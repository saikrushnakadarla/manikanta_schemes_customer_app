import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginNavbar.css';
// Import your logo image
import logoImage from '../Images/MANIKANTHA JEWELLERS FINAL LOOG DESIGN (1)_page-0001.jpg';

const LoginNavbar = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav className="login-navbar">
      <div className="login-navbar-container">
        {/* Logo - Left side */}
        <div className="login-navbar-logo">
          <Link to="/">
            <img
              src={logoImage}
              alt="Company Logo"
              className="login-logo-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <span className="login-logo-text">MANIKANTHA JEWELLERS</span>
          </Link>
        </div>

        {/* Login Button - Right side */}
        <div className="login-navbar-actions">
          <button 
            className="login-btn"
            onClick={handleLoginClick}
          >
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Login</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LoginNavbar;