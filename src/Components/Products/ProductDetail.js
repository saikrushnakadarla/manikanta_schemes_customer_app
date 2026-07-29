import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './ProductDetail.css';
import Navbar from '../Navbar/Navbar';
import baseURL from '../URL/BaseURL';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

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
    
    console.warn('No customer ID found, using default');
    return 52;
  };

  // Check if product is already in cart
  const checkIfInCart = async (productId) => {
    try {
      const customerId = getCustomerId();
      
      if (!customerId) {
        return false;
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
      
      if (data && data.items && data.items.length > 0) {
        const found = data.items.some(item => 
          item.product_details?.opentag_id === parseInt(productId)
        );
        return found;
      }
      
      return false;
    } catch (err) {
      console.error('Error checking cart:', err);
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          return cartItems.some(item => item.id === parseInt(productId));
        } catch (e) {
          console.error('Error parsing localStorage cart:', e);
        }
      }
      return false;
    }
  };

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
          
          const transformedProduct = {
            id: item.opentag_id,
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
            metal: item.metal_type || 'Gold',
            weight: item.gross_weight || '0g',
            description: `${item.sub_category} - ${item.design_master || ''}`,
            inStock: item.status === 'Available',
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
            productData: item,
            features: [
              `Purity: ${item.purity}%`,
              `Metal Type: ${item.metal_type}`,
              `Barcode: ${item.pcode_barcode || 'N/A'}`,
              `Making Charges: ₹${parseFloat(item.making_charges).toFixed(2)}`,
              `Tax: ${item.tax || 'N/A'}`,
              `Stock Point: ${item.stock_point || 'N/A'}`,
              `Design: ${item.design_master || 'Standard'}`,
              `Status: ${item.status}`
            ]
          };
          
          setProduct(transformedProduct);
          setSelectedImage(transformedProduct.image);
          
          const inCart = await checkIfInCart(id);
          setIsAddedToCart(inCart);
          
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message);
        const fallbackProduct = getFallbackProduct();
        setProduct(fallbackProduct);
        setSelectedImage(fallbackProduct.image);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const getFallbackImage = (category, subCategory) => {
    const imageMap = {
      'GOLD JEWELLERY': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop&crop=center',
      'SILVER JEWELLERY': 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=600&fit=crop&crop=center',
      'GOLD BRACELETS': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop&crop=center',
      'SILVER PATTI': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop&crop=center'
    };
    return imageMap[category] || imageMap[subCategory] || 'https://via.placeholder.com/600x600/FFD700/FFFFFF?text=Jewellery';
  };

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
      features: ['Product information unavailable'],
      productData: null
    };
  };

  const showSuccessPopup = (productName) => {
    Swal.fire({
      title: '✨ Added to Cart!',
      text: `${productName} has been added to your cart successfully.`,
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonColor: '#C9A84C',
      confirmButtonText: '🛒 View Cart',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'Continue Shopping',
      background: '#1a1a1a',
      color: '#ffffff',
      backdrop: 'rgba(0,0,0,0.8)',
      customClass: {
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
        popup: 'swal-popup-custom'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/cart');
      }
    });
  };

  const addToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    
    try {
      const customerId = getCustomerId();
      const unitPrice = product.productData?.total_price || product.price.toString();
      
      const cartData = {
        customer: customerId,
        quantity: quantity,
        unit_price: parseFloat(unitPrice).toFixed(2),
        discount: "0",
        gst_percentage: "0",
        gst_amount: "0",
        total_price: (parseFloat(unitPrice) * quantity).toFixed(2),
        product: product.id
      };
      
      console.log('Sending to cart API:', cartData);
      
      const response = await fetch(`${baseURL}/api/cart/add-item/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(cartData)
      });
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }
      
      if (responseData.status === 'success') {
        setIsAddedToCart(true);
        
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = existingCart.find(item => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          existingCart.push({ 
            ...product, 
            quantity: quantity, 
            cartItemId: responseData.data?.cart_item_id 
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(existingCart));
        showSuccessPopup(product.name);
      } else {
        throw new Error(responseData.message || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      showErrorPopup(err.message || 'Failed to add item to cart');
      
      try {
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = existingCart.find(item => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          existingCart.push({ ...product, quantity: quantity });
        }
        
        localStorage.setItem('cart', JSON.stringify(existingCart));
        setIsAddedToCart(true);
        showSuccessPopup(product.name + ' (Offline Mode)');
      } catch (localErr) {
        console.error('Error saving to localStorage:', localErr);
        showErrorPopup('Failed to add item to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const showErrorPopup = (errorMessage) => {
    Swal.fire({
      title: '❌ Error!',
      text: errorMessage || 'Failed to add item to cart. Please try again.',
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK',
      background: '#1a1a1a',
      color: '#ffffff',
      backdrop: 'rgba(0,0,0,0.8)'
    });
  };

  // Buy Now handler - Navigate to checkout
  const handleBuyNow = () => {
    if (!product || !product.inStock) return;
    
    // Navigate to checkout with product data
    navigate('/checkout', {
      state: {
        product: product,
        quantity: quantity,
        source: 'product_detail'
      }
    });
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

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
        <Navbar />
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
        <Navbar />
        <div className="error-container">
          <h2>😕 Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
          <button onClick={() => navigate('/products')} className="back-btn">
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="product-detail-loading">
          <p>Product not found</p>
          <button onClick={() => navigate('/products')} className="back-btn">
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  return ( 
    <div> 
      <Navbar />
      <div className="product-detail-page">
        <button className="back-button" onClick={() => navigate('/products')}>
          ← Back to Products
        </button>

        <div className="product-detail-container">
          <div className="product-images-section">
            <div className="main-image">
              <img 
                src={selectedImage} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600/FFD700/FFFFFF?text=Jewellery';
                }}
              />
              {product.isNew && <span className="badge-new">NEW</span>}
              {product.originalPrice && (
                <span className="badge-discount">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
              {product.inStock && <span className="badge-instock">In Stock</span>}
              {isAddedToCart && <span className="badge-added">✓ Added to Cart</span>}
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

          <div className="product-info-section">
            <div className="product-category-tag">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>
            
            {product.purity && (
              <div className="product-purity">💎 Purity: {product.purity}%</div>
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
                <span className="meta-label">Status:</span>
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
                  disabled={quantity <= 1 || isAddedToCart}
                >
                  −
                </button>
                <span className="qty-number">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10 || isAddedToCart}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="product-actions">
              <button 
                className={`add-to-cart-btn ${isAddedToCart ? 'added' : ''} ${addingToCart ? 'loading' : ''}`}
                onClick={addToCart}
                disabled={!product.inStock || addingToCart || isAddedToCart}
              >
                {addingToCart ? (
                  <span>⏳ Adding...</span>
                ) : isAddedToCart ? (
                  <span>✓ Added to Cart</span>
                ) : (
                  <span>🛒 {product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                )}
              </button>
              <button 
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={!product.inStock || isAddedToCart}
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

      <style jsx>{`
        .swal-popup-custom {
          border-radius: 15px;
          box-shadow: 0 0 20px rgba(201, 168, 76, 0.3);
        }
        .swal-confirm-btn {
          background-color: #C9A84C !important;
          color: #000 !important;
          font-weight: 600 !important;
          padding: 10px 25px !important;
          border-radius: 8px !important;
        }
        .swal-cancel-btn {
          background-color: #d33 !important;
          color: #fff !important;
          font-weight: 600 !important;
          padding: 10px 25px !important;
          border-radius: 8px !important;
        }
        .badge-added {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #4CAF50;
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          z-index: 5;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
          animation: fadeInScale 0.3s ease-out;
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .add-to-cart-btn.added {
          background: linear-gradient(135deg, #4CAF50, #45a049) !important;
          color: white !important;
          cursor: default !important;
        }
        .add-to-cart-btn.added:hover {
          transform: none !important;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4) !important;
        }
        .add-to-cart-btn.loading {
          opacity: 0.7;
          cursor: wait !important;
        }
        .buy-now-btn {
          background: linear-gradient(135deg, #C9A84C, #b8943e);
          color: #000;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }
        .buy-now-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(201, 168, 76, 0.4);
        }
        .buy-now-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .product-actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .add-to-cart-btn {
          flex: 1;
          min-width: 150px;
        }
        .buy-now-btn {
          flex: 1;
          min-width: 150px;
        }
        @media (max-width: 768px) {
          .product-actions {
            flex-direction: column;
          }
          .add-to-cart-btn,
          .buy-now-btn {
            flex: none;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;