import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

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

  // Connect to Supabase Realtime
  const connect = async () => {
    try {
      setIsConnected(false);
      setError(null);

      // Fetch recent messages
      const { data: recentMessages, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(20);

      if (fetchError) {
        console.error('Error fetching messages:', fetchError);
        setError('Failed to load chat history');
        return;
      }

      setMessages(recentMessages || []);

      // Subscribe to new messages
      subscriptionRef.current = supabase
        .channel('chat_messages')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages' 
          }, 
          (payload) => {
            console.log('New message received:', payload.new);
            setMessages(prev => [...prev, payload.new]);
          }
        )
        .subscribe((status) => {
          console.log('Supabase subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setError(null);
          } else if (status === 'CHANNEL_ERROR') {
            setError('Connection error. Retrying...');
            setIsConnected(false);
          }
        });

    } catch (err) {
      console.error('Error connecting to Supabase:', err);
      setError('Failed to connect to chat');
      setIsConnected(false);
    }
  };

  // Disconnect from Supabase
  const disconnect = () => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
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

    if (messageText.length > 500) {
      setError('Message too long (max 500 characters)');
      return false;
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            username: username.trim(),
            message: messageText.trim()
          }
        ]);

      if (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message');
        return false;
      }

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
