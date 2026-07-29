import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state && location.state.order) {
      setOrder(location.state.order);
      setLoading(false);
    } else {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      if (orders.length > 0) {
        setOrder(orders[0]);
      }
      setLoading(false);
    }
  }, [location]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f39c12';
      case 'processing': return '#3498db';
      case 'shipped': return '#9b59b6';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="order-confirmation-page">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Navbar />
        <div className="order-confirmation-page">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Order Found</h2>
            <p>We couldn't find any order details.</p>
            <button className="continue-btn" onClick={() => navigate('/products')}>
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
      <div className="order-confirmation-page">
        <div className="confirmation-container">
          <div className="success-header">
            <div className="success-icon">🎉</div>
            <h1>Order Placed Successfully!</h1>
            <p className="order-subtitle">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            {order.order_number && (
              <p className="order-id-display">Order #: {order.order_number}</p>
            )}
          </div>

          <div className="order-details-card">
            <div className="order-header">
              <div>
                <h2>Order #{order.order_number || order.id}</h2>
                <p className="order-date">
                  Placed on {formatDate(order.invoice_date || order.created_at)}
                </p>
              </div>
              <div className="order-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.order_status) }}
                >
                  {order.order_status || 'Pending'}
                </span>
              </div>
            </div>

            <div className="order-divider"></div>

            <div className="order-items">
              <h3>Order Items</h3>
              {order.items && order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img 
                      src={item.image || 'https://via.placeholder.com/80/FFD700/FFFFFF?text=Jewellery'} 
                      alt={item.product_name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80/FFD700/FFFFFF?text=Jewellery';
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.product_name}</h4>
                    <div className="item-meta">
                      <span>Category: {item.category}</span>
                      <span>Metal: {item.metal_type}</span>
                      <span>Purity: {item.purity}%</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <div className="item-price">
                      ₹{parseFloat(item.unit_price).toLocaleString()} × {item.quantity}
                      <span className="item-total">
                        = ₹{parseFloat(item.total_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-divider"></div>

            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{parseFloat(order.subtotal || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>₹{parseFloat(order.shipping_charge || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="summary-row">
                <span>Tax (GST)</span>
                <span>₹{parseFloat(order.tax_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="summary-row total">
                <span>Grand Total</span>
                <span>₹{parseFloat(order.grand_total || order.subtotal || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>

            <div className="order-divider"></div>

            <div className="order-info-grid">
              <div className="info-item">
                <h4>Payment Method</h4>
                <p>{order.payment_method || 'Online'}</p>
              </div>
              <div className="info-item">
                <h4>Payment Status</h4>
                <p className={`payment-status ${order.payment_status?.toLowerCase()}`}>
                  {order.payment_status || 'Pending'}
                </p>
              </div>
              <div className="info-item">
                <h4>Expected Delivery</h4>
                <p>{order.expected_delivery ? formatDate(order.expected_delivery) : 'N/A'}</p>
              </div>
              {order.remarks && (
                <div className="info-item">
                  <h4>Remarks</h4>
                  <p>{order.remarks}</p>
                </div>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button className="track-btn" onClick={() => navigate('/orders')}>
              📋 View All Orders
            </button>
            <button className="continue-btn" onClick={() => navigate('/products')}>
              🛒 Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;