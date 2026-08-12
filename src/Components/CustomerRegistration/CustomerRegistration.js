import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Changed: useHistory → useNavigate
import Navbar from '../Navbar/LoginNavbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CustomerRegistration.css';
import baseURL from '../URL/BaseURL';

function CustomersForm() {
  const navigate = useNavigate(); // Changed: useHistory → useNavigate
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    account_name: '',
    print_name: '',
    account_group: 'Customers',
    op_bal: '',
    dr_cr: 'DR',
    phone: '',
    mobile: '',
    email: '',
    password: '',
    address: '',
    city: '',
    pin: '',
    aadhaar_number: '',
    pan_number: '',
    nominee_name: '',
    nominee_email: '',
    nominee_phone_number: '',
    relationship: '',
    nominee_aadhaar_number: '',
    nominee_pan_number: '',
    remarks: '',
    referred_person_name: '',
    referred_person_id: '',
    referred_person_referral_code: '',
    customer_status: 'active',
    kyc_status: 'pending',
    join_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (location.state && location.state.isEditMode && location.state.customerData) {
      setIsEditMode(true);
      setCustomerId(location.state.customerData.id || location.state.customerData.account_id);
      setFormData({
        account_name: location.state.customerData.account_name || location.state.customerData.name || '',
        print_name: location.state.customerData.print_name || location.state.customerData.name || '',
        account_group: location.state.customerData.account_group || 'Customers',
        op_bal: location.state.customerData.op_bal || '',
        dr_cr: location.state.customerData.dr_cr || 'DR',
        phone: location.state.customerData.phone || location.state.customerData.phone_number || '',
        mobile: location.state.customerData.mobile || location.state.customerData.phone_number || '',
        email: location.state.customerData.email || '',
        password: '',
        address: location.state.customerData.address || '',
        city: location.state.customerData.city || '',
        pin: location.state.customerData.pin || '',
        aadhaar_number: location.state.customerData.aadhaar_number || '',
        pan_number: location.state.customerData.pan_number || '',
        nominee_name: location.state.customerData.nominee_name || '',
        nominee_email: location.state.customerData.nominee_email || '',
        nominee_phone_number: location.state.customerData.nominee_phone_number || '',
        relationship: location.state.customerData.relationship || '',
        nominee_aadhaar_number: location.state.customerData.nominee_aadhaar_number || '',
        nominee_pan_number: location.state.customerData.nominee_pan_number || '',
        remarks: location.state.customerData.remarks || '',
        referred_person_name: location.state.customerData.referred_person_name || '',
        referred_person_id: location.state.customerData.referred_person_id || '',
        referred_person_referral_code: location.state.customerData.referred_person_referral_code || '',
        customer_status: location.state.customerData.customer_status || 'active',
        kyc_status: location.state.customerData.kyc_status || 'pending',
        join_date: location.state.customerData.join_date || new Date().toISOString().split('T')[0]
      });
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateStep1 = () => {
    if (!formData.account_name.trim()) {
      Swal.fire({ title: 'Error!', text: 'Account name is required', icon: 'error', confirmButtonColor: '#dc3545' });
      return false;
    }
    if (!formData.email.trim()) {
      Swal.fire({ title: 'Error!', text: 'Email is required', icon: 'error', confirmButtonColor: '#dc3545' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({ title: 'Error!', text: 'Please enter a valid email address', icon: 'error', confirmButtonColor: '#dc3545' });
      return false;
    }
    if (!formData.phone.trim()) {
      Swal.fire({ title: 'Error!', text: 'Phone number is required', icon: 'error', confirmButtonColor: '#dc3545' });
      return false;
    }
    if (formData.phone.length < 10) {
      Swal.fire({ title: 'Error!', text: 'Phone number must be at least 10 digits', icon: 'error', confirmButtonColor: '#dc3545' });
      return false;
    }
    if (!isEditMode && !formData.password.trim()) {
      Swal.fire({ title: 'Error!', text: 'Password is required', icon: 'error', confirmButtonColor: '#dc3545' });
      return false;
    }
    if (!isEditMode && formData.password.length < 6) {
      Swal.fire({ title: 'Error!', text: 'Password must be at least 6 characters', icon: 'error', confirmButtonColor: '#dc3545' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    return true;
  };

  const validateStep3 = () => {
    return true;
  };

  const validateStep4 = () => {
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
    else if (currentStep === 4 && validateStep4()) handleSubmit();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Helper function to get current date in ISO format with milliseconds
  const getCurrentDateTimeISO = () => {
    const now = new Date();
    // Format: "2026-07-22T08:40:24.378Z"
    return now.toISOString();
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Create the request data object with correct field names matching the API
      const requestData = {
        account_name: formData.account_name,
        print_name: formData.print_name || formData.account_name,
        account_group: formData.account_group || 'Customers',
        phone: formData.phone,
        mobile: formData.mobile || formData.phone,
        email: formData.email,
        dr_cr: formData.dr_cr || 'DR',
        created_at: getCurrentDateTimeISO() // Add current date and time in ISO format
      };

      // Add password only if provided (mandatory for create)
      if (formData.password) {
        requestData.password = formData.password;
      }

      // Add opening balance if provided
      if (formData.op_bal) {
        requestData.op_bal = formData.op_bal;
      }

      // Add optional fields only if they have values
      if (formData.address) requestData.address = formData.address;
      if (formData.city) requestData.city = formData.city;
      if (formData.pin) requestData.pin = formData.pin;
      if (formData.aadhaar_number) requestData.aadhaar_number = formData.aadhaar_number;
      if (formData.pan_number) requestData.pan_number = formData.pan_number;
      if (formData.nominee_name) requestData.nominee_name = formData.nominee_name;
      if (formData.nominee_email) requestData.nominee_email = formData.nominee_email;
      if (formData.nominee_phone_number) requestData.nominee_phone_number = formData.nominee_phone_number;
      if (formData.relationship) requestData.relationship = formData.relationship;
      if (formData.nominee_aadhaar_number) requestData.nominee_aadhaar_number = formData.nominee_aadhaar_number;
      if (formData.nominee_pan_number) requestData.nominee_pan_number = formData.nominee_pan_number;
      if (formData.remarks) requestData.remarks = formData.remarks;
      if (formData.referred_person_name) requestData.referred_person_name = formData.referred_person_name;
      if (formData.referred_person_id) requestData.referred_person_id = formData.referred_person_id;
      if (formData.referred_person_referral_code) requestData.referred_person_referral_code = formData.referred_person_referral_code;
      if (formData.customer_status) requestData.customer_status = formData.customer_status;
      if (formData.kyc_status) requestData.kyc_status = formData.kyc_status;
      if (formData.join_date) requestData.join_date = formData.join_date;

      console.log('Sending request data:', requestData);

      let url = `${baseURL}/api/customers/`;
      let method = 'POST';
      
      if (isEditMode) {
        url = `${baseURL}/api/customers/${customerId}/`;
        method = 'PUT';
        // Remove created_at for update operations
        delete requestData.created_at;
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned: ${responseText.substring(0, 200)}`);
      }

      if (response.ok) {
        await Swal.fire({
          title: 'Success!',
          text: isEditMode ? 'Customer updated successfully!' : 'Customer registered successfully!',
          icon: 'success',
          confirmButtonColor: '#667eea',
          timer: 2000,
          timerProgressBar: true
        });
        navigate('/login'); // Changed: history.push → navigate
      } else {
        const errorMessage = result.message || result.detail || JSON.stringify(result) || (isEditMode ? 'Failed to update customer' : 'Failed to create customer');
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error details:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'An unexpected error occurred',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Cancel?',
      text: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No, stay'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/customers'); // Changed: history.push → navigate
      }
    });
  };

  return (
    <div className="customersform-page">
      <Navbar />
      
      <div className="customersform-content">
        <div className="container-fluid">
          <div className="customersform-header">
            {/* <div className="header-badge">
              <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-person-plus-fill'}`}></i>
              <span>{isEditMode ? 'Edit Customer' : 'Customer Registration'}</span>
            </div> */}
            <h1 className="customersform-title">
              <i className="bi bi-people-fill"></i>
              {isEditMode ? 'Edit Customer' : 'New Customer Registration'}
            </h1>
            <p className="customersform-subtitle">
              {isEditMode ? 'Update customer information' : 'Fill in the details to register a new customer'}
            </p>
          </div>

          <div className="form-card">
            {/* Step Progress Bar */}
            <div className="step-progress">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Personal Info</div>
              </div>
              <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Address</div>
              </div>
              <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`}></div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">KYC Details</div>
              </div>
              <div className={`step-line ${currentStep >= 4 ? 'active' : ''}`}></div>
              <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Nominee</div>
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="step-content">
                  <h3 className="step-title">
                    <i className="bi bi-person-circle"></i>
                    Personal Information
                  </h3>
                  
                  <div className="form-group">
                    <label>Account Name <span className="required">*</span></label>
                    <input type="text" name="account_name" className="form-control" placeholder="Enter account name" value={formData.account_name} onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label>Print Name</label>
                    <input type="text" name="print_name" className="form-control" placeholder="Enter print name" value={formData.print_name} onChange={handleInputChange} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address <span className="required">*</span></label>
                      <input type="email" name="email" className="form-control" placeholder="Enter email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label>Phone Number <span className="required">*</span></label>
                      <input type="text" name="phone" className="form-control" placeholder="10+ digits" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input type="text" name="mobile" className="form-control" placeholder="Mobile number" value={formData.mobile} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Opening Balance</label>
                      <input type="number" name="op_bal" className="form-control" placeholder="Opening balance" value={formData.op_bal} onChange={handleInputChange} step="0.01" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Account Group</label>
                      <input type="text" name="account_group" className="form-control" value={formData.account_group} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>DR/CR</label>
                      <select name="dr_cr" className="form-control" value={formData.dr_cr} onChange={handleInputChange}>
                        <option value="DR">DR</option>
                        <option value="CR">CR</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Password {!isEditMode && <span className="required">*</span>}</label>
                    <div className="password-input-wrapper">
                      <input type={showPassword ? "text" : "password"} name="password" className="form-control" placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"} value={formData.password} onChange={handleInputChange} required={!isEditMode} />
                      <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}-fill`}></i>
                      </button>
                    </div>
                    {!isEditMode && <small className="form-text">Password must be at least 6 characters</small>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Customer Status</label>
                      <select name="customer_status" className="form-control" value={formData.customer_status} onChange={handleInputChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>KYC Status</label>
                      <select name="kyc_status" className="form-control" value={formData.kyc_status} onChange={handleInputChange}>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Join Date</label>
                    <input type="date" name="join_date" className="form-control" value={formData.join_date} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* Step 2: Address Information */}
              {currentStep === 2 && (
                <div className="step-content">
                  <h3 className="step-title">
                    <i className="bi bi-geo-alt-fill"></i>
                    Address Information
                  </h3>

                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" name="address" className="form-control" placeholder="Street address" value={formData.address} onChange={handleInputChange} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" name="city" className="form-control" placeholder="City" value={formData.city} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>PIN Code</label>
                      <input type="text" name="pin" className="form-control" placeholder="6-digit PIN" value={formData.pin} onChange={handleInputChange} maxLength="6" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: KYC Details */}
              {currentStep === 3 && (
                <div className="step-content">
                  <h3 className="step-title">
                    <i className="bi bi-shield-check"></i>
                    KYC Details
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Aadhaar Number</label>
                      <input type="text" name="aadhaar_number" className="form-control" placeholder="12-digit Aadhaar" value={formData.aadhaar_number} onChange={handleInputChange} maxLength="12" />
                    </div>
                    <div className="form-group">
                      <label>PAN Number</label>
                      <input type="text" name="pan_number" className="form-control" placeholder="PAN (e.g., ABCDE1234F)" value={formData.pan_number} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Referral Person Name</label>
                    <input type="text" name="referred_person_name" className="form-control" placeholder="Who referred you?" value={formData.referred_person_name} onChange={handleInputChange} />
                  </div>

                  <div className="form-group">
                    <label>Remarks</label>
                    <textarea name="remarks" className="form-control" rows="3" placeholder="Any additional remarks" value={formData.remarks} onChange={handleInputChange}></textarea>
                  </div>
                </div>
              )}

              {/* Step 4: Nominee Details */}
              {currentStep === 4 && (
                <div className="step-content">
                  <h3 className="step-title">
                    <i className="bi bi-person-badge-fill"></i>
                    Nominee Information
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nominee Name</label>
                      <input type="text" name="nominee_name" className="form-control" placeholder="Nominee full name" value={formData.nominee_name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Relationship</label>
                      <input type="text" name="relationship" className="form-control" placeholder="e.g., Spouse, Son, Daughter" value={formData.relationship} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nominee Email</label>
                      <input type="email" name="nominee_email" className="form-control" placeholder="Nominee email" value={formData.nominee_email} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Nominee Phone</label>
                      <input type="text" name="nominee_phone_number" className="form-control" placeholder="Nominee phone" value={formData.nominee_phone_number} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nominee Aadhaar</label>
                      <input type="text" name="nominee_aadhaar_number" className="form-control" placeholder="12-digit Aadhaar" value={formData.nominee_aadhaar_number} onChange={handleInputChange} maxLength="12" />
                    </div>
                    <div className="form-group">
                      <label>Nominee PAN</label>
                      <input type="text" name="nominee_pan_number" className="form-control" placeholder="PAN number" value={formData.nominee_pan_number} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="form-actions">
                {currentStep > 1 && (
                  <button type="button" className="btn-prev" onClick={prevStep}>
                    <i className="bi bi-chevron-left"></i> Previous
                  </button>
                )}
                <button type="button" className="btn-next" onClick={nextStep} disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm"></span> Processing...</>
                  ) : (
                    currentStep === 4 ? (isEditMode ? 'Update Customer' : 'Submit Registration') : 'Next'
                  )}
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomersForm;