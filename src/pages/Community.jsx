import { useState, useEffect } from 'react';
import TokenCard from '../components/TokenCard';
import useCommunityData from '../hooks/useCommunityData';
import useCommunityLikes from '../hooks/useCommunityLikes';
import './Dashboard.css';

const Community = () => {
  const [sortBy, setSortBy] = useState('marketCap');
  const { tokens, loading, error, loadTokens } = useCommunityData();
  const { 
    getSessionLikesCount, 
    sessionLikes, 
    getLikeCount, 
    addLike, 
    hasLiked, 
    canLike 
  } = useCommunityLikes();

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const handleSort = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const sortTokens = (tokens, sortBy) => {
    const validTokens = tokens.filter(token => token !== null);
    const failedTokens = tokens.filter(token => token === null);
    
    const sortedTokens = validTokens.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'marketCap') {
        valueA = a.tokenPrice?.marketCap || 0;
        valueB = b.tokenPrice?.marketCap || 0;
      } else if (sortBy === 'price') {
        valueA = a.tokenPrice?.price || 0;
        valueB = b.tokenPrice?.price || 0;
      } else if (sortBy === 'volume') {
        valueA = a.tokenPrice?.tradingUsd || a.tokenPrice?.dayTrading || 0;
        valueB = b.tokenPrice?.tradingUsd || b.tokenPrice?.dayTrading || 0;
      }
      
      return valueB - valueA; // Highest to lowest
    });
    
    return [...sortedTokens, ...failedTokens];
  };

  const sortedTokens = sortTokens(tokens, sortBy);
  const sessionLikesUsed = sessionLikes.length;
  const sessionLikesRemaining = 3 - sessionLikesUsed;

  const handleReload = () => {
    loadTokens();
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading community tokens...</p>
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

  if (tokens.length === 0) {
    return (
      <div className="card">
        <h2>No Community Tokens</h2>
        <p>Community tokens will appear here when added.</p>
      </div>
    );
  }

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>Community Tokens</h1>
          <div className="small">Community-driven token discovery</div>
          <div className="likes-counter">
            <span className="likes-used">Likes used: {sessionLikesUsed}/3</span>
            <span className="likes-remaining">Remaining: {sessionLikesRemaining}</span>
          </div>
        </div>
        <div className="sort-controls">
          <button 
            className={`sort-btn ${sortBy === 'marketCap' ? 'active' : ''}`}
            onClick={() => handleSort('marketCap')}
          >
            Market Cap
            <i className="fas fa-chevron-down chevron-icon"></i>
          </button>
          <button 
            className={`sort-btn ${sortBy === 'volume' ? 'active' : ''}`}
            onClick={() => handleSort('volume')}
          >
            Volume
            <i className="fas fa-chevron-down chevron-icon"></i>
          </button>
          <button className="reload-btn" onClick={handleReload}>
            <i className="fas fa-sync-alt reload-icon"></i>
          </button>
        </div>
      </div>

      <div className="grid">
        {sortedTokens.map((token, index) => (
          <TokenCard 
            key={token?.address || index} 
            token={token} 
            index={index}
            sortBy={sortBy}
            isCommunity={true}
            getLikeCount={getLikeCount}
            addLike={addLike}
            hasLiked={hasLiked}
            canLike={canLike}
          />
        ))}
      </div>
    </>
  );
};

export default Community;
