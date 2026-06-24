import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Changed useHistory to useNavigate
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';
// Import your logo image
import logoImage from '../Images/MANIKANTHA JEWELLERS FINAL LOOG DESIGN (1)_page-0001.jpg'; // Adjust the path as needed

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate(); // Changed from useHistory to useNavigate

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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

    // If user clicks cancel, stop the logout process
    if (!result.isConfirmed) {
      return;
    }

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    setIsLoggingOut(true);

    // Show loading alert
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
      // Call logout API
      const response = await fetch('http://187.127.147.245:81/api/customer/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          user_id: userData.id || userData.user_id || 0
        })
      });

      // Check if response is OK (status 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Logout API error:', errorData);
        // Continue with local logout even if API fails
      } else {
        const data = await response.json().catch(() => ({}));
        console.log('Logout successful:', data);
      }

    } catch (error) {
      console.error('Error during logout API call:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Close SweetAlert if open
      Swal.close();

      // Show success message
      await Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#fff',
      });

      // Navigate to login page - Changed from history.push to navigate
      navigate('/');

      // Close mobile menu if open
      setIsMobileMenuOpen(false);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="navbar-custom">
      <div className="navbar-container">
        {/* Left side - Logo */}
        <div className="navbar-logo">
          <Link to="/dashboard">
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

        {/* Mobile Menu Button */}
        <div className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Navigation Links - Desktop & Mobile */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul>
            <li>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="bi bi-house-door"></i>
                <span>Dashboard</span>
              </Link>
            </li> 

             {/* <li>
              <Link to="/schemesinstallments" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="bi bi-journal-bookmark-fill"></i>
                <span>Schemes Installments</span>
              </Link>
            </li>
            */}
            <li>
              <Link to="/schemes" onClick={() => setIsMobileMenuOpen(false)}>
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
      </div>
    </nav>
  );
};

export default Navbar;