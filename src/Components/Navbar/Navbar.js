import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';
// Import your logo image
import logoImage from '../Images/MANIKANTHA JEWELLERS FINAL LOOG DESIGN (1)_page-0001.jpg';
import baseURL from '../URL/BaseURL';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You are about to logout from your account!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    setIsLoggingOut(true);

    Swal.fire({
      title: 'Logging out...',
      text: 'Please wait while we log you out',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`${baseURL}/api/customer/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          user_id: userData.id || userData.user_id || 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Logout API error:', errorData);
      } else {
        const data = await response.json().catch(() => ({}));
        console.log('Logout successful:', data);
      }

    } catch (error) {
      console.error('Error during logout API call:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      Swal.close();

      await Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#fff',
      });

      navigate('/');
      closeMobileMenu();
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="navbar-custom">
      <div className="navbar-container">
        {/* Mobile Menu Button - LEFT side */}
        <div className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Logo - Center */}
        <div className="navbar-logo">
          <Link to="/dashboard" onClick={closeMobileMenu}>
            <img
              src={logoImage}
              alt="Company Logo"
              className="logo-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <span className="logo-text">MANIKANTHA JEWELLERS</span>
          </Link>
        </div>

        {/* Navigation Links - Desktop */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Close button for mobile */}
          <button className="mobile-close-btn" onClick={closeMobileMenu}>
            <i className="bi bi-x-lg"></i>
          </button>
          
          <ul>
            <li>
              <Link to="/dashboard" onClick={closeMobileMenu}>
                <i className="bi bi-house-door"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link to="/products" onClick={closeMobileMenu}>
                <i className="bi bi-grid-3x3-gap-fill"></i>
                <span>Products</span>
              </Link>
            </li>

            <li>
              <Link to="/cartpage" onClick={closeMobileMenu}>
                <i className="bi bi-cart-fill"></i>
                <span>Cart</span>
              </Link>
            </li>

            <li>
              <Link to="/schemes" onClick={closeMobileMenu}>
                <i className="bi bi-journal-bookmark-fill"></i>
                <span>Schemes</span>
              </Link>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="logout-btn"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </>
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;