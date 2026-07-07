import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Navbar from '../Navbar/Navbar';
import LoginNavbar from '../Navbar/LoginNavbar';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilter, setShowFilter] = useState(false);

  // Sample jewellery products data with realistic image URLs
  const products = [
    {
      id: 1,
      name: 'Diamond Solitaire Ring',
      category: 'Rings',
      price: 24999,
    //   originalPrice: 34999,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
      rating: 4.8,
      reviews: 124,
      isNew: true,
      isGold: true,
      metal: '18K Gold',
      weight: '3.5g',
      description: 'Elegant diamond solitaire ring with a classic design. Perfect for engagements and special occasions.',
      inStock: true
    },
    {
      id: 2,
      name: 'Gold Chain Necklace',
      category: 'Necklaces',
      price: 18999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&crop=center',
      rating: 4.5,
      reviews: 89,
      isNew: false,
      isGold: true,
      metal: '22K Gold',
      weight: '12g',
      description: 'Beautiful gold chain necklace with intricate craftsmanship. Adds elegance to any outfit.',
      inStock: true
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
      metal: 'Silver',
      weight: '2g',
      description: 'Stunning pearl drop earrings with silver setting. Perfect for weddings and parties.',
      inStock: true
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
      metal: '14K Gold',
      weight: '6g',
      description: 'Stunning diamond tennis bracelet with brilliant cut diamonds. A timeless piece.',
      inStock: true
    },
    {
      id: 5,
      name: 'Gold Mangalsutra',
      category: 'Necklaces',
      price: 29999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop&crop=center',
      rating: 4.6,
      reviews: 178,
      isNew: false,
      isGold: true,
      metal: '22K Gold',
      weight: '15g',
      description: 'Traditional gold mangalsutra with black beads. An essential piece for married women.',
      inStock: true
    },
    {
      id: 6,
      name: 'Diamond Stud Earrings',
      category: 'Earrings',
      price: 4999,
    //   originalPrice: 7999,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&crop=center',
      rating: 4.3,
      reviews: 67,
      isNew: true,
      isGold: false,
      metal: 'Silver',
      weight: '1g',
      description: 'Classic diamond stud earrings in silver setting. Perfect for everyday elegance.',
      inStock: true
    },
    {
      id: 7,
      name: 'Gold Engagement Ring',
      category: 'Rings',
      price: 34999,
    //   originalPrice: 45999,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center',
      rating: 4.9,
      reviews: 312,
      isNew: false,
      isGold: true,
      metal: '18K Gold',
      weight: '4g',
      description: 'Exquisite gold engagement ring with a stunning diamond center. A symbol of forever love.',
      inStock: true
    },
    {
      id: 8,
      name: 'Gold Anklet',
      category: 'Bracelets',
      price: 8999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&h=400&fit=crop&crop=center',
      rating: 4.4,
      reviews: 45,
      isNew: true,
      isGold: true,
      metal: '22K Gold',
      weight: '8g',
      description: 'Traditional gold anklet with delicate design. Adds charm to your feet.',
      inStock: true
    },
    {
      id: 9,
      name: 'Emerald Pendant',
      category: 'Necklaces',
      price: 12999,
    //   originalPrice: 15999,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center',
      rating: 4.8,
      reviews: 92,
      isNew: false,
      isGold: true,
      metal: '18K Gold',
      weight: '5g',
      description: 'Beautiful emerald pendant with gold setting. The perfect gift for special someone.',
      inStock: true
    },
    {
      id: 10,
      name: 'Gold Hoop Earrings',
      category: 'Earrings',
      price: 6999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1617038263802-bf90c1a14335?w=400&h=400&fit=crop&crop=center',
      rating: 4.5,
      reviews: 134,
      isNew: true,
      isGold: true,
      metal: '22K Gold',
      weight: '3g',
      description: 'Classic gold hoop earrings with a modern twist. Versatile and stylish.',
      inStock: true
    },
    {
      id: 11,
      name: 'Gold Cuff Bracelet',
      category: 'Bracelets',
      price: 11999,
    //   originalPrice: 14999,
      image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop&crop=center',
      rating: 4.6,
      reviews: 78,
      isNew: false,
      isGold: true,
      metal: '18K Gold',
      weight: '7g',
      description: 'Stylish gold cuff bracelet with modern design. A statement piece for any occasion.',
      inStock: true
    },
    {
      id: 12,
      name: 'Ruby Ring',
      category: 'Rings',
      price: 27999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center',
      rating: 4.7,
      reviews: 156,
      isNew: false,
      isGold: true,
      metal: '14K Gold',
      weight: '3.2g',
      description: 'Stunning ruby ring with a vibrant red stone. A statement of luxury and elegance.',
      inStock: true
    }
  ];

  // Categories for filter
  const categories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'];

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
    e.stopPropagation(); // Prevent navigation to product detail
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = existingCart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increase quantity
      existingItem.quantity += 1;
    } else {
      // Add new item
      existingCart.push({ ...product, quantity: 1 });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show feedback with a toast notification
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
            {/* Product Image - Fixed empty space */}
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
            </div>

            {/* Product Details */}
            <div className="product-details">
              <div className="product-meta">
                <span className="product-category">{product.category}</span>
                <span className="product-metal">{product.metal}</span>
              </div>
              
              <h3 className="product-name">{product.name}</h3>
              
              <div className="product-rating">
                <span className="stars">{renderStars(product.rating)}</span>
                <span className="rating-text">{product.rating}</span>
                <span className="reviews">({product.reviews} reviews)</span>
              </div>
              
              <div className="product-weight">
                ⚖️ Weight: {product.weight}
              </div>
              
              <div className="product-price">
                <span className="current-price">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              
              <button 
                className="add-to-cart-btn"
                onClick={(e) => addToCart(e, product)}
              >
                <span>🛒</span> Add to Cart
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
    </div>
  );
};

export default HomePage;