// // Schemesinstallments.js - Updated with Razorpay payment integration
// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Navbar from '../Navbar/Navbar';
// import Swal from 'sweetalert2';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './Schemesinstallments.css';
// import baseURL from '../URL/BaseURL';
// import Footer from '../Footer/Footer';

// // Load Razorpay script
// const loadRazorpayScript = () => {
//   return new Promise((resolve) => {
//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// };

// function Schemesinstallments() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [installments, setInstallments] = useState([]);
//   const [schemeInfo, setSchemeInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all'); // all, paid, pending
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   // Get enrollment_id from multiple sources
//   const getEnrollmentId = () => {
//     // 1. Check location state (passed from navigation)
//     if (location.state?.enrollment_id) {
//       const id = location.state.enrollment_id;
//       // Store in session for persistence
//       sessionStorage.setItem('currentEnrollmentId', id);
//       return parseInt(id);
//     }

//     // 2. Check URL params
//     const params = new URLSearchParams(location.search);
//     const idFromParams = params.get('enrollment_id');
//     if (idFromParams) {
//       const id = parseInt(idFromParams);
//       sessionStorage.setItem('currentEnrollmentId', id);
//       return id;
//     }

//     // 3. Check sessionStorage (for page refresh persistence)
//     const storedId = sessionStorage.getItem('currentEnrollmentId');
//     if (storedId) {
//       return parseInt(storedId);
//     }

//     // 4. Check localStorage (backup)
//     const localStoredId = localStorage.getItem('currentEnrollmentId');
//     if (localStoredId) {
//       return parseInt(localStoredId);
//     }

//     return null;
//   };

//   useEffect(() => {
//     const enrollmentId = getEnrollmentId();
//     if (enrollmentId) {
//       fetchInstallments(enrollmentId);
//     } else {
//       setError('No enrollment ID found. Please select a scheme first.');
//       setLoading(false);

//       // Show error and redirect back after 3 seconds
//       Swal.fire({
//         title: 'Error!',
//         text: 'No enrollment ID found. Redirecting back...',
//         icon: 'error',
//         timer: 3000,
//         timerProgressBar: true,
//         confirmButtonColor: '#667eea'
//       }).then(() => {
//         navigate('/schemes');
//       });
//     }
//   }, [location]);

//   const fetchInstallments = async (enrollmentId) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token') || localStorage.getItem('customerToken');

//       console.log('🔍 Fetching installments for enrollment ID:', enrollmentId);

//       const response = await fetch(
//         `${baseURL}/api/customer/schemes/${enrollmentId}/installments/`,
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': token ? `Bearer ${token}` : '',
//           }
//         }
//       );

//       if (!response.ok) {
//         if (response.status === 404) {
//           throw new Error('No installments found for this scheme');
//         }
//         throw new Error('Failed to fetch installments');
//       }

//       const result = await response.json();
//       console.log('📊 Installments Response:', result);

//       if (result.status === 'success') {
//         setInstallments(result.data || []);
//         setSchemeInfo({
//           enrollment_id: result.enrollment_id,
//           enrollment_number: result.enrollment_number,
//           scheme_name: result.scheme_name,
//           total_installments: result.total_installments,
//           paid_installments: result.paid_installments,
//           pending_installments: result.pending_installments
//         });
//       } else {
//         throw new Error(result.message || 'Invalid data format received');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching installments:', error);
//       setError(error.message);

//       Swal.fire({
//         title: 'Error!',
//         text: error.message || 'Failed to load installments. Please try again.',
//         icon: 'error',
//         confirmButtonColor: '#667eea'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Razorpay payment handler
//   const handlePayment = async (installment) => {
//     try {
//       setProcessingPayment(true);

//       // Step 1: Load Razorpay script
//       const isScriptLoaded = await loadRazorpayScript();
//       if (!isScriptLoaded) {
//         throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
//       }

//       // Step 2: Get token
//       const token = localStorage.getItem('token') || localStorage.getItem('customerToken');
//       if (!token) {
//         throw new Error('Please login again to continue');
//       }

//       // Step 3: Create payment order
//       const createOrderResponse = await fetch(
//         `${baseURL}/api/scheme/initiate-payment/`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             installment_id: installment.installment_id
//           })
//         }
//       );

