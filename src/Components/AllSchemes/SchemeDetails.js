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
  const [showDetailsModal, setShowDetailsModal] = useState(true);

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
    if (customerId) return parseInt(customerId);
    return null;
  };

  useEffect(() => {
    const fetchSchemeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${baseURL}/api/schemes/${id}/`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setScheme(data);
        const custId = getCustomerId();
        if (custId) {
          setCustomerId(custId);
          await checkEnrollmentStatus(custId, parseInt(id));
        }
      } catch (err) {
        console.error('Error fetching scheme details:', err);
        setError(err.message || 'Failed to fetch scheme details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSchemeDetails();
  }, [id]);

  const checkEnrollmentStatus = async (custId, schemeId) => {
    try {
      const response = await fetch(`${baseURL}/api/customer/schemes/${custId}/`, {
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
      }
      const enrollment = enrollmentsList.find(
        e => e.scheme === schemeId && (e.status === 'active' || e.status === 'Active')
      );
      setEnrollmentStatus(enrollment || null);
    } catch (err) {
      console.error('Error checking enrollment status:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBenefitDescription = (scheme) => {
    if (!scheme) return '';
    if (scheme.scheme_benefit === 'x_plus_y') {
      return `Save today, secure tomorrow. Invest with minimum of Rs ${scheme.scheme_installment_amount} a month for ${scheme.x_value} months and enjoy ${scheme.y_value} month bonus from our side upon maturity`;
    } else if (scheme.scheme_benefit === 'discount') {
      return `Get ${scheme.scheme_benefit_display || 'Special discount'}`;
    }
    return scheme.scheme_benefit_display || 'Special benefit';
  };

  const calculateTotalInvestment = (scheme) => {
    if (!scheme) return 0;
    return scheme.payable_installments * scheme.scheme_installment_amount;
  };

  const calculateIncentive = (scheme) => {
    if (!scheme) return 0;
    if (scheme.scheme_benefit === 'x_plus_y') {
      return scheme.y_value * scheme.scheme_installment_amount;
    }
    return 0;
  };

  const handleClose = () => {
    navigate('/allschemes');
  };

  const handleEnrollNow = () => {
    if (!customerId) {
      Swal.fire({
        title: '⚠️ Login Required',
        text: 'Please login to enroll in this scheme.',
        icon: 'warning',
        confirmButtonColor: '#3d2b56',
        confirmButtonText: 'Login Now',
        background: '#1a1a1a',
        color: '#ffffff',
      }).then((result) => {
        if (result.isConfirmed) window.location.href = '/login';
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

    // Navigate back to AllSchemes and trigger enroll - or handle payment directly
    // For now, navigate to AllSchemes
    navigate('/allschemes');
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
            <button className="back-btn" onClick={handleClose}>
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
        {/* Overlay */}
        <div className="modal-overlay" onClick={handleClose}></div>

        {/* Bottom Sheet Modal */}
        <div className="details-bottom-sheet">
          <div className="bottom-sheet-handle"></div>
          
          <div className="bottom-sheet-content">
            <h2 className="sheet-title">Plan details</h2>
            <h3 className="sheet-plan-name">{scheme.scheme_name}</h3>
            
            <p className="sheet-description">
              Plan Description :- {getBenefitDescription(scheme)}
            </p>

            <div className="sheet-details-table">
              <div className="sheet-row">
                <span className="sheet-label">Plan amount/month</span>
                <span className="sheet-value">₹ {scheme.scheme_installment_amount}/-</span>
              </div>
              <div className="sheet-row">
                <span className="sheet-label">Total payable amount for {scheme.payable_installments} months</span>
                <span className="sheet-value">₹ {calculateTotalInvestment(scheme)}/-</span>
              </div>
              <div className="sheet-row">
                <span className="sheet-label">Incentive</span>
                <span className="sheet-value">₹ {calculateIncentive(scheme)}/-</span>
              </div>
            </div>

            <div className="sheet-total-row">
              <span className="sheet-total-label">Total</span>
              <span className="sheet-total-value">
                ₹ {(calculateTotalInvestment(scheme) + calculateIncentive(scheme))}/-
              </span>
            </div>

            <button className="sheet-close-btn" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SchemeDetails;