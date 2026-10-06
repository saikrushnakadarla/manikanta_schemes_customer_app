import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './CustomerLogin.css';
import { Link } from 'react-router-dom';
import companyLogo from '../Images/MANIKANTHA JEWELLERS FINAL LOOG DESIGN (1)_page-0001.jpg';
import baseURL from '../URL/BaseURL';


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
      const response = await fetch(`${baseURL}/api/customer/login/`, {
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
      navigate('/products');

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
    <div className="tl-page">
      <button
        type="button"
        className="tl-close"
        aria-label="Close"
        onClick={() => navigate(-1)}
      >
        <i className="bi bi-x-lg"></i>
      </button>

      <div className="tl-card">
        <div className="tl-logo">
          <img
            src={companyLogo}
            alt="Company Logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>

        <div className="tl-heading">
          <h1>Sign in to continue</h1>
          <p>Enter your email or username and password to access your account</p>
        </div>

        {apiError && (
          <div className="tl-alert" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{apiError}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setApiError('')}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="tl-field">
            <label htmlFor="identifier">Email or Username</label>
            <input
              type="text"
              className={`tl-input ${errors.identifier ? 'is-invalid' : ''}`}
              id="identifier"
              name="identifier"
              placeholder="Enter your email or username"
              value={formData.identifier}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.identifier && <div className="tl-error">{errors.identifier}</div>}
          </div>

          <div className="tl-field">
            <label htmlFor="password">Password</label>
            <div className="tl-password">
              <input
                type={showPassword ? "text" : "password"}
                className={`tl-input ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="tl-eye"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={togglePasswordVisibility}
              >
                <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
            {errors.password && <div className="tl-error">{errors.password}</div>}
          </div>

          <div className="tl-forgot">
            <a href="#" onClick={(e) => e.preventDefault()}>
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="tl-submit" disabled={isLoading}>
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

        <p className="tl-signup">
          No account?{' '}
          <Link to="/customerregister">Create new account</Link>
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;