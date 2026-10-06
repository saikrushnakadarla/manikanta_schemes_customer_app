import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './HomePage.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import BottomNav from '../Navbar/Bottomnav';
import baseURL from '../URL/BaseURL';
import { isLoggedIn } from '../Navbar/NavConfig';

const PRODUCTS_PREVIEW_COUNT = 6;

const LOCKED_ITEMS = [
  { id: 'address', title: 'Saved Address', desc: 'Discover all your saved addresses here', color: '#e53935', icon: '📍' },
  { id: 'orders', title: 'Orders', desc: 'Access your complete order history here', color: '#2e7d32', icon: '👜' },
  { id: 'custom', title: 'Custom Orders', desc: 'Manage your custom order list', color: '#fb8c00', icon: '📝' },
  { id: 'wishlist', title: 'Wishlist', desc: 'Discover the products in your wishlist', color: '#e91e63', icon: '🤍' },
  { id: 'cart', title: 'Cart', desc: 'Manage all products added to your cart', color: '#1565c0', icon: '🛒' }
];

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const productsSectionRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratesData, setRatesData] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const showProfile = new URLSearchParams(location.search).get('profile') === '1';

  // Logged-in users belong on the members home
  useEffect(() => {
    if (isLoggedIn()) navigate(`/products${location.search}`, { replace: true });
    // eslint-disable-next-line
  }, []);

  // ---------- Register / Login prompt (used for every protected action) ----------
  const promptRegister = (action = 'continue') => {
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

  const formatUpdated = (value) => {
    const d = value ? new Date(value) : new Date();
    const date = isNaN(d.getTime()) ? new Date() : d;
    const day = date.toLocaleString('en-GB', { day: '2-digit' });
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const time = date
      .toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      .toLowerCase();
    return `${day} ${month}, ${time}`;
  };

  // ---------- Rates ----------
  const fetchRates = async () => {
    try {
      setRatesLoading(true);
      const response = await fetch(`${baseURL}/api/current-rates/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const rateData = Array.isArray(data) ? data[0] : data;
      if (!rateData || !rateData.current_rates_id) throw new Error('Invalid rate data received');

      const fmt = (v) =>
        `₹${parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const updated = formatUpdated(rateData.updated_at || rateData.created_at || rateData.date);

      setRatesData([
        { id: 1, metal: 'Gold', rate: fmt(rateData.rate_24crt), purity: '24K (999)', tone: 'blue', icon: '🪙', gst: '', updated },
        { id: 2, metal: 'Gold', rate: fmt(rateData.rate_22crt), purity: '22K (916)', tone: 'pink', icon: '🪙', gst: '', updated },
        { id: 3, metal: 'Gold', rate: fmt(rateData.rate_18crt), purity: '18K (750)', tone: 'green', icon: '🪙', gst: '+3% GST', updated },
        { id: 4, metal: 'Silver', rate: fmt(rateData.silver_rate), purity: '999 Fine', tone: 'yellow', icon: '🥈', gst: '+3% GST', updated }
      ]);
    } catch (err) {
      console.error('Error fetching rates:', err);
      setRatesData([]);
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 300000);
    return () => clearInterval(interval);
  }, []);

  // ---------- Banners ----------
  const banners = [
    { id: 2, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=800&fit=crop&crop=center', title: 'Latest Diamond Collection' },
    { id: 3, image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=1200&h=800&fit=crop&crop=center', title: 'Gold Jewellery' },
    { id: 4, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=800&fit=crop&crop=center', title: 'Special Offer on Gemstones' }
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrentBannerIndex((p) => (p + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  // ---------- Products ----------
  const getFallbackImage = (category, subCategory) => {
    const imageMap = {
      'GOLD JEWELLERY': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
      'SILVER JEWELLERY': 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop&crop=center',
      'GOLD BRACELETS': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&crop=center',
      'SILVER PATTI': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&crop=center'
    };
    return imageMap[category] || imageMap[subCategory] || 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
  };

  const getFallbackProducts = () => [
    { id: 1, name: 'Diamond Solitaire Ring', category: 'Rings', subCategory: 'Rings', price: 24999, image: getFallbackImage('GOLD JEWELLERY'), rating: 4.8, inStock: true },
    { id: 2, name: 'Gold Chain Necklace', category: 'Necklaces', subCategory: 'Necklaces', price: 18999, image: getFallbackImage('SILVER JEWELLERY'), rating: 4.5, inStock: true },
    { id: 3, name: 'Pearl Drop Earrings', category: 'Earrings', subCategory: 'Earrings', price: 7999, image: getFallbackImage('GOLD BRACELETS'), rating: 4.7, inStock: true },
    { id: 4, name: 'Diamond Tennis Bracelet', category: 'Bracelets', subCategory: 'Bracelets', price: 15999, image: getFallbackImage('SILVER PATTI'), rating: 4.9, inStock: true }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/api/opening-tags/`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.status && data.data) {
          const transformed = data.data
            .filter((item) => item.is_display === 1)
            .map((item, index) => ({
              id: item.opentag_id || index,
              name: item.product_name || `${item.sub_category} ${item.prefix || ''}`.trim(),
              category: item.category || 'Jewellery',
              subCategory: item.sub_category || '',
              price: parseFloat(item.total_price) || 0,
              originalPrice: null,
              image: item.image || getFallbackImage(item.category, item.sub_category),
              rating: 4.0 + Math.random() * 0.9,
              inStock: item.status === 'Available',
              purity: item.purity,
              grossWeight: item.gross_weight
            }));
          setProducts(transformed);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts(getFallbackProducts());
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // ---------- Derived data ----------
  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const subCategoryTiles = (() => {
    const map = new Map();
    products.forEach((p) => {
      const key = p.subCategory || p.category;
      if (key && !map.has(key)) map.set(key, { name: key, category: p.category, image: p.image });
    });
    return Array.from(map.values());
  })();

  const visibleSubCategories = subCategoryTiles.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  );

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
    if (selectedSubCategory !== 'All' && (product.subCategory || product.category) !== selectedSubCategory) return false;
    const q = searchQuery.trim().toLowerCase();
    if (q && !`${product.name} ${product.category} ${product.subCategory}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const isFiltering = selectedCategory !== 'All' || selectedSubCategory !== 'All' || searchQuery.trim() !== '';
  const displayedProducts =
    showAllProducts || isFiltering ? sortedProducts : sortedProducts.slice(0, PRODUCTS_PREVIEW_COUNT);
  const trendingProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  // ---------- Handlers ----------
  const scrollToProducts = () => {
    if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectSubCategory = (sub) => {
    setSelectedSubCategory(sub.name);
    setSelectedCategory(sub.category);
    setShowFilter(false);
    setTimeout(scrollToProducts, 50);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory('All');
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSearchQuery('');
    setShowSearch(false);
  };

  // Filters coming from the sidebar / bottom nav (?category=..&sub=..&search=1)
  useEffect(() => {
    if (loading || showProfile) return;
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const sub = params.get('sub');
    const wantsSearch = params.get('search');

    if (cat || sub) {
      setSelectedCategory(cat || 'All');
      setSelectedSubCategory(sub || 'All');
      setShowAllProducts(false);
      setShowSearch(false);
      setSearchQuery('');
      setTimeout(scrollToProducts, 150);
    } else if (wantsSearch) {
      setShowSearch(true);
      setTimeout(() => {
        scrollToProducts();
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 250);
    }
    // eslint-disable-next-line
  }, [location.key, location.search, loading]);

  const renderProductInfo = (product) => {
    const weightNum = parseFloat(product.grossWeight);
    if (product.grossWeight && !isNaN(weightNum) && weightNum > 0) {
      return (
        <p className="pc-info">
          {product.grossWeight} Grams{product.purity ? ` - ${product.purity}` : ''}
        </p>
      );
    }
    return <p className="pc-info">₹ {product.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>;
  };

  const renderProductCard = (product, keyPrefix = '') => (
    <div
      key={`${keyPrefix}${product.id}`}
      className="product-card"
      onClick={() => navigate(`/homeproductdetails/${product.id}`)}
    >
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery'; }}
        />
      </div>
      <div className="product-details">
        <div className="pc-text">
          <h3 className="product-name">{product.name || product.subCategory}</h3>
          {renderProductInfo(product)}
        </div>
        <div className="pc-actions">
          <button
            className="wishlist-btn"
            aria-label="Add to wishlist"
            onClick={(e) => { e.stopPropagation(); promptRegister('add items to your wishlist'); }}
          >
            <span className="wishlist-icon">🤍</span>
          </button>
          <button
            className="add-to-cart-btn"
            aria-label="Add to cart"
            disabled={!product.inStock}
            onClick={(e) => { e.stopPropagation(); promptRegister('add items to your cart'); }}
          >
            <span>🛒</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ---------- Loading / error ----------
  if (loading || (ratesLoading && ratesData.length === 0)) {
    return (
      <div className="guest-home">
        <Navbar />
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading our exquisite collection...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="guest-home">
        <Navbar />
        <div className="error-container">
          <h2>😕 Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  // =====================  PROFILE (locked, guest)  =====================
  if (showProfile) {
    return (
      <div className="guest-home">
        <Navbar />
        <div className="products-page profile-page">
          <h2 className="profile-title">PROFILE</h2>

          <div className="profile-login-card">
            <span>Please login to access your account</span>
            <button className="profile-login-btn" onClick={() => navigate('/login')}>Login</button>
          </div>

          <h3 className="profile-section">SECURITY</h3>
          <div className="profile-card" onClick={() => promptRegister('enable biometric security')}>
            <span className="profile-icon" style={{ background: '#5b3fc0' }}>🙂</span>
            <span className="profile-text">
              <strong>Enable Face Lock / Touch ID</strong>
              <small>Secure your app with biometric authentication</small>
            </span>
            <span className="profile-switch" />
          </div>

          <h3 className="profile-section">MY ACCOUNT</h3>
          {LOCKED_ITEMS.map((item) => (
            <div
              key={item.id}
              className="profile-card"
              onClick={() => promptRegister(`access ${item.title.toLowerCase()}`)}
            >
              <span className="profile-icon" style={{ background: item.color }}>{item.icon}</span>
              <span className="profile-text">
                <strong>{item.title}</strong>
                <small>{item.desc}</small>
              </span>
              <span className="profile-lock">🔒</span>
            </div>
          ))}
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // =====================  HOME (guest)  =====================
  const tilesToShow = subCategoryTiles.slice(0, 3);

  return (
    <div className="guest-home">
      <Navbar />
      <div className="products-page">

        {/* Reward banner -> register */}
        <button className="reward-banner" onClick={() => promptRegister('view your reward points')}>
          <span className="reward-gift-box">🎁</span>
          <span className="reward-text">
            <span className="reward-label">Total Reward Points</span>
            <span className="reward-points">0 Points</span>
          </span>
          <span className="reward-art" aria-hidden="true">🎁</span>
          <span className="reward-arrow">›</span>
        </button>

        {/* Category tiles */}
        <section className="category-tiles">
          {tilesToShow.map((sub) => (
            <button
              key={sub.name}
              className={`category-tile ${selectedSubCategory === sub.name ? 'active' : ''}`}
              onClick={() => handleSelectSubCategory(sub)}
            >
              <span className="category-tile-img">
                <img
                  src={sub.image}
                  alt={sub.name}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Jewellery'; }}
                />
              </span>
              <span className="category-tile-label">{sub.name}</span>
            </button>
          ))}
          <button className="category-tile" onClick={() => setShowFilter(true)} aria-label="More categories">
            <span className="category-tile-img more">
              <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#fff" strokeWidth="1.8">
                <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
              </svg>
            </span>
            <span className="category-tile-label">More</span>
          </button>
        </section>

        {/* Metal rates */}
        <section className="section-block">
          <h2 className="section-title">Metal Rates</h2>
          {ratesData.length > 0 ? (
            <div className="rates-scroll">
              {ratesData.map((rate) => (
                <div key={rate.id} className={`rate-card tone-${rate.tone}`}>
                  <div className="rate-card-top">
                    <span className="rate-icon">{rate.icon}</span>
                    <div className="rate-names">
                      <span className="rate-metal">{rate.metal}</span>
                      <span className="rate-purity">{rate.purity}</span>
                    </div>
                  </div>
                  <div className="rate-value">{rate.rate}</div>
                  <div className="rate-gst">{rate.gst}</div>
                  <div className="rate-updated">Updated: {rate.updated}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rates-error"><span>⚠️ Unable to load current rates. Please try again later.</span></div>
          )}
        </section>

        {/* More options */}
        <section className="section-block">
          <h2 className="section-title">More Options</h2>
          <div className="options-grid">
            <button className="option-card tone-green" onClick={() => promptRegister('view installment plans')}>
              <span className="option-icon">🗓️</span>
              <span className="option-label">Installment Plan</span>
            </button>
          </div>
        </section>

        {/* Banner */}
        <section className="banner-slider-product">
          <div className="banner-wrapper">
            {banners.map((banner, index) => (
              <div key={banner.id} className={`banner-slide ${index === currentBannerIndex ? 'active' : ''}`}>
                <img src={banner.image} alt={banner.title} className="banner-image" />
              </div>
            ))}
          </div>
          <div className="banner-counter-row">
            <span className="banner-counter">{currentBannerIndex + 1}/{banners.length}</span>
          </div>
        </section>

        {/* Products */}
        <section className="section-block" ref={productsSectionRef}>
          <div className="section-head">
            <h2 className="section-title">All Products</h2>
            <div className="head-actions">
              <button
                className="head-search-btn"
                aria-label="Search products"
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchInputRef.current && searchInputRef.current.focus(), 100);
                }}
              >
                🔍
              </button>
              <button
                className="view-all"
                onClick={() => (isFiltering ? clearFilters() : setShowAllProducts((p) => !p))}
              >
                {isFiltering ? 'Clear ✕' : showAllProducts ? 'Show Less <' : 'View All >'}
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="search-bar-wrapper">
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search for Jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="search-button"
                aria-label="Close search"
                onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              >
                <span>✕</span>
              </button>
            </div>
          )}

          <div className="products-grid">{displayedProducts.map((p) => renderProductCard(p))}</div>

          {sortedProducts.length === 0 && (
            <div className="empty-state"><p>No products found</p></div>
          )}
        </section>

        {/* Top trending */}
        {trendingProducts.length > 0 && !isFiltering && (
          <section className="section-block">
            <div className="section-head">
              <h2 className="section-title">Top Trending</h2>
              <button
                className="view-all"
                onClick={() => { setSortBy('rating'); setShowAllProducts(true); scrollToProducts(); }}
              >
                View All &gt;
              </button>
            </div>
            <div className="products-grid">{trendingProducts.map((p) => renderProductCard(p, 'trend-'))}</div>
          </section>
        )}
      </div>

      {/* Categories bottom sheet */}
      {showFilter && (
        <div className="sheet-backdrop" onClick={() => setShowFilter(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-head">
              <h3>Categories</h3>
              <button className="sheet-close" onClick={() => setShowFilter(false)} aria-label="Close">✕</button>
            </div>

            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleSelectCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <h4 className="sheet-sub-title">Sub Categories</h4>
            <div className="sheet-tiles">
              {visibleSubCategories.map((sub) => (
                <button
                  key={sub.name}
                  className={`category-tile ${selectedSubCategory === sub.name ? 'active' : ''}`}
                  onClick={() => handleSelectSubCategory(sub)}
                >
                  <span className="category-tile-img">
                    <img
                      src={sub.image}
                      alt={sub.name}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Jewellery'; }}
                    />
                  </span>
                  <span className="category-tile-label">{sub.name}</span>
                </button>
              ))}
            </div>

            <h4 className="sheet-sub-title">Sort by</h4>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="popular">Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            <div className="sheet-actions">
              <button className="sheet-clear" onClick={clearFilters}>Clear all</button>
              <button className="sheet-apply" onClick={() => { setShowFilter(false); setTimeout(scrollToProducts, 50); }}>
                Show products
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
};

export default HomePage;