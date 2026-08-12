import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './SchemeDetails.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const SchemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [customerId, setCustomerId] = useState(null);

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

  // Fetch scheme details
  useEffect(() => {
    const fetchSchemeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${baseURL}/api/schemes/${id}/`, {
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
        console.log('Scheme details:', data);
        setScheme(data);

        // Check if customer is enrolled in this scheme
        const custId = getCustomerId();
        if (custId) {
          setCustomerId(custId);
          await checkEnrollmentStatus(custId, parseInt(id));
        }
      } catch (err) {
        console.error('Error fetching scheme details:', err);
        setError(err.message || 'Failed to fetch scheme details');
        
        Swal.fire({
          title: '❌ Error!',
          text: 'Failed to load scheme details. Please try again.',
          icon: 'error',
          confirmButtonColor: '#C9A84C',
          background: '#1a1a1a',
          color: '#ffffff',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSchemeDetails();
    }
  }, [id]);

  // Check if customer is enrolled in this scheme
  const checkEnrollmentStatus = async (custId, schemeId) => {
    try {
      const response = await fetch(`${baseURL}/api/customer/schemes/${custId}/`, {
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
      
      let enrollmentsList = [];
      if (data && data.status === 'success' && data.data && Array.isArray(data.data)) {
        enrollmentsList = data.data;
      } else if (Array.isArray(data)) {
        enrollmentsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        enrollmentsList = data.data;
      }

      // Find enrollment for this scheme
      const enrollment = enrollmentsList.find(
        e => e.scheme === schemeId && (e.status === 'active' || e.status === 'Active')
      );
      
      setEnrollmentStatus(enrollment || null);
    } catch (err) {
      console.error('Error checking enrollment status:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get benefit description
  const getBenefitDescription = (scheme) => {
    if (!scheme) return '';
    if (scheme.scheme_benefit === 'x_plus_y') {
      return `Pay ${scheme.x_value} installments, get ${scheme.y_value} installment free!`;
    } else if (scheme.scheme_benefit === 'discount') {
      return `Get ${scheme.scheme_benefit_display || 'Special discount'}`;
    }
    return scheme.scheme_benefit_display || 'Special benefit';
  };

  // Calculate total investment
  const calculateTotalInvestment = (scheme) => {
    if (!scheme) return 0;
    return scheme.payable_installments * scheme.scheme_installment_amount;
  };

  // Calculate total benefit value
  const calculateTotalBenefit = (scheme) => {
    if (!scheme) return 0;
    if (scheme.scheme_benefit === 'x_plus_y') {
      const totalMonths = scheme.x_value + scheme.y_value;
      return totalMonths * scheme.scheme_installment_amount;
    }
    return scheme.payable_installments * scheme.scheme_installment_amount;
  };

  // Calculate savings
  const calculateSavings = (scheme) => {
    if (!scheme || scheme.scheme_benefit !== 'x_plus_y') return 0;
    return scheme.y_value * scheme.scheme_installment_amount;
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/allschemes');
  };

  // Handle enroll now
  const handleEnrollNow = () => {
    if (!customerId) {
      Swal.fire({
        title: '⚠️ Login Required',
        text: 'Please login to enroll in this scheme.',
        icon: 'warning',
        confirmButtonColor: '#C9A84C',
        confirmButtonText: 'Login Now',
        background: '#1a1a1a',
        color: '#ffffff',
        backdrop: 'rgba(0,0,0,0.8)',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    if (enrollmentStatus) {
      Swal.fire({
        title: 'ℹ️ Already Enrolled',
        html: `
          <div style="text-align: left; color: #fff;">
            <p>You are already enrolled in <strong>${scheme.scheme_name}</strong>!</p>
            <p style="font-size: 14px; color: #aaa; margin-top: 10px;">
              Enrollment Number: <strong style="color: #C9A84C;">${enrollmentStatus.enrollment_number}</strong>
            </p>
            <p style="font-size: 14px; color: #aaa;">
              Enrollment Date: <strong>${formatDate(enrollmentStatus.enrollment_date)}</strong>
            </p>
            <p style="font-size: 14px; color: #aaa;">
              Maturity Date: <strong>${formatDate(enrollmentStatus.maturity_date)}</strong>
            </p>
            <p style="font-size: 14px; color: #aaa;">
              Status: <strong style="color: #28a745;">${enrollmentStatus.status}</strong>
            </p>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#C9A84C',
        confirmButtonText: 'OK',
        background: '#1a1a1a',
        color: '#ffffff',
      });
      return;
    }

    // Navigate to enrollment form or show confirmation
    Swal.fire({
      title: '🌟 Enroll in Scheme',
      html: `
        <div style="text-align: left; color: #fff;">
          <p><strong>Scheme:</strong> ${scheme.scheme_name}</p>
          <p><strong>Installment:</strong> ${formatCurrency(scheme.scheme_installment_amount)}/month</p>
          <p><strong>Total Investment:</strong> ${formatCurrency(calculateTotalInvestment(scheme))}</p>
          <p><strong>Benefit:</strong> ${getBenefitDescription(scheme)}</p>
          <p><strong>Maturity:</strong> ${scheme.scheme_maturity_period} months</p>
          <hr style="border-color: #C9A84C;">
          <p style="font-size: 14px; color: #aaa;">
            <strong>Customer ID:</strong> ${customerId}
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '✅ Confirm Enrollment',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#C9A84C',
      cancelButtonColor: '#d33',
      background: '#1a1a1a',
      color: '#ffffff',
      backdrop: 'rgba(0,0,0,0.8)',
      width: 500,
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to enrollment form with scheme data
        navigate('/customer-schemes-enrollment', {
          state: {
            schemeData: scheme,
            customerId: customerId,
            isFromSchemeDetails: true
          }
        });
      }
    });
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="scheme-details-page">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading scheme details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div>
        <Navbar />
        <div className="scheme-details-page">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Scheme Not Found</h2>
            <p>{error || 'The scheme you are looking for does not exist.'}</p>
            <button className="back-btn" onClick={handleBack}>
              ← Back to Schemes
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
      <div className="scheme-details-page">
        <div className="scheme-details-container">
          {/* Back Button */}
          <button className="back-btn" onClick={handleBack}>
            ← Back to Schemes
          </button>

          {/* Scheme Header */}
          <div className="scheme-details-header">
            <div className="scheme-icon">
              {scheme.scheme_benefit === 'x_plus_y' ? '🎁' : '💎'}
            </div>
            <div className="scheme-header-content">
              <h1 className="scheme-title">{scheme.scheme_name}</h1>
              <div className="scheme-benefit-badge">
                {getBenefitDescription(scheme)}
              </div>
              {enrollmentStatus && (
                <div className="enrolled-badge-large">
                  ✅ Enrolled
                </div>
              )}
            </div>
          </div>

          {/* Scheme Stats */}
          <div className="scheme-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <span className="stat-label">Installment Amount</span>
                <span className="stat-value">{formatCurrency(scheme.scheme_installment_amount)}</span>
                <span className="stat-sub">per month</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <span className="stat-label">Maturity Period</span>
                <span className="stat-value">{scheme.scheme_maturity_period}</span>
                <span className="stat-sub">months</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <span className="stat-label">Total Investment</span>
                <span className="stat-value">{formatCurrency(calculateTotalInvestment(scheme))}</span>
                <span className="stat-sub">payable in {scheme.payable_installments} installments</span>
              </div>
            </div>
            {scheme.scheme_benefit === 'x_plus_y' && (
              <div className="stat-card highlight">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <span className="stat-label">Your Savings</span>
                  <span className="stat-value">{formatCurrency(calculateSavings(scheme))}</span>
                  <span className="stat-sub">{scheme.y_value} month(s) FREE</span>
                </div>
              </div>
            )}
          </div>

          {/* Scheme Details */}
          <div className="scheme-details-grid">
            <div className="details-card">
              <h3>Scheme Information</h3>
              <div className="details-list">
                <div className="detail-row">
                  <span className="detail-label">Scheme Name</span>
                  <span className="detail-value">{scheme.scheme_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Scheme ID</span>
                  <span className="detail-value">#{scheme.scheme_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Benefit Type</span>
                  <span className="detail-value">
                    {scheme.scheme_benefit === 'x_plus_y' ? 'X+Y Installments' : 'Discount'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Benefit Description</span>
                  <span className="detail-value">{scheme.scheme_benefit_display || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created Date</span>
                  <span className="detail-value">{formatDate(scheme.created_at)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">{formatDate(scheme.updated_at)}</span>
                </div>
              </div>
            </div>

            <div className="details-card">
              <h3>Installment Details</h3>
              <div className="details-list">
                <div className="detail-row">
                  <span className="detail-label">X Value (Paid)</span>
                  <span className="detail-value highlight">{scheme.x_value} months</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Y Value (Free)</span>
                  <span className="detail-value highlight">{scheme.y_value} months</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Payable</span>
                  <span className="detail-value">{scheme.payable_installments} installments</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Monthly Payment</span>
                  <span className="detail-value">{formatCurrency(scheme.scheme_installment_amount)}</span>
                </div>
                <div className="detail-row total-row">
                  <span className="detail-label">Total Amount Payable</span>
                  <span className="detail-value">{formatCurrency(calculateTotalInvestment(scheme))}</span>
                </div>
                {scheme.scheme_benefit === 'x_plus_y' && (
                  <div className="detail-row benefit-row">
                    <span className="detail-label">💎 You Save</span>
                    <span className="detail-value">{formatCurrency(calculateSavings(scheme))}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Benefit Breakdown */}
          {scheme.scheme_benefit === 'x_plus_y' && (
            <div className="benefit-breakdown">
              <h3>How It Works</h3>
              <div className="breakdown-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Pay for {scheme.x_value} Months</h4>
                    <p>Make {scheme.x_value} monthly installments of {formatCurrency(scheme.scheme_installment_amount)}</p>
                  </div>
                </div>
                <div className="step-arrow">→</div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Get {scheme.y_value} Month FREE</h4>
                    <p>Receive {scheme.y_value} month(s) absolutely free</p>
                  </div>
                </div>
                <div className="step-arrow">→</div>
                <div className="step highlight-step">
                  <div className="step-number">🎉</div>
                  <div className="step-content">
                    <h4>Complete Your Maturity</h4>
                    <p>After {scheme.scheme_maturity_period} months, you get {formatCurrency(calculateTotalBenefit(scheme))} worth benefits</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="enroll-btn"
              onClick={handleEnrollNow}
              disabled={!!enrollmentStatus}
            >
              <span className="btn-icon">{enrollmentStatus ? '✅' : '🚀'}</span>
              {enrollmentStatus ? 'Already Enrolled' : 'Enroll in This Scheme'}
            </button>
            <button className="share-btn" onClick={() => {
              Swal.fire({
                title: 'Share Scheme',
                text: `Check out ${scheme.scheme_name} scheme!`,
                icon: 'info',
                confirmButtonColor: '#C9A84C',
                background: '#1a1a1a',
                color: '#ffffff',
              });
            }}>
              <span className="btn-icon">📤</span>
              Share
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SchemeDetails;