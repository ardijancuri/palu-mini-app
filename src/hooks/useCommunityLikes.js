import { useState, useEffect, useCallback } from 'react';

const useCommunityLikes = () => {
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
      // Load community session likes from localStorage (separate from main dashboard)
      const savedSessionLikes = JSON.parse(localStorage.getItem('communitySessionLikes') || '[]');
      setSessionLikes(savedSessionLikes);
      
      // Load community token likes from API
      const response = await fetchJson('/api/community-tokens');
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

  const addLike = useCallback(async (address) => {
    // Check if already liked in this community session
    if (sessionLikes.includes(address)) {
      throw new Error('Token already liked in this community session');
    }
    
    // Check if community session limit reached
    if (sessionLikes.length >= 3) {
      throw new Error('Community session like limit reached (3 likes)');
    }
    
    try {
      const response = await fetchJson(`/api/community-tokens/${address}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        // Add to community session likes
        const newSessionLikes = [...sessionLikes, address];
        setSessionLikes(newSessionLikes);
        localStorage.setItem('communitySessionLikes', JSON.stringify(newSessionLikes));
        
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
      console.error('Error adding community like:', err);
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
    addLike,
    getLikeCount,
    hasLiked,
    canLike,
    getSessionLikesCount
  };
};

export default useCommunityLikes;
