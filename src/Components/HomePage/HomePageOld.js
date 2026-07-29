import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Navbar from '../Navbar/Navbar';
import LoginNavbar from '../Navbar/LoginNavbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          // Transform API data to match your product structure
          const transformedProducts = data.data.map((item, index) => ({
            id: item.opentag_id || index,
            name: item.product_name || `${item.sub_category} ${item.prefix || ''}`.trim(),
            category: item.category || 'Jewellery',
            subCategory: item.sub_category || '',
            price: parseFloat(item.total_price) || 0,
            originalPrice: null, // API doesn't have original price
            image: item.image || getFallbackImage(item.category, item.sub_category),
            rating: 4.0 + Math.random() * 0.9, // Generate random rating since API doesn't provide
            reviews: Math.floor(Math.random() * 200) + 10,
            isNew: item.status === 'Available' ? true : false,
            isGold: item.metal_type === 'GOLD',
            metal: item.metal_type || 'Gold',
            weight: item.gross_weight || '0g',
            description: `${item.sub_category} - ${item.design_master || ''}`,
            inStock: item.status === 'Available',
            // Additional fields from API
            purity: item.purity,
            pcode: item.pcode_barcode,
            grossWeight: item.gross_weight,
            makingCharges: item.making_charges,
            tax: item.tax,
            status: item.status,
            stockPoint: item.stock_point,
            designMaster: item.design_master
          }));
          
          setProducts(transformedProducts);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        // Use fallback data if API fails
        setProducts(getFallbackProducts());
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fallback image function
  const getFallbackImage = (category, subCategory) => {
    const imageMap = {
      'GOLD JEWELLERY': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
      'SILVER JEWELLERY': 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop&crop=center',
      'GOLD BRACELETS': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&crop=center',
      'SILVER PATTI': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&crop=center'
    };
    return imageMap[category] || imageMap[subCategory] || 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
  };

  // Fallback products if API fails
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
        metal: '18K Gold',
        weight: '3.5g',
        description: 'Elegant diamond solitaire ring with a classic design.',
        inStock: true
      }
    ];
  };

  // Categories for filter - dynamically from API data
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // popular (default)
  });

  // Navigate to product detail
  const handleProductClick = (productId) => {
    navigate(`/homeproductdetails/${productId}`);
  };

  // Add to cart handler
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

  // Render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '★'}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  // Loading state
  if (loading) {
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

  // Error state
  if (error) {
    return (
      <div>
        <LoginNavbar />
        <div className="error-container">
          <h2>😕 Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return ( 
    <div> 
      <LoginNavbar />
      <div className="products-page">
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
          Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {sortedProducts.map(product => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => handleProductClick(product.id)}
            >
              {/* Product Image */}
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

              {/* Product Details */}
              <div className="product-details">
                <div className="product-meta">
                  <span className="product-category">{product.category}</span>
                  <span className="product-metal">{product.metal}</span>
                </div>
                
                <h3 className="product-name">{product.name || product.subCategory}</h3>
                
                {product.purity && (
                  <div className="product-purity">
                    💎 Purity: {product.purity}%
                  </div>
                )}
                
                <div className="product-rating">
                  <span className="stars">{renderStars(product.rating)}</span>
                  <span className="rating-text">{product.rating.toFixed(1)}</span>
                  <span className="reviews">({product.reviews} reviews)</span>
                </div>
                
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

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="empty-state">
            <p>No products found in this category</p>
          </div>
        )}
      </div> 
      <Footer />
    </div>
  );
};

export default HomePage;