//       if (!createOrderResponse.ok) {
//         const errorData = await createOrderResponse.json();
//         throw new Error(errorData.error || 'Failed to create payment order');
//       }

//       const orderData = await createOrderResponse.json();
//       console.log('✅ Payment order created:', orderData);

//       // Step 4: Initialize Razorpay checkout
//       const options = {
//         key: orderData.key,
//         amount: orderData.amount,
//         currency: 'INR',
//         name: 'Scheme Installment Payment',
//         description: `Payment for Installment #${installment.installment_no}`,
//         order_id: orderData.order_id,
//         prefill: {
//           name: localStorage.getItem('customerName') || 'Customer',
//           email: localStorage.getItem('customerEmail') || '',
//           contact: localStorage.getItem('customerPhone') || '',
//         },
//         theme: {
//           color: '#667eea'
//         },
//         handler: function(response) {
//           // Step 5: Verify payment
//           verifyPayment(response, installment);
//         },
//         modal: {
//           ondismiss: function() {
//             setProcessingPayment(false);
//             Swal.fire({
//               title: 'Payment Cancelled',
//               text: 'You cancelled the payment process.',
//               icon: 'info',
//               confirmButtonColor: '#667eea'
//             });
//           }
//         }
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();

//     } catch (error) {
//       console.error('❌ Payment error:', error);
//       setProcessingPayment(false);
//       Swal.fire({
//         title: 'Payment Error',
//         text: error.message || 'Failed to initiate payment. Please try again.',
//         icon: 'error',
//         confirmButtonColor: '#667eea'
//       });
//     }
//   };

//   // Verify payment after successful transaction
//   const verifyPayment = async (paymentResponse, installment) => {
//     try {
//       const token = localStorage.getItem('token') || localStorage.getItem('customerToken');

//       const verifyResponse = await fetch(
//         `${baseURL}/api/scheme/verify-payment/`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             razorpay_order_id: paymentResponse.razorpay_order_id,
//             razorpay_payment_id: paymentResponse.razorpay_payment_id,
//             razorpay_signature: paymentResponse.razorpay_signature
//           })
//         }
//       );

//       const verifyData = await verifyResponse.json();
//       console.log('✅ Payment verification response:', verifyData);

//       if (verifyData.status === 'success') {
//         // Payment successful
//         setProcessingPayment(false);

//         // Show success message
//         Swal.fire({
//           title: 'Payment Successful!',
//           text: `Receipt Number: ${verifyData.receipt_no || 'N/A'}`,
//           icon: 'success',
//           confirmButtonColor: '#00b894',
//           timer: 5000,
//           timerProgressBar: true
//         });

//         // Refresh installments list
//         const enrollmentId = getEnrollmentId();
//         if (enrollmentId) {
//           await fetchInstallments(enrollmentId);
//         }
//       } else {
//         throw new Error(verifyData.error || 'Payment verification failed');
//       }
//     } catch (error) {
//       console.error('❌ Verification error:', error);
//       setProcessingPayment(false);
//       Swal.fire({
//         title: 'Verification Failed',
//         text: error.message || 'Payment could not be verified. Please contact support.',
//         icon: 'error',
//         confirmButtonColor: '#667eea'
//       });
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return 'N/A';
//     const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(numAmount);
//   };

//   const getStatusBadge = (status) => {
//     const statusMap = {
//       'paid': { class: 'status-paid', icon: 'bi-check-circle-fill' },
//       'pending': { class: 'status-pending', icon: 'bi-clock-fill' },
//       'overdue': { class: 'status-overdue', icon: 'bi-exclamation-circle-fill' },
//       'cancelled': { class: 'status-cancelled', icon: 'bi-x-circle-fill' }
//     };
//     const statusInfo = statusMap[status?.toLowerCase()] || statusMap['pending'];
//     return (
//       <span className={`status-badge ${statusInfo.class}`}>
//         <i className={`bi ${statusInfo.icon}`}></i>
//         {status || 'Pending'}
//       </span>
//     );
//   };

//   const getPaymentModeIcon = (mode) => {
//     const modeMap = {
//       'UPI': 'bi-phone',
//       'CASH': 'bi-cash',
//       'CARD': 'bi-credit-card',
//       'NETBANKING': 'bi-building',
//       'CHEQUE': 'bi-receipt',
//       'RAZORPAY': 'bi-credit-card-2-front'
//     };
//     return modeMap[mode?.toUpperCase()] || 'bi-credit-card';
//   };

