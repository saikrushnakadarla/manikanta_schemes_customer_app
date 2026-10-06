import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';
import logoImage from '../Images/MANIKANTHA JEWELLERS FINAL LOOG DESIGN (1)_page-0001.jpg';
import baseURL from '../URL/BaseURL';
import { ROUTES, getHomeRoute, buildHomeFilterUrl, getUserName } from './NavConfig';

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  // Get current logged-in customer ID (null for guests)
  const getCustomerId = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const uid = user.id || user.customer_id || user.user_id || null;
        if (uid) return uid;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    const customerId =
      localStorage.getItem('customerId') ||
      localStorage.getItem('customer_id') ||
      localStorage.getItem('userId');

    if (customerId) {
      return parseInt(customerId);
    }

    return null;
  };

  const isGuest = !getCustomerId();

  // Guests get the Register / Login popup instead of protected pages
  const promptRegister = (action = 'continue') => {
    closeDrawer();
    Swal.fire({
      title: '🔒 Register to Continue',
      text: `Please register or login to ${action}.`,
      icon: 'info',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Register',
      denyButtonText: 'Login',
      cancelButtonText: 'Not now',
      confirmButtonColor: '#5b2189',
      denyButtonColor: '#C9A84C',
      cancelButtonColor: '#888',
      background: '#1a1a1a',
      color: '#ffffff',
      backdrop: 'rgba(0,0,0,0.8)'
    }).then((result) => {
      if (result.isConfirmed) navigate('/customerregister');
      else if (result.isDenied) navigate('/login');
    });
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

      const customerItems = items.filter((item) => item.customer === customerId);
      setWishlistCount(customerItems.length);
    } catch (err) {
      console.error('Error fetching wishlist count:', err);
      setWishlistCount(0);
    }
  };

  // Fetch categories + sub categories for the sidebar
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${baseURL}/api/opening-tags/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const items = (data && data.status && data.data ? data.data : []).filter((i) => i.is_display === 1);

      const catMap = new Map();
      items.forEach((item) => {
        const catName = item.category || 'Jewellery';
        if (!catMap.has(catName)) {
          catMap.set(catName, { name: catName, image: item.image || '', subs: new Map() });
        }
        const cat = catMap.get(catName);
        if (!cat.image && item.image) cat.image = item.image;
        const subName = item.sub_category;
        if (subName && !cat.subs.has(subName)) {
          cat.subs.set(subName, { name: subName, image: item.image || '' });
        }
      });

      setCategories(
        Array.from(catMap.values()).map((c) => ({ ...c, subs: Array.from(c.subs.values()) }))
      );
    } catch (err) {
      console.error('Error fetching sidebar categories:', err);
      setCategories([]);
    } finally {
      setCategoriesLoaded(true);
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();

    const handleCartUpdate = () => fetchCartCount();
    const handleWishlistUpdate = () => fetchWishlistCount();

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
    // eslint-disable-next-line
  }, []);

  const openDrawer = () => {
    setIsDrawerOpen(true);
    if (!categoriesLoaded) fetchCategories();
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const toggleCategory = (name) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  const goToFilter = (category, sub) => {
    closeDrawer();
    navigate(buildHomeFilterUrl(category, sub));
  };

  const renderThumb = (image, alt) =>
    image ? (
      <img
        src={image}
        alt={alt}
        className="tn-thumb"
        onError={(e) => {
          e.target.style.display = 'none';
          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
        }}
      />
    ) : null;

  const Placeholder = ({ show }) => (
    <span className="tn-thumb tn-thumb-placeholder" style={{ display: show ? 'flex' : 'none' }}>
      <i className="bi bi-image"></i>
    </span>
  );

  // Header icon: real link for members, register popup for guests
  const renderHeaderIcon = (to, title, iconClass, count, actionText) => {
    if (isGuest) {
      return (
        <button
          type="button"
          className="tn-icon-btn"
          title={title}
          aria-label={title}
          onClick={() => promptRegister(actionText)}
          style={{ border: 'none' }}
        >
          <i className={`bi ${iconClass}`}></i>
        </button>
      );
    }
    return (
      <Link to={to} className="tn-icon-btn" title={title}>
        <i className={`bi ${iconClass}`}></i>
        {count > 0 && <span className="tn-badge">{count}</span>}
      </Link>
    );
  };

  return (
    <>
      <header className="tn-header">
        <div className="tn-header-inner">
          <button className="tn-menu-btn" onClick={openDrawer} aria-label="Open menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <Link to={getHomeRoute()} className="tn-logo" onClick={closeDrawer}>
            <span className="tn-logo-chip">
              <img
                src={logoImage}
                alt="Company Logo"
                className="tn-logo-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </span>
            <span className="tn-brand">
              <span className="tn-brand-name">MANIKANTHA</span>
              <span className="tn-brand-sub">JEWELLERS</span>
            </span>
          </Link>

          <div className="tn-icons">
            {renderHeaderIcon(ROUTES.wishlist, 'Wishlist', 'bi-heart-fill', wishlistCount, 'view your wishlist')}
            {renderHeaderIcon(ROUTES.cart, 'Cart', 'bi-cart-fill', cartCount, 'view your cart')}
            {renderHeaderIcon(ROUTES.notifications, 'Notifications', 'bi-bell-fill', 0, 'view your notifications')}
          </div>
        </div>
      </header>

      {/* Sidebar drawer */}
      <div
        className={`tn-overlay ${isDrawerOpen ? 'show' : ''}`}
        onClick={closeDrawer}
      ></div>

      <button
        className={`tn-drawer-close ${isDrawerOpen ? 'show' : ''}`}
        onClick={closeDrawer}
        aria-label="Close menu"
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      <aside className={`tn-drawer ${isDrawerOpen ? 'open' : ''}`} aria-hidden={!isDrawerOpen}>
        <div className="tn-drawer-user">
          <span className="tn-avatar">
            <i className="bi bi-person-fill"></i>
          </span>
          <p className="tn-hi">Hi</p>
          <p className="tn-username">{isGuest ? 'Guest' : getUserName()}</p>
        </div>

        <h3 className="tn-drawer-title">Categories &amp; Sub Categories</h3>

        <div className="tn-cat-list">
          {!categoriesLoaded && <p className="tn-cat-msg">Loading...</p>}
          {categoriesLoaded && categories.length === 0 && (
            <p className="tn-cat-msg">No categories found</p>
          )}

          {categories.map((cat) => {
            const isOpen = expanded === cat.name;
            return (
              <div key={cat.name} className="tn-cat-block">
                <div className="tn-cat-row">
                  <button
                    className="tn-cat-main"
                    onClick={() => goToFilter(cat.name, '')}
                  >
                    {renderThumb(cat.image, cat.name)}
                    <Placeholder show={!cat.image} />
                    <span className="tn-cat-name">{cat.name}</span>
                  </button>
                  {cat.subs.length > 0 && (
                    <button
                      className="tn-cat-toggle"
                      onClick={() => toggleCategory(cat.name)}
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                      {isOpen ? '−' : '+'}
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="tn-sub-list">
                    {cat.subs.map((sub) => (
                      <button
                        key={sub.name}
                        className="tn-sub-row"
                        onClick={() => goToFilter(cat.name, sub.name)}
                      >
                        {renderThumb(sub.image, sub.name)}
                        <Placeholder show={!sub.image} />
                        <span className="tn-sub-name">{sub.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Navbar;