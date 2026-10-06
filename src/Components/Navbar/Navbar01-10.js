import React, { useState, useEffect } from 'react';
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
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const navigate = useNavigate();

  // Get current logged-in customer ID
  const getCustomerId = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || user.customer_id || user.user_id || null;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    const customerId = localStorage.getItem('customerId') || 
                      localStorage.getItem('customer_id') || 
                      localStorage.getItem('userId');
    
    if (customerId) {
      return parseInt(customerId);
    }
    
    return null;
  };

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const customerId = getCustomerId();
      if (!customerId) {
        setCartCount(0);
        return;
      }

      const response = await fetch(`${baseURL}/api/cart/?customer_id=${customerId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.items) {
        const totalItems = data.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCount(totalItems);
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    }
  };

  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    try {
      const customerId = getCustomerId();
      if (!customerId) {
        setWishlistCount(0);
        return;
      }

      const response = await fetch(`${baseURL}/api/wishlist/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        items = data.data;
      }
      
      const customerItems = items.filter(item => item.customer === customerId);
      setWishlistCount(customerItems.length);
    } catch (err) {
      console.error('Error fetching wishlist count:', err);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    const handleWishlistUpdate = () => {
      fetchWishlistCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You are about to logout from your account!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#A36E29',
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

        {/* Logo - Center with Brand Name */}
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
            <span className="brand-name">MANIKANTHA</span>
            <span className="brand-subtitle">JEWELLERS</span>
          </Link>
        </div>

        {/* Right side icons - Cart and Wishlist */}
        <div className="navbar-icons">
          <Link to="/wishlist" className="nav-icon" onClick={closeMobileMenu} title="Wishlist">
            <i className="bi bi-heart-fill"></i>
            {wishlistCount > 0 && (
              <span className="icon-badge">{wishlistCount}</span>
            )}
          </Link>
          <Link to="/cartpage" className="nav-icon" onClick={closeMobileMenu} title="Cart">
            <i className="bi bi-cart-fill"></i>
            {cartCount > 0 && (
              <span className="icon-badge">{cartCount}</span>
            )}
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
                {cartCount > 0 && (
                  <span className="mobile-badge">{cartCount}</span>
                )}
              </Link>
            </li>

            <li>
              <Link to="/wishlist" onClick={closeMobileMenu}>
                <i className="bi bi-heart-fill"></i>
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="mobile-badge">{wishlistCount}</span>
                )}
              </Link>
            </li>

            <li>
              <Link to="/orders" onClick={closeMobileMenu}>
                <i className="bi bi-box-seam-fill"></i>
                <span>Orders</span>
              </Link>
            </li>

            <li>
              <Link to="/schemes" onClick={closeMobileMenu}>
                <i className="bi bi-journal-bookmark-fill"></i>
                <span>Schemes</span>
              </Link>
            </li>

            <li>
              <Link to="/about" onClick={closeMobileMenu}>
                <i className="bi bi-info-circle-fill"></i>
                <span>About Us</span>
              </Link>
            </li>

            <li>
              <Link to="/contact" onClick={closeMobileMenu}>
                <i className="bi bi-headset"></i>
                <span>Contact Us</span>
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