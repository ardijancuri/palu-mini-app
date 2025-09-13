import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <img src="/assets/palu-logo.png" alt="PALU" className="header-logo" />
        </div>
        <div className="nav-container">
          <nav className="main-nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Waiting Room
            </Link>
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <span 
              className="nav-link disabled" 
              title="Coming Soon"
            >
              Community
            </span>
          </nav>
        </div>
        <div className="mobile-menu">
          <button className="menu-toggle" onClick={toggleMenu}>
            <i className="fas fa-bars"></i>
          </button>
          <nav className={`main-nav mobile-nav ${isMenuOpen ? 'active' : ''}`}>
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Waiting Room
            </Link>
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <span 
              className="nav-link disabled" 
              title="Coming Soon"
            >
              Community
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
