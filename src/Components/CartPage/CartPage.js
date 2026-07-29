import React, { useState, useEffect } from 'react';
import './CartPage.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);

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

  // Fetch cart from API
  const fetchCart = async () => {
    try {
      setLoading(true);
      const customerId = getCustomerId();
      
      if (!customerId) {
        throw new Error('Customer not logged in');
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
      console.log('Cart API Response:', data);

      if (data && data.items && data.items.length > 0) {
        // Transform API data to match your cart item structure
        const transformedItems = data.items.map(item => ({
          id: item.product_details.opentag_id,
          cart_item_id: item.cart_item_id,
          name: item.product_details.product_name || 
                `${item.product_details.sub_category} ${item.product_details.prefix || ''}`.trim(),
          category: item.product_details.category || 'Jewellery',
          price: parseFloat(item.unit_price) || 0,
          image: item.product_details.image || getFallbackImage(
            item.product_details.category, 
            item.product_details.sub_category
          ),
          metal: item.product_details.metal_type || 'Gold',
          weight: item.product_details.gross_weight || '0g',
          quantity: item.quantity || 1,
          total_price: parseFloat(item.total_price) || 0,
          purity: item.product_details.purity,
          product_details: item.product_details
        }));
        
        setCartItems(transformedItems);
        setCartId(data.cart_id);
        
        // Save to localStorage as backup
        localStorage.setItem('cart', JSON.stringify(transformedItems));
      } else {
        // If API returns empty cart, check localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart && JSON.parse(savedCart).length > 0) {
          setCartItems(JSON.parse(savedCart));
        } else {
          setCartItems([]);
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
      
      // Fallback to localStorage if API fails
      const savedCart = localStorage.getItem('cart');
      if (savedCart && JSON.parse(savedCart).length > 0) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

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

  // Load cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Update quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Update localStorage
      const updatedCart = cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      // TODO: Call API to update quantity if needed
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  // Remove item from cart using DELETE API
  const removeItem = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      try {
        const itemToRemove = cartItems.find(item => item.id === productId);
        
        if (!itemToRemove) {
          throw new Error('Item not found in cart');
        }

        // Set loading state for this item
        setRemovingItem(productId);

        // Call API to remove item
        const response = await fetch(`${baseURL}/api/cart/remove-item/${itemToRemove.cart_item_id}/`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        console.log('Delete response status:', response.status);

        if (!response.ok) {
          let errorMessage = `Failed to remove item (status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Delete response:', result);

        // Remove from local state
        const newItems = cartItems.filter(item => item.id !== productId);
        setCartItems(newItems);
        localStorage.setItem('cart', JSON.stringify(newItems));

        alert(`✓ ${itemToRemove.name} removed from cart successfully!`);

        if (newItems.length === 0) {
          setCartId(null);
        }

      } catch (err) {
        console.error('Error removing item:', err);
        alert(`❌ Failed to remove item: ${err.message}`);
        fetchCart();
      } finally {
        setRemovingItem(null);
      }
    }
  };

  // Clear entire cart using the clear API
  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        setClearingCart(true);
        
        const customerId = getCustomerId();
        
        if (!customerId) {
          throw new Error('Customer not logged in');
        }

        // Call the clear cart API with customer_id as query parameter
        const response = await fetch(`${baseURL}/api/cart/clear/?customer_id=${customerId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        console.log('Clear cart response status:', response.status);

        if (!response.ok) {
          let errorMessage = `Failed to clear cart (status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Clear cart response:', result);

        // Clear local state
        setCartItems([]);
        setDiscount(0);
        setAppliedPromo('');
        setPromoCode('');
        setCartId(null);
        localStorage.removeItem('cart');

        alert('✓ Cart cleared successfully!');

      } catch (err) {
        console.error('Error clearing cart:', err);
        alert(`❌ Failed to clear cart: ${err.message}`);
        
        // If API fails, try to clear items one by one as fallback
        try {
          for (const item of cartItems) {
            try {
              await fetch(`${baseURL}/api/cart/remove-item/${item.cart_item_id}/`, {
                method: 'DELETE',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
              });
            } catch (e) {
              console.warn(`Failed to remove item ${item.id}:`, e);
            }
          }
          
          setCartItems([]);
          setCartId(null);
          localStorage.removeItem('cart');
          alert('✓ Cart cleared successfully! (using fallback method)');
        } catch (fallbackErr) {
          console.error('Fallback clear failed:', fallbackErr);
          // Refresh cart if all fails
          fetchCart();
        }
      } finally {
        setClearingCart(false);
      }
    }
  };

  // Apply promo code
  const applyPromo = () => {
    const promos = {
      'SAVE10': 10,
      'SAVE20': 20,
      'DIWALI': 15,
      'WELCOME': 5,
      'GOLD50': 50,
      'JEWEL25': 25
    };

    if (promoCode.toUpperCase() in promos) {
      setDiscount(promos[promoCode.toUpperCase()]);
      setAppliedPromo(promoCode.toUpperCase());
      alert(`🎉 Promo code "${promoCode.toUpperCase()}" applied! ${promos[promoCode.toUpperCase()]}% discount.`);
    } else {
      alert('❌ Invalid promo code. Please try again.');
    }
    setPromoCode('');
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryCharge = subtotal > 5000 ? 0 : 199;
  const tax = Math.round(subtotal * 0.05);
  const discountAmount = Math.round(subtotal * (discount / 100));
  const total = subtotal + deliveryCharge + tax - discountAmount;

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Check if cart is empty
  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="cart-page empty-cart">
          <div className="empty-cart-content">
            <div className="empty-cart-icon">💎</div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any jewellery to your cart yet.</p>
            <p className="empty-cart-subtitle">✨ Explore our exquisite collection and find the perfect piece for you!</p>
            <button 
              className="continue-shopping-btn"
              onClick={() => window.location.href = '/products'}
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return ( 
    <div>
      <Navbar />
      <div className="cart-page">
        {/* Header */}
        <div className="cart-header">
          <h1>💎 Shopping Cart</h1>
          <span className="cart-item-count">{cartItems.length} items</span>
          {cartId && (
            <span className="cart-id">Cart #{cartId}</span>
          )}
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}. Showing locally saved items.
          </div>
        )}

        <div className="cart-content">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            {/* Mobile Summary Card */}
            <div className="mobile-cart-summary">
              <div className="mobile-total">
                <span>Total: ₹{total.toLocaleString()}</span>
                <span className="item-count">{cartItems.length} items</span>
              </div>
              <button className="checkout-btn-mobile">
                Proceed to Checkout
              </button>
            </div>

            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
                      }}
                    />
                    {item.purity && (
                      <span className="item-purity">{item.purity}%</span>
                    )}
                  </div>
                  
                  <div className="cart-item-details">
                    <div className="item-header">
                      <h3 className="item-name">{item.name}</h3>
                      <button 
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        disabled={removingItem === item.id || clearingCart}
                      >
                        {removingItem === item.id ? '⏳' : '✕'}
                      </button>
                    </div>
                    
                    <div className="item-meta">
                      <span className="item-category">{item.category}</span>
                      <span className="item-metal">{item.metal}</span>
                      <span className="item-weight">⚖️ {item.weight}g</span>
                    </div>
                    
                    <div className="item-price-section">
                      <div className="item-price">
                        ₹{item.price.toLocaleString()}
                      </div>
                      
                      <div className="item-quantity">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          disabled={removingItem === item.id || clearingCart}
                        >
                          −
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          disabled={removingItem === item.id || clearingCart}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="item-total">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="summary-row">
              <span>Delivery Charges</span>
              <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (5%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            
            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount ({discount}% OFF)</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            
            {/* Promo Code */}
            <div className="promo-section">
              <p className="promo-label">🎁 Have a promo code?</p>
              <div className="promo-input-group">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="promo-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && promoCode) {
                      applyPromo();
                    }
                  }}
                />
                <button 
                  className="apply-promo-btn"
                  onClick={applyPromo}
                  disabled={!promoCode || clearingCart}
                >
                  Apply
                </button>
              </div>
              <div className="promo-hints">
                <span>Try: SAVE10, SAVE20, DIWALI</span>
              </div>
              {appliedPromo && (
                <div className="applied-promo">
                  ✓ Promo code {appliedPromo} applied!
                  <span 
                    className="remove-promo"
                    onClick={() => {
                      setDiscount(0);
                      setAppliedPromo('');
                    }}
                  >
                    ✕
                  </span>
                </div>
              )}
            </div>
            
            <button 
              className="checkout-btn"
              disabled={clearingCart}
            >
              {clearingCart ? '⏳ Processing...' : 'Proceed to Checkout'}
            </button>
            
            <button 
              className="clear-cart-btn" 
              onClick={clearCart}
              disabled={clearingCart}
            >
              {clearingCart ? '⏳ Clearing...' : '🗑️ Clear Cart'}
            </button>
            
            <div className="continue-shopping">
              <a href="/products" className="continue-link">
                ← Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>  
      <Footer />
    </div>
  );
};

export default CartPage;