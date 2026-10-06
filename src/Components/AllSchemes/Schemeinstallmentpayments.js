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

function Schemesinstallments() {
  const location = useLocation();
  const navigate = useNavigate();
  const [installments, setInstallments] = useState([]);
  const [schemeInfo, setSchemeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState({});

  // ============================================================
  // PARTIAL PAYMENT MODAL STATE
  // ============================================================
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(null);

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
    if (storedId) return parseInt(storedId);

    const localStoredId = localStorage.getItem('currentEnrollmentId');
    if (localStoredId) return parseInt(localStoredId);

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
        confirmButtonColor: '#3d2b56'
      }).then(() => {
        navigate('/my-enrollments');
      });
    }
  }, [location]);

  const fetchInstallments = async (enrollmentId) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${baseURL}/api/customer/schemes/${enrollmentId}/installments/`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No installments found for this scheme');
        }
        throw new Error('Failed to fetch installments');
      }

      const result = await response.json();

      if (result.status === 'success') {
        setInstallments(result.data || []);
        setSchemeInfo({
          enrollment_id: result.enrollment_id,
          enrollment_number: result.enrollment_number,
          scheme_name: result.scheme_name,
          total_installments: result.total_installments,
          paid_installments: result.paid_installments,
          pending_installments: result.pending_installments
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
        confirmButtonColor: '#3d2b56'
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  /**
   * Returns remaining amount for an installment
   * (amount - paid_amount)
   */
  const getRemainingAmount = (installment) => {
    const amount = parseFloat(installment.amount || 0);
    const paid = parseFloat(installment.paid_amount || 0);
    const remaining = amount - paid;
    return remaining > 0 ? remaining : 0;
  };

  /**
   * Determines if an installment is still payable
   * (i.e., not cancelled AND remaining amount > 0)
   */
  const isInstallmentPayable = (installment) => {
    const status = (installment.status || '').toLowerCase();
    if (status === 'cancelled') return false;
    return getRemainingAmount(installment) > 0;
  };

  const getTotalGoldAccumulated = () => {
    const totalPaid = installments
      .filter(i => {
        const s = (i.status || '').toLowerCase();
        return s === 'paid' || s === 'partial';
      })
      .reduce((sum, i) => sum + parseFloat(i.paid_amount || 0), 0);
    // Approximate: ₹6000 per gram of 22K gold
    return (totalPaid / 6000).toFixed(3);
  };

  const getCurrentDueInstallment = () => {
    return installments.find(i => {
      const status = (i.status || '').toLowerCase();
      return (status === 'pending' || status === 'partial' || status === 'overdue') 
             && getRemainingAmount(i) > 0;
    });
  };

  const openPaymentModal = (installment) => {
    const remaining = getRemainingAmount(installment);
    setSelectedInstallment(installment);
    setPaymentAmount(remaining.toString());
    setPaymentError('');
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInstallment(null);
    setPaymentAmount('');
    setPaymentError('');
  };

  const handleProceedToPayment = () => {
    if (!selectedInstallment) return;

    const remaining = getRemainingAmount(selectedInstallment);
    const entered = parseFloat(paymentAmount);

    if (!paymentAmount || isNaN(entered)) {
      setPaymentError('Please enter a valid amount.');
      return;
    }
    if (entered <= 0) {
      setPaymentError('Amount must be greater than zero.');
      return;
    }
    if (entered > remaining) {
      setPaymentError(
        `Amount cannot exceed the remaining amount of ₹${remaining.toFixed(2)}.`
      );
      return;
    }

    const installmentToPay = selectedInstallment;
    const amountToPay = entered;

    closePaymentModal();

    setTimeout(() => {
      handlePayment(installmentToPay, amountToPay);
    }, 200);
  };

  // ============================================================
  // RAZORPAY PAYMENT
  // ============================================================
  const handlePayment = async (installment, paymentAmount) => {
    const installmentId = installment.installment_id;

    try {
      setProcessingPayment(prev => ({ ...prev, [installmentId]: true }));

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      const createOrderResponse = await fetch(
        `${baseURL}/api/scheme/initiate-payment/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            installment_id: installmentId,
            payment_amount: paymentAmount
          })
        }
      );

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.error || errorData.message || 'Failed to create payment order');
      }

      const orderData = await createOrderResponse.json();

      const razorpayKey = orderData.razorpay_key || orderData.key;
      const razorpayOrderId = orderData.razorpay_order_id || orderData.order_id;
      const razorpayAmount = orderData.amount
        ? orderData.amount
        : Math.round(parseFloat(paymentAmount) * 100);

      if (!razorpayKey || !razorpayOrderId) {
        throw new Error('Invalid payment order response from server.');
      }

      const options = {
        key: razorpayKey,
        amount: razorpayAmount,
        currency: 'INR',
        name: 'Scheme Installment Payment',
        description: `Payment for Installment #${installment.installment_no}`,
        order_id: razorpayOrderId,
        prefill: {
          name: localStorage.getItem('customerName') || 'Customer',
          email: localStorage.getItem('customerEmail') || '',
          contact: localStorage.getItem('customerPhone') || '',
        },
        theme: { color: '#3d2b56' },
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
              confirmButtonColor: '#3d2b56'
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
        confirmButtonColor: '#3d2b56'
      });
    }
  };

  const verifyPayment = async (paymentResponse, installment) => {
    const installmentId = installment.installment_id;

    try {
      const verifyResponse = await fetch(
        `${baseURL}/api/scheme/confirm-payment/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature
          })
        }
      );

      const verifyData = await verifyResponse.json();

      if (verifyData.success === true || verifyData.status === 'success') {
        setProcessingPayment(prev => ({ ...prev, [installmentId]: false }));

        const instStatus = verifyData.installment?.status;
        const isPartial = instStatus === 'partial';

        Swal.fire({
          title: isPartial ? 'Partial Payment Successful!' : 'Payment Successful!',
          html: isPartial
            ? `<p>Your partial payment has been recorded.</p>
               <p><strong>Remaining amount:</strong> ₹${verifyData.installment?.remaining_amount ?? 'N/A'}</p>`
            : `<p>Receipt Number: ${verifyData.receipt?.receipt_number || 'N/A'}</p>`,
          icon: 'success',
          confirmButtonColor: '#2d6a4f',
          timer: 5000,
          timerProgressBar: true
        });

        const enrollmentId = getEnrollmentId();
        if (enrollmentId) await fetchInstallments(enrollmentId);
      } else {
        throw new Error(verifyData.error || verifyData.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setProcessingPayment(prev => ({ ...prev, [installmentId]: false }));

      Swal.fire({
        title: 'Verification Failed',
        text: error.message || 'Payment could not be verified. Please contact support.',
        icon: 'error',
        confirmButtonColor: '#3d2b56'
      });
    }
  };

  // ============================================================
  // FORMATTERS
  // ============================================================
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const handleBack = () => {
    sessionStorage.removeItem('currentEnrollmentId');
    localStorage.removeItem('currentEnrollmentId');
    navigate('/my-enrollments');
  };

  // ============================================================
  // RENDER STATUS PILL
  // ============================================================
  const renderStatusPill = (installment) => {
    const status = (installment.status || '').toLowerCase();
    const dueDate = new Date(installment.due_date);
    const monthYear = dueDate
      .toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      .toUpperCase();

    if (status === 'paid') {
      return <span className="status-pill status-pill-paid">• PAID</span>;
    }
    if (status === 'partial') {
      return <span className="status-pill status-pill-partial">• PARTIAL</span>;
    }
    if (status === 'overdue') {
      return <span className="status-pill status-pill-overdue">• OVERDUE</span>;
    }
    if (status === 'cancelled') {
      return <span className="status-pill status-pill-cancelled">• CANCELLED</span>;
    }
    return <span className="status-pill status-pill-upcoming">• UPCOMING . {monthYear}</span>;
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="ph-loading">
          <div className="ph-spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="ph-error">
          <div className="ph-error-icon">⚠️</div>
          <h3>Error Loading Installments</h3>
          <p>{error}</p>
          <button onClick={handleBack} className="ph-back-btn">← Go Back</button>
        </div>
      </div>
    );
  }

  const currentDue = getCurrentDueInstallment();
  const goldAccumulated = getTotalGoldAccumulated();
  const paidCount = installments.filter(i => i.status?.toLowerCase() === 'paid').length;
  const totalCount = schemeInfo?.total_installments || installments.length || 0;

  return (
    <div className="ph-page">
      <Navbar />

      <div className="ph-container">
        {/* ================= HEADER ================= */}
        <div className="ph-header">
          <button className="ph-back-icon" onClick={handleBack}>←</button>
          <h1 className="ph-title">Payment History</h1>
          <span className="ph-active-badge">Active</span>
        </div>

        {/* ================= GOLD SUMMARY CARD ================= */}
        <div className="ph-summary-card">
          <div className="ph-summary-top">
            <div className="ph-summary-left">
              <h2 className="ph-summary-title">
                {schemeInfo?.scheme_name || 'Scheme'}
              </h2>
              <p className="ph-summary-subtitle">
                Total Gold 22K (916) deposits
              </p>
            </div>
            <div className="ph-summary-right">
              <span className="ph-gold-value">{goldAccumulated} g</span>
            </div>
          </div>

          <div className="ph-summary-bottom">
            <div className="ph-progress-bar">
              <div
                className="ph-progress-fill"
                style={{ width: `${totalCount > 0 ? (paidCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="ph-progress-text">
              {paidCount} of {totalCount} done
            </span>
          </div>
        </div>

        {/* ================= INSTALLMENTS LIST ================= */}
        <div className="ph-list">
          {installments.length === 0 ? (
            <div className="ph-empty">
              <div className="ph-empty-icon">📋</div>
              <p>No installments found</p>
            </div>
          ) : (
            installments.map((installment, index) => {
              const status = (installment.status || '').toLowerCase();
              const installmentId = installment.installment_id;
              const isProcessing = processingPayment[installmentId] || false;
              const remaining = getRemainingAmount(installment);
              const isFullyPaid = status === 'paid' || remaining <= 0;
              const isCancelled = status === 'cancelled';
              const isPartial = status === 'partial' && remaining > 0;

              // ✅ Pay Now shows for pending, partial, overdue (not cancelled, not fully paid)
              const showPayNowButton = !isCancelled && !isFullyPaid;
              // ✅ Payment Details only shows for fully paid or partial
              const showPaymentDetailsBtn = status === 'paid' || status === 'partial';

              // Left border color by status
              let borderClass = 'ph-card-pending';
              if (status === 'paid') borderClass = 'ph-card-paid';
              else if (status === 'partial') borderClass = 'ph-card-partial';
              else if (status === 'overdue') borderClass = 'ph-card-overdue';

              return (
                <div key={installmentId || index} className={`ph-card ${borderClass}`}>
                  {/* Card Top: Installment # + Amount */}
                  <div className="ph-card-top">
                    <h3 className="ph-card-title">
                      Installment {installment.installment_no}
                    </h3>
                    <span className="ph-card-amount">
                      ₹ {formatCurrency(installment.amount)} /-
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div className="ph-card-status">
                    {renderStatusPill(installment)}
                  </div>

                  {/* Date / Due info */}
                  <div className="ph-card-date">
                    {status === 'paid' ? (
                      <span>Paid on {formatDateTime(installment.paid_date || installment.updated_at)}</span>
                    ) : status === 'partial' ? (
                      <span>
                        Paid ₹{formatCurrency(installment.paid_amount)} of ₹{formatCurrency(installment.amount)} — 
                        {' '}Remaining ₹{formatCurrency(remaining)}
                      </span>
                    ) : (
                      <span>
                        Pay between {formatDateTime(installment.due_date).split(',')[0]} - {formatDateTime(
                          new Date(new Date(installment.due_date).setDate(new Date(installment.due_date).getDate() + 30)).toISOString()
                        ).split(',')[0]}
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="ph-card-divider"></div>

                  {/* Bottom: Mode + Actions */}
                  <div className="ph-card-bottom">
                    {/* Left side: payment mode label (only for paid/partial) */}
                    <div className="ph-payment-mode">
                      {(status === 'paid' || status === 'partial') && (
                        <span className="ph-mode-label">
                          {installment.payment_mode
                            ? installment.payment_mode.toUpperCase()
                            : 'Razorpay (upi)'}
                        </span>
                      )}
                    </div>

                    {/* Right side: action buttons */}
                    <div className="ph-card-actions">
                      {/* Payment Details button (for paid or partial) */}
                      {showPaymentDetailsBtn && (
                        <button
                          className="ph-payment-details-btn"
                          onClick={() => setShowPaymentDetails(installment)}
                        >
                          Payment Details
                        </button>
                      )}

                      {/* ✅ Pay Now button (shows for pending, partial, overdue) */}
                      {showPayNowButton && (
                        <button
                          className="ph-pay-now-btn"
                          onClick={() => openPaymentModal(installment)}
                          disabled={isProcessing}
                          title={`Pay remaining ₹${remaining.toFixed(2)}`}
                        >
                          {isProcessing
                            ? 'Processing...'
                            : isPartial
                              ? `Pay Remaining ₹${formatCurrency(remaining)}`
                              : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom spacer for floating button */}
        {currentDue && <div style={{ height: '100px' }}></div>}
      </div>

      {/* ================= FLOATING "PAY CURRENT DUE" BUTTON ================= */}
      {currentDue && (
        <button
          className="ph-float-pay-btn"
          onClick={() => openPaymentModal(currentDue)}
        >
          Pay Current Due
        </button>
      )}

      {/* ================= PARTIAL PAYMENT MODAL ================= */}
      {showPaymentModal && selectedInstallment && (
        <div className="ph-modal-overlay" onClick={closePaymentModal}>
          <div className="ph-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ph-modal-header">
              <h3>Make Payment</h3>
              <button className="ph-modal-close" onClick={closePaymentModal}>✕</button>
            </div>

            <div className="ph-modal-body">
              <div className="ph-modal-summary">
                <div className="ph-modal-row">
                  <span>Installment #</span>
                  <strong>{selectedInstallment.installment_no}</strong>
                </div>
                <div className="ph-modal-row">
                  <span>Total Amount</span>
                  <strong>₹ {formatCurrency(selectedInstallment.amount)}</strong>
                </div>
                <div className="ph-modal-row">
                  <span>Already Paid</span>
                  <strong>₹ {formatCurrency(selectedInstallment.paid_amount || 0)}</strong>
                </div>
                <div className="ph-modal-row highlight">
                  <span>Remaining</span>
                  <strong>₹ {formatCurrency(getRemainingAmount(selectedInstallment))}</strong>
                </div>
              </div>

              <div className="ph-modal-input-group">
                <label>Enter Payment Amount *</label>
                <div className="ph-modal-input-wrap">
                  <span className="ph-rupee">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    max={getRemainingAmount(selectedInstallment)}
                    value={paymentAmount}
                    onChange={(e) => {
                      setPaymentAmount(e.target.value);
                      setPaymentError('');
                    }}
                    placeholder="Enter amount"
                    autoFocus
                  />
                </div>
                {paymentError && (
                  <p className="ph-modal-error">⚠ {paymentError}</p>
                )}
                <div className="ph-quick-amounts">
                  <button onClick={() => {
                    setPaymentAmount(getRemainingAmount(selectedInstallment).toString());
                    setPaymentError('');
                  }}>Full</button>
                  <button onClick={() => {
                    setPaymentAmount((getRemainingAmount(selectedInstallment) / 2).toFixed(2));
                    setPaymentError('');
                  }}>50%</button>
                  <button onClick={() => { setPaymentAmount('1000'); setPaymentError(''); }}>₹1000</button>
                  <button onClick={() => { setPaymentAmount('500'); setPaymentError(''); }}>₹500</button>
                </div>
              </div>
            </div>

            <div className="ph-modal-footer">
              <button className="ph-btn-cancel" onClick={closePaymentModal}>Cancel</button>
              <button
                className="ph-btn-proceed"
                onClick={handleProceedToPayment}
                disabled={!!processingPayment[selectedInstallment.installment_id]}
              >
                {processingPayment[selectedInstallment.installment_id]
                  ? 'Processing...'
                  : 'Proceed to Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAYMENT DETAILS MODAL ================= */}
      {showPaymentDetails && (
        <div className="ph-modal-overlay" onClick={() => setShowPaymentDetails(null)}>
          <div className="ph-modal ph-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ph-modal-header">
              <h3>Payment Details</h3>
              <button className="ph-modal-close" onClick={() => setShowPaymentDetails(null)}>✕</button>
            </div>
            <div className="ph-modal-body">
              <div className="ph-modal-summary">
                <div className="ph-modal-row">
                  <span>Installment #</span>
                  <strong>{showPaymentDetails.installment_no}</strong>
                </div>
                <div className="ph-modal-row">
                  <span>Total Amount</span>
                  <strong>₹ {formatCurrency(showPaymentDetails.amount)}</strong>
                </div>
                <div className="ph-modal-row">
                  <span>Amount Paid</span>
                  <strong>₹ {formatCurrency(showPaymentDetails.paid_amount || showPaymentDetails.amount)}</strong>
                </div>
                {getRemainingAmount(showPaymentDetails) > 0 && (
                  <div className="ph-modal-row highlight">
                    <span>Remaining</span>
                    <strong>₹ {formatCurrency(getRemainingAmount(showPaymentDetails))}</strong>
                  </div>
                )}
                <div className="ph-modal-row">
                  <span>Paid Date</span>
                  <strong>{formatDateTime(showPaymentDetails.paid_date || showPaymentDetails.updated_at)}</strong>
                </div>
                <div className="ph-modal-row">
                  <span>Payment Mode</span>
                  <strong>{showPaymentDetails.payment_mode || 'N/A'}</strong>
                </div>
                <div className="ph-modal-row">
                  <span>Receipt No</span>
                  <strong>{showPaymentDetails.receipt_number || 'N/A'}</strong>
                </div>
                {showPaymentDetails.transaction_reference && (
                  <div className="ph-modal-row">
                    <span>Transaction Ref</span>
                    <strong>{showPaymentDetails.transaction_reference}</strong>
                  </div>
                )}
                <div className="ph-modal-row">
                  <span>Status</span>
                  <strong style={{ textTransform: 'capitalize' }}>{showPaymentDetails.status}</strong>
                </div>
              </div>
            </div>
            <div className="ph-modal-footer">
              <button
                className="ph-btn-proceed"
                style={{ width: '100%' }}
                onClick={() => setShowPaymentDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schemesinstallments;