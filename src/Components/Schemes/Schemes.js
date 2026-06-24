// Schemes.js - Updated with View Installments button
import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Schemes.css';

function Schemes() {
  const navigate = useNavigate();
  const [enrolledSchemes, setEnrolledSchemes] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [schemeDetails, setSchemeDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchEnrolledSchemes();
  }, []);

  const getCustomerId = () => {
    // Try multiple storage keys to get customer ID
    const id = localStorage.getItem('customerId') || 
               localStorage.getItem('customer_id') ||
               localStorage.getItem('userId');
    
    if (id) {
      return parseInt(id);
    }
    
    // Try to extract from user object
    const userData = JSON.parse(localStorage.getItem('customer') || 
                               localStorage.getItem('user') || 
                               '{}');
    
    return userData.id || 
           userData.customer_id || 
           userData.user_id || 
           userData._id || 
           null;
  };

  const fetchEnrolledSchemes = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || localStorage.getItem('customerToken');
      const customerId = getCustomerId();

      console.log('🔍 Fetching schemes for customer ID:', customerId);

      if (!customerId) {
        throw new Error('Customer ID not found. Please login again.');
      }

      const response = await fetch(`http://187.127.147.245:81/api/customer/schemes/${customerId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No schemes found for this customer');
        }
        throw new Error('Failed to fetch enrolled schemes');
      }

      const result = await response.json();
      console.log('📊 API Response:', result);
      
      if (result.status === 'success') {
        setEnrolledSchemes(result.data || []);
        setCustomerInfo({
          customer_id: result.customer_id,
          customer_name: result.customer_name,
          total_schemes: result.total_schemes
        });
      } else {
        throw new Error(result.message || 'Invalid data format received');
      }
    } catch (error) {
      console.error('❌ Error fetching enrolled schemes:', error);
      setError(error.message);
      
      // Show error toast
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to load schemes. Please try again.',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemeDetails = async (enrollmentId) => {
    try {
      setDetailsLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('customerToken');

      console.log('🔍 Fetching scheme details for enrollment ID:', enrollmentId);

      const response = await fetch(`http://187.127.147.245:81/api/customer/scheme-details/${enrollmentId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scheme details');
      }

      const result = await response.json();
      console.log('📊 Scheme Details Response:', result);

      if (result.status === 'success') {
        setSchemeDetails(result.data);
        // Store next due installment separately if needed
        if (result.next_due_installment) {
          setSchemeDetails(prev => ({
            ...prev,
            next_due_installment: result.next_due_installment
          }));
        }
      } else {
        throw new Error(result.message || 'Invalid data format received');
      }
    } catch (error) {
      console.error('❌ Error fetching scheme details:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to load scheme details. Please try again.',
        icon: 'error',
        confirmButtonColor: '#667eea'
      });
    } finally {
      setDetailsLoading(false);
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
      'active': { class: 'status-active', icon: 'bi-check-circle-fill' },
      'completed': { class: 'status-completed', icon: 'bi-check-circle-fill' },
      'cancelled': { class: 'status-cancelled', icon: 'bi-x-circle-fill' },
      'pending': { class: 'status-pending', icon: 'bi-clock-fill' }
    };
    const statusInfo = statusMap[status?.toLowerCase()] || statusMap['active'];
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        <i className={`bi ${statusInfo.icon}`}></i>
        {status || 'Active'}
      </span>
    );
  };

  const getBenefitText = (scheme) => {
    if (scheme.scheme_benefit === 'x_plus_y') {
      const total = scheme.total_installments || 0;
      const free = Math.floor(total * 0.1);
      return `Pay ${total - free} get ${free} free`;
    }
    if (scheme.scheme_benefit === 'no_wastage') {
      return 'No Wastage Benefit';
    }
    return scheme.scheme_benefit || 'Standard';
  };

  const getBenefitIcon = (benefit) => {
    const benefitMap = {
      'no_wastage': 'bi-shield-check',
      'x_plus_y': 'bi-gift',
      'standard': 'bi-star'
    };
    return benefitMap[benefit?.toLowerCase()] || 'bi-star';
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = async (scheme) => {
    setSelectedScheme(scheme);
    setShowModal(true);
    // Fetch detailed information for the selected scheme
    if (scheme.enrollment_id) {
      await fetchSchemeDetails(scheme.enrollment_id);
    }
  };

  const handleViewInstallments = (enrollmentId) => {
    // Store enrollment_id in localStorage for the installments component to access
    localStorage.setItem('currentEnrollmentId', enrollmentId);
    // Navigate to installments page with state
    navigate('/schemesinstallments', { 
      state: { 
        enrollment_id: enrollmentId,
        from: 'schemes'
      } 
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedScheme(null);
    setSchemeDetails(null);
  };

  // Filter schemes based on search term
  const filteredSchemes = enrolledSchemes.filter(scheme =>
    scheme.scheme_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchemes = filteredSchemes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="schemes-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading your enrolled schemes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="schemes-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Error Loading Schemes</h3>
          <p>{error}</p>
          <button onClick={fetchEnrolledSchemes} className="btn btn-primary">
            <i className="bi bi-arrow-repeat"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="schemes-page">
      <Navbar />
      
      <div className="schemes-content">
        <div className="container-fluid">
          {/* Header Section */}
          <div className="schemes-header">
            <div className="header-badge">
              <i className="bi bi-person-badge-fill"></i>
              <span>My Enrollments</span>
            </div>
            <h1 className="schemes-title">
              <i className="bi bi-journal-bookmark-fill"></i>
              My Savings Schemes
            </h1>
            <p className="schemes-subtitle">
              {customerInfo?.customer_name || 'Customer'} • {customerInfo?.total_schemes || 0} schemes enrolled
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-journal-bookmark-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{customerInfo?.total_schemes || 0}</h3>
                <p>Total Schemes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div className="stat-info">
                <h3>
                  {enrolledSchemes.filter(s => s.status?.toLowerCase() === 'active').length}
                </h3>
                <p>Active Schemes</p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="search-add-container">
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by scheme name, enrollment no..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scheme Cards - Mobile Responsive */}
          <div className="schemes-cards-container">
            {currentSchemes.length > 0 ? (
              currentSchemes.map((scheme, index) => (
                <div key={scheme.enrollment_id || index} className="scheme-card">
                  <div className="scheme-card-header">
                    <div className="scheme-card-title">
                      <div className="scheme-icon">
                        <i className="bi bi-gem-fill"></i>
                      </div>
                      <div>
                        <h4>{scheme.scheme_name}</h4>
                        <span className="enrollment-number">#{scheme.enrollment_number}</span>
                      </div>
                    </div>
                    {getStatusBadge(scheme.status)}
                  </div>
                  
                  <div className="scheme-card-body">
                    <div className="scheme-details-grid">
                      <div className="detail-item">
                        <i className="bi bi-calendar3"></i>
                        <div>
                          <label>Enrollment Date</label>
                          <p>{formatDate(scheme.enrollment_date)}</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="bi bi-calendar-check"></i>
                        <div>
                          <label>Maturity Date</label>
                          <p>{formatDate(scheme.maturity_date)}</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="bi bi-currency-rupee"></i>
                        <div>
                          <label>Installment Amount</label>
                          <p>{formatCurrency(scheme.installment_amount)}</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="bi bi-receipt"></i>
                        <div>
                          <label>Installments</label>
                          <p>{scheme.paid_installments || 0}/{scheme.total_installments || 0}</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="bi bi-piggy-bank-fill"></i>
                        <div>
                          <label>Total Paid</label>
                          <p>{formatCurrency(scheme.total_paid_amount)}</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="bi bi-gift-fill"></i>
                        <div>
                          <label>Scheme Benefit</label>
                          <p>{getBenefitText(scheme)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="scheme-card-footer">
                    <div className="progress-section">
                      <div className="progress-info">
                        <span>Progress</span>
                        <span>{scheme.total_installments > 0 ? 
                          Math.round((scheme.paid_installments || 0) / scheme.total_installments * 100) : 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${scheme.total_installments > 0 ? 
                              (scheme.paid_installments || 0) / scheme.total_installments * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(scheme)}
                      >
                        <i className="bi bi-eye-fill"></i>
                        View Details
                      </button>
                      <button 
                        className="view-installments-btn"
                        onClick={() => handleViewInstallments(scheme.enrollment_id)}
                      >
                        <i className="bi bi-wallet-fill"></i>
                        Installments
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <div className="no-data-content">
                  <i className="bi bi-inbox-fill"></i>
                  <p>No enrolled schemes found</p>
                  <span>Start saving with our gold schemes!</span>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredSchemes.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSchemes.length)} of {filteredSchemes.length} schemes
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

      {/* Scheme Details Modal */}
      {showModal && selectedScheme && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-gem-fill"></i>
                Scheme Details
              </h3>
              <button className="close-modal" onClick={closeModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {detailsLoading ? (
                <div className="details-loading">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Loading scheme details...</p>
                </div>
              ) : schemeDetails ? (
                <>
                  <div className="modal-header-info">
                    <div className="scheme-icon-large">
                      <i className={`bi ${getBenefitIcon(schemeDetails.scheme_benefit)}`}></i>
                    </div>
                    <h4>{schemeDetails.scheme_name}</h4>
                    <div className="modal-ids">
                      <span className="enrollment-id-badge">Enrollment: {schemeDetails.enrollment_number}</span>
                      <span className="customer-id-badge">Customer: {schemeDetails.customer_name}</span>
                    </div>
                    <div className="modal-status">
                      {getStatusBadge(schemeDetails.status)}
                    </div>
                  </div>
                  
                  <div className="modal-details-grid">
                    <div className="modal-details-section">
                      <h5><i className="bi bi-info-circle-fill"></i> Scheme Information</h5>
                      <div className="detail-group">
                        <i className="bi bi-calendar-plus"></i>
                        <div>
                          <label>Enrollment Date</label>
                          <p>{formatDate(schemeDetails.enrollment_date)}</p>
                        </div>
                      </div>
                      <div className="detail-group">
                        <i className="bi bi-calendar-check"></i>
                        <div>
                          <label>Maturity Date</label>
                          <p>{formatDate(schemeDetails.maturity_date)}</p>
                        </div>
                      </div>
                      <div className="detail-group">
                        <i className="bi bi-currency-rupee"></i>
                        <div>
                          <label>Installment Amount</label>
                          <p>{formatCurrency(schemeDetails.installment_amount)}</p>
                        </div>
                      </div>
                      <div className="detail-group">
                        <i className="bi bi-gift-fill"></i>
                        <div>
                          <label>Scheme Benefit</label>
                          <p>{getBenefitText(schemeDetails)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="modal-details-section">
                      <h5><i className="bi bi-pie-chart-fill"></i> Payment Progress</h5>
                      <div className="detail-group">
                        <i className="bi bi-receipt"></i>
                        <div>
                          <label>Installments Status</label>
                          <p>Paid: {schemeDetails.paid_installments || 0} / Total: {schemeDetails.total_installments || 0}</p>
                          <p className="pending-info">Pending: {schemeDetails.pending_installments || 0}</p>
                        </div>
                      </div>
                      <div className="detail-group">
                        <i className="bi bi-piggy-bank-fill"></i>
                        <div>
                          <label>Total Paid Amount</label>
                          <p>{formatCurrency(schemeDetails.total_paid_amount)}</p>
                        </div>
                      </div>
                      <div className="detail-group">
                        <i className="bi bi-arrow-up-circle-fill"></i>
                        <div>
                          <label>Progress</label>
                          <p>{schemeDetails.progress || `${schemeDetails.paid_installments || 0}/${schemeDetails.total_installments || 0}`}</p>
                        </div>
                      </div>
                      <div className="detail-group progress-bar-large">
                        <div className="progress-info">
                          <span>Completion</span>
                          <span>{schemeDetails.total_installments > 0 ? 
                            Math.round((schemeDetails.paid_installments || 0) / schemeDetails.total_installments * 100) : 0}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${schemeDetails.total_installments > 0 ? 
                                (schemeDetails.paid_installments || 0) / schemeDetails.total_installments * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="modal-details-section">
                      <h5><i className="bi bi-calendar-event-fill"></i> Next Due Installment</h5>
                      {schemeDetails.next_due_installment ? (
                        <div className="next-due-card">
                          <div className="due-detail">
                            <i className="bi bi-hash"></i>
                            <div>
                              <label>Installment No.</label>
                              <p>#{schemeDetails.next_due_installment.installment_no}</p>
                            </div>
                          </div>
                          <div className="due-detail">
                            <i className="bi bi-calendar3"></i>
                            <div>
                              <label>Due Date</label>
                              <p>{formatDate(schemeDetails.next_due_installment.due_date)}</p>
                            </div>
                          </div>
                          <div className="due-detail">
                            <i className="bi bi-currency-rupee"></i>
                            <div>
                              <label>Amount</label>
                              <p>{formatCurrency(schemeDetails.next_due_installment.amount)}</p>
                            </div>
                          </div>
                          <div className="due-detail">
                            <i className="bi bi-circle-fill"></i>
                            <div>
                              <label>Status</label>
                              <p className="status-pending-text">
                                <span className="status-dot pending"></span>
                                {schemeDetails.next_due_installment.status || 'Pending'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="no-due">
                          <i className="bi bi-check-circle-fill"></i>
                          <p>No pending installments</p>
                        </div>
                      )}
                    </div>

                    {schemeDetails.remarks && (
                      <div className="modal-details-section full-width">
                        <h5><i className="bi bi-chat-quote-fill"></i> Remarks</h5>
                        <div className="remarks-box">
                          <p>{schemeDetails.remarks}</p>
                        </div>
                      </div>
                    )}

                    <div className="modal-details-section full-width">
                      <h5><i className="bi bi-clock-history"></i> System Information</h5>
                      <div className="system-info-grid">
                        <div className="system-info-item">
                          <label>Created At</label>
                          <p>{formatDateTime(schemeDetails.created_at)}</p>
                        </div>
                        <div className="system-info-item">
                          <label>Last Updated</label>
                          <p>{formatDateTime(schemeDetails.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="details-error">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <p>Failed to load scheme details</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schemes;