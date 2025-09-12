import { useState, useEffect, useCallback } from 'react';

const useLikes = () => {
  const [likesData, setLikesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionLikes, setSessionLikes] = useState([]);

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  };

  const loadLikesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load session likes from localStorage
      const savedSessionLikes = JSON.parse(localStorage.getItem('sessionLikes') || '[]');
      setSessionLikes(savedSessionLikes);
      
      const response = await fetchJson('/api/tokens');
      if (response.success) {
        const likesMap = {};
        response.data.forEach(token => {
          likesMap[token.address] = {
            likeCount: token.like_count,
            hasLiked: savedSessionLikes.includes(token.address)
          };
        });
        setLikesData(likesMap);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUserLikeStatus = useCallback(async (address) => {
    // No longer checking if user has liked - always allow new likes
    try {
      const response = await fetchJson(`/api/tokens/${address}/likes`);
      if (response.success) {
        setLikesData(prev => ({
          ...prev,
          [address]: {
            ...prev[address],
            hasLiked: false // Always show as not liked to allow new likes
          }
        }));
      }
    } catch (err) {
      console.error('Error checking like status:', err);
    }
  }, []);

  const addLike = useCallback(async (address) => {
    // Check if already liked in this session
    if (sessionLikes.includes(address)) {
      throw new Error('Token already liked in this session');
    }
    
    // Check if session limit reached
    if (sessionLikes.length >= 3) {
      throw new Error('Session like limit reached (3 likes)');
    }
    
    try {
      const response = await fetchJson(`/api/tokens/${address}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        // Add to session likes
        const newSessionLikes = [...sessionLikes, address];
        setSessionLikes(newSessionLikes);
        localStorage.setItem('sessionLikes', JSON.stringify(newSessionLikes));
        
        setLikesData(prev => ({
          ...prev,
          [address]: {
            likeCount: response.data.likeCount,
            hasLiked: true
          }
        }));
        return response.data;
      }
    } catch (err) {
      console.error('Error adding like:', err);
      throw err;
    }
  }, [sessionLikes]);

  const getLikeCount = useCallback((address) => {
    return likesData[address]?.likeCount || 0;
  }, [likesData]);

  const hasLiked = useCallback((address) => {
    return likesData[address]?.hasLiked || false;
  }, [likesData]);

  const canLike = useCallback((address) => {
    return !sessionLikes.includes(address) && sessionLikes.length < 3;
  }, [sessionLikes]);

  const getSessionLikesCount = useCallback(() => {
    return sessionLikes.length;
  }, [sessionLikes]);

  useEffect(() => {
    loadLikesData();
  }, [loadLikesData]);

  return {
    likesData,
    loading,
    error,
    sessionLikes,
    loadLikesData,
    checkUserLikeStatus,
    addLike,
    getLikeCount,
    hasLiked,
    canLike,
    getSessionLikesCount
  };
};

export default useLikes;
