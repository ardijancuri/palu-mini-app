import { useState, useEffect } from 'react';
import TokenCard from '../components/TokenCard';
import useLikes from '../hooks/useLikes';
import './Dashboard.css';

const TokenCommunity = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Specific token address
  const tokenAddress = '0xb75a7e8876df49a74cc4c76c6bda161a8ea4b483';
  
  const { 
    getSessionLikesCount, 
    sessionLikes, 
    getLikeCount, 
    addLike, 
    hasLiked, 
    canLike 
  } = useLikes();

  const fetchTokenData = async (address) => {
    try {
      const response = await fetch(`/api/token/${address}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      
      // Handle different response formats
      if (data?.code === 0 && data?.data) {
        return { ...data.data, address };
      } else if (data?.data) {
        return { ...data.data, address };
      } else {
        throw new Error('Invalid token data format');
      }
    } catch (err) {
      console.error('Error fetching token data:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        setLoading(true);
        setError(null);
        const tokenData = await fetchTokenData(tokenAddress);
        setToken(tokenData);
      } catch (err) {
        console.error('Error loading token:', err);
        setError('Failed to load token data');
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, [tokenAddress]);

  const handleReload = async () => {
    try {
      setLoading(true);
      setError(null);
      const tokenData = await fetchTokenData(tokenAddress);
      setToken(tokenData);
    } catch (err) {
      console.error('Error reloading token:', err);
      setError('Failed to reload token data');
    } finally {
      setLoading(false);
    }
  };

  const sessionLikesUsed = sessionLikes.length;
  const sessionLikesRemaining = 3 - sessionLikesUsed;

  if (loading) {
    return (
      <div className="card">
        <p>Loading token data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleReload}>Retry</button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="card">
        <h2>Token Not Found</h2>
        <p>Unable to load token data for address: {tokenAddress}</p>
        <button onClick={handleReload}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>Community Token</h1>
          <div className="small">Featured community token</div>
          <div className="likes-counter">
            <span className="likes-used">Likes used: {sessionLikesUsed}/3</span>
            <span className="likes-remaining">Remaining: {sessionLikesRemaining}</span>
          </div>
        </div>
        <div className="sort-controls">
          <button className="reload-btn" onClick={handleReload}>
            <i className="fas fa-sync-alt reload-icon"></i>
          </button>
        </div>
      </div>

      <div className="grid">
        <TokenCard 
          key={token?.address || tokenAddress} 
          token={token} 
          index={0}
          sortBy="marketCap"
          isCommunity={true}
          getLikeCount={getLikeCount}
          addLike={addLike}
          hasLiked={hasLiked}
          canLike={canLike}
        />
      </div>
    </>
  );
};

export default TokenCommunity;
