import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginLayout.css';
import logoImage from '../Images/MANIKANTHA JEWELLERS FINAL LOOG DESIGN (1)_page-0001.jpg';
import { getHomeRoute, REGISTER_ROUTE } from '../navConfig';

/**
 * Login screen UI (matches the app reference).
 * Put your EXISTING login / OTP logic in `onContinue(value)` – this component only provides the look.
 *
 * Props:
 *  - onContinue(value)  called with the typed mobile number / email
 *  - loading            shows "Please wait..." on the button
 *  - error              optional error text under the input
 */
const LoginLayout = ({ onContinue, loading = false, error = '' }) => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    if (onContinue) onContinue(value.trim());
  };

  return (
    <div className="lg-page">
      <button className="lg-close" onClick={() => navigate(getHomeRoute())} aria-label="Close">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#3a3340" strokeWidth="2.4" strokeLinecap="round">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>

      <div className="lg-card">
        <div className="lg-logo-block">
          <span className="lg-logo-chip">
            <img
              src={logoImage}
              alt="Company Logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </span>
          <span className="lg-brand">
            <span className="lg-brand-name">MANIKANTHA</span>
            <span className="lg-brand-sub">JEWELLERS</span>
          </span>
        </div>

        <h1 className="lg-title">Sign in to continue</h1>
        <p className="lg-subtitle">We'll send an OTP to your phone or email to confirm it's you</p>

        <form onSubmit={submit}>
          <label className="lg-label" htmlFor="lg-identifier">Mobile number / Email</label>
          <input
            id="lg-identifier"
            className="lg-input"
            type="text"
            placeholder="Enter Mobile number / Email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="username"
          />
          {error && <p className="lg-error">{error}</p>}

          <button className="lg-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Continue Sign In'}
          </button>
        </form>

        <p className="lg-footer">
          <span>No account?</span>
          <button type="button" className="lg-link" onClick={() => navigate(REGISTER_ROUTE)}>
            Create new account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginLayout;
