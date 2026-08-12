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

  const handleSignupClick = () => {
    navigate('/customerregister');
  };

  return (
    <nav className="login-navbar-custom">
      <div className="login-navbar-container">
        {/* Logo - Left side with Brand Name */}
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
            <div className="login-brand-text">
              <span className="login-brand-name">MANIKANTHA</span>
              <span className="login-brand-subtitle">JEWELLERS</span>
            </div>
          </Link>
        </div>

        {/* Action Buttons - Right side */}
        <div className="login-navbar-actions">
          {/* Signup Button */}
          {/* <button 
            className="signup-btn"
            onClick={handleSignupClick}
          >
            <i className="bi bi-person-plus"></i>
            <span>Signup</span>
          </button> */}

          {/* Login Button */}
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