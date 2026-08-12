import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AllSchemes.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const AllSchemes = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [enrolledSchemes, setEnrolledSchemes] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

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

  // Fetch customer data
  const fetchCustomerData = async () => {
    try {
      const id = getCustomerId();
      if (!id) {
        console.warn('No customer ID found');
        return;
      }
      
      setCustomerId(id);
      
      const response = await fetch(`${baseURL}/api/customers/${id}/`, {
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
      setCustomerData(data);
    } catch (err) {
      console.error('Error fetching customer data:', err);
    }
  };

  // Fetch enrolled schemes for current customer using the new API
  const fetchEnrolledSchemes = async () => {
    try {
      setLoadingEnrollments(true);
      const id = getCustomerId();
      
      if (!id) {
        setLoadingEnrollments(false);
        return;
      }

      // Use the new API endpoint: /api/customer/schemes/{customer_id}/
      const response = await fetch(`${baseURL}/api/customer/schemes/${id}/`, {
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
      console.log('Enrolled schemes data:', data);
      
      // Handle the response format
      let enrollmentsList = [];
      if (data && data.status === 'success' && data.data && Array.isArray(data.data)) {
        enrollmentsList = data.data;
      } else if (Array.isArray(data)) {
        enrollmentsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        enrollmentsList = data.data;
      } else if (data && data.results && Array.isArray(data.results)) {
        enrollmentsList = data.results;
      } else {
        enrollmentsList = [];
      }

      // Filter only active enrollments
      const activeEnrollments = enrollmentsList.filter(
        enrollment => enrollment.status === 'active' || enrollment.status === 'Active'
      );
      
      setEnrolledSchemes(activeEnrollments);
      console.log('Active enrolled schemes:', activeEnrollments);
    } catch (err) {
      console.error('Error fetching enrolled schemes:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Fetch all schemes
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchSchemes(),
        fetchCustomerData(),
        fetchEnrolledSchemes()
      ]);
    };
    fetchData();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${baseURL}/api/schemes/`, {
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
      console.log('Schemes data:', data);
      
      // Handle different response formats
      let schemesList = [];
      if (Array.isArray(data)) {
        schemesList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        schemesList = data.data;
      } else if (data && data.results && Array.isArray(data.results)) {
        schemesList = data.results;
      } else {
        schemesList = [];
      }

      setSchemes(schemesList);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError(err.message || 'Failed to fetch schemes');
      
      Swal.fire({
        title: '❌ Error!',
        text: 'Failed to load schemes. Please try again.',
        icon: 'error',
        confirmButtonColor: '#C9A84C',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if scheme is already enrolled
  const isSchemeEnrolled = (schemeId) => {
    return enrolledSchemes.some(enrollment => enrollment.scheme === schemeId);
  };

  // Get enrollment details for a scheme
  const getEnrollmentDetails = (schemeId) => {
    return enrolledSchemes.find(enrollment => enrollment.scheme === schemeId);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
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
    if (scheme.scheme_benefit === 'x_plus_y') {
      return `Pay ${scheme.x_value}, get ${scheme.y_value} free`;
    } else if (scheme.scheme_benefit === 'discount') {
      return `${scheme.scheme_benefit_display || 'Special discount'}`;
    }
    return scheme.scheme_benefit_display || 'Special benefit';
  };

  // Calculate total investment
  const calculateTotalInvestment = (scheme) => {
    return scheme.payable_installments * scheme.scheme_installment_amount;
  };

  // Calculate maturity date
  const calculateMaturityDate = (enrollmentDate, maturityPeriod) => {
    const date = new Date(enrollmentDate);
    date.setMonth(date.getMonth() + maturityPeriod);
    return date.toISOString().split('T')[0];
  };

  // Generate enrollment number
  const generateEnrollmentNumber = () => {
    return 'ENR' + Date.now().toString().slice(-8);
  };

  // Handle view details - Navigate to scheme details page
  const handleViewDetails = (schemeId) => {
    navigate(`/schemesdetails/${schemeId}`);
  };

  // Check if customer is logged in
  const checkCustomerLogin = () => {
    const id = getCustomerId();
    if (!id) {
      Swal.fire({
        title: '⚠️ Login Required',
        text: 'Please login to enroll in a scheme.',
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
      return false;
    }
    return true;
  };

  // Handle enroll now
  const handleEnrollNow = async (scheme) => {
    // Check if customer is logged in
    if (!checkCustomerLogin()) {
      return;
    }

    // Check if already enrolled
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
            <p style="font-size: 14px; color: #aaa;">
              Enrollment Date: <strong>${formatDate(enrollment.enrollment_date)}</strong>
            </p>
            <p style="font-size: 14px; color: #aaa;">
              Maturity Date: <strong>${formatDate(enrollment.maturity_date)}</strong>
            </p>
            <p style="font-size: 14px; color: #aaa;">
              Status: <strong style="color: #28a745;">${enrollment.status}</strong>
            </p>
            <p style="font-size: 14px; color: #aaa;">
              Paid Installments: <strong>${enrollment.paid_installments || 0} / ${enrollment.total_installments || 0}</strong>
            </p>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#C9A84C',
        confirmButtonText: 'OK',
        background: '#1a1a1a',
        color: '#ffffff',
        backdrop: 'rgba(0,0,0,0.8)',
      });
      return;
    }

    const customerId = getCustomerId();
    if (!customerId) {
      return;
    }

    // Show enrollment confirmation
    const result = await Swal.fire({
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
            <strong>Customer ID:</strong> ${customerId}<br>
            <strong>Customer Name:</strong> ${customerData?.account_name || 'N/A'}
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
    });

    if (!result.isConfirmed) {
      return;
    }

    // Proceed with enrollment
    setLoading(true);

    try {
      const enrollmentDate = new Date().toISOString().split('T')[0];
      const maturityDate = calculateMaturityDate(enrollmentDate, scheme.scheme_maturity_period);
      const enrollmentNumber = generateEnrollmentNumber();

      const enrollmentData = {
        customer: customerId,
        scheme: scheme.scheme_id,
        enrollment_date: enrollmentDate,
        maturity_date: maturityDate,
        enrollment_number: enrollmentNumber,
        remarks: `Enrolled in ${scheme.scheme_name}`,
        status: 'active',
        paid_installments: 0,
        total_paid_amount: 0,
      };

      console.log('Enrollment Data:', enrollmentData);

      const response = await fetch(`${baseURL}/api/customer-scheme-enrollments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
      });

      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
        console.log('Enrollment response:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = {};
      }

      if (!response.ok) {
        const errorMsg = responseData.message || responseData.error || responseData.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      // Refresh enrolled schemes
      await fetchEnrolledSchemes();

      // Success
      await Swal.fire({
        title: '🎉 Enrollment Successful!',
        html: `
          <div style="text-align: center; color: #fff;">
            <p>You have successfully enrolled in <strong>${scheme.scheme_name}</strong>!</p>
            <p style="font-size: 14px; color: #aaa; margin-top: 10px;">
              Enrollment Number: <strong style="color: #C9A84C;">${enrollmentNumber}</strong>
            </p>
            <p style="font-size: 14px; color: #aaa;">
              Maturity Date: <strong>${formatDate(maturityDate)}</strong>
            </p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#C9A84C',
        confirmButtonText: '📋 View My Enrollments',
        showCancelButton: true,
        cancelButtonText: 'Continue Browsing',
        background: '#1a1a1a',
        color: '#ffffff',
        backdrop: 'rgba(0,0,0,0.8)',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/my-enrollments';
        }
      });

    } catch (err) {
      console.error('Error enrolling in scheme:', err);
      
      Swal.fire({
        title: '❌ Enrollment Failed!',
        text: err.message || 'Failed to enroll in scheme. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        background: '#1a1a1a',
        color: '#ffffff',
        backdrop: 'rgba(0,0,0,0.8)',
      });
    } finally {
      setLoading(false);
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
            <button className="retry-btn" onClick={fetchSchemes}>
              Retry
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
      <div className="schemes-page">
        <div className="schemes-container">
          {/* Header Section */}
          <div className="schemes-header">
            <h1>💎 Investment Schemes</h1>
            <p className="schemes-subtitle">
              Discover our exclusive investment plans and start your journey to financial growth
            </p>
            <div className="schemes-stats">
              <div className="stat-item">
                <span className="stat-number">{schemes.length}</span>
                <span className="stat-label">Total Schemes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {schemes.length > 0 ? formatCurrency(Math.max(...schemes.map(s => s.scheme_installment_amount))) : '₹0'}
                </span>
                <span className="stat-label">Max Installment</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {schemes.length > 0 ? Math.max(...schemes.map(s => s.scheme_maturity_period)) : 0}
                </span>
                <span className="stat-label">Max Months</span>
              </div>
            </div>
          </div>

          {/* Schemes Grid */}
          {schemes.length === 0 ? (
            <div className="no-schemes">
              <div className="empty-icon">📋</div>
              <h3>No Schemes Available</h3>
              <p>Please check back later for new investment opportunities.</p>
            </div>
          ) : (
            <div className="schemes-grid">
              {schemes.map((scheme) => {
                const enrolled = isSchemeEnrolled(scheme.scheme_id);
                const enrollment = getEnrollmentDetails(scheme.scheme_id);
                
                return (
                  <div 
                    key={scheme.scheme_id} 
                    className={`scheme-card ${enrolled ? 'enrolled' : ''}`}
                  >
                    <div className="scheme-card-header">
                      <div className="scheme-title-section">
                        <h2 className="scheme-name">{scheme.scheme_name}</h2>
                        <div className="scheme-benefit-tag">
                          {getBenefitDescription(scheme)}
                        </div>
                        {enrolled && (
                          <div className="enrolled-badge">
                            ✅ Enrolled
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="scheme-card-body">
                      <div className="scheme-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Installment</span>
                          <span className="detail-value highlight">
                            {formatCurrency(scheme.scheme_installment_amount)}
                            <span className="detail-sub">/mo</span>
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Maturity</span>
                          <span className="detail-value">
                            {scheme.scheme_maturity_period}
                            <span className="detail-sub"> months</span>
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Total Investment</span>
                          <span className="detail-value highlight">
                            {formatCurrency(calculateTotalInvestment(scheme))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="scheme-card-footer">
                      <button 
                        className={`invest-btn ${enrolled ? 'enrolled' : ''}`}
                        onClick={() => handleEnrollNow(scheme)}
                        disabled={loading || loadingEnrollments || enrolled}
                      >
                        <span className="btn-icon">{enrolled ? '✅' : '🚀'}</span>
                        {enrolled ? 'Enrolled' : 'Enroll Now'}
                      </button>
                      <button 
                        className="details-btn"
                        onClick={() => handleViewDetails(scheme.scheme_id)}
                      >
                        View Details
                      </button>
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