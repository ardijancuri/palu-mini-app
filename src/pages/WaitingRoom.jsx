import { useState, useEffect, useRef } from 'react';
import Chat from '../components/Chat';

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

  const createShareBlob = async (priceText) => {
    try {
      console.log('Starting image creation...');
      
      const size = 1080;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Randomly choose between palu-price-1.png and palu-price-2.png (50% chance each)
      const randomImage = Math.random() < 0.5 ? 'palu-price-1.png' : 'palu-price-2.png';
      console.log('Selected background image:', randomImage);
      
      // Load the background image
      const bg = new Image();
      bg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        bg.onload = resolve;
        bg.onerror = () => reject(new Error('Failed to load background'));
        bg.src = `/assets/${randomImage}`;
      });
      
      // Draw the background image
      ctx.drawImage(bg, 0, 0, size, size);
      
      // Set text properties for the price (keeping your current styling)
      ctx.fillStyle = '#F5C908';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Calculate position (keeping your current position)
      const x = size / 2; // Horizontally centered
      const y = size * 0.27; // 27% from top (your current position)
      
      // Set font size (keeping your current size)
      const fontSize = Math.floor(size * 0.18); // 18% of canvas size (your current size)
      ctx.font = `600 ${fontSize}px Oswald, sans-serif`;
      
      // Add shadow for better visibility (keeping your current shadow)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      
      // Draw the price text
      ctx.fillText(priceText, x, y);
      
      // Convert canvas to blob
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png', 1.0));
      if (!blob) throw new Error('Failed to create image blob');
      
      console.log('Image blob created successfully');
      return blob;
      
    } catch (error) {
      console.error('Image creation failed:', error);
      throw error;
    }
  };

  const copyImageToClipboard = async (blob) => {
    // Check if clipboard API is available
    if (!navigator.clipboard || !window.ClipboardItem) {
      console.log('Clipboard API not available');
      return false;
    }

    try {
      // Request clipboard permission (mobile browsers often require this)
      if (navigator.permissions?.query) {
        try {
          const permission = await navigator.permissions.query({ name: 'clipboard-write' });
          console.log('Clipboard permission:', permission.state);
        } catch (e) {
          console.log('Permission query failed:', e);
        }
      }

      // Try different MIME types for better mobile compatibility
      const mimeTypes = [
        blob.type || 'image/png',
        'image/png',
        'image/jpeg',
        'image/webp'
      ];

      for (const mimeType of mimeTypes) {
        try {
          console.log(`Trying to copy with MIME type: ${mimeType}`);
          await navigator.clipboard.write([
            new ClipboardItem({ [mimeType]: blob })
          ]);
          console.log('Successfully copied to clipboard');
          return true;
        } catch (error) {
          console.log(`Failed with ${mimeType}:`, error.message);
          continue;
        }
      }

      // Final fallback: try with a fresh blob
      try {
        const freshBlob = new Blob([blob], { type: 'image/png' });
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': freshBlob })
        ]);
        console.log('Successfully copied with fresh blob');
        return true;
      } catch (error) {
        console.log('Final fallback failed:', error.message);
        return false;
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      return false;
    }
  };

  const openTwitterIntent = (text) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const openTwitterDeepLink = (text) => {
    const deep = `twitter://post?message=${encodeURIComponent(text)}`;
    window.location.href = deep; // Open X app composer
  };

  const shareToTwitter = async () => {
    setIsSharing(true);
    
    try {
      // 1) Ensure image is ready
      const priceText = `BNB $${formatPrice(bnbPrice)}`;
      const blob = await createShareBlob(priceText);

      // 2) Detect mobile platform
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
                    (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document);
      const isAndroid = /Android/i.test(navigator.userAgent);

      // 3) Mobile-specific sharing approach
      if (isMobile) {
        // For mobile, try to copy image first, then redirect
        const copied = await copyImageToClipboard(blob);
        
        if (copied) {
          // Show success message with instructions
          alert('✅ Image copied to clipboard!\n\nNow opening X app...\n\nOnce X opens, tap the compose button and paste the image (long press in text area → Paste)');
          
          // Small delay to ensure clipboard is set
          setTimeout(() => {
            const text = `BNB is at $${formatPrice(bnbPrice)}! 🚀\nWaiting for $1000! 🚀\n\nWaiting Room: bnb.palu.meme\n#BNB #BNBChain #Crypto #ToTheMoon`;
            
            if (isIOS) {
              openTwitterDeepLink(text);
            } else if (isAndroid) {
              // Try deep link first, fallback to web
              try {
                openTwitterDeepLink(text);
                // Fallback after 2 seconds if deep link doesn't work
                setTimeout(() => {
                  openTwitterIntent(text);
                }, 2000);
              } catch {
                openTwitterIntent(text);
              }
            } else {
              openTwitterIntent(text);
            }
          }, 500);
        } else {
          // Fallback: download image and open X
          alert('📱 Mobile sharing:\n\n1. Image will be downloaded\n2. X app will open\n3. Attach the downloaded image to your tweet');
          
          // Download the image
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bnb-price-${formatPrice(bnbPrice)}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // Open X after download
          setTimeout(() => {
            const text = `BNB is at $${formatPrice(bnbPrice)}! 🚀\nWaiting for $1000! 🚀\n\nWaiting Room: bnb.palu.meme\n#BNB #BNBChain #Crypto #ToTheMoon`;
            
            if (isIOS) {
              openTwitterDeepLink(text);
            } else {
              openTwitterIntent(text);
            }
          }, 1000);
        }
      } else {
        // Desktop: use web intent (no clipboard needed)
        const text = `BNB is at $${formatPrice(bnbPrice)}! 🚀\nWaiting for $1000! 🚀\n\nWaiting Room: bnb.palu.meme\n#BNB #BNBChain #Crypto #ToTheMoon`;
        openTwitterIntent(text);
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
                <img className='palu-logo' src="/assets/palu-moon.png" alt="PALU" />
              </div>
              
              {/* Live Chat */}
              <Chat 
                isMinimized={isChatMinimized}
                onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
              />
              
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
