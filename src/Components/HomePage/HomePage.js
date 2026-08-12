// HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './HomePage.css';
import LoginNavbar from '../Navbar/LoginNavbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [ratesData, setRatesData] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const bannerIntervalRef = useRef(null);

  // Get current logged-in customer ID from localStorage
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

  // Check if user is logged in
  const isUserLoggedIn = () => {
    return getCustomerId() !== null;
  };

  // Fetch rates from API
  const fetchRates = async () => {
    try {
      setRatesLoading(true);
      const response = await fetch(`${baseURL}/api/current-rates/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API data into the format expected by the rates ticker
      if (data) {
        // Handle both array and single object response
        let rateData = Array.isArray(data) ? data[0] : data;
        
        // If there's no data or invalid structure, throw error
        if (!rateData || !rateData.current_rates_id) {
          throw new Error('Invalid rate data received');
        }
        
        // Transform to rates display format
        const transformedRates = [
          {
            id: 1,
            metal: 'Gold 24K',
            rate: `₹${parseFloat(rateData.rate_24crt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            purity: '24 Carat',
            color: '#FFD700'
          },
          {
            id: 2,
            metal: 'Gold 22K',
            rate: `₹${parseFloat(rateData.rate_22crt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            purity: '22 Carat',
            color: '#FFC107'
          },
          {
            id: 3,
            metal: 'Gold 18K',
            rate: `₹${parseFloat(rateData.rate_18crt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            purity: '18 Carat',
            color: '#FFB300'
          },
          {
            id: 4,
            metal: 'Silver',
            rate: `₹${parseFloat(rateData.silver_rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            purity: '999 Fine',
            color: '#C0C0C0'
          }
        ];
        
        setRatesData(transformedRates);
        setLastUpdated(new Date().toLocaleString());
      } else {
        throw new Error('No data received from API');
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError('Failed to load rates');
      // Set empty rates array instead of fallback static values
      setRatesData([]);
    } finally {
      setRatesLoading(false);
    }
  };

  // Initial fetch and auto-refresh rates
  useEffect(() => {
    fetchRates();
    
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 300000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Banner images data
  const banners = [
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=500&fit=crop&crop=center',
      title: 'Latest Diamond Collection',
      subtitle: 'LATEST DIAMOND COLLECTION',
      overlay: 'DIAMOND COLLECTION'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=1200&h=500&fit=crop&crop=center',
      title: 'Gold Jewellery',
      subtitle: 'GOLD JEWELLERY',
      overlay: 'GOLD JEWELLERY'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=500&fit=crop&crop=center',
      title: 'Special Offer on Gemstones',
      subtitle: 'SPECIAL OFFER ON GEMSTONES',
      overlay: 'GEMSTONES'
    }
  ];

  // Collection images for clickable sections
  const collections = [
    {
      id: 'schemes',
      title: '💎 INVESTMENT SCHEMES',
      description: 'Start your investment journey with our exclusive schemes',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=400&fit=crop&crop=center',
      category: 'Schemes',
      icon: '📈'
    },
    {
      id: 'gold',
      title: 'GOLD JEWELLERY COLLECTION',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=400&fit=crop&crop=center',
      category: 'Gold'
    },
    {
      id: 'silver',
      title: 'SILVER JEWELLERY COLLECTION',
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=400&fit=crop&crop=center',
      category: 'Silver'
    }
  ];

  // Auto-scroll banners
  useEffect(() => {
    bannerIntervalRef.current = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);

    return () => {
      if (bannerIntervalRef.current) {
        clearInterval(bannerIntervalRef.current);
      }
    };
  }, [banners.length]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/api/opening-tags/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status && data.data) {
          const displayableProducts = data.data.filter(item => item.is_display === 1);
          
          const transformedProducts = displayableProducts.map((item, index) => ({
            id: item.opentag_id || index,
            name: item.product_name || `${item.sub_category} ${item.prefix || ''}`.trim(),
            category: item.category || 'Jewellery',
            subCategory: item.sub_category || '',
            price: parseFloat(item.total_price) || 0,
            originalPrice: null,
            image: item.image || getFallbackImage(item.category, item.sub_category),
            rating: 4.0 + Math.random() * 0.9,
            reviews: Math.floor(Math.random() * 200) + 10,
            isNew: item.status === 'Available' ? true : false,
            isGold: item.metal_type === 'GOLD',
            isSilver: item.metal_type === 'SILVER',
            metal: item.metal_type || 'Gold',
            weight: item.gross_weight || '0g',
            description: `${item.sub_category} - ${item.design_master || ''}`,
            inStock: item.status === 'Available',
            purity: item.purity,
            pcode: item.pcode_barcode,
            grossWeight: item.gross_weight,
            makingCharges: item.making_charges,
            tax: item.tax,
            status: item.status,
            stockPoint: item.stock_point,
            designMaster: item.design_master,
            is_display: item.is_display
          }));
          
          setProducts(transformedProducts);
          setFilteredProducts(transformedProducts);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        const fallbackProducts = getFallbackProducts();
        setProducts(fallbackProducts);
        setFilteredProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search, category, and collection
  useEffect(() => {
    let result = [...products];

    // Filter by collection (Gold/Silver)
    if (selectedCollection === 'Gold') {
      result = result.filter(product => product.isGold === true);
    } else if (selectedCollection === 'Silver') {
      result = result.filter(product => product.isSilver === true);
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.subCategory.toLowerCase().includes(query) ||
        product.metal.toLowerCase().includes(query)
      );
    }

    // Sort products
    result.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

    setFilteredProducts(result);
  }, [products, selectedCategory, sortBy, searchQuery, selectedCollection]);

  const getFallbackImage = (category, subCategory) => {
    const imageMap = {
      'GOLD JEWELLERY': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
      'SILVER JEWELLERY': 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop&crop=center',
      'GOLD BRACELETS': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&crop=center',
      'SILVER PATTI': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&crop=center'
    };
    return imageMap[category] || imageMap[subCategory] || 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
  };

  const getFallbackProducts = () => {
    return [
      {
        id: 1,
        name: 'Diamond Solitaire Ring',
        category: 'Rings',
        price: 24999,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
        rating: 4.8,
        reviews: 124,
        isNew: true,
        isGold: true,
        isSilver: false,
        metal: '18K Gold',
        weight: '3.5g',
        description: 'Elegant diamond solitaire ring with a classic design.',
        inStock: true,
        is_display: 1
      },
      {
        id: 2,
        name: 'Gold Chain Necklace',
        category: 'Necklaces',
        price: 18999,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&crop=center',
        rating: 4.5,
        reviews: 89,
        isNew: false,
        isGold: true,
        isSilver: false,
        metal: '22K Gold',
        weight: '12g',
        description: 'Beautiful gold chain necklace with intricate craftsmanship.',
        inStock: true,
        is_display: 1
      },
      {
        id: 3,
        name: 'Pearl Drop Earrings',
        category: 'Earrings',
        price: 7999,
        originalPrice: 12999,
        image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop&crop=center',
        rating: 4.7,
        reviews: 56,
        isNew: true,
        isGold: false,
        isSilver: true,
        metal: 'Silver',
        weight: '2g',
        description: 'Stunning pearl drop earrings with silver setting.',
        inStock: true,
        is_display: 1
      },
      {
        id: 4,
        name: 'Diamond Tennis Bracelet',
        category: 'Bracelets',
        price: 15999,
        originalPrice: 19999,
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&crop=center',
        rating: 4.9,
        reviews: 203,
        isNew: false,
        isGold: true,
        isSilver: false,
        metal: '14K Gold',
        weight: '6g',
        description: 'Stunning diamond tennis bracelet with brilliant cut diamonds.',
        inStock: true,
        is_display: 1
      }
    ];
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const handleProductClick = (productId) => {
    navigate(`/homeproductdetails/${productId}`);
  };

  const addToCart = (e, product) => {
    e.stopPropagation();
    
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = existingCart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `✨ ${product.name} added to cart!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const handleCollectionClick = (collection) => {
    // Check if it's the Schemes collection
    if (collection.id === 'schemes') {
      // Always show login prompt for schemes
      Swal.fire({
        title: '🔒 Login Required',
        text: 'Please login to view and invest in our exclusive schemes.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C9A84C',
        cancelButtonColor: '#d33',
        confirmButtonText: '✅ Yes, Login',
        cancelButtonText: 'Cancel',
        background: '#1a1a1a',
        color: '#ffffff',
        backdrop: 'rgba(0,0,0,0.8)',
        customClass: {
          popup: 'swal-popup-custom'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    // For Gold and Silver collections
    setSelectedCollection(collection.category);
    // Scroll to products section
    document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
  };

  const goToBanner = (index) => {
    setCurrentBannerIndex(index);
  };

  // Show loading state while both products and rates are loading
  if (loading || ratesLoading) {
    return (
      <div>
        <LoginNavbar />
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading our exquisite collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LoginNavbar />
      
      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search for Jewellery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">
            <span>🔍</span>
          </button>
        </div>
      </div>

      {/* Gold & Silver Rates Ticker */}
      {ratesData.length > 0 ? (
        <div className="rates-ticker">
          <div className="rates-ticker-container">
            <div className="rates-ticker-content">
              {ratesData.map((rate, index) => (
                <div key={rate.id} className="rate-item">
                  <span className="rate-metal" style={{ color: rate.color }}>
                    {rate.metal}
                  </span>
                  <span className="rate-purity">({rate.purity})</span>
                  <span className="rate-value">{rate.rate}</span>
                  {index < ratesData.length - 1 && (
                    <span className="rate-divider">|</span>
                  )}
                </div>
              ))}
              {/* Duplicate for seamless scrolling */}
              {ratesData.map((rate, index) => (
                <div key={`dup-${rate.id}`} className="rate-item">
                  <span className="rate-metal" style={{ color: rate.color }}>
                    {rate.metal}
                  </span>
                  <span className="rate-purity">({rate.purity})</span>
                  <span className="rate-value">{rate.rate}</span>
                  {index < ratesData.length - 1 && (
                    <span className="rate-divider">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {lastUpdated && (
            <div className="rates-last-updated">
              {/* <span>🔹 Last updated: {lastUpdated}</span> */}
            </div>
          )}
        </div>
      ) : (
        <div className="rates-error">
          <span>⚠️ Unable to load current rates. Please try again later.</span>
        </div>
      )}

      {/* Banner Slider */}
      <div className="banner-slider">
        <div className="banner-wrapper">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`banner-slide ${index === currentBannerIndex ? 'active' : ''}`}
            >
              <img src={banner.image} alt={banner.title} className="banner-image" />
              <div className="banner-overlay">
                <h2>{banner.overlay}</h2>
                <p>{banner.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Banner Dots */}
        <div className="banner-dots">
          {banners.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentBannerIndex ? 'active' : ''}`}
              onClick={() => goToBanner(index)}
            />
          ))}
        </div>
      </div>

      {/* Collection Images */}
      <div className="collections-section">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`collection-card ${collection.id === 'schemes' ? 'schemes-card' : ''}`}
            onClick={() => handleCollectionClick(collection)}
          >
            <img src={collection.image} alt={collection.title} className="collection-image" />
            <div className="collection-overlay">
              {collection.icon && (
                <div className="collection-icon">{collection.icon}</div>
              )}
              <h3>{collection.title}</h3>
              {collection.description && (
                <p className="collection-description">{collection.description}</p>
              )}
              <span className="collection-cta">
                {collection.id === 'schemes' ? 'Explore Schemes →' : 'View Collection →'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Products Section */}
      <div id="products-section" className="products-page">
        {/* Header */}
        <div className="products-header">
          <h1>✨ Our Collection</h1>
          <p>Discover exquisite jewellery pieces crafted with perfection</p>
        </div>

        {/* Filter and Sort Bar */}
        <div className="filter-bar">
          <div className="filter-section">
            <button 
              className="filter-toggle"
              onClick={() => setShowFilter(!showFilter)}
            >
              <span>☰</span> Categories
            </button>
            
            <div className={`category-filters ${showFilter ? 'show' : ''}`}>
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowFilter(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="sort-section">
            <label htmlFor="sort">Sort by:</label>
            <select 
              id="sort" 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="popular">Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          {selectedCollection !== 'All' && ` in ${selectedCollection} Collection`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="product-image-wrapper">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
                  }}
                />
                {product.isNew && (
                  <span className="badge-new">NEW</span>
                )}
                {product.originalPrice && (
                  <span className="badge-discount">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
                {product.inStock && (
                  <span className="badge-instock">In Stock</span>
                )}
              </div>

              <div className="product-details">
                <h3 className="product-name">{product.name || product.subCategory}</h3>
                
                <div className="product-weight">
                  ⚖️ Weight: {product.weight}
                </div>
                
                <div className="product-price">
                  <span className="current-price">₹{product.price.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  {product.originalPrice && (
                    <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={(e) => addToCart(e, product)}
                  disabled={!product.inStock}
                >
                  <span>🛒</span> {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <p>No products found matching your criteria</p>
          </div>
        )}
      </div>
      
      <Footer />

      <style jsx>{`
        .swal-popup-custom {
          border-radius: 15px;
          box-shadow: 0 0 30px rgba(201, 168, 76, 0.3);
        }
        .collection-description {
          font-size: 14px;
          color: #ddd;
          margin: 5px 0 10px;
          opacity: 0.9;
        }
        .collection-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }
        .collection-card.schemes-card .collection-overlay {
          background: linear-gradient(135deg, rgba(201, 168, 76, 0.85), rgba(184, 148, 62, 0.85));
        }
        .collection-card.schemes-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 50px rgba(201, 168, 76, 0.4);
        }
        .collection-card.schemes-card .collection-cta {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
        }
        .collection-card.schemes-card .collection-cta:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .rates-last-updated {
          text-align: center;
          padding: 5px 0;
          font-size: 12px;
          color: #888;
          background: rgba(0,0,0,0.05);
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .rates-last-updated span {
          opacity: 0.7;
        }
        .rates-error {
          text-align: center;
          padding: 10px;
          background: rgba(255, 0, 0, 0.1);
          color: #ff6b6b;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default HomePage;