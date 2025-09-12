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
        <h1>PALU</h1>
        <div className="nav-container">
          <nav className="main-nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/community" 
              className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}
            >
              Community
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
              Dashboard
            </Link>
            <Link 
              to="/community" 
              className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
