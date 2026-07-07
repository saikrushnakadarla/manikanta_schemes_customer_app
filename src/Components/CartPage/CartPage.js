import React, { useState, useEffect } from 'react';
import './CartPage.css';
import Navbar from '../Navbar/Navbar';

const CartPage = () => {
  // Static cart items for demo
  const staticCartItems = [
    {
      id: 1,
      name: 'Diamond Solitaire Ring',
      category: 'Rings',
      price: 24999,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
      metal: '18K Gold',
      weight: '3.5g',
      quantity: 1
    },
    {
      id: 3,
      name: 'Pearl Drop Earrings',
      category: 'Earrings',
      price: 7999,
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop',
      metal: 'Silver',
      weight: '2g',
      quantity: 2
    },
    {
      id: 7,
      name: 'Gold Engagement Ring',
      category: 'Rings',
      price: 34999,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
      metal: '18K Gold',
      weight: '4g',
      quantity: 1
    },
    {
      id: 10,
      name: 'Gold Hoop Earrings',
      category: 'Earrings',
      price: 6999,
      image: 'https://images.unsplash.com/photo-1617038263802-bf90c1a14335?w=400&h=400&fit=crop',
      metal: '22K Gold',
      weight: '3g',
      quantity: 1
    }
  ];

  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [useStaticData, setUseStaticData] = useState(true);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart && JSON.parse(savedCart).length > 0) {
      setCartItems(JSON.parse(savedCart));
      setUseStaticData(false);
    } else {
      // Use static data if no cart in localStorage
      setCartItems(staticCartItems);
      setUseStaticData(true);
    }
  }, []);

  // Update localStorage whenever cart changes (only for user-added items)
  useEffect(() => {
    if (!useStaticData) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, useStaticData]);

  // Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    setUseStaticData(false);
  };

  // Remove item from cart
  const removeItem = (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      const newItems = cartItems.filter(item => item.id !== productId);
      setCartItems(newItems);
      if (newItems.length === 0) {
        setUseStaticData(true);
      } else {
        setUseStaticData(false);
      }
    }
  };

  // Clear entire cart
  const clearCart = () => {
    if (window.confirm('Clear your entire cart?')) {
      setCartItems([]);
      setDiscount(0);
      setAppliedPromo('');
      setPromoCode('');
      setUseStaticData(true);
      localStorage.removeItem('cart');
    }
  };

  // Apply promo code
  const applyPromo = () => {
    // Sample promo codes
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
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const discountAmount = Math.round(subtotal * (discount / 100));
  const total = subtotal + deliveryCharge + tax - discountAmount;

  // Check if cart is empty
  if (cartItems.length === 0) {
    return (
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
      </div>

      {/* Static Data Indicator */}
      {useStaticData && cartItems.length > 0 && (
        <div className="demo-banner">
          <span>📌 Demo items shown. Add products from the collection!</span>
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
                </div>
                
                <div className="cart-item-details">
                  <div className="item-header">
                    <h3 className="item-name">{item.name}</h3>
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="item-meta">
                    <span className="item-category">{item.category}</span>
                    <span className="item-metal">{item.metal}</span>
                    <span className="item-weight">⚖️ {item.weight}</span>
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
                      >
                        −
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
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
                disabled={!promoCode}
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
          
          <button className="checkout-btn">
            Proceed to Checkout
          </button>
          
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
          
          <div className="continue-shopping">
            <a href="/products" className="continue-link">
              ← Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div> 
    </div>
  );
};

export default CartPage;