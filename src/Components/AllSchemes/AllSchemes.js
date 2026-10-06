import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AllSchemes.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const AllSchemes = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [enrolledSchemes, setEnrolledSchemes] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

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

  const fetchCustomerData = async () => {
    try {
      const id = getCustomerId();
      if (!id) return;
      setCustomerId(id);
      const response = await fetch(`${baseURL}/api/customers/${id}/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCustomerData(data);
    } catch (err) {
      console.error('Error fetching customer data:', err);
    }
  };

  const fetchEnrolledSchemes = async () => {
    try {
      setLoadingEnrollments(true);
      const id = getCustomerId();
      if (!id) { setLoadingEnrollments(false); return; }
      const response = await fetch(`${baseURL}/api/customer/schemes/${id}/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      let enrollmentsList = [];
      if (data && data.status === 'success' && data.data && Array.isArray(data.data)) {
        enrollmentsList = data.data;
      } else if (Array.isArray(data)) {
        enrollmentsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        enrollmentsList = data.data;
      } else if (data && data.results && Array.isArray(data.results)) {
        enrollmentsList = data.results;
      }
      const activeEnrollments = enrollmentsList.filter(
        enrollment => enrollment.status === 'active' || enrollment.status === 'Active'
      );
      setEnrolledSchemes(activeEnrollments);
    } catch (err) {
      console.error('Error fetching enrolled schemes:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchSchemes(), fetchCustomerData(), fetchEnrolledSchemes()]);
    };
    fetchData();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${baseURL}/api/schemes/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      let schemesList = [];
      if (Array.isArray(data)) schemesList = data;
      else if (data && data.data && Array.isArray(data.data)) schemesList = data.data;
      else if (data && data.results && Array.isArray(data.results)) schemesList = data.results;
      setSchemes(schemesList);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError(err.message || 'Failed to fetch schemes');
      Swal.fire({
        title: '❌ Error!',
        text: 'Failed to load schemes. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3d2b56',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } finally {
      setLoading(false);
    }
  };

  const isSchemeEnrolled = (schemeId) => {
    return enrolledSchemes.some(enrollment => enrollment.scheme === schemeId);
  };

  const getEnrollmentDetails = (schemeId) => {
    return enrolledSchemes.find(enrollment => enrollment.scheme === schemeId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBenefitDescription = (scheme) => {
    if (scheme.scheme_benefit === 'x_plus_y') {
      return `Pay ${scheme.x_value}, get ${scheme.y_value} free`;
    } else if (scheme.scheme_benefit === 'discount') {
      return `${scheme.scheme_benefit_display || 'Special discount'}`;
    }
    return scheme.scheme_benefit_display || 'Special benefit';
  };

  const calculateTotalInvestment = (scheme) => {
    return scheme.payable_installments * scheme.scheme_installment_amount;
  };

  const handleViewDetails = (schemeId) => {
    navigate(`/schemesdetails/${schemeId}`);
  };

  const checkCustomerLogin = () => {
    const id = getCustomerId();
    if (!id) {
      Swal.fire({
        title: '⚠️ Login Required',
        text: 'Please login to enroll in a scheme.',
        icon: 'warning',
        confirmButtonColor: '#3d2b56',
        confirmButtonText: 'Login Now',
        background: '#1a1a1a',
        color: '#ffffff',
      }).then((result) => {
        if (result.isConfirmed) window.location.href = '/login';
      });
      return false;
    }
    return true;
  };

  const confirmPaymentWithBackend = async (confirmationData) => {
    try {
      const response = await fetch(`${baseURL}/api/scheme-enrollment/confirm-payment/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(confirmationData),
      });
      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
      } catch (e) { responseData = {}; }
      if (!response.ok) {
        const errorMsg = responseData.message || responseData.error || responseData.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }
      if (responseData.status !== 'success') {
        throw new Error(responseData.message || 'Payment confirmation failed');
      }
      return responseData;
    } catch (err) {
      console.error('Error confirming payment:', err);
      throw err;
    }
  };

  const processRazorpayPayment = async (paymentData) => {
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Scheme Enrollment',
        description: `Payment for ${paymentData.scheme_name}`,
        order_id: paymentData.order_id,
        handler: async function (response) {
          await handlePaymentSuccess(
            paymentData,
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
        prefill: {
          name: paymentData.customer_name || 'Customer',
          email: customerData?.email || '',
          contact: customerData?.phone || '',
        },
        theme: { color: '#3d2b56' },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            Swal.fire({
              title: 'Payment Cancelled',
              text: 'You have cancelled the payment process.',
              icon: 'info',
              confirmButtonColor: '#3d2b56',
              background: '#1a1a1a',
              color: '#ffffff',
            });
          }
        }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      setProcessingPayment(false);
      Swal.fire({
        title: '❌ Payment Error',
        text: error.message || 'Failed to initiate payment. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    }
  };

  const handlePaymentSuccess = async (paymentData, razorpayPaymentId, razorpayOrderId, razorpaySignature) => {
    try {
      Swal.fire({
        title: '⏳ Confirming Payment...',
        text: 'Please wait while we confirm your payment.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#ffffff',
        didOpen: () => { Swal.showLoading(); }
      });

      const confirmationData = {
        customer_id: paymentData.customer_id,
        scheme_id: paymentData.scheme_id,
        transaction_id: paymentData.transaction_id,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: razorpaySignature,
      };

      const confirmationResponse = await confirmPaymentWithBackend(confirmationData);
      await fetchEnrolledSchemes();

      const scheme = schemes.find(s => s.scheme_id === paymentData.scheme_id);

      await Swal.fire({
        title: '🎉 Enrollment Successful!',
        html: `
          <div style="text-align: center; color: #fff;">
            <p>You have successfully enrolled in <strong>${scheme?.scheme_name || paymentData.scheme_name}</strong>!</p>
            ${confirmationResponse.enrollment_number ? `
              <p style="font-size: 14px; color: #aaa; margin-top: 10px;">
                Enrollment Number: <strong style="color: #C9A84C;">${confirmationResponse.enrollment_number}</strong>
              </p>
            ` : ''}
            <p style="font-size: 14px; color: #aaa;">
              First Installment: <strong style="color: #28a745;">${formatCurrency(scheme?.scheme_installment_amount || 0)}</strong> paid
            </p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#3d2b56',
        confirmButtonText: '📋 View My Enrollments',
        showCancelButton: true,
        cancelButtonText: 'Continue Browsing',
        background: '#1a1a1a',
        color: '#ffffff',
      }).then((result) => {
        if (result.isConfirmed) navigate('/my-enrollments');
      });
    } catch (err) {
      console.error('Error confirming payment:', err);
      Swal.fire({
        title: '⚠️ Payment Confirmation Issue',
        html: `
          <div style="text-align: left; color: #fff;">
            <p>Your payment was successful, but we encountered an issue confirming it.</p>
            <p style="font-size: 14px; color: #aaa; margin-top: 10px;">
              Payment ID: <strong>${razorpayPaymentId}</strong>
            </p>
            <p style="font-size: 14px; color: #aaa;">
              Error: <strong style="color: #ff6b6b;">${err.message}</strong>
            </p>
          </div>
        `,
        icon: 'warning',
        confirmButtonColor: '#3d2b56',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleEnrollNow = async (scheme) => {
    if (!checkCustomerLogin()) return;

    if (isSchemeEnrolled(scheme.scheme_id)) {
      const enrollment = getEnrollmentDetails(scheme.scheme_id);
      Swal.fire({
        title: 'ℹ️ Already Enrolled',
        html: `
          <div style="text-align: left; color: #fff;">
            <p>You are already enrolled in <strong>${scheme.scheme_name}</strong>!</p>
            <p style="font-size: 14px; color: #aaa; margin-top: 10px;">
              Enrollment Number: <strong style="color: #C9A84C;">${enrollment.enrollment_number}</strong>
            </p>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#3d2b56',
        confirmButtonText: 'OK',
        background: '#1a1a1a',
        color: '#ffffff',
      });
      return;
    }

    const customerId = getCustomerId();
    if (!customerId) return;

    const result = await Swal.fire({
      title: '🌟 Enroll & Pay First Installment',
      html: `
        <div style="text-align: left; color: #fff;">
          <p><strong>Scheme:</strong> ${scheme.scheme_name}</p>
          <p><strong>First Installment:</strong> ${formatCurrency(scheme.scheme_installment_amount)}</p>
          <p><strong>Total Investment:</strong> ${formatCurrency(calculateTotalInvestment(scheme))}</p>
          <p><strong>Benefit:</strong> ${getBenefitDescription(scheme)}</p>
          <p><strong>Maturity:</strong> ${scheme.scheme_maturity_period} months</p>
          <hr style="border-color: #3d2b56;">
          <p style="font-size: 12px; color: #888; margin-top: 10px;">
            💳 You will be redirected to make the first installment payment
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '💳 Pay Now',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3d2b56',
      cancelButtonColor: '#d33',
      background: '#1a1a1a',
      color: '#ffffff',
      width: 500,
    });

    if (!result.isConfirmed) return;
    setProcessingPayment(true);

    try {
      const paymentPayload = { customer_id: customerId, scheme_id: scheme.scheme_id };
      const paymentUrl = `${baseURL}/api/scheme-enrollment/initiate-payment/`;
      const response = await fetch(paymentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(paymentPayload),
      });
      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
      } catch (e) { responseData = {}; }

      if (!response.ok) {
        const errorMsg = responseData.message || responseData.error || responseData.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }
      if (responseData.status !== 'success') {
        throw new Error(responseData.message || 'Failed to initiate payment');
      }
      await processRazorpayPayment(responseData);
    } catch (err) {
      console.error('Error in enrollment process:', err);
      setProcessingPayment(false);
      let errorMessage = err.message || 'Failed to initiate payment. Please try again.';
      if (err.message.includes('404')) {
        errorMessage = 'Payment endpoint not found. Please check if the server is running and the URL is correct.';
      }
      Swal.fire({
        title: '❌ Payment Initiation Failed!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#d33',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="schemes-page">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading schemes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="schemes-page">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchSchemes}>Retry</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="schemes-page">
        <div className="schemes-container">
          {/* Header */}
          <div className="schemes-header-bar">
            <button className="back-icon-btn" onClick={() => navigate('/my-enrollments')}>
              ←
            </button>
            <h1>Installment Plans</h1>
          </div>

          {/* Schemes List */}
          {schemes.length === 0 ? (
            <div className="no-schemes">
              <div className="empty-icon">📋</div>
              <h3>No Schemes Available</h3>
              <p>Please check back later for new investment opportunities.</p>
            </div>
          ) : (
            <div className="schemes-list">
              {schemes.map((scheme) => {
                const enrolled = isSchemeEnrolled(scheme.scheme_id);
                return (
                  <div key={scheme.scheme_id} className="scheme-card">
                    <div className="scheme-card-left-border"></div>
                    <div className="scheme-card-content">
                      <div className="scheme-card-top">
                        <span className="plan-label">Plan Name</span>
                        <h2 className="plan-title">{scheme.scheme_name}</h2>
                        <p className="plan-price">
                          ₹ {scheme.scheme_installment_amount}/-
                        </p>
                        <p className="plan-tenure">
                          Tenure - {scheme.scheme_maturity_period} months
                        </p>
                      </div>
                      <div className="scheme-divider"></div>
                      <div className="scheme-card-buttons">
                        <button 
                          className="view-details-btn"
                          onClick={() => handleViewDetails(scheme.scheme_id)}
                        >
                          View Details
                        </button>
                        <button 
                          className={`buy-now-btn ${enrolled ? 'enrolled' : ''}`}
                          onClick={() => handleEnrollNow(scheme)}
                          disabled={loading || loadingEnrollments || processingPayment || enrolled}
                        >
                          {processingPayment ? 'Processing...' : enrolled ? 'Enrolled' : 'Buy Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllSchemes;