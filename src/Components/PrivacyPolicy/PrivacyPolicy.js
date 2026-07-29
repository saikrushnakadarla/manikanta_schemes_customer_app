import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page">
      <Navbar />

      {/* Hero Section */}
      <section className="policy-hero">
        <div className="policy-hero-content">
          <h1 className="policy-hero-title">Privacy Policy</h1>
          <p className="policy-hero-subtitle">
            Your privacy matters to us. Learn how we protect your information.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="policy-content">
        <div className="container">
          <div className="policy-last-updated">
            Last Updated: January 1, 2024
          </div>

          <div className="policy-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              make a purchase, or contact us for support. This may include:
            </p>
            <ul>
              <li>Name and contact information</li>
              <li>Payment and transaction details</li>
              <li>Communication preferences</li>
              <li>Device and browsing information</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process your orders and payments</li>
              <li>Provide customer support</li>
              <li>Send you updates about your orders</li>
              <li>Improve our products and services</li>
              <li>Send you marketing communications (with your consent)</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul>
              <li>Service providers who assist with our operations</li>
              <li>Payment processors for transaction processing</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div className="policy-section">
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>6. Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience and analyze website traffic. 
              You can control cookie preferences through your browser settings.
            </p>
          </div>

          <div className="policy-section">
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="policy-contact">
              <p><i className="bi bi-envelope"></i> privacy@jewellerystore.com</p>
              <p><i className="bi bi-telephone"></i> +91 98765 43210</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;