import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Orders.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const Orders = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    
    return null;
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const customerId = getCustomerId();
      
      if (!customerId) {
        setError('Please login to view your orders');
        setLoading(false);
        return;
      }

      const response = await fetch(`${baseURL}/api/orders/?customer_id=${customerId}`, {
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
      console.log('Orders API Response:', data);

      // Transform orders data
      const transformedOrders = data.map(order => {
        // Get product details from first item (if available)
        const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
        const productDetails = firstItem?.product_details || {};
        
        // Transform items
        const transformedItems = (order.items || []).map(item => {
          const details = item.product_details || {};
          return {
            id: item.product || details.opentag_id || item.order_item_id,
            name: item.product_name || details.product_name || details.sub_category || 'Product',
            price: parseFloat(item.unit_price) || parseFloat(details.total_price) || 0,
            quantity: item.quantity || 1,
            image: details.image || getFallbackImage(details.category, details.sub_category),
            metal: details.metal_type || item.metal_type || 'Gold',
            weight: details.gross_weight || item.gross_weight || '0g',
            purity: details.purity || item.purity || '',
            category: details.category || item.category || 'Jewellery'
          };
        });

        return {
          id: order.order_id,
          orderNumber: order.order_number || `ORD-${order.order_id}`,
          date: order.placed_at || order.created_at,
          total: parseFloat(order.grand_total) || 0,
          subtotal: parseFloat(order.subtotal) || 0,
          status: order.order_status || 'Processing',
          paymentMethod: order.payment_method || 'N/A',
          paymentStatus: order.payment_status || 'Pending',
          items: transformedItems,
          shippingAddress: order.shipping_address || 'N/A',
          billingAddress: order.billing_address || 'N/A',
          trackingNumber: `TRK-${order.order_id}-${Date.now()}`,
          expectedDelivery: order.expected_delivery,
          deliveredAt: order.delivered_at,
          cancelledAt: order.cancelled_at,
          remarks: order.remarks || '',
          discount: parseFloat(order.discount) || 0,
          taxAmount: parseFloat(order.tax_amount) || 0,
          shippingCharge: parseFloat(order.shipping_charge) || 0,
          invoiceNumber: order.invoice_number,
          invoiceDate: order.invoice_date,
          placedAt: order.placed_at,
          createdAt: order.created_at,
          updatedAt: order.updated_at
        };
      });

      setOrders(transformedOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fallback image function
  const getFallbackImage = (category, subCategory) => {
    const imageMap = {
      'GOLD JEWELLERY': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop&crop=center',
      'SILVER JEWELLERY': 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=200&h=200&fit=crop&crop=center',
      'GOLD BRACELETS': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&h=200&fit=crop&crop=center',
      'SILVER PATTI': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop&crop=center'
    };
    return imageMap[category] || imageMap[subCategory] || 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Jewellery';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Delivered': '#28a745',
      'Shipped': '#007bff',
      'Processing': '#ffc107',
      'Pending': '#ffc107',
      'Cancelled': '#dc3545',
      'Completed': '#28a745',
      'Failed': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'Delivered': '✅',
      'Shipped': '📦',
      'Processing': '⏳',
      'Pending': '⏳',
      'Cancelled': '❌',
      'Completed': '✅',
      'Failed': '❌'
    };
    return icons[status] || '📋';
  };

  // Status options for filter
  const statusOptions = ['All', 'Processing', 'Pending', 'Shipped', 'Delivered', 'Cancelled', 'Completed', 'Failed'];

  // Filter orders based on status
  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  // Calculate statistics
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length;
  const activeOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Pending' || o.status === 'Shipped').length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  // Navigate to order details
  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  // Format date (e.g. 03 October 2026, 11:46 AM)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day}, ${time}`;
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="orders-loading">
          <div className="loader"></div>
          <p>Loading your orders...</p>
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
        <div className="orders-error">
          <h2>😕 {error}</h2>
          <button onClick={fetchOrders} className="retry-btn">
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
      <div className="orders-page">
        {/* Header */}
        <div className="orders-header">
          <h1>📦 My Orders</h1>
          <p>Track and manage all your orders in one place</p>
        </div>

        {/* Stats Summary */}
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-number">{totalOrders}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{deliveredOrders}</span>
            <span className="stat-label">Delivered</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{activeOrders}</span>
            <span className="stat-label">Active Orders</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">₹{totalSpent.toLocaleString()}</span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="orders-filter-bar">
          <div className="filter-section">
            <button 
              className="filter-toggle"
              onClick={() => setShowFilter(!showFilter)}
            >
              <span>☰</span> Filter by Status
            </button>
            
            <div className={`status-filters ${showFilter ? 'show' : ''}`}>
              {statusOptions.map(status => (
                <button
                  key={status}
                  className={`status-btn ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => {
                    setFilterStatus(status);
                    setShowFilter(false);
                  }}
                >
                  {status === 'All' ? '📋 All' : `${getStatusIcon(status)} ${status}`}
                </button>
              ))}
            </div>
          </div>

          <div className="order-count">
            Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <span className="empty-icon">📭</span>
              <h3>No orders found</h3>
              <p>You haven't placed any orders with this status yet.</p>
              <button 
                className="shop-now-btn"
                onClick={() => navigate('/products')}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
              const itemCount = order.items ? order.items.length : 0;
              return (
                <div
                  key={order.id}
                  className="order-card"
                  onClick={() => handleOrderClick(order.id)}
                >
                  {/* Row 1: Order No + number */}
                  <div className="oc-row">
                    <span className="oc-label">Order No</span>
                    <span className="oc-number">#{order.orderNumber || order.id}</span>
                  </div>

                  {/* Row 2: Placed On + date */}
                  <div className="oc-row oc-row-sub">
                    <span className="oc-sub">Placed On</span>
                    <span className="oc-sub oc-date">{formatDate(order.placedAt || order.date)}</span>
                  </div>

                  {/* Status badges */}
                  <div className="oc-badges">
                    <span
                      className="oc-status"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                    {order.paymentStatus && (
                      <span
                        className={`oc-pay ${String(order.paymentStatus).toLowerCase() === 'paid' ? 'paid' : 'unpaid'}`}
                      >
                        {order.paymentStatus}
                      </span>
                    )}
                  </div>

                  {/* Item preview */}
                  <div className="oc-body">
                    {firstItem ? (
                      <img
                        className="oc-img"
                        src={firstItem.image}
                        alt={firstItem.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Jewellery';
                        }}
                      />
                    ) : (
                      <div className="oc-img oc-img-empty" />
                    )}
                    <div className="oc-info">
                      <span className="oc-name">
                        {firstItem ? firstItem.name : 'No items found'}
                        {itemCount > 1 && <span className="oc-more"> +{itemCount - 1} more</span>}
                      </span>
                      <span className="oc-qty">
                        Quantity - {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                      </span>
                      <div className="oc-bottom">
                        <span className="oc-total">
                          ₹{order.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                        <button
                          className="view-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order.id);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div> 
      <Footer/>
    </div>
  );
};

export default Orders;