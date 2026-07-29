import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Checkout.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_type: 'Home',
    full_name: '',
    mobile: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    landmark: '',
    is_default: false
  });

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

  // Fetch customer addresses
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const customerId = getCustomerId();
      
      if (!customerId) {
        console.warn('No customer ID found');
        return;
      }

      const response = await fetch(`${baseURL}/api/customer-addresses/?customer=${customerId}`, {
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
      console.log('Addresses response:', data);

      let addressList = [];
      if (Array.isArray(data)) {
        addressList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        addressList = data.data;
      } else if (data && data.results && Array.isArray(data.results)) {
        addressList = data.results;
      }

      setAddresses(addressList);
      
      // Select default address or first address
      if (addressList.length > 0) {
        const defaultAddress = addressList.find(addr => addr.is_default) || addressList[0];
        setSelectedAddress(defaultAddress);
        setShowAddressForm(false);
      } else {
        setShowAddressForm(true);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      // If no addresses, show form
      setShowAddressForm(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    // Get product data from location state
    if (location.state && location.state.product) {
      const { product, quantity } = location.state;
      
      const totalPrice = product.price * quantity;
      const taxAmount = totalPrice * 0.05;
      const grandTotal = totalPrice + taxAmount;
      
      setOrderData({
        product: product,
        quantity: quantity,
        subtotal: totalPrice,
        taxAmount: taxAmount,
        grandTotal: grandTotal,
        customerId: getCustomerId()
      });
    } else {
      // If no product data, redirect to products
      navigate('/products');
    }

    // Fetch addresses
    fetchAddresses();
  }, [location, navigate]);

  // Handle address form change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save new address
  const saveAddress = async () => {
    // Validate address fields
    const required = ['full_name', 'mobile', 'address_line1', 'city', 'state', 'pincode'];
    for (let field of required) {
      if (!newAddress[field] || newAddress[field].trim() === '') {
        Swal.fire({
          title: '⚠️ Incomplete Address',
          text: `Please fill in the ${field.replace('_', ' ')} field.`,
          icon: 'warning',
          confirmButtonColor: '#C9A84C',
          background: '#1a1a1a',
          color: '#ffffff',
        });
        return;
      }
    }

    setSavingAddress(true);

    try {
      const customerId = getCustomerId();
      
      if (!customerId) {
        throw new Error('Please login to save address');
      }

      const addressPayload = {
        ...newAddress,
        customer: customerId,
        email: newAddress.email || `${customerId}@example.com`
      };

      console.log('Saving address:', addressPayload);

      const response = await fetch(`${baseURL}/api/customer-addresses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(addressPayload)
      });

      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
        console.log('Address save response:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = {};
      }

      if (!response.ok) {
        const errorMsg = responseData.message || responseData.error || responseData.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      // Add new address to list
      const newAddressData = responseData.data || responseData;
      setAddresses(prev => [...prev, newAddressData]);
      setSelectedAddress(newAddressData);
      setShowAddressForm(false);
      
      // Reset form
      setNewAddress({
        address_type: 'Home',
        full_name: '',
        mobile: '',
        email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        landmark: '',
        is_default: false
      });

      Swal.fire({
        title: '✅ Address Saved!',
        text: 'Your address has been saved successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#ffffff',
      });

    } catch (err) {
      console.error('Error saving address:', err);
      Swal.fire({
        title: '❌ Error!',
        text: err.message || 'Failed to save address. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } finally {
      setSavingAddress(false);
    }
  };

  // Select address
  const selectAddress = (address) => {
    setSelectedAddress(address);
  };

  // Show address form
  const handleAddAddress = () => {
    setShowAddressForm(true);
    setSelectedAddress(null);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  // Validate before placing order
  const validateOrder = () => {
    if (!selectedAddress) {
      Swal.fire({
        title: '⚠️ No Address Selected',
        text: 'Please select or add a shipping address.',
        icon: 'warning',
        confirmButtonColor: '#C9A84C',
        background: '#1a1a1a',
        color: '#ffffff',
      });
      return false;
    }

    if (!orderData) {
      Swal.fire({
        title: '❌ Error',
        text: 'Order data is missing. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        background: '#1a1a1a',
        color: '#ffffff',
      });
      return false;
    }

    return true;
  };

  // Place order
  const placeOrder = async () => {
    if (!validateOrder()) {
      return;
    }

    setLoading(true);

    try {
      const customerId = getCustomerId();
      
      if (!customerId) {
        throw new Error('Please login to place order');
      }

      const { product, quantity, subtotal, taxAmount, grandTotal } = orderData;
      
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const currentDate = new Date().toISOString();
      const expectedDelivery = new Date();
      expectedDelivery.setDate(expectedDelivery.getDate() + 7);

      // Prepare order data
      const orderPayload = {
        order_number: orderNumber,
        invoice_date: currentDate,
        customer: customerId,
        shipping_address: selectedAddress.address_id || selectedAddress.id,
        billing_address: selectedAddress.address_id || selectedAddress.id,
        subtotal: subtotal.toFixed(2),
        discount: "0.00",
        shipping_charge: "0.00",
        tax_amount: taxAmount.toFixed(2),
        grand_total: grandTotal.toFixed(2),
        payment_method: paymentMethod,
        payment_status: "Pending",
        order_status: "Pending",
        remarks: `Order for ${product.name}`,
        expected_delivery: expectedDelivery.toISOString().split('T')[0],
        delivered_at: null,
        cancelled_at: null,
        items: [
          {
            product: product.id,
            quantity: quantity,
            unit_price: product.price.toFixed(2),
            total_price: grandTotal.toFixed(2),
            product_name: product.name,
            category: product.category,
            metal_type: product.metal,
            purity: product.purity?.toString() || "0",
            gross_weight: product.grossWeight?.toString() || "0",
            net_weight: product.grossWeight?.toString() || "0",
            making_charge: product.makingCharges?.toString() || "0.00",
            gst_percentage: "5.00",
            gst_amount: taxAmount.toFixed(2),
            discount: "0.00",
            barcode: product.pcode || 'N/A',
            stone_weight: "0.000",
            wastage: "0.00"
          }
        ]
      };

      console.log('Placing order:', orderPayload);

      const response = await fetch(`${baseURL}/api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
        console.log('Order response:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = {};
      }

      if (!response.ok) {
        const errorMsg = responseData.message || responseData.error || responseData.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      // Save order to localStorage
      const orderWithDetails = {
        ...orderPayload,
        id: responseData.id || responseData.order_id || `ORD-${Date.now()}`,
        created_at: currentDate,
        is_offline: false
      };

      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.unshift(orderWithDetails);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      // Show success popup
      await Swal.fire({
        title: '🎉 Order Placed Successfully!',
        text: `Your order #${orderNumber} has been placed successfully.`,
        icon: 'success',
        showConfirmButton: true,
        confirmButtonColor: '#C9A84C',
        confirmButtonText: '📋 View Order',
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
          navigate('/order-confirmation', { 
            state: { 
              order: orderWithDetails,
              orderId: responseData.id || responseData.order_id 
            } 
          });
        } else {
          navigate('/products');
        }
      });

    } catch (err) {
      console.error('Error placing order:', err);
      
      Swal.fire({
        title: '❌ Order Failed!',
        text: err.message || 'Failed to place order. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
        background: '#1a1a1a',
        color: '#ffffff',
        backdrop: 'rgba(0,0,0,0.8)'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div>
        <Navbar />
        <div className="checkout-page">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  const { product, quantity, subtotal, taxAmount, grandTotal } = orderData;

  return (
    <div>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container">
          <h1>Checkout</h1>
          
          <div className="checkout-grid">
            {/* Left Column - Order Items */}
            <div className="checkout-items">
              <h2>Order Summary</h2>
              <div className="order-item-card">
                <div className="item-image">
                  <img 
                    src={product.image || 'https://via.placeholder.com/100/FFD700/FFFFFF?text=Jewellery'} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100/FFD700/FFFFFF?text=Jewellery';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3>{product.name}</h3>
                  <p className="item-category">{product.category}</p>
                  <p className="item-meta">Metal: {product.metal} | Purity: {product.purity}%</p>
                  <p className="item-meta">Weight: {product.weight}</p>
                  <div className="item-price-detail">
                    <span>₹{product.price.toLocaleString()} × {quantity}</span>
                    <span className="item-total">= ₹{(product.price * quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="total-row">
                  <span>Tax (5% GST)</span>
                  <span>₹{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="total-row grand-total">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Shipping & Payment */}
            <div className="checkout-form">
              <div className="form-section">
                <div className="address-section-header">
                  <h2>Shipping Address</h2>
                  {!showAddressForm && addresses.length > 0 && (
                    <button 
                      className="add-address-btn"
                      onClick={handleAddAddress}
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {/* Show Address Form if no addresses or user clicked add */}
                {showAddressForm ? (
                  <div className="address-form">
                    <div className="form-group">
                      <label>Address Type</label>
                      <select
                        name="address_type"
                        value={newAddress.address_type}
                        onChange={handleAddressChange}
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={newAddress.full_name}
                        onChange={handleAddressChange}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Mobile</label>
                        <input
                          type="text"
                          name="mobile"
                          value={newAddress.mobile}
                          onChange={handleAddressChange}
                          placeholder="Phone number"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={newAddress.email}
                          onChange={handleAddressChange}
                          placeholder="Email (optional)"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Address Line 1</label>
                      <input
                        type="text"
                        name="address_line1"
                        value={newAddress.address_line1}
                        onChange={handleAddressChange}
                        placeholder="House number, street name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Address Line 2</label>
                      <input
                        type="text"
                        name="address_line2"
                        value={newAddress.address_line2}
                        onChange={handleAddressChange}
                        placeholder="Apartment, suite, unit (optional)"
                      />
                    </div>
                    <div className="form-group">
                      <label>Landmark</label>
                      <input
                        type="text"
                        name="landmark"
                        value={newAddress.landmark}
                        onChange={handleAddressChange}
                        placeholder="Landmark (optional)"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          name="state"
                          value={newAddress.state}
                          onChange={handleAddressChange}
                          placeholder="State"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          value={newAddress.pincode}
                          onChange={handleAddressChange}
                          placeholder="Pincode"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Country</label>
                        <input
                          type="text"
                          name="country"
                          value={newAddress.country}
                          onChange={handleAddressChange}
                          placeholder="Country"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      {addresses.length > 0 && (
                        <button 
                          className="cancel-btn"
                          onClick={() => {
                            setShowAddressForm(false);
                            if (addresses.length > 0) {
                              setSelectedAddress(addresses[0]);
                            }
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        className="save-address-btn"
                        onClick={saveAddress}
                        disabled={savingAddress}
                      >
                        {savingAddress ? '⏳ Saving...' : '💾 Save Address'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display saved addresses */
                  <div className="saved-addresses">
                    {loadingAddresses ? (
                      <p>Loading addresses...</p>
                    ) : addresses.length > 0 ? (
                      <>
                        {addresses.map((address) => (
                          <div 
                            key={address.address_id || address.id}
                            className={`address-card ${selectedAddress?.address_id === address.address_id || selectedAddress?.id === address.id ? 'selected' : ''}`}
                            onClick={() => selectAddress(address)}
                          >
                            <div className="address-radio">
                              <input 
                                type="radio" 
                                checked={selectedAddress?.address_id === address.address_id || selectedAddress?.id === address.id}
                                readOnly
                              />
                            </div>
                            <div className="address-content">
                              <div className="address-name">{address.full_name}</div>
                              <div className="address-type">
                                <span className="type-badge">{address.address_type}</span>
                                {address.is_default && <span className="default-badge">Default</span>}
                              </div>
                              <div className="address-detail">
                                {address.address_line1}
                                {address.address_line2 && `, ${address.address_line2}`}
                              </div>
                              <div className="address-detail">
                                {address.city}, {address.state} - {address.pincode}
                              </div>
                              <div className="address-detail">{address.country}</div>
                              <div className="address-contact">
                                📱 {address.mobile}
                                {address.email && ` | ✉️ ${address.email}`}
                              </div>
                              {address.landmark && (
                                <div className="address-landmark">📍 {address.landmark}</div>
                              )}
                            </div>
                          </div>
                        ))}
                        {!showAddressForm && (
                          <button 
                            className="add-address-card"
                            onClick={handleAddAddress}
                          >
                            <span className="add-icon">+</span>
                            <span>Add New Address</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <p>No addresses found. Please add a new address.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="form-section">
                <h2>Payment Method</h2>
                <div className="payment-options">
                  <div 
                    className={`payment-option ${paymentMethod === 'Online' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodChange('Online')}
                  >
                    <div className="payment-radio">
                      <input type="radio" checked={paymentMethod === 'Online'} readOnly />
                      <span>Online Payment</span>
                    </div>
                    <p className="payment-desc">Credit Card, Debit Card, UPI, Net Banking</p>
                  </div>
                  <div 
                    className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodChange('COD')}
                  >
                    <div className="payment-radio">
                      <input type="radio" checked={paymentMethod === 'COD'} readOnly />
                      <span>Cash on Delivery</span>
                    </div>
                    <p className="payment-desc">Pay when you receive the order</p>
                  </div>
                </div>
              </div>

              <button 
                className="place-order-btn"
                onClick={placeOrder}
                disabled={loading || !selectedAddress}
              >
                {loading ? '⏳ Placing Order...' : '🛒 Place Order Now'}
              </button>
              {!selectedAddress && addresses.length > 0 && !showAddressForm && (
                <p className="select-address-warning">⚠️ Please select a shipping address</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

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
      `}</style>
    </div>
  );
};

export default Checkout;