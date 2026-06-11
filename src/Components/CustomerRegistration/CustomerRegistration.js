import React, { useState } from "react";
import "./CustomerRegistration.css";

const CustomerRegistration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    // Step 2: Address Details
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    // Step 3: Scheme & Preferences
    schemeType: "",
    preferredLanguage: "",
    occupation: "",
    annualIncome: "",
    nomineeName: "",
    nomineeRelation: "",
    // Step 4: Account & Verification
    username: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStep = () => {
    let newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
        isValid = false;
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
        isValid = false;
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
        isValid = false;
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone number must be 10 digits";
        isValid = false;
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
        isValid = false;
      }
      if (!formData.gender) {
        newErrors.gender = "Please select gender";
        isValid = false;
      }
    } else if (step === 2) {
      if (!formData.addressLine1.trim()) {
        newErrors.addressLine1 = "Address line 1 is required";
        isValid = false;
      }
      if (!formData.city.trim()) {
        newErrors.city = "City is required";
        isValid = false;
      }
      if (!formData.state.trim()) {
        newErrors.state = "State is required";
        isValid = false;
      }
      if (!formData.pincode.trim()) {
        newErrors.pincode = "Pincode is required";
        isValid = false;
      } else if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Pincode must be 6 digits";
        isValid = false;
      }
    } else if (step === 3) {
      if (!formData.schemeType) {
        newErrors.schemeType = "Please select a scheme";
        isValid = false;
      }
      if (!formData.preferredLanguage) {
        newErrors.preferredLanguage = "Please select preferred language";
        isValid = false;
      }
      if (!formData.nomineeName.trim()) {
        newErrors.nomineeName = "Nominee name is required";
        isValid = false;
      }
      if (!formData.nomineeRelation) {
        newErrors.nomineeRelation = "Please select nominee relation";
        isValid = false;
      }
    } else if (step === 4) {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
        isValid = false;
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
        isValid = false;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = "You must agree to the terms and conditions";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      // Here you would typically send data to your backend API
      console.log("Form submitted:", formData);
      alert("Registration successful! Please check your email for verification.");
      // Reset form or redirect
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        schemeType: "",
        preferredLanguage: "",
        occupation: "",
        annualIncome: "",
        nomineeName: "",
        nomineeRelation: "",
        username: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
      });
      setStep(1);
    }
  };

  const renderStep1 = () => (
    <div className="step-container">
      <h4 className="step-title">Personal Information</h4>
      <div className="row">
        <div className="col-md-12 mb-3">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
          {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Phone Number *</label>
          <input
            type="tel"
            className={`form-control ${errors.phone ? "is-invalid" : ""}`}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
          />
          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Date of Birth *</label>
          <input
            type="date"
            className={`form-control ${errors.dateOfBirth ? "is-invalid" : ""}`}
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
          {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Gender *</label>
          <div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
              />
              <label className="form-check-label">Male</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
              />
              <label className="form-check-label">Female</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="gender"
                value="Other"
                checked={formData.gender === "Other"}
                onChange={handleChange}
              />
              <label className="form-check-label">Other</label>
            </div>
          </div>
          {errors.gender && <div className="text-danger small mt-1">{errors.gender}</div>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-container">
      <h4 className="step-title">Address Details</h4>
      <div className="row">
        <div className="col-md-12 mb-3">
          <label className="form-label">Address Line 1 *</label>
          <input
            type="text"
            className={`form-control ${errors.addressLine1 ? "is-invalid" : ""}`}
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            placeholder="House/Flat No., Street"
          />
          {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Address Line 2 (Optional)</label>
          <input
            type="text"
            className="form-control"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Landmark, Area"
          />
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">City *</label>
          <input
            type="text"
            className={`form-control ${errors.city ? "is-invalid" : ""}`}
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
          />
          {errors.city && <div className="invalid-feedback">{errors.city}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">State *</label>
          <input
            type="text"
            className={`form-control ${errors.state ? "is-invalid" : ""}`}
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
          />
          {errors.state && <div className="invalid-feedback">{errors.state}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Pincode *</label>
          <input
            type="text"
            className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="6-digit pincode"
            maxLength="6"
          />
          {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Country</label>
          <input
            type="text"
            className="form-control"
            name="country"
            value={formData.country}
            onChange={handleChange}
            readOnly
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-container">
      <h4 className="step-title">Scheme & Preferences</h4>
      <div className="row">
        <div className="col-md-12 mb-3">
          <label className="form-label">Select Scheme *</label>
          <select
            className={`form-select ${errors.schemeType ? "is-invalid" : ""}`}
            name="schemeType"
            value={formData.schemeType}
            onChange={handleChange}
          >
            <option value="">Choose a scheme</option>
            <option value="gold_savings">Gold Savings Scheme</option>
            <option value="silver_savings">Silver Savings Scheme</option>
            <option value="diamond_investment">Diamond Investment Plan</option>
            <option value="festive_special">Festive Special Scheme</option>
            <option value="annual_plan">Annual Membership Plan</option>
          </select>
          {errors.schemeType && <div className="invalid-feedback">{errors.schemeType}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Preferred Language *</label>
          <select
            className={`form-select ${errors.preferredLanguage ? "is-invalid" : ""}`}
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleChange}
          >
            <option value="">Select language</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="tamil">Tamil</option>
            <option value="telugu">Telugu</option>
            <option value="kannada">Kannada</option>
          </select>
          {errors.preferredLanguage && <div className="invalid-feedback">{errors.preferredLanguage}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Occupation</label>
          <select
            className="form-select"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
          >
            <option value="">Select occupation</option>
            <option value="salaried">Salaried</option>
            <option value="self_employed">Self Employed</option>
            <option value="business">Business</option>
            <option value="student">Student</option>
            <option value="homemaker">Homemaker</option>
            <option value="retired">Retired</option>
          </select>
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Annual Income Range</label>
          <select
            className="form-select"
            name="annualIncome"
            value={formData.annualIncome}
            onChange={handleChange}
          >
            <option value="">Select income range</option>
            <option value="below_3lac">Below ₹3 Lakhs</option>
            <option value="3lac_6lac">₹3 Lakhs - ₹6 Lakhs</option>
            <option value="6lac_10lac">₹6 Lakhs - ₹10 Lakhs</option>
            <option value="10lac_25lac">₹10 Lakhs - ₹25 Lakhs</option>
            <option value="above_25lac">Above ₹25 Lakhs</option>
          </select>
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Nominee Name *</label>
          <input
            type="text"
            className={`form-control ${errors.nomineeName ? "is-invalid" : ""}`}
            name="nomineeName"
            value={formData.nomineeName}
            onChange={handleChange}
            placeholder="Full name of nominee"
          />
          {errors.nomineeName && <div className="invalid-feedback">{errors.nomineeName}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Nominee Relation *</label>
          <select
            className={`form-select ${errors.nomineeRelation ? "is-invalid" : ""}`}
            name="nomineeRelation"
            value={formData.nomineeRelation}
            onChange={handleChange}
          >
            <option value="">Select relation</option>
            <option value="spouse">Spouse</option>
            <option value="child">Child</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="other">Other</option>
          </select>
          {errors.nomineeRelation && <div className="invalid-feedback">{errors.nomineeRelation}</div>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-container">
      <h4 className="step-title">Account Setup & Verification</h4>
      <div className="row">
        <div className="col-md-12 mb-3">
          <label className="form-label">Choose Username *</label>
          <input
            type="text"
            className={`form-control ${errors.username ? "is-invalid" : ""}`}
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username for login"
          />
          {errors.username && <div className="invalid-feedback">{errors.username}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Password *</label>
          <input
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <label className="form-label">Confirm Password *</label>
          <input
            type="password"
            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
          />
          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
        </div>
        <div className="col-md-12 mb-3">
          <div className="form-check">
            <input
              className={`form-check-input ${errors.agreeTerms ? "is-invalid" : ""}`}
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              id="agreeTerms"
            />
            <label className="form-check-label" htmlFor="agreeTerms">
              I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms and Conditions</a> and <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a> *
            </label>
            {errors.agreeTerms && <div className="invalid-feedback d-block">{errors.agreeTerms}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div className="registration-wrapper">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-7">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <h2 className="text-center mb-2">Customer Registration</h2>
                <p className="text-center text-muted">Join our schemes & earn exclusive benefits</p>
                {/* Progress Steps */}
                <div className="progress-steps d-flex justify-content-between mt-4 mb-3">
                  <div className={`step-indicator ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
                    <div className="step-circle">1</div>
                    <div className="step-label">Personal</div>
                  </div>
                  <div className={`step-indicator ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
                    <div className="step-circle">2</div>
                    <div className="step-label">Address</div>
                  </div>
                  <div className={`step-indicator ${step >= 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}>
                    <div className="step-circle">3</div>
                    <div className="step-label">Scheme</div>
                  </div>
                  <div className={`step-indicator ${step >= 4 ? "active" : ""} ${step > 4 ? "completed" : ""}`}>
                    <div className="step-circle">4</div>
                    <div className="step-label">Account</div>
                  </div>
                </div>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {renderStep()}
                  
                  <div className="d-flex justify-content-between mt-4">
                    {step > 1 && (
                      <button type="button" className="btn btn-outline-secondary px-4" onClick={prevStep}>
                        <i className="bi bi-arrow-left me-2"></i>Previous
                      </button>
                    )}
                    {step < 4 && (
                      <button type="button" className="btn btn-primary px-4 ms-auto" onClick={nextStep}>
                        Next<i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    )}
                    {step === 4 && (
                      <button type="submit" className="btn btn-success px-4 ms-auto">
                        <i className="bi bi-check-circle me-2"></i>Register
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegistration;