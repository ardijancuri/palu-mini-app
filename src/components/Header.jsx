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
          <Link to="/">
            <img src="/assets/palu-logo.png" alt="PALU" className="header-logo" />
          </Link>
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
              to="/1st-batch" 
              className={`nav-link ${location.pathname === '/1st-batch' ? 'active' : ''}`}
            >
              1st Batch
            </Link>
            <Link 
              to="/2nd-batch" 
              className={`nav-link ${location.pathname === '/2nd-batch' ? 'active' : ''}`}
            >
              2nd Batch
            </Link>
            <Link 
              to="/community" 
              className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}
            >
              Community
            </Link>
            <div className="nav-item-with-label">
              <span 
                className="nav-link disabled"
              >
                PALU Tools
              </span>
              <span className="coming-soon-label">Coming Soon</span>
            </div>
            <Link 
              to="/contact" 
              className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
            >
              Contact Us
            </Link>
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
              to="/1st-batch" 
              className={`nav-link ${location.pathname === '/1st-batch' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              1st Batch
            </Link>
            <Link 
              to="/2nd-batch" 
              className={`nav-link ${location.pathname === '/2nd-batch' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              2nd Batch
            </Link>
            <Link 
              to="/community" 
              className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
            <div className="nav-item-with-label">
              <span 
                className="nav-link disabled"
              >
                PALU Tools
              </span>
              <span className="coming-soon-label">Coming Soon</span>
            </div>
            <Link 
              to="/contact" 
              className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
