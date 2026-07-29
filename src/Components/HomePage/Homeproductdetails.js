import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Homeproductdetails.css';
import Navbar from '../Navbar/Navbar';
import LoginNavbar from '../Navbar/LoginNavbar';
import Swal from 'sweetalert2';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const Homeproductdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/api/opening-tags/${id}/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status && data.data) {
          const item = data.data;
          
          // Transform API data to match your product structure
          const transformedProduct = {
            id: item.opentag_id,
            name: item.product_name || `${item.sub_category} ${item.prefix || ''}`.trim(),
            category: item.category || 'Jewellery',
            subCategory: item.sub_category || '',
            price: parseFloat(item.total_price) || 0,
            originalPrice: null, // API doesn't have original price
            image: item.image || getFallbackImage(item.category, item.sub_category),
            rating: 4.0 + Math.random() * 0.9, // Generate random rating
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
            taxAmt: item.tax_amt,
            status: item.status,
            stockPoint: item.stock_point,
            designMaster: item.design_master,
            rate: item.rate,
            totalPrice: item.total_price,
            // Features from API data
            features: [
              `Purity: ${item.purity}%`,
              `Metal Type: ${item.metal_type}`,
              `Barcode: ${item.pcode_barcode || 'N/A'}`,
              `Making Charges: ₹${parseFloat(item.making_charges).toFixed(2)}`,
              `Tax: ${item.tax || 'N/A'}`,
              `Tax Amount: ₹${parseFloat(item.tax_amt).toFixed(2)}`,
              `Stock Point: ${item.stock_point || 'N/A'}`,
              `Design: ${item.design_master || 'Standard'}`,
              `Status: ${item.status}`,
              `Source: ${item.source || 'N/A'}`
            ]
          };
          
          setProduct(transformedProduct);
          setSelectedImage(transformedProduct.image);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message);
        // Use fallback product if API fails
        const fallbackProduct = getFallbackProduct();
        setProduct(fallbackProduct);
        setSelectedImage(fallbackProduct.image);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Fallback image function
  const getFallbackImage = (category, subCategory) => {
    const imageMap = {
      'GOLD JEWELLERY': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop&crop=center',
      'SILVER JEWELLERY': 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=600&fit=crop&crop=center',
      'GOLD BRACELETS': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop&crop=center',
      'SILVER PATTI': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop&crop=center'
    };
    return imageMap[category] || imageMap[subCategory] || 'https://via.placeholder.com/600x600/FFD700/FFFFFF?text=Jewellery';
  };

  // Fallback product if API fails
  const getFallbackProduct = () => {
    return {
      id: parseInt(id),
      name: 'Product Not Found',
      category: 'Jewellery',
      price: 0,
      originalPrice: null,
      image: 'https://via.placeholder.com/600x600/FFD700/FFFFFF?text=Product+Not+Found',
      rating: 0,
      reviews: 0,
      isNew: false,
      metal: 'N/A',
      weight: '0g',
      description: 'Product details could not be loaded from the server.',
      inStock: false,
      features: ['Product information unavailable']
    };
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = () => {
    if (!product) return;
    
    Swal.fire({
      title: 'Please Login to Continue',
      text: 'You need to login to your account for continuing the shopping',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Login Now',
      cancelButtonText: 'Cancel',
      backdrop: 'rgba(0,0,0,0.8)',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/5087/5087579.png',
      imageWidth: 80,
      imageHeight: 80,
      imageAlt: 'Login required',
    }).then((result) => {
      if (result.isConfirmed) {
        // User clicked "Login Now"
        navigate('/login');
      } else {
        // User clicked "Cancel" - proceed with add to cart
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = existingCart.find(item => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          existingCart.push({ ...product, quantity: quantity });
        }
        
        localStorage.setItem('cart', JSON.stringify(existingCart));
        
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart!',
          text: `${product.name} (${quantity} item${quantity > 1 ? 's' : ''}) added to your cart`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    Swal.fire({
      title: 'Please Login to Continue',
      text: 'You need to login to your account for continuing the shopping',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Login Now',
      cancelButtonText: 'Cancel',
      backdrop: 'rgba(0,0,0,0.8)',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/5087/5087579.png',
      imageWidth: 80,
      imageHeight: 80,
      imageAlt: 'Login required',
    }).then((result) => {
      if (result.isConfirmed) {
        // User clicked "Login Now"
        navigate('/login');
      } else {
        // User clicked "Cancel" - proceed with buy now
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = existingCart.find(item => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          existingCart.push({ ...product, quantity: quantity });
        }
        
        localStorage.setItem('cart', JSON.stringify(existingCart));
        navigate('/checkout');
      }
    });
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
        <div className="product-detail-loading">
          <div className="loader"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !product) {
    return (
      <div>
        <LoginNavbar />
        <div className="error-container">
          <h2>😕 Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
          <button onClick={() => navigate('/')} className="back-btn">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <LoginNavbar />
        <div className="product-detail-loading">
          <p>Product not found</p>
          <button onClick={() => navigate('/')} className="back-btn">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LoginNavbar />
      <div className="product-detail-page">
        {/* Back Button */}
        <button className="back-button" onClick={() => navigate('/')}>
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
              {product.inStock && (
                <span className="badge-instock">In Stock</span>
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

            {product.purity && (
              <div className="product-purity">
                💎 Purity: {product.purity}%
              </div>
            )}

            <div className="product-rating-section">
              <span className="stars">{renderStars(product.rating)}</span>
              <span className="rating-text">{product.rating.toFixed(1)}</span>
              <span className="reviews">({product.reviews} customer reviews)</span>
            </div>

            <div className="product-price-section">
              <span className="current-price">₹{product.price.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
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
                <span className="meta-label">Purity:</span>
                <span className="meta-value">{product.purity || 'N/A'}%</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Barcode:</span>
                <span className="meta-value">{product.pcode || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Availability:</span>
                <span className={`meta-value ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                </span>
              </div>
              {product.stockPoint && (
                <div className="meta-item">
                  <span className="meta-label">Stock Point:</span>
                  <span className="meta-value">{product.stockPoint}</span>
                </div>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-features">
              <h3>Product Details</h3>
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
              <button 
                className="add-to-cart-btn" 
                onClick={addToCart}
                disabled={!product.inStock}
              >
                🛒 {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button 
                className="buy-now-btn" 
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
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
      <Footer/>
    </div>
  );
};

export default Homeproductdetails;