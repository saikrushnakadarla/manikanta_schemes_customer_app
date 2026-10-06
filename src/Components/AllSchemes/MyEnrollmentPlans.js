import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './MyEnrollmentPlans.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const MyEnrollmentPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [enrolledSchemes, setEnrolledSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [expandedId, setExpandedId] = useState(null);

  // ------------------------------------------------------------
  // Get current logged-in customer ID
  // ------------------------------------------------------------
  const getCustomerId = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const id = user.id || user.customer_id || user.user_id;
        if (id) return parseInt(id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    const customerId =
      localStorage.getItem('customerId') ||
      localStorage.getItem('customer_id') ||
      localStorage.getItem('userId');
    if (customerId) return parseInt(customerId);
    return null;
  };

  // ------------------------------------------------------------
  // Format helpers
  // ------------------------------------------------------------
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getProgressPercentage = (paid, total) => {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((paid / total) * 100));
  };

  // ------------------------------------------------------------
  // Normalize an enrollment object — accepts many field names
  // ------------------------------------------------------------
  const normalizeEnrollment = (raw) => {
    if (!raw || typeof raw !== 'object') return null;

    const id =
      raw.id ??
      raw.enrollment_id ??
      raw.customer_scheme_id ??
      raw.pk ??
      null;

    const schemeId =
      raw.scheme ??
      raw.scheme_id ??
      raw.schemeId ??
      (raw.scheme_data && raw.scheme_data.scheme_id) ??
      null;

    const schemeName =
      raw.scheme_name ??
      raw.schemeName ??
      raw.name ??
      (raw.scheme_data && raw.scheme_data.scheme_name) ??
      'Unnamed Scheme';

    const installmentAmount =
      raw.scheme_installment_amount ??
      raw.installment_amount ??
      raw.monthly_installment ??
      (raw.scheme_data && raw.scheme_data.scheme_installment_amount) ??
      0;

    const totalInstallments =
      raw.total_installments ??
      raw.totalInstallments ??
      raw.payable_installments ??
      (raw.scheme_data && raw.scheme_data.payable_installments) ??
      0;

    const paidInstallments =
      raw.paid_installments ??
      raw.paidInstallments ??
      raw.installments_paid ??
      0;

    const status = (raw.status || raw.enrollment_status || 'active').toString();

    const enrollmentDate =
      raw.enrollment_date ?? raw.created_at ?? raw.start_date ?? null;

    const maturityDate = raw.maturity_date ?? raw.end_date ?? null;

    const enrollmentNumber =
      raw.enrollment_number ?? raw.enrollmentNumber ?? null;

    const customerName =
      raw.customer_name ?? raw.account_name ?? (raw.customer && raw.customer.name) ?? null;

    const totalLocked = raw.total_locked ?? null;

    return {
      ...raw,
      id,
      scheme: schemeId,
      scheme_name: schemeName,
      scheme_installment_amount: installmentAmount,
      total_installments: totalInstallments,
      paid_installments: paidInstallments,
      status,
      enrollment_date: enrollmentDate,
      maturity_date: maturityDate,
      enrollment_number: enrollmentNumber,
      customer_name: customerName,
      total_locked: totalLocked,
    };
  };

  // ------------------------------------------------------------
  // Extract enrollments list from any API shape
  // ------------------------------------------------------------
  const extractEnrollments = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.status === 'success' && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.enrollments)) return data.enrollments;
    if (Array.isArray(data.schemes)) return data.schemes;
    if (data.data && Array.isArray(data.data.results)) return data.data.results;
    console.warn('⚠️ Unknown API response shape:', data);
    return [];
  };

  // ------------------------------------------------------------
  // Fetch enrolled schemes
  // ------------------------------------------------------------
  const fetchEnrolledSchemes = async () => {
    try {
      setLoading(true);
      setError(null);

      const id = getCustomerId();
      if (!id) {
        setLoading(false);
        navigate('/login');
        return;
      }

      // Clean trailing slashes from baseURL to avoid "//api/..."
      const cleanBase = baseURL.replace(/\/+$/, '');

      // Add cache-busting query param — safe, never triggers CORS preflight
      const url = `${cleanBase}/api/customer/schemes/${id}/?_t=${Date.now()}`;
      console.log('📡 Fetching enrolled schemes from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // ⚠️ Do NOT add 'Cache-Control' here — Django CORS will reject the preflight
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Raw API response:', data);

      const rawList = extractEnrollments(data);
      console.log('📋 Extracted enrollments count:', rawList.length);

      const normalized = rawList.map(normalizeEnrollment).filter(Boolean);
      console.log('✅ Normalized enrollments:', normalized);

      setEnrolledSchemes(normalized);
    } catch (err) {
      console.error('❌ Error fetching enrolled schemes:', err);
      setError(err.message || 'Failed to fetch enrolled schemes');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Re-fetch whenever this page is (re)visited — including
  // when returning from /allschemes after a successful enrollment.
  // location.key changes on every navigation, so this always fires.
  // ------------------------------------------------------------
  useEffect(() => {
    fetchEnrolledSchemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // ------------------------------------------------------------
  // Status helpers (case-insensitive, multiple keywords)
  // ------------------------------------------------------------
  const ACTIVE_STATUSES = ['active', 'running', 'in_progress', 'enrolled', 'ongoing'];
  const CLOSED_STATUSES = ['closed', 'completed', 'matured', 'cancelled', 'canceled'];

  const isActiveStatus = (status) => {
    const s = (status || '').toString().trim().toLowerCase();
    return ACTIVE_STATUSES.includes(s);
  };

  const isClosedStatus = (status) => {
    const s = (status || '').toString().trim().toLowerCase();
    return CLOSED_STATUSES.includes(s);
  };

  // ------------------------------------------------------------
  // Filter by tab
  // ------------------------------------------------------------
  const filteredSchemes = enrolledSchemes.filter((scheme) => {
    if (activeTab === 'active') return isActiveStatus(scheme.status);
    return isClosedStatus(scheme.status);
  });

  const activeCount = enrolledSchemes.filter((s) => isActiveStatus(s.status)).length;
  const closedCount = enrolledSchemes.filter((s) => isClosedStatus(s.status)).length;

  // ------------------------------------------------------------
  // Loading UI
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="my-plans-page">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading your plans...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ------------------------------------------------------------
  // Error UI
  // ------------------------------------------------------------
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="my-plans-page">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchEnrolledSchemes}>
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ------------------------------------------------------------
  // Main render
  // ------------------------------------------------------------
  return (
    <div>
      <Navbar />
      <div className="my-plans-page">
        <div className="my-plans-container">
          {/* Header */}
          <div className="my-plans-header">
            <button className="back-icon-btn" onClick={() => navigate(-1)}>
              ←
            </button>
            <h1>My Installment Plans</h1>
            <button
              className="buy-new-plan-btn"
              onClick={() => navigate('/allschemes')}
            >
              Buy New Plan
            </button>
          </div>

          {/* KYC Pending Banner */}
          {/* <div className="kyc-banner">KYC PENDING</div> */}

          {/* Tabs */}
          <div className="plans-tabs">
            <button
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active A/C {activeCount > 0 && `(${activeCount})`}
            </button>
            {/* <button
              className={`tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
              onClick={() => setActiveTab('closed')}
            >
              Closed A/C {closedCount > 0 && `(${closedCount})`}
            </button> */}
          </div>

          {/* Plans List */}
          {filteredSchemes.length === 0 ? (
            <div className="empty-plans">
              <div className="empty-icon">📋</div>
              <h3>
                No {activeTab === 'active' ? 'Active' : 'Closed'} Plans
              </h3>
              <p>
                {activeTab === 'active'
                  ? "You haven't enrolled in any schemes yet."
                  : 'No closed plans to display.'}
              </p>
              {activeTab === 'active' && (
                <button
                  className="empty-buy-btn"
                  onClick={() => navigate('/allschemes')}
                >
                  Buy New Plan
                </button>
              )}
            </div>
          ) : (
            <div className="plans-list">
              {filteredSchemes.map((enrollment) => {
                const key =
                  enrollment.id ??
                  enrollment.enrollment_number ??
                  `${enrollment.scheme}-${enrollment.enrollment_date}`;

                const isExpanded = expandedId === enrollment.id;

                const progress = getProgressPercentage(
                  enrollment.paid_installments || 0,
                  enrollment.total_installments || 0
                );

                const dueInstallments =
                  (enrollment.total_installments || 0) -
                  (enrollment.paid_installments || 0);

                const totalPaid =
                  (enrollment.paid_installments || 0) *
                  (enrollment.scheme_installment_amount || 0);

                const goldLocked = (totalPaid / 6000).toFixed(3);

                return (
                  <div key={key} className="plan-card">
                    <div className="plan-card-top">
                      <div className="plan-dates">
                        <span className="start-date">
                          Started {formatDate(enrollment.enrollment_date)}
                        </span>
                        <span className="end-date">
                          Ends {formatDate(enrollment.maturity_date)}
                        </span>
                      </div>
                      <h3 className="plan-name">{enrollment.scheme_name}</h3>
                      <p className="plan-purpose">
                        Saving for -{enrollment.customer_name || 'Self'}
                      </p>
                    </div>

                    <div className="plan-card-details">
                      <div className="plan-detail-row">
                        <span className="plan-detail-label">Monthly Installment</span>
                        <span className="plan-detail-value">
                          ₹ {formatCurrency(enrollment.scheme_installment_amount)}/-
                        </span>
                      </div>
                      <div className="plan-detail-row">
                        <span className="plan-detail-label">Total Amount Paid</span>
                        <span className="plan-detail-value">
                          ₹ {formatCurrency(totalPaid)}/-
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="progress-section">
                        <div className="progress-labels">
                          <span>
                            Paid <strong>{enrollment.paid_installments || 0}</strong>
                          </span>
                          <span>
                            Due <strong>{dueInstallments}</strong>
                          </span>
                        </div>
                        <div className="progress-bar-track">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* <div className="plan-detail-row">
                        <span className="plan-detail-label">Savings A/C No</span>
                        <span className="plan-detail-value">
                          #{enrollment.enrollment_number || enrollment.id || 'N/A'}
                        </span>
                      </div>
                      <div className="plan-detail-row">
                        <span className="plan-detail-label">Total Locked</span>
                        <span className="plan-detail-value">
                          {enrollment.total_locked || `${goldLocked} gm`}, Gold
                        </span>
                      </div> */}
                    </div>

                    <div className="plan-card-actions">
                      <button
                        className="details-btn"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : enrollment.id)
                        }
                      >
                        <span>▼</span> Details
                      </button>
                      <button
                        className="passbook-btn"
                        onClick={() =>
                          navigate(`/payment-history/${enrollment.id}`, {
                            state: { enrollment_id: enrollment.id }
                          })
                        }
                      >
                        <span>📖</span> View Passbook
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="expanded-details">
                        <div className="expanded-row">
                          <span>Enrollment Number</span>
                          <span>{enrollment.enrollment_number || 'N/A'}</span>
                        </div>
                        <div className="expanded-row">
                          <span>Total Installments</span>
                          <span>{enrollment.total_installments || 0}</span>
                        </div>
                        <div className="expanded-row">
                          <span>Paid Installments</span>
                          <span>{enrollment.paid_installments || 0}</span>
                        </div>
                        <div className="expanded-row">
                          <span>Status</span>
                          <span
                            className={`status-${(enrollment.status || '').toLowerCase()}`}
                          >
                            {enrollment.status}
                          </span>
                        </div>
                        {enrollment.scheme && (
                          <button
                            className="full-details-btn"
                            onClick={() =>
                              navigate(`/schemesdetails/${enrollment.scheme}`)
                            }
                          >
                            View Full Scheme Details
                          </button>
                        )}
                      </div>
                    )}
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

export default MyEnrollmentPlans;