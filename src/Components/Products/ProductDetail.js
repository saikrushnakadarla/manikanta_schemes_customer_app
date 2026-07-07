import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import Navbar from '../Navbar/Navbar';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  // All products data (same as in Products component)
  const allProducts = [
    {
      id: 1,
      name: 'Diamond Solitaire Ring',
      category: 'Rings',
      price: 24999,
      originalPrice: 34999,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop&crop=center',
      rating: 4.8,
      reviews: 124,
      isNew: true,
      metal: '18K Gold',
      weight: '3.5g',
      description: 'Elegant diamond solitaire ring with a classic design. Perfect for engagements and special occasions. The diamond is ethically sourced and certified.',
      inStock: true,
      features: ['24K Gold Plated', 'Natural Diamond', 'Certificate Included', 'Free Resizing']
    },
    {
      id: 2,
      name: 'Gold Chain Necklace',
      category: 'Necklaces',
      price: 18999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&crop=center',
      rating: 4.5,
      reviews: 89,
      isNew: false,
      metal: '22K Gold',
      weight: '12g',
      description: 'Beautiful gold chain necklace with intricate craftsmanship. Adds elegance to any outfit. Perfect for both casual and formal occasions.',
      inStock: true,
      features: ['22K Pure Gold', 'Handcrafted', 'Adjustable Chain', 'Lifetime Warranty']
    },
    {
      id: 3,
      name: 'Pearl Drop Earrings',
      category: 'Earrings',
      price: 7999,
      originalPrice: 12999,
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=600&fit=crop&crop=center',
      rating: 4.7,
      reviews: 56,
      isNew: true,
      metal: 'Silver',
      weight: '2g',
      description: 'Stunning pearl drop earrings with silver setting. Perfect for weddings and parties. The pearls are naturally sourced and handpicked.',
      inStock: true,
      features: ['Natural Pearls', 'Silver Setting', 'Hypoallergenic', 'Gift Box Included']
    },
    {
      id: 4,
      name: 'Diamond Tennis Bracelet',
      category: 'Bracelets',
      price: 15999,
      originalPrice: 19999,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop&crop=center',
      rating: 4.9,
      reviews: 203,
      isNew: false,
      metal: '14K Gold',
      weight: '6g',
      description: 'Stunning diamond tennis bracelet with brilliant cut diamonds. A timeless piece that never goes out of style.',
      inStock: true,
      features: ['14K Gold', 'Brilliant Diamonds', 'Secure Clasp', 'Beautiful Gift Packaging']
    },
    {
      id: 5,
      name: 'Gold Mangalsutra',
      category: 'Necklaces',
      price: 29999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=600&fit=crop&crop=center',
      rating: 4.6,
      reviews: 178,
      isNew: false,
      metal: '22K Gold',
      weight: '15g',
      description: 'Traditional gold mangalsutra with black beads. An essential piece for married women with a modern design.',
      inStock: true,
      features: ['22K Gold', 'Traditional Design', 'Durable Chain', 'Beautiful Finish']
    },
    {
      id: 6,
      name: 'Diamond Stud Earrings',
      category: 'Earrings',
      price: 4999,
      originalPrice: 7999,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop&crop=center',
      rating: 4.3,
      reviews: 67,
      isNew: true,
      metal: 'Silver',
      weight: '1g',
      description: 'Classic diamond stud earrings in silver setting. Perfect for everyday elegance and office wear.',
      inStock: true,
      features: ['Silver Setting', 'Diamond Studs', 'Everyday Wear', 'Gift Box Included']
    },
    {
      id: 7,
      name: 'Gold Engagement Ring',
      category: 'Rings',
      price: 34999,
      originalPrice: 45999,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&crop=center',
      rating: 4.9,
      reviews: 312,
      isNew: false,
      metal: '18K Gold',
      weight: '4g',
      description: 'Exquisite gold engagement ring with a stunning diamond center. A symbol of forever love and commitment.',
      inStock: true,
      features: ['18K Gold', 'Premium Diamond', 'Certificate', 'Free Resizing']
    },
    {
      id: 8,
      name: 'Gold Anklet',
      category: 'Bracelets',
      price: 8999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&h=600&fit=crop&crop=center',
      rating: 4.4,
      reviews: 45,
      isNew: true,
      metal: '22K Gold',
      weight: '8g',
      description: 'Traditional gold anklet with delicate design. Adds charm and elegance to your feet for festive occasions.',
      inStock: true,
      features: ['22K Gold', 'Intricate Design', 'Adjustable', 'Perfect Gift']
    },
    {
      id: 9,
      name: 'Emerald Pendant',
      category: 'Necklaces',
      price: 12999,
      originalPrice: 15999,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&crop=center',
      rating: 4.8,
      reviews: 92,
      isNew: false,
      metal: '18K Gold',
      weight: '5g',
      description: 'Beautiful emerald pendant with gold setting. The perfect gift for that special someone who loves vibrant colors.',
      inStock: true,
      features: ['Natural Emerald', '18K Gold Setting', 'Chain Included', 'Certificate']
    },
    {
      id: 10,
      name: 'Gold Hoop Earrings',
      category: 'Earrings',
      price: 6999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1617038263802-bf90c1a14335?w=600&h=600&fit=crop&crop=center',
      rating: 4.5,
      reviews: 134,
      isNew: true,
      metal: '22K Gold',
      weight: '3g',
      description: 'Classic gold hoop earrings with a modern twist. Versatile and stylish for any occasion.',
      inStock: true,
      features: ['22K Gold', 'Modern Design', 'Lightweight', 'Comfortable']
    },
    {
      id: 11,
      name: 'Gold Cuff Bracelet',
      category: 'Bracelets',
      price: 11999,
      originalPrice: 14999,
      image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=600&fit=crop&crop=center',
      rating: 4.6,
      reviews: 78,
      isNew: false,
      metal: '18K Gold',
      weight: '7g',
      description: 'Stylish gold cuff bracelet with modern design. A statement piece that adds sophistication to any outfit.',
      inStock: true,
      features: ['18K Gold', 'Unique Design', 'Comfort Fit', 'Gift Ready']
    },
    {
      id: 12,
      name: 'Ruby Ring',
      category: 'Rings',
      price: 27999,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&crop=center',
      rating: 4.7,
      reviews: 156,
      isNew: false,
      metal: '14K Gold',
      weight: '3.2g',
      description: 'Stunning ruby ring with a vibrant red stone. A statement of luxury and elegance. The ruby is natural and vibrant.',
      inStock: true,
      features: ['Natural Ruby', '14K Gold', 'Unique Setting', 'Certificate']
    }
  ];

  useEffect(() => {
    // Find product by id
    const foundProduct = allProducts.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(foundProduct.image);
    } else {
      // Product not found, redirect to products page
      navigate('/products');
    }
  }, [id, navigate]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = () => {
    if (!product) return;
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = existingCart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increase quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      existingCart.push({ ...product, quantity: quantity });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show feedback
    alert(`✨ ${product.name} added to cart! (${quantity} item${quantity > 1 ? 's' : ''})`);
  };

  if (!product) {
    return (
      <div className="product-detail-loading">
        <div className="loader"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

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
        <Navbar />
    <div className="product-detail-page">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/products')}>
        ← Back to Products
      </button>

      <div className="product-detail-container">
        {/* Product Images */}
        <div className="product-images-section">
          <div className="main-image">
            <img 
              src={selectedImage} 
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600/FFD700/FFFFFF?text=Jewellery';
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
          <div className="thumbnail-images">
            {[product.image, product.image, product.image].map((img, idx) => (
              <div 
                key={idx} 
                className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt={`${product.name} view ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="product-category-tag">
            {product.category}
          </div>
          
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-rating-section">
            <span className="stars">{renderStars(product.rating)}</span>
            <span className="rating-text">{product.rating}</span>
            <span className="reviews">({product.reviews} customer reviews)</span>
          </div>
          
          <div className="product-price-section">
            <span className="current-price">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {product.originalPrice && (
              <span className="discount-percent">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
          
          <div className="product-meta-info">
            <div className="meta-item">
              <span className="meta-label">Metal:</span>
              <span className="meta-value">{product.metal}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Weight:</span>
              <span className="meta-value">{product.weight}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Availability:</span>
              <span className={`meta-value ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
              </span>
            </div>
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          <div className="product-features">
            <h3>Features</h3>
            <ul>
              {product.features.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="product-quantity">
            <label>Quantity:</label>
            <div className="quantity-control">
              <button 
                className="qty-btn"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="qty-number">{quantity}</span>
              <button 
                className="qty-btn"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
          </div>
          
          <div className="product-actions">
            <button className="add-to-cart-btn" onClick={addToCart}>
              🛒 Add to Cart
            </button>
            <button className="buy-now-btn">
              Buy Now
            </button>
          </div>
          
          <div className="product-guarantee">
            <div className="guarantee-item">
              <span>🔒</span>
              <span>Secure Payment</span>
            </div>
            <div className="guarantee-item">
              <span>🚚</span>
              <span>Free Delivery</span>
            </div>
            <div className="guarantee-item">
              <span>🔄</span>
              <span>7-Day Return</span>
            </div>
          </div>
        </div>
      </div>
    </div> 
    </div>
  );
};

export default ProductDetail;