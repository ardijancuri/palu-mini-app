import { useState, useEffect, useRef } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Generate a random username if not set
  const generateRandomUsername = () => {
    const adjectives = ['Crypto', 'Moon', 'Diamond', 'Rocket', 'Bull', 'Bear', 'Hodl', 'Lambo', 'ToTheMoon', 'BNB'];
    const nouns = ['Trader', 'Holder', 'Investor', 'Whale', 'Dolphin', 'Ape', 'Degen', 'Legend', 'Master', 'Pro'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 9999);
    return `${adjective}${noun}${number}`;
  };

  // Initialize username from localStorage or generate one
  useEffect(() => {
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsUsernameSet(true);
    } else {
      const newUsername = generateRandomUsername();
      setUsername(newUsername);
      localStorage.setItem('chatUsername', newUsername);
      setIsUsernameSet(true);
    }
  }, []);

  // Connect to WebSocket
  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Determine WebSocket URL based on environment
      let wsUrl;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Development: use localhost:3000
        wsUrl = `${protocol}//localhost:3000`;
      } else {
        // Production: use same host as the frontend
        wsUrl = `${protocol}//${window.location.host}`;
      }
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Chat WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'recent_messages':
              setMessages(data.messages);
              break;
            case 'new_message':
              setMessages(prev => [...prev, data.message]);
              break;
            case 'error':
              setError(data.message);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Chat WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        setError('Chat unavailable in production. WebSocket server not deployed.');
        setIsConnected(false);
      };

    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError('Failed to connect to chat');
    }
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  // Send a message
  const sendMessage = (messageText) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to chat');
      return false;
    }

    if (!messageText.trim()) {
      setError('Message cannot be empty');
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        username: username,
        message: messageText.trim()
      }));
      setError(null);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  };

  // Update username
  const updateUsername = (newUsername) => {
    if (newUsername.trim() && newUsername.trim().length <= 20) {
      setUsername(newUsername.trim());
      localStorage.setItem('chatUsername', newUsername.trim());
      setIsUsernameSet(true);
      return true;
    }
    return false;
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    messages,
    isConnected,
    error,
    username,
    isUsernameSet,
    connect,
    disconnect,
    sendMessage,
    updateUsername,
    formatTime
  };
};
