import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './CustomerLogin.css';
import companyLogo from '../Images/MANIKANTHA JEWELLERS FINAL LOOG DESIGN (1)_page-0001.jpg';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch('http://187.127.147.245:81/api/customer/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      console.log('Customer login successful:', data);
      
      // Extract customer data from response
      const customerData = data.user || data.customer || data;
      
      // Store token if present
      if (data.token) {
        localStorage.setItem('token', data.token); // Use 'token' consistently
        localStorage.setItem('customerToken', data.token);
      }
      
      // Store customer data
      if (customerData) {
        localStorage.setItem('customer', JSON.stringify(customerData));
        localStorage.setItem('user', JSON.stringify(customerData)); // Also store as 'user' for compatibility
        
        // *** CRITICAL: Extract and store customer ID ***
        const customerId = customerData.id || 
                          customerData.customer_id || 
                          customerData.user_id || 
                          customerData._id ||
                          data.customer_id ||
                          data.id;
        
        if (customerId) {
          // Store customer ID in multiple places for reliability
          localStorage.setItem('customerId', customerId.toString());
          localStorage.setItem('customer_id', customerId.toString()); // Alternative key
          console.log('✅ Customer ID stored successfully:', customerId);
        } else {
          console.warn('⚠️ No customer ID found in response:', customerData);
          // Try to extract from nested data
          const nestedId = data?.data?.customer_id || data?.data?.id;
          if (nestedId) {
            localStorage.setItem('customerId', nestedId.toString());
            localStorage.setItem('customer_id', nestedId.toString());
            console.log('✅ Customer ID stored from nested data:', nestedId);
          }
        }
      }
      
      // Navigate to dashboard
      navigate('/dashboard');

    } catch (error) {
      setApiError(error.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4"> 
            <div className="company-logo-container mb-3">
              <img 
                src={companyLogo} 
                alt="Company Logo" 
                className="company-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML += '<i className="bi bi-building" style="font-size: 3rem;"></i>';
                }}
              />
            </div>
            <div className="card shadow-lg border-0 login-card">
              <div className="card-body p-4 p-sm-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-2">Customer Login</h2>
                  <p className="text-muted">Please sign in to continue</p>
                </div>

                {apiError && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {apiError}
                    <button type="button" className="btn-close" onClick={() => setApiError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="identifier" className="form-label fw-semibold">
                      Email or Username
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control border-start-0 ${errors.identifier ? 'is-invalid' : ''}`}
                        id="identifier"
                        name="identifier"
                        placeholder="Enter your email or username"
                        value={formData.identifier}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.identifier && (
                      <div className="invalid-feedback d-block">{errors.identifier}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <span 
                        className="input-group-text bg-light border-start-0 password-toggle"
                        onClick={togglePasswordVisibility}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                      </span>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block">{errors.password}</div>
                    )}
                  </div>

                  <div className="text-end mb-3">
                    <a href="#" className="text-decoration-none small" onClick={(e) => e.preventDefault()}>
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <a href="#" className="text-decoration-none fw-semibold" onClick={(e) => e.preventDefault()}>
                      Sign up
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-muted small mt-3">
              &copy; 2024 Your Company. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;