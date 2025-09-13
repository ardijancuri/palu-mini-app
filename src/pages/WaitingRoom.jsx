import { useState, useEffect, useRef } from 'react';

const WaitingRoom = () => {
  const [bnbPrice, setBnbPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const waitingRoomRef = useRef(null);

  useEffect(() => {
    let ws = null;
    let pollTimer = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    const reconnectDelay = 5000; // 5 seconds

    const connectWS = () => {
      // Prevent multiple connection attempts
      if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
        return;
      }

      cleanup();
      
      try {
        ws = new WebSocket('wss://stream.binance.com:9443/ws/bnbusdt@miniTicker');
        
        ws.onopen = () => {
          console.log('WebSocket connected successfully');
          reconnectAttempts = 0; // Reset attempts on successful connection
        };
        
        ws.onmessage = (e) => {
          const data = JSON.parse(e.data);
          const price = parseFloat(data.c);
          setBnbPrice(price);
          setLoading(false);
          setError(null);
        };

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          ws = null;
          scheduleFallback();
        };
        
        ws.onerror = (error) => {
          console.log('WebSocket error:', error);
          ws = null;
          scheduleFallback();
        };
      } catch (err) {
        console.log('WebSocket connection failed:', err);
        ws = null;
        scheduleFallback();
      }
    };

    const scheduleFallback = () => {
      // Start REST API polling if not already running
      if (!pollTimer) {
        console.log('Starting REST API fallback');
        pollTimer = setInterval(async () => {
          try {
            const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
            const data = await response.json();
            const price = parseFloat(data.price);
            setBnbPrice(price);
            setLoading(false);
            setError(null);
          } catch (err) {
            console.log('REST API fetch failed:', err);
            setError('Failed to fetch price');
            setLoading(false);
          }
        }, 5000);
      }
      
      // Try to reconnect WebSocket with exponential backoff
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1); // Exponential backoff
        console.log(`Scheduling WebSocket reconnection attempt ${reconnectAttempts} in ${delay}ms`);
        
        reconnectTimer = setTimeout(() => {
          connectWS();
        }, delay);
      } else {
        console.log('Max WebSocket reconnection attempts reached, using REST API only');
      }
    };

    const cleanup = () => {
      if (pollTimer) { 
        clearInterval(pollTimer); 
        pollTimer = null; 
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (ws) { 
        try { 
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        } catch {} 
        ws = null;
      }
    };

    // Start connection
    connectWS();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, []);

  const formatPrice = (price) => {
    if (!price) return '0';
    return Math.floor(price).toString();
  };

  const captureScreenshot = async () => {
    try {
      console.log('Starting screenshot capture...');
      
      // Create a canvas with the background image and price overlay
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 420;
      
      canvas.width = size;
      canvas.height = size;
      
      // Randomly choose between palu-price-1.png and palu-price-2.png (50% chance each)
      const randomImage = Math.random() < 0.5 ? 'palu-price-1.png' : 'palu-price-2.png';
      console.log('Selected background image:', randomImage);
      
      // Load the background image
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        backgroundImg.onload = () => {
          try {
            // Draw the background image
            ctx.drawImage(backgroundImg, 0, 0, size, size);
            
            // Set up text styling
            ctx.fillStyle = '#F5C908'; // Golden color
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Calculate position (30% from top, horizontally centered)
            const x = size / 2; // Horizontally centered
            const y = size * 0.3; // 30% from top
            
            // Set font size based on canvas size
            const fontSize = Math.floor(size * 0.15); // 15% of canvas size
            ctx.font = `600 ${fontSize}px Oswald, sans-serif`;
            
            // Add text shadow for better visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Draw the price text
            const priceText = `BNB $${formatPrice(bnbPrice)}`;
            ctx.fillText(priceText, x, y);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            console.log('Screenshot created successfully with background:', randomImage);
            resolve(canvas.toDataURL('image/png'));
          } catch (error) {
            console.error('Error creating screenshot:', error);
            reject(error);
          }
        };
        
        backgroundImg.onerror = () => {
          console.error('Failed to load background image:', randomImage);
          reject(new Error('Failed to load background image'));
        };
        
                // Load the randomly selected background image
                backgroundImg.src = `/assets/${randomImage}`;
      });
      
    } catch (error) {
      console.error('Screenshot failed:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return null;
    }
  };

  const shareToTwitter = async () => {
    setIsSharing(true);
    
    try {
      const screenshot = await captureScreenshot();
      
      if (!screenshot) {
        alert('Failed to capture screenshot');
        return;
      }

      // Convert data URL to blob
      const response = await fetch(screenshot);
      const blob = await response.blob();
      
      // Copy image to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        
        // Create Twitter share URL with text
        const text = `BNB is at $${formatPrice(bnbPrice)}! 🚀\nWaiting for $1000! 🚀\n\n#BNB #Binance #Crypto #ToTheMoon #X`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        
        // Show success message and open Twitter
        alert('📸 Screenshot copied to clipboard!\n\nOpening X/Twitter...\n\nJust paste (Ctrl+V) to add the image to your tweet!');
        
        // Open Twitter/X in new tab
        window.open(twitterUrl, '_blank');
        
      } catch (clipboardError) {
        console.error('Clipboard copy failed:', clipboardError);
        
        // Fallback: download the image if clipboard fails
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bnb-${formatPrice(bnbPrice)}-${Date.now()}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('📸 Screenshot downloaded!\n\nClipboard access denied. Image has been downloaded instead.');
      }
      
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="waiting-room" ref={waitingRoomRef}>
      {/* Planet decorations */}
              <div className="planet planet-left">
                <img src="/assets/plane1.png" alt="Planet 1" />
              </div>
              <div className="planet planet-center">
                <img src="/assets/plane2.png" alt="Planet 2" />
              </div>
              <div className="planet planet-right">
                <img src="/assets/planet3.png" alt="Planet 3" />
              </div>
              
              {/* PALU logo at bottom right */}
              <div className="palu-logo">
                <img className='palu-logo' src="/assets/PALU.webp" alt="PALU" />
              </div>
              
              {/* Live Chat */}
              <div className={`live-chat ${isChatMinimized ? 'minimized' : ''}`}>
                <div className="chat-header" onClick={() => setIsChatMinimized(!isChatMinimized)}>
                  <div className="chat-title">
                    <i className="fas fa-comments"></i>
                    Live Chat
                  </div>
                  <div className="chat-header-right">
                    <button 
                      className="minimize-chat-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsChatMinimized(!isChatMinimized);
                      }}
                    >
                      <i className={`fas ${isChatMinimized ? 'fa-plus' : 'fa-minus'}`}></i>
                    </button>
                  </div>
                </div>
                {!isChatMinimized && (
                  <>
                    <div className="chat-messages">
                      <div className="coming-soon-message">
                        <div className="coming-soon-icon">
                          <i className="fas fa-rocket"></i>
                        </div>
                        <div className="coming-soon-text">
                          <h3>Live Chat Coming Soon!</h3>
                          <p>We're working hard to bring you real-time community chat. Stay tuned!</p>
                        </div>
                      </div>
                    </div>
                    <div className="chat-input disabled">
                      <input type="text" placeholder="Chat will be available soon..." disabled />
                      <button className="send-button" disabled>
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="waiting-room-content">
        <h1 className="waiting-room-title">BNB ${formatPrice(bnbPrice)}</h1>
        {loading && <div className="loading-indicator">Loading...</div>}
        {error && <div className="error-indicator">{error}</div>}
        
         {!loading && !error && bnbPrice && (
           <button 
             className="share-button"
             onClick={shareToTwitter}
             disabled={isSharing}
           >
             {isSharing ? (
               <>
                 <i className="fas fa-spinner fa-spin"></i>
                 Sharing...
               </>
             ) : (
               <>
                 <i className="fab fa-x-twitter"></i>
                 Share on X
               </>
             )}
           </button>
         )}
      </div>
    </div>
  );
};

export default WaitingRoom;
