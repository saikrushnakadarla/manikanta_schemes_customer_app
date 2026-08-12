import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Get current logged-in customer ID
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
    return 57; // Default customer ID
  };

  // Fetch customer details
  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await fetch(`${baseURL}/api/customers/${customerId}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCustomerDetails(data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  // Fetch orders
  const fetchOrders = async (customerId) => {
    try {
      const response = await fetch(`${baseURL}/api/orders/?customer_id=${customerId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data);
      setOrderCount(data.length);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    }
  };

  // Fetch cart items
  const fetchCartItems = async (customerId) => {
    try {
      const response = await fetch(`${baseURL}/api/cart/?customer_id=${customerId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCartItems(data.items || []);
      setCartCount(data.items?.length || 0);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setCartItems([]);
      setCartCount(0);
    }
  };

  // Fetch wishlist items
  const fetchWishlistItems = async (customerId) => {
    try {
      const response = await fetch(`${baseURL}/api/wishlist/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Filter wishlist items for the current customer
      const customerWishlist = data.filter(item => item.customer === customerId);
      setWishlistItems(customerWishlist);
      setWishlistCount(customerWishlist.length);
    } catch (err) {
      console.error('Error fetching wishlist items:', err);
      setWishlistItems([]);
      setWishlistCount(0);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const customerId = getCustomerId();
      
      await Promise.all([
        fetchCustomerDetails(customerId),
        fetchOrders(customerId),
        fetchCartItems(customerId),
        fetchWishlistItems(customerId)
      ]);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled',
      'Completed': 'status-completed'
    };
    return statusMap[status] || 'status-default';
  };

  // Navigate to pages
  const goToCart = () => navigate('/cartpage');
  const goToWishlist = () => navigate('/wishlist');
  const goToOrders = () => navigate('/orders');
  const goToProduct = (productId) => navigate(`/product/${productId}`);

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-error">
          <span className="error-icon">😕</span>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchAllData} className="retry-btn">
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="customer-dashboard">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Welcome back, {customerDetails?.account_name || 'Customer'}!</p>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card stat-orders" onClick={goToOrders}>
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-number">{orderCount}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          
          <div className="stat-card stat-cart" onClick={goToCart}>
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <span className="stat-number">{cartCount}</span>
              <span className="stat-label">Cart Items</span>
            </div>
          </div>
          
          <div className="stat-card stat-wishlist" onClick={goToWishlist}>
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <span className="stat-number">{wishlistCount}</span>
              <span className="stat-label">Wishlist</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orderCount})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            Wishlist ({wishlistCount})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Customer Profile Card */}
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {customerDetails?.account_name?.charAt(0) || 'U'}
                  </div>
                  <div className="profile-info">
                    <h2>{customerDetails?.account_name || 'User'}</h2>
                    <p className="profile-email">{customerDetails?.email || 'No email'}</p>
                    <p className="profile-phone">📞 {customerDetails?.mobile || 'No phone'}</p>
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="detail-item">
                    <span className="detail-label">Customer ID</span>
                    <span className="detail-value">#{customerDetails?.account_id || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Group</span>
                    <span className="detail-value">{customerDetails?.account_group || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Opening Balance</span>
                    <span className="detail-value">₹{customerDetails?.op_bal || '0'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">{formatDate(customerDetails?.created_at)}</span>
                  </div>
                  {customerDetails?.city && (
                    <div className="detail-item">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{customerDetails.city}</span>
                    </div>
                  )}
                  {customerDetails?.state && (
                    <div className="detail-item">
                      <span className="detail-label">State</span>
                      <span className="detail-value">{customerDetails.state}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Orders Preview */}
              {orders.length > 0 && (
                <div className="recent-orders">
                  <h3>Recent Orders</h3>
                  <div className="recent-orders-list">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.order_id} className="recent-order-item">
                        <div className="order-info">
                          <span className="order-number">#{order.order_number?.slice(0, 12)}</span>
                          <span className="order-date">{formatDate(order.placed_at)}</span>
                        </div>
                        <div className="order-meta">
                          <span className={`order-status ${getStatusBadgeClass(order.order_status)}`}>
                            {order.order_status}
                          </span>
                          <span className="order-amount">₹{parseFloat(order.grand_total).toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {orders.length > 3 && (
                    <button className="view-all-btn" onClick={goToOrders}>
                      View All Orders →
                    </button>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-grid">
                  <button className="action-btn" onClick={goToCart}>
                    <span className="action-icon">🛒</span>
                    View Cart
                  </button>
                  <button className="action-btn" onClick={goToWishlist}>
                    <span className="action-icon">❤️</span>
                    View Wishlist
                  </button>
                  <button className="action-btn" onClick={goToOrders}>
                    <span className="action-icon">📦</span>
                    My Orders
                  </button>
                  <button className="action-btn" onClick={() => navigate('/products')}>
                    <span className="action-icon">🛍️</span>
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-tab">
              {orders.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <h3>No Orders Yet</h3>
                  <p>Start shopping to see your orders here.</p>
                  <button className="shop-now-btn" onClick={() => navigate('/products')}>
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.order_id} className="order-card">
                      <div className="order-header">
                        <div>
                          <span className="order-number">Order #{order.order_number?.slice(0, 15)}</span>
                          <span className="order-date">{formatDate(order.placed_at)}</span>
                        </div>
                        <span className={`order-status ${getStatusBadgeClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </div>
                      
                      <div className="order-items">
                        {order.items?.slice(0, 2).map((item) => (
                          <div key={item.order_item_id} className="order-item">
                            <div className="order-item-info">
                              <span className="item-name">
                                {item.product_details?.sub_category || 'Product'}
                              </span>
                              <span className="item-qty">Qty: {item.quantity}</span>
                            </div>
                            <span className="item-price">₹{parseFloat(item.unit_price).toFixed(0)}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className="order-more-items">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                      
                      <div className="order-footer">
                        <span className="order-total">Total: ₹{parseFloat(order.grand_total).toFixed(0)}</span>
                        <span className="payment-method">{order.payment_method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="wishlist-tab">
              {wishlistItems.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">❤️</span>
                  <h3>Your Wishlist is Empty</h3>
                  <p>Save your favorite items here.</p>
                  <button className="shop-now-btn" onClick={() => navigate('/products')}>
                    Explore Products
                  </button>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlistItems.map((item) => (
                    <div key={item.wishlist_id} className="wishlist-item-card">
                      <div className="wishlist-item-image">
                        <img 
                          src={item.product_details?.image || 'https://via.placeholder.com/200/FFD700/FFFFFF?text=Product'} 
                          alt={item.product_details?.sub_category}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200/FFD700/FFFFFF?text=Product';
                          }}
                        />
                      </div>
                      <div className="wishlist-item-details">
                        <h4>{item.product_details?.sub_category || 'Product'}</h4>
                        <p className="wishlist-item-meta">
                          {item.product_details?.category} • {item.product_details?.metal_type}
                        </p>
                        <p className="wishlist-item-price">
                          ₹{parseFloat(item.product_details?.total_price || 0).toFixed(0)}
                        </p>
                        <button 
                          className="view-product-btn"
                          onClick={() => goToProduct(item.product)}
                        >
                          View Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;