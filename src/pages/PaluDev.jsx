import React from 'react';
import paluDevImage from '../assets/palu-dev.webp';
import './PaluDev.css';

const PaluDev = () => {
  const handleConnectTelegram = () => {
    // Open Chrome extension with the specified ID
    window.open('chrome-extension://mcdpafmjkcgfdhbnjpdchjbjkkmhpeoc/index.html', '_blank');
  };

  return (
    <div className="palu-dev">
      <div className="palu-dev-content">
        <div className="palu-dev-image-container">
          <img src={paluDevImage} alt="PALU DEV" className="palu-dev-image" />
        </div>
        <h1 className="palu-dev-title">Palu Tools</h1>
      </div>
    </div>
  );
};

export default PaluDev;
