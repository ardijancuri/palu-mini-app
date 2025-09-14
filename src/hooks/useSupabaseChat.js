import { useState, useEffect, useRef } from 'react';
import { chatService } from '../lib/supabase';

export const useSupabaseChat = () => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const subscriptionRef = useRef(null);

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

  // Connect to Supabase and load messages
  const connect = async () => {
    try {
      setError(null);
      
      // Load recent messages
      const recentMessages = await chatService.getRecentMessages(20);
      setMessages(recentMessages);
      
      // Subscribe to new messages
      subscriptionRef.current = chatService.subscribeToMessages((newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      });
      
      setIsConnected(true);
      console.log('Supabase chat connected');
      
    } catch (err) {
      console.error('Error connecting to Supabase chat:', err);
      setError('Failed to connect to chat. Please check your Supabase configuration.');
      setIsConnected(false);
    }
  };

  // Disconnect from Supabase
  const disconnect = () => {
    if (subscriptionRef.current) {
      chatService.unsubscribeFromMessages(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    setIsConnected(false);
  };

  // Send a message
  const sendMessage = async (messageText) => {
    if (!messageText.trim()) {
      setError('Message cannot be empty');
      return false;
    }

    if (!isConnected) {
      setError('Not connected to chat');
      return false;
    }

    try {
      await chatService.sendMessage(username, messageText);
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