//   const handleFilterChange = (filterType) => {
//     setFilter(filterType);
//     setCurrentPage(1);
//   };

//   const handleBack = () => {
//     // Clear stored enrollment_id when going back
//     sessionStorage.removeItem('currentEnrollmentId');
//     localStorage.removeItem('currentEnrollmentId');
//     navigate('/schemes');
//   };

//   // Filter installments
//   const filteredInstallments = installments.filter(inst => {
//     if (filter === 'all') return true;
//     if (filter === 'paid') return inst.status?.toLowerCase() === 'paid';
//     if (filter === 'pending') return inst.status?.toLowerCase() === 'pending';
//     return true;
//   });

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentInstallments = filteredInstallments.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredInstallments.length / itemsPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   if (loading) {
//     return (
//       <div>
//         <Navbar />
//         <div className="installments-loading">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p>Loading installment details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div>
//         <Navbar />
//         <div className="installments-error">
//           <i className="bi bi-exclamation-triangle-fill"></i>
//           <h3>Error Loading Installments</h3>
//           <p>{error}</p>
//           <button onClick={handleBack} className="btn btn-primary">
//             <i className="bi bi-arrow-left"></i> Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="installments-page">
//       <Navbar />

//       <div className="installments-content">
//         <div className="container-fluid">
//           {/* Header Section */}
//           <div className="installments-header">
//             <button className="back-button" onClick={handleBack}>
//               <i className="bi bi-arrow-left"></i>
//               Back to Schemes
//             </button>
//             <div className="header-content">
//               <div className="header-badge">
//                 <i className="bi bi-wallet-fill"></i>
//                 <span>Installments</span>
//               </div>
//               <h1 className="installments-title">
//                 <i className="bi bi-list-check"></i>
//                 Installment Details
//               </h1>
//               <p className="installments-subtitle">
//                 {schemeInfo?.scheme_name || 'Scheme'} • Enrollment #{schemeInfo?.enrollment_number || 'N/A'}
//               </p>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="stats-container">
//             <div className="stat-card total">
//               <div className="stat-icon">
//                 <i className="bi bi-receipt"></i>
//               </div>
//               <div className="stat-info">
//                 <h3>{schemeInfo?.total_installments || 0}</h3>
//                 <p>Total Installments</p>
//               </div>
//             </div>
//             <div className="stat-card paid">
//               <div className="stat-icon">
//                 <i className="bi bi-check-circle-fill"></i>
//               </div>
//               <div className="stat-info">
//                 <h3>{schemeInfo?.paid_installments || 0}</h3>
//                 <p>Paid</p>
//               </div>
//             </div>
//             <div className="stat-card pending">
//               <div className="stat-icon">
//                 <i className="bi bi-clock-fill"></i>
//               </div>
//               <div className="stat-info">
//                 <h3>{schemeInfo?.pending_installments || 0}</h3>
//                 <p>Pending</p>
//               </div>
//             </div>
//           </div>

//           {/* Filter Section */}
//           <div className="filter-container">
//             <div className="filter-buttons">
//               <button
//                 className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
//                 onClick={() => handleFilterChange('all')}
//               >
//                 <i className="bi bi-list-ul"></i>
//                 All
//               </button>
//               <button
//                 className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
//                 onClick={() => handleFilterChange('paid')}
//               >
//                 <i className="bi bi-check-circle-fill"></i>
//                 Paid
//               </button>
//               <button
//                 className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
//                 onClick={() => handleFilterChange('pending')}
//               >
//                 <i className="bi bi-clock-fill"></i>
//                 Pending
//               </button>
//             </div>
//             <div className="filter-info">
//               Showing {filteredInstallments.length} of {installments.length} installments
//             </div>
//           </div>

//           {/* Installments List */}
//           <div className="installments-list-container">
//             {currentInstallments.length > 0 ? (
//               currentInstallments.map((installment, index) => (
//                 <div key={installment.installment_id || index} className={`installment-card ${installment.status?.toLowerCase()}`}>
//                   <div className="installment-card-header">
//                     <div className="installment-number">
//                       <div className="number-circle">
//                         <span>#{installment.installment_no}</span>
//                       </div>
//                       <div>
//                         <h4>Installment {installment.installment_no}</h4>
//                         <span className="due-date">
//                           <i className="bi bi-calendar3"></i>
//                           Due: {formatDate(installment.due_date)}
//                         </span>
//                       </div>
//                     </div>
//                     {getStatusBadge(installment.status)}
//                   </div>

//                   <div className="installment-card-body">
//                     <div className="installment-details-grid">
//                       <div className="detail-item">
//                         <i className="bi bi-currency-rupee"></i>
//                         <div>
//                           <label>Amount</label>
//                           <p className="amount">{formatCurrency(installment.amount)}</p>
//                         </div>
//                       </div>

//                       {installment.status?.toLowerCase() === 'paid' && (
//                         <>
//                           <div className="detail-item">
//                             <i className="bi bi-check-circle"></i>
//                             <div>
//                               <label>Paid Amount</label>
//                               <p className="paid-amount">{formatCurrency(installment.paid_amount)}</p>
//                             </div>
//                           </div>
//                           <div className="detail-item">
//                             <i className="bi bi-calendar-check"></i>
//                             <div>
//                               <label>Paid Date</label>
//                               <p>{formatDate(installment.paid_date)}</p>
//                             </div>
//                           </div>
//                           <div className="detail-item">
//                             <i className="bi bi-receipt"></i>
//                             <div>
//                               <label>Receipt</label>
//                               <p className="receipt-number">{installment.receipt_number || 'N/A'}</p>
//                             </div>
//                           </div>
//                           <div className="detail-item">
//                             <i className={`bi ${getPaymentModeIcon(installment.payment_mode)}`}></i>
//                             <div>
//                               <label>Payment Mode</label>
//                               <p>{installment.payment_mode || 'N/A'}</p>
//                             </div>
//                           </div>
//                           {installment.transaction_reference && (
//                             <div className="detail-item">
//                               <i className="bi bi-hash"></i>
//                               <div>
//                                 <label>Transaction Reference</label>
//                                 <p className="transaction-ref">{installment.transaction_reference}</p>
//                               </div>
//                             </div>
//                           )}
//                         </>
//                       )}

//                       {installment.status?.toLowerCase() === 'pending' && (
//                         <>
//                           <div className="detail-item">
//                             <i className="bi bi-hourglass-split"></i>
//                             <div>
//                               <label>Status</label>
//                               <p className="pending-status">Awaiting Payment</p>
//                             </div>
//                           </div>
//                           {installment.can_pay !== false && (
//                             <div className="detail-item">
//                               <i className="bi bi-credit-card"></i>
//                               <div>
//                                 <label>Action</label>
//                                 <button 
//                                   className="pay-now-btn"
//                                   onClick={() => handlePayment(installment)}
//                                   disabled={processingPayment}
//                                 >
//                                   {processingPayment ? (
//                                     <>
//                                       <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//                                       Processing...
//                                     </>
//                                   ) : (
//                                     <>
//                                       <i className="bi bi-wallet2"></i>
//                                       Pay Now
//                                     </>
//                                   )}
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>

//                     {installment.remarks && (
//                       <div className="installment-remarks">
//                         <i className="bi bi-chat-quote-fill"></i>
//                         <p>{installment.remarks}</p>
//                       </div>
//                     )}
//                   </div>

//                   <div className="installment-card-footer">
//                     <div className="timestamp-info">
//                       <span>
//                         <i className="bi bi-clock-history"></i>
//                         Created: {formatDateTime(installment.created_at)}
//                       </span>
//                       {installment.updated_at !== installment.created_at && (
//                         <span>
//                           <i className="bi bi-pencil"></i>
//                           Updated: {formatDateTime(installment.updated_at)}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="no-data">
//                 <div className="no-data-content">
//                   <i className="bi bi-inbox-fill"></i>
//                   <p>No installments found</p>
//                   <span>No {filter} installments available</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Pagination */}
//           {filteredInstallments.length > 0 && (
//             <div className="pagination-container">
//               <div className="pagination-info">
//                 Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInstallments.length)} of {filteredInstallments.length} installments
//               </div>
//               <div className="pagination-controls">
//                 <button
//                   className="pagination-btn"
//                   onClick={() => paginate(currentPage - 1)}
//                   disabled={currentPage === 1}
//                 >
//                   <i className="bi bi-chevron-left"></i>
//                 </button>
//                 <div className="page-numbers">
//                   {[...Array(Math.min(5, totalPages))].map((_, i) => {
//                     let pageNum;
//                     if (totalPages <= 5) {
//                       pageNum = i + 1;
//                     } else if (currentPage <= 3) {
//                       pageNum = i + 1;
//                     } else if (currentPage >= totalPages - 2) {
//                       pageNum = totalPages - 4 + i;
//                     } else {
//                       pageNum = currentPage - 2 + i;
//                     }
//                     return (
//                       <button
//                         key={pageNum}
//                         className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
//                         onClick={() => paginate(pageNum)}
//                       >
//                         {pageNum}
//                       </button>
//                     );
//                   })}
//                   {totalPages > 5 && currentPage < totalPages - 2 && (
//                     <>
//                       <span className="page-dots">...</span>
//                       <button
//                         className="page-number-btn"
//                         onClick={() => paginate(totalPages)}
//                       >
//                         {totalPages}
//                       </button>
//                     </>
//                   )}
//                 </div>
//                 <button
//                   className="pagination-btn"
//                   onClick={() => paginate(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                 >
//                   <i className="bi bi-chevron-right"></i>
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div> 
//       <Footer/>
//     </div>
//   );
// }

// export default Schemesinstallments;



// Schemesinstallments.js - Fixed per-installment payment processing
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Schemesinstallments.css';
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
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [processingPayment, setProcessingPayment] = useState({});

  // ============================================================
  // NEW STATE FOR PARTIAL PAYMENT MODAL
  // ============================================================
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');

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
        confirmButtonColor: '#667eea'
      }).then(() => {
        navigate('/schemes');
      });
    }
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

  // ============================================================
  // HELPERS FOR PARTIAL PAYMENT
  // ============================================================

  /**
   * Returns the remaining amount for an installment
   * (installment.amount - installment.paid_amount)
   */
  const getRemainingAmount = (installment) => {
    const amount = parseFloat(installment.amount || 0);
    const paid = parseFloat(installment.paid_amount || 0);
    const remaining = amount - paid;
    return remaining > 0 ? remaining : 0;
  };

  /**
   * Opens the partial payment modal for a selected installment
   */
  const openPaymentModal = (installment) => {
    const remaining = getRemainingAmount(installment);
    setSelectedInstallment(installment);
    setPaymentAmount(remaining.toString());
    setPaymentError('');
    setShowPaymentModal(true);
  };

  /**
   * Closes the partial payment modal
   */
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInstallment(null);
    setPaymentAmount('');
    setPaymentError('');
  };

  /**
   * Validates and proceeds to payment from the modal
   */
  const handleProceedToPayment = () => {
    if (!selectedInstallment) return;

    const remaining = getRemainingAmount(selectedInstallment);
    const entered = parseFloat(paymentAmount);

    // ---- Validation ----
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

    // ---- Proceed to Razorpay ----
    const installmentToPay = selectedInstallment;
    const amountToPay = entered;

    closePaymentModal();

    // Small delay to let modal close animation run
    setTimeout(() => {
      handlePayment(installmentToPay, amountToPay);
    }, 200);
  };

  // ============================================================
  // RAZORPAY PAYMENT HANDLER (now accepts paymentAmount)
  // ============================================================
  const handlePayment = async (installment, paymentAmount) => {
    const installmentId = installment.installment_id;

    try {
      // Set processing state for this specific installment
      setProcessingPayment(prev => ({ ...prev, [installmentId]: true }));

      // Step 1: Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      console.log('💰 Creating payment order for installment:', installmentId, 'amount:', paymentAmount);

      // Step 2: Create payment order — now sending payment_amount
      const createOrderResponse = await fetch(
        `${baseURL}/api/scheme/initiate-payment/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            installment_id: installmentId,
            payment_amount: paymentAmount
          })
        }
      );

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        console.error('❌ Order creation error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create payment order');
      }

      const orderData = await createOrderResponse.json();
      console.log('✅ Payment order created:', orderData);

      // ============================================================
      // NORMALIZE BACKEND RESPONSE
      // (backend may return razorpay_key / razorpay_order_id
      //  OR key / order_id)
      // ============================================================
      const razorpayKey = orderData.razorpay_key || orderData.key;
      const razorpayOrderId = orderData.razorpay_order_id || orderData.order_id;
      const razorpayAmount = orderData.amount
        ? orderData.amount
        : Math.round(parseFloat(paymentAmount) * 100);

      if (!razorpayKey || !razorpayOrderId) {
        throw new Error('Invalid payment order response from server.');
      }

      // Step 3: Initialize Razorpay checkout
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
        theme: {
          color: '#667eea'
        },
        handler: function (response) {
          // Step 4: Verify payment
          verifyPayment(response, installment);
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(prev => ({ ...prev, [installmentId]: false }));
            Swal.fire({
              title: 'Payment Cancelled',
              text: 'You cancelled the payment process.',
              icon: 'info',
              confirmButtonColor: '#667eea'
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
        confirmButtonColor: '#667eea'
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

      if (verifyData.success === true || verifyData.status === 'success') {
        setProcessingPayment(prev => ({ ...prev, [installmentId]: false }));

        // Determine if this was a partial or full payment
        const instStatus = verifyData.installment?.status;
        const isPartial = instStatus === 'partial';

        Swal.fire({
          title: isPartial ? 'Partial Payment Successful!' : 'Payment Successful!',
          html: isPartial
            ? `
              <p>Your partial payment has been recorded.</p>
              <p><strong>Remaining amount:</strong> ₹${verifyData.installment?.remaining_amount ?? 'N/A'}</p>
            `
            : `<p>Receipt Number: ${verifyData.receipt?.receipt_number || 'N/A'}</p>`,
          icon: 'success',
          confirmButtonColor: '#00b894',
          timer: 5000,
          timerProgressBar: true
        });

        // Refresh installments list
        const enrollmentId = getEnrollmentId();
        if (enrollmentId) {
          await fetchInstallments(enrollmentId);
        }
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
        confirmButtonColor: '#667eea'
      });
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
    if (!amount && amount !== 0) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'paid': { class: 'status-paid', icon: 'bi-check-circle-fill' },
      'pending': { class: 'status-pending', icon: 'bi-clock-fill' },
      'partial': { class: 'status-partial', icon: 'bi-hourglass-split' },
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
      'CHEQUE': 'bi-receipt',
      'RAZORPAY': 'bi-credit-card-2-front'
    };
    return modeMap[mode?.toUpperCase()] || 'bi-credit-card';
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
    setCurrentPage(1);
  };

  const handleBack = () => {
    sessionStorage.removeItem('currentEnrollmentId');
    localStorage.removeItem('currentEnrollmentId');
    navigate('/schemes');
  };

  // Filter installments
  const filteredInstallments = installments.filter(inst => {
    if (filter === 'all') return true;
    if (filter === 'paid') return inst.status?.toLowerCase() === 'paid';
    if (filter === 'pending') return inst.status?.toLowerCase() === 'pending';
    if (filter === 'partial') return inst.status?.toLowerCase() === 'partial';
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
              <button
                className={`filter-btn ${filter === 'partial' ? 'active' : ''}`}
                onClick={() => handleFilterChange('partial')}
              >
                <i className="bi bi-hourglass-split"></i>
                Partial
              </button>
            </div>
            <div className="filter-info">
              Showing {filteredInstallments.length} of {installments.length} installments
            </div>
          </div>

          {/* Installments List */}
          <div className="installments-list-container">
            {currentInstallments.length > 0 ? (
              currentInstallments.map((installment, index) => {
                const installmentId = installment.installment_id;
                const isProcessing = processingPayment[installmentId] || false;
                const statusLower = installment.status?.toLowerCase();
                const remaining = getRemainingAmount(installment);
                const paidAmount = parseFloat(installment.paid_amount || 0);

                // 🚫 Only exclude truly non-payable statuses
                const isCancelled = statusLower === 'cancelled';
                const isFullyPaid = statusLower === 'paid' || remaining <= 0;

                // ✅ Payable = not cancelled AND still owes money
                // (ignore can_pay — backend sets it to false for partials in some cases)
                const isPayable = !isCancelled && !isFullyPaid;

                // ✅ Same flag drives the button visibility
                const showPayButton = isPayable;

                return (
                  <div key={installmentId || index} className={`installment-card ${statusLower}`}>
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
                            <label>Total Amount</label>
                            <p className="amount">{formatCurrency(installment.amount)}</p>
                          </div>
                        </div>

                        {/* Show paid amount for paid OR partial */}
                        {(statusLower === 'paid' || statusLower === 'partial') && (
                          <div className="detail-item">
                            <i className="bi bi-check-circle"></i>
                            <div>
                              <label>Paid Amount</label>
                              <p className="paid-amount">{formatCurrency(paidAmount)}</p>
                            </div>
                          </div>
                        )}

                        {/* Show remaining amount for pending OR partial */}
                        {isPayable && (
                          <div className="detail-item">
                            <i className="bi bi-wallet2"></i>
                            <div>
                              <label>Remaining Amount</label>
                              <p className="remaining-amount">{formatCurrency(remaining)}</p>
                            </div>
                          </div>
                        )}

                        {statusLower === 'paid' && (
                          <>
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
                        {/* 
                        {isPayable && installment.can_pay !== false && (
                          <div className="detail-item">
                            <i className="bi bi-credit-card"></i>
                            <div>
                              <label>Action</label>
                              <button
                                className="pay-now-btn"
                                onClick={() => openPaymentModal(installment)}
                                disabled={isProcessing || remaining <= 0}
                              >
                                {isProcessing ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-wallet2"></i>
                                    Pay Now
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )} */}

                        {showPayButton && (
                          <div className="detail-item">
                            <i className="bi bi-credit-card"></i>
                            <div>
                              <label>Action</label>
                              <button
                                className="pay-now-btn"
                                onClick={() => openPaymentModal(installment)}
                                disabled={isProcessing}
                                title={`Pay remaining ₹${remaining.toFixed(2)}`}
                              >
                                {isProcessing ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-wallet2"></i>
                                    {statusLower === 'partial'
                                      ? `Pay Remaining ₹${remaining.toFixed(0)}`
                                      : 'Pay Now'}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
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
                );
              })
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

      {/* ============================================================ */}
      {/* PARTIAL PAYMENT MODAL                                        */}
      {/* ============================================================ */}
      {showPaymentModal && selectedInstallment && (
        <div className="payment-modal-overlay" onClick={closePaymentModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h3>
                <i className="bi bi-wallet2"></i>
                Make Payment
              </h3>
              <button className="payment-modal-close" onClick={closePaymentModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="payment-modal-body">
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Installment #</span>
                  <strong>{selectedInstallment.installment_no}</strong>
                </div>
                <div className="summary-row">
                  <span>Total Amount</span>
                  <strong>{formatCurrency(selectedInstallment.amount)}</strong>
                </div>
                <div className="summary-row">
                  <span>Already Paid</span>
                  <strong>{formatCurrency(selectedInstallment.paid_amount || 0)}</strong>
                </div>
                <div className="summary-row highlight">
                  <span>Remaining</span>
                  <strong>{formatCurrency(getRemainingAmount(selectedInstallment))}</strong>
                </div>
              </div>

              <div className="payment-input-group">
                <label htmlFor="paymentAmount">
                  Enter Payment Amount <span className="required">*</span>
                </label>
                <div className="input-with-rupee">
                  <span className="rupee-symbol">₹</span>
                  <input
                    id="paymentAmount"
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
                  <p className="payment-error">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    {paymentError}
                  </p>
                )}
                <div className="quick-amount-buttons">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAmount(getRemainingAmount(selectedInstallment).toString());
                      setPaymentError('');
                    }}
                  >
                    Full Amount
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const half = (getRemainingAmount(selectedInstallment) / 2).toFixed(2);
                      setPaymentAmount(half);
                      setPaymentError('');
                    }}
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAmount('1000');
                      setPaymentError('');
                    }}
                  >
                    ₹1000
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAmount('500');
                      setPaymentError('');
                    }}
                  >
                    ₹500
                  </button>
                </div>
              </div>
            </div>

            <div className="payment-modal-footer">
              <button className="btn-cancel" onClick={closePaymentModal}>
                Cancel
              </button>
              <button
                className="btn-proceed"
                onClick={handleProceedToPayment}
                disabled={!!processingPayment[selectedInstallment.installment_id]}
              >
                {processingPayment[selectedInstallment.installment_id] ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-credit-card"></i>
                    Proceed to Pay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schemesinstallments;