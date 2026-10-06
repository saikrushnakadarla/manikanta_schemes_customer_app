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
  // UI-only state (new)
  const [showStatus, setShowStatus] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

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
      customer: orderData.customer,
      // extra optional fields used only for display in the payment sheet
      razorpayOrderId: orderData.razorpay_order_id || orderData.payment_order_id || '',
      transactionId: orderData.transaction_id || orderData.razorpay_payment_id || orderData.payment_id || ''
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

  // Get tracking steps (kept as-is)
  const getTrackingSteps = (status) => {
    const steps = [
      { label: 'Order Placed', completed: true },
      { label: 'Processing', completed: status !== 'Processing' && status !== 'Pending' && status !== 'Cancelled' },
      { label: 'Shipped', completed: status === 'Shipped' || status === 'Delivered' || status === 'Completed' },
      { label: 'Delivered', completed: status === 'Delivered' || status === 'Completed' }
    ];
    return steps;
  };

  // Status timeline used by the "Order Status" screen
  const statusTimeline = [
    { label: 'Pending', text: 'Your order has been placed and awaiting confirmation' },
    { label: 'Accepted', text: 'Your order has been successfully accepted' },
    { label: 'In Progress', text: 'Your order has been accepted and is now in progress' },
    { label: 'Order Ready', text: 'Your order is ready and will be dispatched shortly!' },
    { label: 'Dispatched', text: 'Your order has been dispatched and will be delivered to your doorstep soon' },
    { label: 'Delivered', text: 'Your order has been successfully delivered to your doorstep' }
  ];

  // Index of the current step in the timeline
  const getCurrentStepIndex = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') return 5;
    if (s === 'shipped' || s === 'dispatched') return 4;
    if (s.includes('ready')) return 3;
    if (s.includes('progress')) return 2;
    if (s === 'accepted' || s === 'confirmed') return 1;
    return 0; // Pending / Processing
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

  // Format date + time for "Placed On"
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day}, ${time}`;
  };

  const money = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Download invoice (opens printable invoice; user can "Save as PDF")
  const handleDownloadInvoice = () => {
    const customer = order.customer && typeof order.customer === 'object' ? order.customer : {};
    const rows = order.items.map((it, i) => `
      <tr>
        <td>${i + 1}</td><td>${it.name}</td><td>${it.weight}</td><td>${it.quantity}</td>
        <td>₹${money(it.price)}</td><td>₹${money(it.price * it.quantity)}</td>
      </tr>`).join('');
    const w = window.open('', '_blank');
    if (!w) {
      Swal.fire({ title: 'Popup blocked', text: 'Please allow popups to download the invoice.', icon: 'info', background: '#1a1a1a', color: '#ffffff' });
      return;
    }
    w.document.write(`<!doctype html><html><head><title>Invoice ${order.invoiceNumber || order.orderNumber}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:30px;color:#222}
        h1{margin:0 0 6px;font-size:26px} .muted{color:#666;font-size:13px}
        table{width:100%;border-collapse:collapse;margin-top:20px;font-size:13px}
        th{background:#c9a84c;color:#fff;text-align:left;padding:8px} td{padding:8px;border-bottom:1px solid #eee}
        .totals{margin-top:20px;margin-left:auto;width:280px;font-size:14px}
        .totals div{display:flex;justify-content:space-between;padding:4px 0}
        .grand{font-weight:700;border-top:1px solid #ccc;margin-top:6px;padding-top:8px!important}
      </style></head><body>
      <h1>Tax Invoice</h1>
      <div class="muted">Invoice Number: ${order.invoiceNumber || order.orderNumber}</div>
      <div class="muted">Invoice Date: ${formatDate(order.invoiceDate || order.placedAt || order.date)}</div>
      <p><b>Name:</b> ${customer.name || customer.first_name || ''}<br/>
         <b>Address:</b> ${order.shippingAddress}<br/>
         <b>Payment Mode:</b> ${order.paymentMethod}</p>
      <table><thead><tr><th>SL</th><th>Particulars</th><th>Weight</th><th>Qty</th><th>Amount</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="totals">
        <div><span>Subtotal</span><span>₹${money(order.subtotal)}</span></div>
        ${order.taxAmount > 0 ? `<div><span>Tax</span><span>₹${money(order.taxAmount)}</span></div>` : ''}
        <div class="grand"><span>Grand Total</span><span>₹${money(order.total)}</span></div>
      </div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>`);
    w.document.close();
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

  const isPaid = String(order.paymentStatus).toLowerCase() === 'paid';
  const currentStep = getCurrentStepIndex(order.status);
  const customerObj = order.customer && typeof order.customer === 'object' ? order.customer : {};
  const customerName = customerObj.name || customerObj.first_name || '';
  const customerPhone = customerObj.phone || customerObj.mobile || customerObj.phone_number || '';

  // ---------- ORDER STATUS SCREEN ----------
  if (showStatus) {
    return (
      <div>
        <Navbar />
        <div className="od-page">
          <div className="od-wrap">
            <div className="od-topbar">
              <button className="od-back" onClick={() => setShowStatus(false)} aria-label="Back">←</button>
              <h2>Order Status</h2>
            </div>

            {(order.status === 'Cancelled' || order.status === 'Failed') && (
              <div className="od-cancelled">
                ⚠️ This order was {order.status.toLowerCase()}
                {order.cancelledAt ? ` on ${formatDate(order.cancelledAt)}` : ''}
                {order.remarks && <p>Reason: {order.remarks}</p>}
              </div>
            )}

            <div className="od-timeline">
              {statusTimeline.map((step, i) => {
                const done = i <= currentStep && order.status !== 'Cancelled' && order.status !== 'Failed';
                const lineDone = i < currentStep && order.status !== 'Cancelled' && order.status !== 'Failed';
                return (
                  <div key={step.label} className={`od-step ${done ? 'done' : ''}`}>
                    <div className="od-step-rail">
                      <span className="od-dot"></span>
                      {i < statusTimeline.length - 1 && <span className={`od-line ${lineDone ? 'done' : ''}`}></span>}
                    </div>
                    <div className="od-step-text">
                      <h4>{step.label}</h4>
                      <p>{step.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ---------- ORDER DETAILS SCREEN ----------
  return (
    <div>
      <Navbar />
      <div className="od-page">
        <div className="od-wrap">
          {/* Top bar */}
          <div className="od-topbar">
            <button className="od-back" onClick={() => navigate('/orders')} aria-label="Back to Orders">←</button>
            <h2>Order Details</h2>
          </div>

          {/* Order No / Placed On */}
          <div className="od-head">
            <div className="od-head-row">
              <span className="od-head-label">Order No</span>
              <span className="od-head-number">#{order.orderNumber || order.id}</span>
            </div>
            <div className="od-head-row">
              <span className="od-head-sub">Placed On</span>
              <span className="od-head-sub">{formatDateTime(order.placedAt || order.date)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="od-items">
            {order.items.map((item, index) => (
              <div key={index} className="od-item">
                <img
                  className="od-item-img"
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
                  }}
                />
                <div className="od-item-info">
                  <h4 className="od-item-name">{item.name}</h4>
                  <span className="od-item-qty">Quantity - {item.quantity} {item.quantity === 1 ? 'Item' : 'Items'}</span>
                  <div className="od-item-meta">
                    <span>{item.metal} • {item.weight}</span>
                    {item.purity && <span>Purity: {item.purity}%</span>}
                    {item.barcode && <span>Code: {item.barcode}</span>}
                    <span className="od-item-total">
                      Total Price: ₹ {(item.price * item.quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {index === 0 && (
                    <button
                      className="od-status-btn"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                      onClick={() => setShowStatus(true)}
                    >
                      {order.status} &gt;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cancel */}
          {(order.status === 'Processing' || order.status === 'Pending') && (
            <button className="od-cancel-btn" onClick={handleCancelOrder} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          {/* Cancelled info */}
          {order.status === 'Cancelled' && order.cancelledAt && (
            <div className="od-cancelled">
              ⚠️ This order was cancelled on {formatDate(order.cancelledAt)}
              {order.remarks && <p>Reason: {order.remarks}</p>}
            </div>
          )}

          {/* Order Tracking */}
          {order.status !== 'Cancelled' && order.status !== 'Failed' && (
            <>
              <hr className="od-divider" />
              <div className="od-section">
                <div className="od-track-head">
                  <h3>Order Tracking</h3>
                  <button className="od-track-link" onClick={() => setShowStatus(true)}>
                    View Status &gt;
                  </button>
                </div>
                <div className="od-track">
                  {getTrackingSteps(order.status).map((step, index, arr) => (
                    <div key={index} className={`od-track-step ${step.completed ? 'completed' : ''}`}>
                      <div className="od-track-circle">{step.completed ? '✓' : index + 1}</div>
                      <div className="od-track-label">{step.label}</div>
                      {index < arr.length - 1 && (
                        <div className={`od-track-line ${step.completed && arr[index + 1].completed ? 'completed' : ''}`}></div>
                      )}
                    </div>
                  ))}
                </div>
                {order.trackingNumber && (
                  <div className="od-track-number">
                    <span>Tracking Number</span>
                    <strong>{order.trackingNumber}</strong>
                  </div>
                )}
              </div>
            </>
          )}

          <hr className="od-divider" />

          {/* Remarks */}
          <div className="od-section">
            <h3>Remarks</h3>
            <p className="od-muted">{order.remarks ? order.remarks : 'No remarks added'}</p>
          </div>

          <hr className="od-divider" />

          {/* Payment Information */}
          <div className="od-section">
            <h3>Payment Information</h3>
            <div className="od-card od-pay-card" onClick={() => setShowPayment(true)}>
              <div className="od-pay-col">
                <span className="od-pay-label">Payment Status</span>
                <span className={`od-pay-pill ${isPaid ? 'paid' : 'unpaid'}`}>{order.paymentStatus}</span>
              </div>
              <div className="od-pay-sep"></div>
              <div className="od-pay-col">
                <span className="od-pay-label">Payment Type</span>
                <span className="od-pay-value">{order.paymentMethod}</span>
              </div>
              <span className="od-chevron">›</span>
            </div>
          </div>

          <hr className="od-divider" />

          {/* Download invoice */}
          <button className="od-invoice-row" onClick={handleDownloadInvoice}>
            <span>Download Invoice</span>
            <span className="od-chevron">›</span>
          </button>

          <hr className="od-divider" />

          {/* Delivery Address */}
          <div className="od-section">
            <h3>Delivery Address</h3>
            <div className="od-card od-address">
              {customerName && <p className="od-addr-name">{customerName}</p>}
              {customerPhone && <p className="od-addr-phone">+91 {customerPhone}</p>}
              <p className="od-addr-text">{order.shippingAddress}</p>
              {order.expectedDelivery && order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Completed' && (
                <p className="od-addr-extra">🚚 Estimated Delivery: {formatDate(order.expectedDelivery)}</p>
              )}
              {order.deliveredAt && (order.status === 'Delivered' || order.status === 'Completed') && (
                <p className="od-addr-extra">✅ Delivered On: {formatDate(order.deliveredAt)}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="od-actions">
            {(order.status === 'Delivered' || order.status === 'Completed') && (
              <>
                <button className="od-btn od-btn-review">⭐ Write a Review</button>
                <button className="od-btn od-btn-reorder" onClick={handleReorder}>🔄 Reorder All</button>
              </>
            )}
            <button className="od-btn od-btn-primary" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Payment Details bottom sheet */}
      {showPayment && (
        <div className="od-overlay" onClick={() => setShowPayment(false)}>
          <div className="od-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="od-sheet-head">
              <div>
                <h3>Payment Details</h3>
                {order.razorpayOrderId && <span className="od-sheet-sub">{order.razorpayOrderId}</span>}
              </div>
              {isPaid && <span className="od-paid-seal">PAID</span>}
            </div>

            <div className="od-kv"><span>Transaction Id</span><span>{order.transactionId || 'N/A'}</span></div>
            <div className="od-kv"><span>Invoice No</span><span>{order.invoiceNumber ? `#${order.invoiceNumber}` : 'N/A'}</span></div>
            <div className="od-kv"><span>Paid Date</span><span>{formatDate(order.invoiceDate || order.updatedAt || order.placedAt)}</span></div>
            <div className="od-kv"><span>Payment Mode</span><span>{order.paymentMethod}</span></div>
            <div className="od-kv"><span>Status</span><span>{order.paymentStatus}</span></div>

            <h3 className="od-sheet-title2">Amount Details</h3>
            <div className="od-kv light"><span>Subtotal</span><span>₹ {money(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="od-kv light"><span>Discount</span><span>-₹ {money(order.discount)}</span></div>}
            {order.shippingCharge > 0 && <div className="od-kv light"><span>Shipping</span><span>₹ {money(order.shippingCharge)}</span></div>}
            {order.taxAmount > 0 && <div className="od-kv light"><span>Tax</span><span>₹ {money(order.taxAmount)}</span></div>}
            <div className="od-kv light"><span>Total</span><span>₹ {money(order.total)}</span></div>

            <button className="od-sheet-invoice" onClick={handleDownloadInvoice}>
              <span className="od-dl-icon">⬇</span>
              <span>Download Invoice</span>
              <span className="od-dl-arrow">→</span>
            </button>

            <button className="od-sheet-close" onClick={() => setShowPayment(false)}>Close</button>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default OrderDetail;