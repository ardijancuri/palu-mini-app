import React from 'react';
import paluDevImage from '../assets/palu-dev.webp';
import './PaluTools.css';

const PaluTools = () => {
  return (
    <div className="palu-tools">
      <div className="palu-tools-content">
        <div className="palu-tools-header">
          <div className="palu-tools-left">
            <h1 className="palu-tools-title">PALU Tools</h1>
            <div className="palu-tools-description">
              <p>Welcome to PALU Tools - your comprehensive toolkit for crypto analysis and trading.</p>
            </div>
          </div>
          <div className="palu-tools-right">
            <img src={paluDevImage} alt="PALU" className="palu-tools-logo" />
          </div>
        </div>
        
        <div className="coming-soon-section">
          <div className="coming-soon-content">
            <h2 className="coming-soon-title">Coming Soon</h2>
            <p className="coming-soon-description">
              We're working hard to bring you amazing crypto tools and features. 
              Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaluTools;
