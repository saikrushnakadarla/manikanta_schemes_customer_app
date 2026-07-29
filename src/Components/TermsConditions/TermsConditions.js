import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './TermsConditions.css';

const TermsConditions = () => {
  return (
    <div className="terms-page">
      <Navbar />

      {/* Hero Section */}
      <section className="terms-hero">
        <div className="terms-hero-content">
          <h1 className="terms-hero-title">Terms & Conditions</h1>
          <p className="terms-hero-subtitle">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="terms-content">
        <div className="container">
          <div className="terms-last-updated">
            Last Updated: January 1, 2024
          </div>

          <div className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By using our website and services, you agree to comply with and be bound by 
              these Terms & Conditions. If you do not agree, please do not use our services.
            </p>
          </div>

          <div className="terms-section">
            <h2>2. Products and Pricing</h2>
            <ul>
              <li>All products are subject to availability</li>
              <li>Prices are subject to change without notice</li>
              <li>Weights and purity are as per BIS standards</li>
              <li>Making charges may vary by product</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>3. Orders and Payment</h2>
            <ul>
              <li>Orders are confirmed upon payment verification</li>
              <li>We accept payments via various secure methods</li>
              <li>In case of payment failure, the order will be cancelled</li>
              <li>We reserve the right to cancel orders for any reason</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>4. Shipping and Delivery</h2>
            <ul>
              <li>Standard delivery takes 3-5 business days</li>
              <li>Free shipping on orders above ₹50,000</li>
              <li>All shipments are insured</li>
              <li>Signature required upon delivery</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>5. Return and Exchange Policy</h2>
            <ul>
              <li>14-day return policy on all products</li>
              <li>Products must be unused and in original packaging</li>
              <li>Exchange available within 30 days</li>
              <li>Special orders are not eligible for return</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>6. Warranty and Guarantee</h2>
            <ul>
              <li>All gold products are BIS hallmarked</li>
              <li>Lifetime exchange on selected designs</li>
              <li>Free cleaning and polishing for 1 year</li>
              <li>Complimentary jewellery insurance for 6 months</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>7. User Accounts</h2>
            <ul>
              <li>You are responsible for maintaining account security</li>
              <li>Provide accurate and complete information</li>
              <li>We reserve the right to suspend accounts</li>
              <li>Account details are subject to verification</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>8. Limitation of Liability</h2>
            <p>
              We are not liable for any indirect, incidental, or consequential damages 
              arising from the use of our products or services. Our liability is limited 
              to the purchase price of the product.
            </p>
          </div>

          <div className="terms-section">
            <h2>9. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of India. 
              Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, India.
            </p>
          </div>

          <div className="terms-section">
            <h2>10. Contact Information</h2>
            <p>For any questions regarding these terms, please contact us at:</p>
            <div className="terms-contact">
              <p><i className="bi bi-envelope"></i> legal@jewellerystore.com</p>
              <p><i className="bi bi-telephone"></i> +91 98765 43210</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsConditions;