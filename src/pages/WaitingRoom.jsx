import { useState, useEffect, useRef } from 'react';
import Chat from '../components/Chat';

const WaitingRoom = () => {
  const [bnbPrice, setBnbPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [shareBlob, setShareBlob] = useState(null);
  const [shareNotice, setShareNotice] = useState('');
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
      
      // Load the background image (same-origin)
      const bg = new Image();
      
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

  // Pre-generate image blob when price updates to keep clipboard call within iOS gesture window
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!bnbPrice || loading || error) return;
        const priceText = `BNB $${formatPrice(bnbPrice)}`;
        const blob = await createShareBlob(priceText);
        if (!cancelled) setShareBlob(blob);
      } catch (e) {
        if (!cancelled) setShareBlob(null);
      }
    })();
    return () => { cancelled = true; };
  }, [bnbPrice, loading, error]);

  const getPlatform = () => {
    const ua = navigator.userAgent || '';

    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) {
      return 'ios';
    }

    if (/Android/i.test(ua)) {
      return 'android';
    }

    return 'desktop';
  };

  const copyImageToClipboard = async (blob) => {
    if (!blob) {
      return false;
    }

    const clipboard = navigator.clipboard;
    const ClipboardItemCtor =
      typeof window !== 'undefined'
        ? window.ClipboardItem || window.WebKitClipboardItem
        : null;

    if (!clipboard?.write || !ClipboardItemCtor) {
      return false;
    }

    try {
      if (navigator.permissions?.query) {
        try {
          await navigator.permissions.query({ name: "clipboard-write" });
        } catch (permissionError) {
          console.warn("Clipboard permission query failed", permissionError);
        }
      }

      const platform = getPlatform();

      // iOS: be strict, use PNG only, and also try Promise-based data for Safari
      if (platform === "ios") {
        try {
          const item = new ClipboardItemCtor({ "image/png": blob });
          await clipboard.write([item]);
          return true;
        } catch (err1) {
          console.warn("iOS direct PNG clipboard write failed", err1);
          try {
            const item = new ClipboardItemCtor({ "image/png": Promise.resolve(blob) });
            await clipboard.write([item]);
            return true;
          } catch (err2) {
            console.warn("iOS Promise PNG clipboard write failed", err2);
          }
        }
        return false;
      }

      // Desktop/Android: attempt blob's type first, then PNG/JPEG
      const preferredTypes = [];
      if (blob.type && blob.type.startsWith("image/")) {
        preferredTypes.push(blob.type);
      }
      preferredTypes.push("image/png", "image/jpeg");

      for (const type of preferredTypes) {
        try {
          const item = new ClipboardItemCtor({ [type]: blob });
          await clipboard.write([item]);
          return true;
        } catch (err) {
          console.warn(`Clipboard write failed for ${type}`, err);
        }
      }
    } catch (error) {
      console.warn("Clipboard image copy failed", error);
    }

    return false;
  };

  const openTwitterIntent = (text) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const openTwitterDeepLink = (text) => {
    const deep = `twitter://post?message=${encodeURIComponent(text)}`;
    window.location.href = deep; // Attempt to open X app composer
  };

  const attemptOpenXIOS = (text) => {
    // Try multiple deep-link formats that X/Twitter apps have supported
    const schemes = [
      `twitter://post?message=${encodeURIComponent(text)}`,
      `twitter://compose?text=${encodeURIComponent(text)}`,
      `x://post?text=${encodeURIComponent(text)}`,
      `x://compose?text=${encodeURIComponent(text)}`,
      `twitter://` // generic open
    ];

    const tryScheme = (index) => {
      if (index >= schemes.length) {
        // Do not fall back to browser per request; show a small hint instead
        showShareNotice('If not prompted, switch to the X app and paste.');
        return;
      }

      const url = schemes[index];

      // Create a hidden anchor and also set location to maximize chances
      const a = document.createElement('a');
      a.href = url;
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);

      // If page stays visible, try next scheme after a short delay
      const t = setTimeout(() => {
        if (document.visibilityState === 'visible') {
          document.body.removeChild(a);
          tryScheme(index + 1);
        } else {
          // Navigated to app; clean up
          document.body.removeChild(a);
        }
      }, 1200);

      try {
        // Some iOS versions prefer direct assignment; others prefer a click
        window.location.href = url;
        a.click();
      } catch (_) {
        // Ignore and let the timeout advance
      }
    };

    tryScheme(0);
  };

  const showShareNotice = (message, ms = 1800) => {
    setShareNotice(message);
    if (ms > 0) {
      setTimeout(() => setShareNotice(''), ms);
    }
  };

  const shareToTwitter = async () => {
    setIsSharing(true);

    try {
      const priceText = `BNB $${formatPrice(bnbPrice)}`;
      const shareText = `BNB is at $${formatPrice(bnbPrice)}!
Waiting for $1000!

Waiting Room: bnb.palu.meme
#BNB #BNBChain #Crypto #ToTheMoon`;
      const blob = shareBlob || await createShareBlob(priceText);

      const copied = await copyImageToClipboard(blob);

      if (copied) {
        showShareNotice('Paste the price card in X');
      } else {
        showShareNotice('Could not copy automatically. When X opens, paste if available or attach the image.');
      }

      const platform = getPlatform();
      if (platform === 'ios') {
        // Try to open the X app; fall back to web intent if it doesn't open
        attemptOpenXIOS(shareText);
      } else {
        openTwitterIntent(shareText);
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
              
              {shareNotice && (
                <div className="share-notice">
                  {shareNotice}
                </div>
              )}

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
