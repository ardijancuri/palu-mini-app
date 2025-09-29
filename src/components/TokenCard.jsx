import { useState, useEffect } from 'react';
import { formatPrice, formatUsd, formatLiquidity } from '../utils/formatters';
import UpvoteButton from './UpvoteButton';
import paluPfpImage from '../assets/palu-pfp.png';

const TokenCard = ({ 
  token, 
  index, 
  sortBy, 
  isCommunity = false,
  getLikeCount,
  addLike,
  hasLiked,
  canLike
}) => {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isAddingLike, setIsAddingLike] = useState(false);

  useEffect(() => {
    // Load like count from database
    const likeCount = getLikeCount(token.address);
    setUpvoteCount(likeCount);
  }, [token.address, getLikeCount]);

  const handleUpvote = async () => {
    if (isAddingLike || !canLike(token.address)) return;
    
    setIsAddingLike(true);
    try {
      const result = await addLike(token.address);
      if (result) {
        setUpvoteCount(result.likeCount);
      }
    } catch (error) {
      console.error('Error adding like:', error);
    } finally {
      setIsAddingLike(false);
    }
  };

  if (!token) {
    return (
      <div className="token-card">
        <div className="token-left">
          <div>Failed to load token</div>
        </div>
      </div>
    );
  }

  // Custom image mapping for specific tokens
  const getTokenImage = (token) => {
    const customImages = {
      '0xb75a7e8876df49a74cc4c76c6bda161a8ea4b483': paluPfpImage
    };
    
    return customImages[token.address] || token.image || null;
  };
  
  const img = getTokenImage(token);
  const symbol = token.shortName || token.symbol || '';
  const name = token.name || symbol || '';
  const tp = token.tokenPrice || {};
  const price = tp.price || 0;
  const mc = tp.marketCap || 0;
  const liq = tp.liquidity || 0;
  const vol = tp.tradingUsd || tp.dayTrading || 0;
  const change = Number(tp.dayIncrease || 0);
  const changeStr = (change >= 0 ? '+' : '') + change + '%';
  const changeColor = change >= 0 ? '#16a34a' : '#ef4444';

  // Determine ranking class
  let rankingClass = '';
  if (index === 0) {
    rankingClass = 'gold';
  } else if (index === 1) {
    rankingClass = 'silver';
  } else if (index === 2) {
    rankingClass = 'bronze';
  }

  return (
    <div className={`token-card ${rankingClass}`}>
      {/* Desktop Layout */}
      <div className="token-left">
        {img && <img className="token-logo" src={img} alt={name} />}
        <div>
          <div className="token-name">
            <span className="ticker" style={{fontWeight: 'bold'}}>{symbol}</span>
          </div>
          <div className="small" style={{color: changeColor}}>{changeStr}</div>
        </div>
      </div>
      <div className="token-metrics">
        <div className="token-metric">
          <div className="main">{formatUsd(mc)}</div>
          <div className="sub">Market Cap</div>
        </div>
        <div className="token-metric">
          <div className="main">{formatPrice(price)}</div>
          <div className="sub">Price</div>
        </div>
        <div className="token-metric">
          <div className="main">{formatLiquidity(liq)}</div>
          <div className="sub">Liquidity</div>
        </div>
        <div className="token-metric">
          <div className="main">{formatUsd(vol)}</div>
          <div className="sub">Volume 24h</div>
        </div>
        <UpvoteButton 
          address={token.address}
          count={upvoteCount}
          isUpvoted={hasLiked(token.address)}
          onUpvote={handleUpvote}
          isLoading={isAddingLike}
          disabled={!canLike(token.address)}
        />
      </div>
      
      {/* Mobile Layout */}
      <div className="mobile-layout">
        <div className="mobile-token-image">
          {img && <img className="mobile-token-logo" src={img} alt={name} />}
        </div>
        <div className="mobile-content">
          <div className="mobile-top-row">
            <div className="mobile-token-ticker">
              <div className="ticker">{symbol}</div>
              <div className="small" style={{color: changeColor}}>{changeStr}</div>
            </div>
            <div className="mobile-market-cap">
              <div className="main">{formatUsd(mc)}</div>
              <div className="sub">Market Cap</div>
            </div>
            <UpvoteButton 
              address={token.address}
              count={upvoteCount}
              isUpvoted={hasLiked(token.address)}
              onUpvote={handleUpvote}
              isMobile={true}
              isLoading={isAddingLike}
              disabled={!canLike(token.address)}
            />
          </div>
          <div className="mobile-bottom-row">
            <div className="mobile-metric">
              <div className="main">{formatPrice(price)}</div>
              <div className="sub">Price</div>
            </div>
            <div className="mobile-metric">
              <div className="main">{formatLiquidity(liq)}</div>
              <div className="sub">Liquidity</div>
            </div>
            <div className="mobile-metric">
              <div className="main">{formatUsd(vol)}</div>
              <div className="sub">Volume</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
