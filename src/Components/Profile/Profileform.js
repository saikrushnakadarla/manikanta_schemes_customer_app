import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Profileform.css';
import baseURL from '../URL/BaseURL';

const PROFILE_ROUTE = '/profile';
const LOGIN_ROUTE = '/login';

// Logged-in customer id (the account_id used by /api/customers/<id>/)
const getCustomerId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}') || {};
    const id = user.account_id || user.id || user.customer_id || user.user_id;
    if (id) return id;
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
  const stored =
    localStorage.getItem('customerId') ||
    localStorage.getItem('customer_id') ||
    localStorage.getItem('userId');
  return stored ? parseInt(stored) : null;
};

// "2026-07-21T00:00:00Z" -> "2026-07-21"
const toInputDate = (value) => (value ? String(value).slice(0, 10) : '');

// "2026-07-21" -> "21/07/2026"
const toDisplayDate = (value) => {
  if (!value) return '';
  const [y, m, d] = value.split('-');
  return y && m && d ? `${d}/${m}/${y}` : value;
};

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true">
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="#4f2480" strokeWidth="2" />
    <path d="M3 9.5h18" stroke="#4f2480" strokeWidth="4" />
    <path d="M8 2.8v3.4M16 2.8v3.4" stroke="#4f2480" strokeWidth="2" strokeLinecap="round" />
    <g fill="#4f2480">
      <circle cx="8" cy="13" r="0.9" /><circle cx="12" cy="13" r="0.9" /><circle cx="16" cy="13" r="0.9" />
      <circle cx="8" cy="16.5" r="0.9" /><circle cx="12" cy="16.5" r="0.9" /><circle cx="16" cy="16.5" r="0.9" />
    </g>
  </svg>
);

