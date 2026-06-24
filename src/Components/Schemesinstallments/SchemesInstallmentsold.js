// Schemesinstallments.js - Updated with improved enrollment_id handling
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Schemesinstallments.css';

function Schemesinstallments() {
  const location = useLocation();
  const navigate = useNavigate();
  const [installments, setInstallments] = useState([]);
  const [schemeInfo, setSchemeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, paid, pending
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Get enrollment_id from multiple sources
  const getEnrollmentId = () => {
    // 1. Check location state (passed from navigation)
    if (location.state?.enrollment_id) {
      const id = location.state.enrollment_id;
      // Store in session for persistence
      sessionStorage.setItem('currentEnrollmentId', id);
      return parseInt(id);
    }
    
    // 2. Check URL params
    const params = new URLSearchParams(location.search);
    const idFromParams = params.get('enrollment_id');
    if (idFromParams) {
      const id = parseInt(idFromParams);
      sessionStorage.setItem('currentEnrollmentId', id);
      return id;
    }
    
    // 3. Check sessionStorage (for page refresh persistence)
    const storedId = sessionStorage.getItem('currentEnrollmentId');
    if (storedId) {
      return parseInt(storedId);
    }
    
    // 4. Check localStorage (backup)
    const localStoredId = localStorage.getItem('currentEnrollmentId');
    if (localStoredId) {
      return parseInt(localStoredId);
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
      
      // Show error and redirect back after 3 seconds
      Swal.fire({
        title: 'Error!',
        text: 'No enrollment ID found. Redirecting back...',
        icon: 'error',
        timer: 3000,
        timerProgressBar: true,
        confirmButtonColor: '#667eea'
      }).then(() => {
        navigate('/schemes');
      });
    }
  }, [location]);

  const fetchInstallments = async (enrollmentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('customerToken');

      console.log('🔍 Fetching installments for enrollment ID:', enrollmentId);

      const response = await fetch(
        `http://187.127.147.245:81/api/customer/schemes/${enrollmentId}/installments/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
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
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
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
    if (!amount) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'paid': { class: 'status-paid', icon: 'bi-check-circle-fill' },
      'pending': { class: 'status-pending', icon: 'bi-clock-fill' },
      'overdue': { class: 'status-overdue', icon: 'bi-exclamation-circle-fill' },
      'cancelled': { class: 'status-cancelled', icon: 'bi-x-circle-fill' }
    };
    const statusInfo = statusMap[status?.toLowerCase()] || statusMap['pending'];
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        <i className={`bi ${statusInfo.icon}`}></i>
        {status || 'Pending'}
      </span>
    );
  };

  const getPaymentModeIcon = (mode) => {
    const modeMap = {
      'UPI': 'bi-phone',
      'CASH': 'bi-cash',
      'CARD': 'bi-credit-card',
      'NETBANKING': 'bi-building',
      'CHEQUE': 'bi-receipt'
    };
    return modeMap[mode?.toUpperCase()] || 'bi-credit-card';
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
    setCurrentPage(1);
  };

  const handleBack = () => {
    // Clear stored enrollment_id when going back
    sessionStorage.removeItem('currentEnrollmentId');
    localStorage.removeItem('currentEnrollmentId');
    navigate('/schemes');
  };

  // Filter installments
  const filteredInstallments = installments.filter(inst => {
    if (filter === 'all') return true;
    if (filter === 'paid') return inst.status?.toLowerCase() === 'paid';
    if (filter === 'pending') return inst.status?.toLowerCase() === 'pending';
    return true;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInstallments = filteredInstallments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInstallments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="installments-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading installment details...</p>
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

  return (
    <div className="installments-page">
      <Navbar />
      
      <div className="installments-content">
        <div className="container-fluid">
          {/* Header Section */}
          <div className="installments-header">
            <button className="back-button" onClick={handleBack}>
              <i className="bi bi-arrow-left"></i>
              Back to Schemes
            </button>
            <div className="header-content">
              <div className="header-badge">
                <i className="bi bi-wallet-fill"></i>
                <span>Installments</span>
              </div>
              <h1 className="installments-title">
                <i className="bi bi-list-check"></i>
                Installment Details
              </h1>
              <p className="installments-subtitle">
                {schemeInfo?.scheme_name || 'Scheme'} • Enrollment #{schemeInfo?.enrollment_number || 'N/A'}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card total">
              <div className="stat-icon">
                <i className="bi bi-receipt"></i>
              </div>
              <div className="stat-info">
                <h3>{schemeInfo?.total_installments || 0}</h3>
                <p>Total Installments</p>
              </div>
            </div>
            <div className="stat-card paid">
              <div className="stat-icon">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{schemeInfo?.paid_installments || 0}</h3>
                <p>Paid</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">
                <i className="bi bi-clock-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{schemeInfo?.pending_installments || 0}</h3>
                <p>Pending</p>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-container">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                <i className="bi bi-list-ul"></i>
                All
              </button>
              <button
                className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
                onClick={() => handleFilterChange('paid')}
              >
                <i className="bi bi-check-circle-fill"></i>
                Paid
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => handleFilterChange('pending')}
              >
                <i className="bi bi-clock-fill"></i>
                Pending
              </button>
            </div>
            <div className="filter-info">
              Showing {filteredInstallments.length} of {installments.length} installments
            </div>
          </div>

          {/* Installments List */}
          <div className="installments-list-container">
            {currentInstallments.length > 0 ? (
              currentInstallments.map((installment, index) => (
                <div key={installment.installment_id || index} className={`installment-card ${installment.status?.toLowerCase()}`}>
                  <div className="installment-card-header">
                    <div className="installment-number">
                      <div className="number-circle">
                        <span>#{installment.installment_no}</span>
                      </div>
                      <div>
                        <h4>Installment {installment.installment_no}</h4>
                        <span className="due-date">
                          <i className="bi bi-calendar3"></i>
                          Due: {formatDate(installment.due_date)}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(installment.status)}
                  </div>

                  <div className="installment-card-body">
                    <div className="installment-details-grid">
                      <div className="detail-item">
                        <i className="bi bi-currency-rupee"></i>
                        <div>
                          <label>Amount</label>
                          <p className="amount">{formatCurrency(installment.amount)}</p>
                        </div>
                      </div>
                      
                      {installment.status?.toLowerCase() === 'paid' && (
                        <>
                          <div className="detail-item">
                            <i className="bi bi-check-circle"></i>
                            <div>
                              <label>Paid Amount</label>
                              <p className="paid-amount">{formatCurrency(installment.paid_amount)}</p>
                            </div>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-calendar-check"></i>
                            <div>
                              <label>Paid Date</label>
                              <p>{formatDate(installment.paid_date)}</p>
                            </div>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-receipt"></i>
                            <div>
                              <label>Receipt</label>
                              <p className="receipt-number">{installment.receipt_number || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="detail-item">
                            <i className={`bi ${getPaymentModeIcon(installment.payment_mode)}`}></i>
                            <div>
                              <label>Payment Mode</label>
                              <p>{installment.payment_mode || 'N/A'}</p>
                            </div>
                          </div>
                          {installment.transaction_reference && (
                            <div className="detail-item">
                              <i className="bi bi-hash"></i>
                              <div>
                                <label>Transaction Reference</label>
                                <p className="transaction-ref">{installment.transaction_reference}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {installment.status?.toLowerCase() === 'pending' && (
                        <>
                          <div className="detail-item">
                            <i className="bi bi-hourglass-split"></i>
                            <div>
                              <label>Status</label>
                              <p className="pending-status">Awaiting Payment</p>
                            </div>
                          </div>
                          {installment.can_pay && (
                            <div className="detail-item">
                              <i className="bi bi-credit-card"></i>
                              <div>
                                <label>Action</label>
                                <button 
                                  className="pay-now-btn"
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Payment',
                                      text: `Pay installment #${installment.installment_no} of ${formatCurrency(installment.amount)}`,
                                      icon: 'info',
                                      showCancelButton: true,
                                      confirmButtonColor: '#00b894',
                                      cancelButtonColor: '#d33',
                                      confirmButtonText: 'Pay Now'
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        Swal.fire('Success!', 'Payment initiated successfully!', 'success');
                                      }
                                    });
                                  }}
                                >
                                  <i className="bi bi-wallet2"></i>
                                  Pay Now
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {installment.remarks && (
                      <div className="installment-remarks">
                        <i className="bi bi-chat-quote-fill"></i>
                        <p>{installment.remarks}</p>
                      </div>
                    )}
                  </div>

                  <div className="installment-card-footer">
                    <div className="timestamp-info">
                      <span>
                        <i className="bi bi-clock-history"></i>
                        Created: {formatDateTime(installment.created_at)}
                      </span>
                      {installment.updated_at !== installment.created_at && (
                        <span>
                          <i className="bi bi-pencil"></i>
                          Updated: {formatDateTime(installment.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <div className="no-data-content">
                  <i className="bi bi-inbox-fill"></i>
                  <p>No installments found</p>
                  <span>No {filter} installments available</span>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredInstallments.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInstallments.length)} of {filteredInstallments.length} installments
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <div className="page-numbers">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="page-dots">...</span>
                      <button
                        className="page-number-btn"
                        onClick={() => paginate(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Schemesinstallments;