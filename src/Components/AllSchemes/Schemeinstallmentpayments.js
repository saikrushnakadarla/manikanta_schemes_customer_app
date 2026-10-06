import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import './Schemeinstallmentpayments.css';
import baseURL from '../URL/BaseURL';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Schemeinstallmentpayments() {
  const location = useLocation();
  const navigate = useNavigate();
  const [installments, setInstallments] = useState([]);
  const [schemeInfo, setSchemeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [processingPayment, setProcessingPayment] = useState({});

  // Get enrollment_id from multiple sources
  const getEnrollmentId = () => {
    if (location.state?.enrollment_id) {
      const id = location.state.enrollment_id;
      sessionStorage.setItem('currentEnrollmentId', id);
      return parseInt(id);
    }

    const params = new URLSearchParams(location.search);
    const idFromParams = params.get('enrollment_id');
    if (idFromParams) {
      const id = parseInt(idFromParams);
      sessionStorage.setItem('currentEnrollmentId', id);
      return id;
    }

    const storedId = sessionStorage.getItem('currentEnrollmentId');
    if (storedId) {
      return parseInt(storedId);
    }

    const localStoredId = localStorage.getItem('currentEnrollmentId');
    if (localStoredId) {
      return parseInt(localStoredId);
    }

    // Fallback: use plan.id passed from AllSchemes via navigate state
    if (location.state?.plan?.id) {
      const id = parseInt(location.state.plan.id);
      sessionStorage.setItem('currentEnrollmentId', id);
      return id;
    }

    return null;
  };

  useEffect(() => {
    const enrollmentId = getEnrollmentId();
    if (enrollmentId) {
      fetchInstallments(enrollmentId);
    } else {
      setError('No enrollment ID found. Please select a scheme first.');
      setLoading(false);

      Swal.fire({
        title: 'Error!',
        text: 'No enrollment ID found. Redirecting back...',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        confirmButtonColor: '#5b2189'
      }).then(() => {
        navigate('/schemes');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const fetchInstallments = async (enrollmentId) => {
    try {
      setLoading(true);

      console.log('🔍 Fetching installments for enrollment ID:', enrollmentId);

      const response = await fetch(
        `${baseURL}/api/customer/schemes/${enrollmentId}/installments/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No installments found for this scheme');
        }
        throw new Error('Failed to fetch installments');
      }

      const result = await response.json();
      console.log('📊 Installments Response:', result);

      if (result.status === 'success') {
        setInstallments(result.data || []);
        setSchemeInfo({
          enrollment_id: result.enrollment_id,
          enrollment_number: result.enrollment_number,
          scheme_name: result.scheme_name,
          total_installments: result.total_installments,
          paid_installments: result.paid_installments,
          pending_installments: result.pending_installments,
          total_gold: result.total_gold || result.gold_locked || '0.132 g',
          gold_purity: result.gold_purity || '22K (916)'
        });
      } else {
        throw new Error(result.message || 'Invalid data format received');
      }
    } catch (error) {
      console.error('❌ Error fetching installments:', error);
      setError(error.message);

      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to load installments. Please try again.',
        icon: 'error',
        confirmButtonColor: '#5b2189'
      });
    } finally {
      setLoading(false);
    }
  };

  // Razorpay payment handler
  const handlePayment = async (installment) => {
    const installmentId = installment.installment_id;

    try {
      setProcessingPayment(prev => ({ ...prev, [installmentId]: true }));

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      console.log('💰 Creating payment order for installment:', installmentId);

      const createOrderResponse = await fetch(
        `${baseURL}/api/scheme/initiate-payment/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            installment_id: installmentId
          })
        }
      );

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        console.error('❌ Order creation error:', errorData);
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await createOrderResponse.json();
      console.log('✅ Payment order created:', orderData);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Scheme Installment Payment',
        description: `Payment for Installment #${installment.installment_no}`,
        order_id: orderData.order_id,
        prefill: {
          name: localStorage.getItem('customerName') || 'Customer',
          email: localStorage.getItem('customerEmail') || '',
          contact: localStorage.getItem('customerPhone') || '',
        },
        theme: {
          color: '#5b2189'
        },
        handler: function (response) {
          verifyPayment(response, installment);
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(prev => ({ ...prev, [installmentId]: false }));
            Swal.fire({
              title: 'Payment Cancelled',
              text: 'You cancelled the payment process.',
              icon: 'info',
              confirmButtonColor: '#5b2189'
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('❌ Payment error:', error);
      setProcessingPayment(prev => ({ ...prev, [installmentId]: false }));

      Swal.fire({
        title: 'Payment Error',
        text: error.message || 'Failed to initiate payment. Please try again.',
        icon: 'error',
        confirmButtonColor: '#5b2189'
      });
    }
  };

  // Verify payment after successful transaction
  const verifyPayment = async (paymentResponse, installment) => {
    const installmentId = installment.installment_id;

    try {
      const verifyResponse = await fetch(
        `${baseURL}/api/scheme/confirm-payment/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature
          })
        }
      );

      const verifyData = await verifyResponse.json();
      console.log('✅ Payment verification response:', verifyData);

      if (verifyData.status === 'success') {
        setProcessingPayment(prev => ({ ...prev, [installmentId]: false }));

        Swal.fire({
          title: 'Payment Successful!',
          text: `Receipt Number: ${verifyData.receipt_no || 'N/A'}`,
          icon: 'success',
          confirmButtonColor: '#00b894',
          timer: 5000,
          timerProgressBar: true
        });

        const enrollmentId = getEnrollmentId();
        if (enrollmentId) {
          await fetchInstallments(enrollmentId);
        }
      } else {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setProcessingPayment(prev => ({ ...prev, [installmentId]: false }));

      Swal.fire({
        title: 'Verification Failed',
        text: error.message || 'Payment could not be verified. Please contact support.',
        icon: 'error',
        confirmButtonColor: '#5b2189'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹ ${numAmount.toLocaleString('en-IN')} /-`;
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Status label from reference (PAID / UPCOMING . NOV 2026 / OVERDUE)
  const getStatusLabel = (installment) => {
    const status = (installment.status || 'pending').toLowerCase();
    if (status === 'paid') return { text: 'PAID', className: 'status-paid' };
    if (status === 'overdue') return { text: 'OVERDUE', className: 'status-overdue' };
    if (status === 'cancelled') return { text: 'CANCELLED', className: 'status-cancelled' };

    // pending -> upcoming month label
    const due = installment.due_date ? new Date(installment.due_date) : null;
    if (due) {
      const monthYear = due.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).toUpperCase();
      return { text: `UPCOMING . ${monthYear}`, className: 'status-upcoming' };
    }
    return { text: 'UPCOMING', className: 'status-upcoming' };
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
  };

  const handleBack = () => {
    sessionStorage.removeItem('currentEnrollmentId');
    localStorage.removeItem('currentEnrollmentId');
    navigate(-1);
  };

  // Find the current due installment (first pending / overdue)
  const currentDueInstallment = installments.find(
    (inst) => (inst.status || '').toLowerCase() === 'pending' ||
      (inst.status || '').toLowerCase() === 'overdue'
  );

  // Filter installments
  const filteredInstallments = installments.filter(inst => {
    if (filter === 'all') return true;
    if (filter === 'paid') return inst.status?.toLowerCase() === 'paid';
    if (filter === 'pending') {
      const s = inst.status?.toLowerCase();
      return s === 'pending' || s === 'overdue';
    }
    return true;
  });

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="installments-loading">
          <div className="scheme-loader"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="installments-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Error Loading Installments</h3>
          <p>{error}</p>
          <button onClick={handleBack} className="btn btn-primary">
            <i className="bi bi-arrow-left"></i> Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalInstallments = schemeInfo?.total_installments || installments.length || 11;
  const paidInstallments = schemeInfo?.paid_installments || installments.filter(i => i.status?.toLowerCase() === 'paid').length;
  const progressPercent = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

  return (
    <div className="installments-page">
      <Navbar />

      <div className="installments-content">
        {/* Header */}
        <div className="ph-header">
          <button className="ph-back-btn" onClick={handleBack} aria-label="Back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className="ph-title">Payment History</h1>
          <span className="ph-active-badge">Active</span>
        </div>

        {/* Blue summary card */}
        <div className="ph-summary-card">
          <div className="ph-summary-top">
            <div className="ph-summary-left">
              <h2 className="ph-scheme-name">
                {schemeInfo?.scheme_name || 'Swarna Dhara Metal'}
              </h2>
              <p className="ph-scheme-sub">
                Total Gold {schemeInfo?.gold_purity || '22K (916)'} deposits
              </p>
            </div>
            <div className="ph-summary-right">
              <span className="ph-gold-amount">
                {schemeInfo?.total_gold || '0.132 g'}
              </span>
            </div>
          </div>

          <div className="ph-progress-row">
            <div className="ph-progress-bar">
              <div
                className="ph-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="ph-progress-text">
              {paidInstallments} of {totalInstallments} done
            </span>
          </div>
        </div>

        {/* Filter chips (subtle) */}
        <div className="ph-filter-row">
          <button
            className={`ph-filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button
            className={`ph-filter-chip ${filter === 'paid' ? 'active' : ''}`}
            onClick={() => handleFilterChange('paid')}
          >
            Paid
          </button>
          <button
            className={`ph-filter-chip ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => handleFilterChange('pending')}
          >
            Upcoming
          </button>
        </div>

        {/* Installments List */}
        <div className="ph-list">
          {filteredInstallments.length > 0 ? (
            filteredInstallments.map((installment, index) => {
              const installmentId = installment.installment_id;
              const isProcessing = processingPayment[installmentId] || false;
              const status = (installment.status || 'pending').toLowerCase();
              const isPaid = status === 'paid';
              const isPending = status === 'pending' || status === 'overdue';
              const statusLabel = getStatusLabel(installment);

              return (
                <div key={installmentId || index} className={`ph-card ${isPaid ? 'paid' : ''}`}>
                  <div className={`ph-card-strip ${isPaid ? 'strip-paid' : 'strip-upcoming'}`} />

                  <div className="ph-card-body">
                    {/* Top row */}
                    <div className="ph-card-top">
                      <h3 className="ph-installment-title">
                        Installment {installment.installment_no}
                      </h3>
                      <span className="ph-installment-amount">
                        {formatCurrency(installment.amount || installment.paid_amount)}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="ph-status-row">
                      <span className={`ph-status-badge ${statusLabel.className}`}>
                        {isPaid ? '• PAID' : `• ${statusLabel.text}`}
                      </span>
                    </div>

                    {/* Date line */}
                    <p className="ph-date-line">
                      {isPaid
                        ? formatDateTime(installment.paid_date || installment.updated_at)
                        : `Pay between ${formatShortDate(installment.due_date)} - ${formatShortDate(installment.due_date)}`}
                    </p>

                    <div className="ph-divider" />

                    {/* Bottom row */}
                    <div className="ph-card-bottom">
                      <span className="ph-payment-mode">
                        {isPaid
                          ? (installment.payment_mode || 'Razorpay (upi)')
                          : ''}
                      </span>

                      {isPaid && (
                        <button
                          className="ph-outline-btn"
                          onClick={() => navigate(`/payment-details/${installmentId}`, { state: { installment } })}
                        >
                          Payment Details
                        </button>
                      )}

                      {isPending && (
                        <button
                          className="ph-paynow-btn"
                          onClick={() => handlePayment(installment)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="ph-no-data">
              <p>No installments found</p>
              <span>No {filter} installments available</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Pay Current Due button */}
      {currentDueInstallment && (
        <button
          className="ph-floating-pay-btn"
          onClick={() => handlePayment(currentDueInstallment)}
          disabled={processingPayment[currentDueInstallment.installment_id]}
        >
          {processingPayment[currentDueInstallment.installment_id]
            ? 'Processing...'
            : 'Pay Current Due'}
        </button>
      )}
    </div>
  );
}

export default Schemeinstallmentpayments;