function Profileform() {
  const navigate = useNavigate();
  const birthdayRef = useRef(null);
  const anniversaryRef = useRef(null);

  const [customer, setCustomer] = useState(null); // full object returned by the GET api
  const [form, setForm] = useState({ name: '', email: '', birthday: '', anniversary: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});

  const customerId = getCustomerId();

  // ---------- GET: load existing details ----------
  const fetchCustomer = async () => {
    if (!customerId) {
      navigate(LOGIN_ROUTE);
      return;
    }

    try {
      setLoading(true);
      setLoadError('');

      const response = await fetch(`${baseURL}/api/customers/${customerId}/`, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCustomer(data);
      setForm({
        name: data.account_name || '',
        email: data.email || '',
        birthday: toInputDate(data.birthday),
        anniversary: toInputDate(data.anniversary)
      });
    } catch (err) {
      console.error('Error fetching customer:', err);
      setLoadError('Unable to load your details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const openPicker = (ref) => {
    const el = ref.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker();
        return;
      } catch (e) {
        /* fall through */
      }
    }
    el.focus();
    el.click();
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- PUT: update details ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer || saving) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const newName = form.name.trim();

      // keep print name in sync only if it was the same as the account name
      const printNameFollowsName = !customer.print_name || customer.print_name === customer.account_name;

      const payload = {
        ...customer,
        account_name: newName,
        print_name: printNameFollowsName ? newName : customer.print_name,
        email: form.email.trim() || null,
        birthday: form.birthday || null,
        anniversary: form.anniversary || null
      };

      const response = await fetch(`${baseURL}/api/customers/${customerId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });

      let result = {};
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        result = {};
      }

      if (!response.ok) {
        const message =
          result.detail ||
          result.message ||
          result.error ||
          Object.entries(result)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('\n') ||
          `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      const updated = Object.keys(result).length ? result : payload;
      setCustomer(updated);

      // keep the locally stored user in sync (name shown on Profile / sidebar)
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}') || {};
        const merged = { ...stored, name: newName, customer_name: newName, email: updated.email };
        localStorage.setItem('user', JSON.stringify(merged));
      } catch (storageErr) {
        console.error('Error updating stored user:', storageErr);
      }

      await Swal.fire({
        title: 'Profile Updated!',
        text: 'Your profile details have been saved.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
        confirmButtonColor: '#4f2480'
      });
      navigate(PROFILE_ROUTE);
    } catch (err) {
      console.error('Error updating profile:', err);
      Swal.fire({
        title: 'Update Failed',
        text: err.message || 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f2480'
      });
    } finally {
      setSaving(false);
    }
  };

  const mobile = customer ? customer.mobile || customer.phone || '' : '';
  const mobileDisplay = mobile ? `+91 ${mobile}` : '';

  return (
    <div className="pf-page">
      {/* Top bar */}
      <div className="pf-topbar">
        <button className="pf-back" onClick={() => navigate(-1)} aria-label="Back">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#1c1521" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12H4M10 6l-6 6 6 6" />
          </svg>
        </button>
        <h1 className="pf-title">Edit Profile</h1>
      </div>

      {loading && (
        <div className="pf-state">
          <div className="pf-loader"></div>
          <p>Loading your details...</p>
        </div>
      )}

      {!loading && loadError && (
        <div className="pf-state">
          <p className="pf-load-error">{loadError}</p>
          <button className="pf-retry" onClick={fetchCustomer}>Retry</button>
        </div>
      )}

      {!loading && !loadError && customer && (
        <form onSubmit={handleSubmit} noValidate>
          {/* Avatar card */}
          <div className="pf-card pf-avatar-card">
            <span className="pf-avatar">
              <svg viewBox="0 0 24 24" width="62" height="62" aria-hidden="true">
                <circle cx="12" cy="8" r="4.4" fill="#4f2480" />
                <path d="M3.6 21c0-4.3 3.4-6.4 8.4-6.4s8.4 2.1 8.4 6.4z" fill="#4f2480" />
              </svg>
            </span>
            <p className="pf-avatar-name">{form.name || customer.account_name}</p>
            {mobileDisplay && <p className="pf-avatar-mobile">{mobileDisplay}</p>}
          </div>

          {/* Fields */}
          <div className="pf-card pf-fields">
            <div className="pf-field">
              <label htmlFor="pf-name">Full Name</label>
              <input
                id="pf-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter Full Name"
              />
              {errors.name && <span className="pf-error">{errors.name}</span>}
            </div>

            <div className="pf-field">
              <label htmlFor="pf-mobile">Mobile Number</label>
              <input
                id="pf-mobile"
                type="text"
                value={mobileDisplay}
                readOnly
                disabled
                className="pf-readonly"
                placeholder="Mobile Number"
              />
            </div>

            <div className="pf-field">
              <label htmlFor="pf-email">Email Id</label>
              <input
                id="pf-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter Email"
              />
              {errors.email && <span className="pf-error">{errors.email}</span>}
            </div>

            <div className="pf-field pf-date-field">
              <label htmlFor="pf-birthday">Date Of Birth</label>
              <div className="pf-date-row">
                <input
                  id="pf-birthday"
                  type="text"
                  readOnly
                  value={toDisplayDate(form.birthday)}
                  placeholder="Enter Date Of Birth"
                  className="pf-date-text"
                  onClick={() => openPicker(birthdayRef)}
                />
                <button type="button" className="pf-cal-btn" onClick={() => openPicker(birthdayRef)} aria-label="Pick date of birth">
                  <CalendarIcon />
                </button>
                <input
                  ref={birthdayRef}
                  name="birthday"
                  type="date"
                  className="pf-hidden-date"
                  value={form.birthday}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={handleChange}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="pf-field pf-date-field">
              <label htmlFor="pf-anniversary">Anniversary</label>
              <div className="pf-date-row">
                <input
                  id="pf-anniversary"
                  type="text"
                  readOnly
                  value={toDisplayDate(form.anniversary)}
                  placeholder="Enter Anniversary Date"
                  className="pf-date-text"
                  onClick={() => openPicker(anniversaryRef)}
                />
                <button type="button" className="pf-cal-btn" onClick={() => openPicker(anniversaryRef)} aria-label="Pick anniversary date">
                  <CalendarIcon />
                </button>
                <input
                  ref={anniversaryRef}
                  name="anniversary"
                  type="date"
                  className="pf-hidden-date"
                  value={form.anniversary}
                  onChange={handleChange}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="pf-submit" disabled={saving}>
            {saving ? 'Updating...' : 'Update profile'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Profileform;
