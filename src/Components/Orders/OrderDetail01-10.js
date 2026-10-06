import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './OrderDetail.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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

  // Fetch order details from API
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const customerId = getCustomerId();
      
      if (!customerId) {
        setError('Please login to view order details');
        setLoading(false);
        return;
      }

      // First, fetch all orders for the customer
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
      console.log('All Orders Response:', data);

      // Find the specific order by ID
      const foundOrder = data.find(order => order.order_id === parseInt(id) || order.order_number === id);
      
      if (!foundOrder) {
        setError('Order not found');
        setLoading(false);
        return;
      }

      // Transform order data
      const transformedOrder = transformOrderData(foundOrder);
      setOrder(transformedOrder);
      setError(null);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Transform order data
  const transformOrderData = (orderData) => {
    // Get product details from items
    const transformedItems = (orderData.items || []).map(item => {
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
        category: details.category || item.category || 'Jewellery',
        description: `${details.sub_category || ''} - ${details.design_master || ''}`.trim() || 'Beautiful jewellery piece',
        totalPrice: parseFloat(item.total_price) || 0,
        unitPrice: parseFloat(item.unit_price) || 0,
        discount: parseFloat(item.discount) || 0,
        gstAmount: parseFloat(item.gst_amount) || 0,
        gstPercentage: parseFloat(item.gst_percentage) || 0,
        barcode: item.barcode || '',
        huidNumber: item.huid_number || '',
        makingCharge: parseFloat(item.making_charge) || 0,
        wastage: parseFloat(item.wastage) || 0,
        netWeight: item.net_weight || details.gross_weight || '0g',
        stoneWeight: item.stone_weight || '0g'
      };
    });

    return {
      id: orderData.order_id,
      orderNumber: orderData.order_number || `ORD-${orderData.order_id}`,
      date: orderData.placed_at || orderData.created_at,
      total: parseFloat(orderData.grand_total) || 0,
      subtotal: parseFloat(orderData.subtotal) || 0,
      status: orderData.order_status || 'Processing',
      paymentMethod: orderData.payment_method || 'N/A',
      paymentStatus: orderData.payment_status || 'Pending',
      items: transformedItems,
      shippingAddress: orderData.shipping_address || 'N/A',
      billingAddress: orderData.billing_address || 'N/A',
      trackingNumber: `TRK-${orderData.order_id}-${Date.now()}`,
      expectedDelivery: orderData.expected_delivery,
      deliveredAt: orderData.delivered_at,
      cancelledAt: orderData.cancelled_at,
      remarks: orderData.remarks || '',
      discount: parseFloat(orderData.discount) || 0,
      taxAmount: parseFloat(orderData.tax_amount) || 0,
      shippingCharge: parseFloat(orderData.shipping_charge) || 0,
      invoiceNumber: orderData.invoice_number,
      invoiceDate: orderData.invoice_date,
      placedAt: orderData.placed_at,
      createdAt: orderData.created_at,
      updatedAt: orderData.updated_at,
      customer: orderData.customer
    };
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

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

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

  // Get tracking steps
  const getTrackingSteps = (status) => {
    const steps = [
      { label: 'Order Placed', completed: true },
      { label: 'Processing', completed: status !== 'Processing' && status !== 'Pending' && status !== 'Cancelled' },
      { label: 'Shipped', completed: status === 'Shipped' || status === 'Delivered' || status === 'Completed' },
      { label: 'Delivered', completed: status === 'Delivered' || status === 'Completed' }
    ];
    return steps;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Handle cancel order using DELETE API
  const handleCancelOrder = async () => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: 'Are you sure you want to cancel this order? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      background: '#1a1a1a',
      color: '#ffffff',
    });

    if (!result.isConfirmed) {
      return;
    }

    // Show loading state
    setCancelling(true);

    try {
      // Show processing message
      Swal.fire({
        title: 'Cancelling Order...',
        text: 'Please wait while we cancel your order',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // Call DELETE API to cancel the order
      const response = await fetch(`${baseURL}/api/orders/${order.id}/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Close the loading dialog
      Swal.close();

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to cancel order. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          if (response.status === 404) {
            errorMessage = 'Order not found. It may have been already cancelled.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to cancel this order.';
          } else if (response.status === 400) {
            errorMessage = 'Order cannot be cancelled in its current state.';
          }
        }
        throw new Error(errorMessage);
      }

      // Check if response has content (204 No Content)
      let responseData = null;
      try {
        const text = await response.text();
        if (text) {
          responseData = JSON.parse(text);
        }
      } catch (e) {
        // Ignore parsing error for empty responses
      }

      console.log('Order cancelled successfully:', responseData);

      // Update order status in state
      setOrder(prev => ({
        ...prev,
        status: 'Cancelled',
        cancelledAt: new Date().toISOString()
      }));

      // Show success message
      await Swal.fire({
        title: 'Order Cancelled!',
        text: `Order #${order.orderNumber || order.id} has been cancelled successfully.`,
        icon: 'success',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'OK',
        background: '#1a1a1a',
        color: '#ffffff',
      });

      // Navigate back to orders page
      navigate('/orders');

    } catch (err) {
      console.error('Error cancelling order:', err);
      
      // Show error message
      await Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to cancel order. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } finally {
      setCancelling(false);
    }
  };

  // Handle reorder
  const handleReorder = () => {
    Swal.fire({
      title: 'Reorder All Items?',
      text: 'Would you like to add all items from this order to your cart?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#C9A84C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, add to cart!',
      cancelButtonText: 'No, thanks',
      background: '#1a1a1a',
      color: '#ffffff',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Show loading
          Swal.fire({
            title: 'Adding to Cart...',
            text: 'Please wait while we add items to your cart',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            }
          });

          // Add all items to cart
          const customerId = getCustomerId();
          for (const item of order.items) {
            const cartData = {
              customer: customerId,
              quantity: item.quantity,
              unit_price: item.unitPrice || item.price,
              discount: "0",
              gst_percentage: "0",
              gst_amount: "0",
              total_price: item.unitPrice || item.price,
              product: item.id
            };

            const response = await fetch(`${baseURL}/api/cart/add-item/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(cartData)
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to add item to cart');
            }
          }

          Swal.close();

          // Update cart count
          window.dispatchEvent(new Event('cartUpdated'));

          await Swal.fire({
            title: 'Added to Cart!',
            text: 'All items have been added to your cart.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#1a1a1a',
            color: '#ffffff',
          });

          navigate('/cartpage');
        } catch (err) {
          console.error('Error reordering:', err);
          Swal.fire({
            title: 'Error!',
            text: err.message || 'Failed to add items to cart. Please try again.',
            icon: 'error',
            confirmButtonColor: '#d33',
            background: '#1a1a1a',
            color: '#ffffff',
          });
        }
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="order-detail-loading">
          <div className="loader"></div>
          <p>Loading order details...</p>
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
        <div className="order-detail-error">
          <h2>😕 {error}</h2>
          <button onClick={fetchOrderDetails} className="retry-btn">
            Retry
          </button>
          <button onClick={() => navigate('/orders')} className="back-orders-btn">
            ← Back to Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Navbar />
        <div className="order-detail-error">
          <h2>😕 Order not found</h2>
          <button onClick={() => navigate('/orders')} className="back-orders-btn">
            ← Back to Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="order-detail-page">
        {/* Back Button */}
        <button className="back-button" onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>

        <div className="order-detail-container">
          {/* Order Header */}
          <div className="order-detail-header">
            <div className="order-header-left">
              <h1>Order #{order.orderNumber || order.id}</h1>
              <div className="order-meta">
                <span className="order-date">📅 {formatDate(order.placedAt || order.date)}</span>
                <span className="order-payment">💳 {order.paymentMethod}</span>
                {order.paymentStatus && (
                  <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                )}
              </div>
            </div>
            <div className="order-header-right">
              <span 
                className="status-badge-large"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusIcon(order.status)} {order.status}
              </span>
            </div>
          </div>

          {/* Tracking Timeline */}
          {order.status !== 'Cancelled' && order.status !== 'Failed' && (
            <div className="tracking-timeline">
              <h3>📋 Order Tracking</h3>
              <div className="timeline-steps">
                {getTrackingSteps(order.status).map((step, index) => (
                  <div key={index} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                    <div className="step-circle">{step.completed ? '✓' : index + 1}</div>
                    <div className="step-label">{step.label}</div>
                    {index < getTrackingSteps(order.status).length - 1 && (
                      <div className={`step-line ${step.completed ? 'completed' : ''}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Order Info */}
          {order.status === 'Cancelled' && order.cancelledAt && (
            <div className="cancelled-info">
              <div className="cancelled-banner">
                ⚠️ This order was cancelled on {formatDate(order.cancelledAt)}
                {order.remarks && <p className="cancelled-remarks">Reason: {order.remarks}</p>}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="order-items-section">
            <h3>🛍️ Items in this Order</h3>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-detail-item">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
                    }}
                  />
                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-description">{item.description}</p>
                    <div className="item-specs">
                      <span className="spec">⚙️ {item.metal}</span>
                      <span className="spec">⚖️ {item.weight}</span>
                      <span className="spec">📦 Qty: {item.quantity}</span>
                      {item.purity && (
                        <span className="spec">💎 {item.purity}%</span>
                      )}
                      {item.barcode && (
                        <span className="spec">📋 {item.barcode}</span>
                      )}
                    </div>
                    <div className="item-price-detail">
                      <span className="item-price">₹{item.price.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      <span className="item-subtotal">
                        Subtotal: ₹{(item.price * item.quantity).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </span>
                      {item.gstAmount > 0 && (
                        <span className="item-gst">GST: ₹{item.gstAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="summary-grid">
              <div className="summary-left">
                <h3>📍 Shipping Address</h3>
                <p className="address-text">{order.shippingAddress}</p>
                {order.trackingNumber && (
                  <div className="tracking-info">
                    <span className="tracking-label">📦 Tracking Number:</span>
                    <span className="tracking-number">{order.trackingNumber}</span>
                  </div>
                )}
                {order.expectedDelivery && order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Completed' && (
                  <div className="delivery-estimate">
                    <span className="delivery-label">🚚 Estimated Delivery:</span>
                    <span className="delivery-date">
                      {formatDate(order.expectedDelivery)}
                    </span>
                  </div>
                )}
                {order.deliveredAt && (order.status === 'Delivered' || order.status === 'Completed') && (
                  <div className="delivered-info">
                    <span className="delivered-label">✅ Delivered On:</span>
                    <span className="delivered-date">{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
                {order.invoiceNumber && (
                  <div className="invoice-info">
                    <span className="invoice-label">📄 Invoice Number:</span>
                    <span className="invoice-number">{order.invoiceNumber}</span>
                  </div>
                )}
              </div>

              <div className="summary-right">
                <h3>💰 Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
                {order.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  </div>
                )}
                {order.shippingCharge > 0 && (
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>₹{order.shippingCharge.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="summary-row">
                    <span>Tax</span>
                    <span>₹{order.taxAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  </div>
                )}
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span className="total-amount">₹{order.total.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
                <div className="payment-method">
                  <span>💳 Payment Method:</span>
                  <span>{order.paymentMethod}</span>
                </div>
                {order.remarks && (
                  <div className="order-remarks">
                    <span>📝 Remarks:</span>
                    <span>{order.remarks}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="order-action-buttons">
            {(order.status === 'Processing' || order.status === 'Pending') && (
              <button 
                className="cancel-order-btn" 
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Cancelling...
                  </>
                ) : (
                  '❌ Cancel Order'
                )}
              </button>
            )}
            {(order.status === 'Delivered' || order.status === 'Completed') && (
              <>
                <button className="review-btn">
                  ⭐ Write a Review
                </button>
                <button className="reorder-btn" onClick={handleReorder}>
                  🔄 Reorder All
                </button>
              </>
            )}
            <button 
              className="continue-shopping-btn"
              onClick={() => navigate('/products')}
            >
              🛍️ Continue Shopping
            </button>
          </div>
        </div>
      </div> 
      <Footer/>
    </div>
  );
};

export default OrderDetail;