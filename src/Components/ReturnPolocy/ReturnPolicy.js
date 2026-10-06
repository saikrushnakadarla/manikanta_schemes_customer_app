import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './ReturnPolicy.css';

function ReturnPolicy() {
  return (
    <div className="return-policy-page">
      <Navbar />

      {/* Hero Section */}
      <section className="policy-hero">
        <div className="policy-hero-content">
          <h1 className="policy-hero-title">Return Policy</h1>
          <p className="policy-hero-subtitle">
            Please read our return policy carefully before making a purchase
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="policy-content-section">
        <div className="container">
          <div className="policy-content">
            {/* Important Notice */}
            <div className="policy-notice">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <div>
                <h3>Important Notice</h3>
                <p>
                  All online orders placed with Manikanta Jewellers are considered 
                  final. We do not accept returns, exchanges, or refunds for any 
                  online purchases.
                </p>
              </div>
            </div>

            {/* No Returns Policy */}
            <div className="policy-block">
              <h2 className="section-title">Return Policy</h2>
              <p>
               All online orders placed with Manikanta Jewellers are final. We do not accept standard returns, exchanges, or refunds, with the exception of damaged or defective items.
              </p>
              {/* <p>
                We strongly encourage our valued customers to thoroughly review 
                product details, specifications, and images before placing an 
                order. If you have any questions or need clarification about a 
                product, please contact us before completing your purchase.
              </p> */}
            </div>

            {/* Why No Returns */}
            {/* <div className="policy-block">
              <h2 className="section-title">Why We Don't Accept Returns</h2>
              <div className="policy-reasons">
                <div className="reason-card">
                  <div className="reason-icon">
                    <i className="bi bi-gem"></i>
                  </div>
                  <h4>Handcrafted Uniqueness</h4>
                  <p>
                    Every piece is uniquely handcrafted, making it impossible to 
                    resell or restock returned items.
                  </p>
                </div>
                <div className="reason-card">
                  <div className="reason-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h4>Hygiene & Safety</h4>
                  <p>
                    For the safety and hygiene of all our customers, we cannot 
                    accept previously shipped jewellery items.
                  </p>
                </div>
                <div className="reason-card">
                  <div className="reason-icon">
                    <i className="bi bi-award"></i>
                  </div>
                  <h4>Quality Assurance</h4>
                  <p>
                    Each item is quality-checked and certified before dispatch, 
                    ensuring you receive only the finest craftsmanship.
                  </p>
                </div>
              </div>
            </div> */}

            {/* What You Can Do */}
            {/* <div className="policy-block">
              <h2 className="section-title">What You Can Do</h2>
              <ul className="policy-list">
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Visit Our Store:</strong> We invite you to visit our 
                    store in Belur to personally view and select your jewellery 
                    before purchasing.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Ask Questions:</strong> Reach out to us via phone or 
                    email for any product-related queries before placing an order.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Request Details:</strong> We are happy to provide 
                    additional images, videos, or specifications upon request.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>In-Store Exchange:</strong> For purchases made in-store, 
                    please contact us directly to discuss any exchange possibilities.
                  </span>
                </li>
              </ul>
            </div> */}

            {/* Damaged or Defective Items */}
            <div className="policy-block">
              <h2 className="section-title">Damaged or Defective Items</h2>
              <p>
                In the rare event that you receive a damaged or defective item, 
                please contact us within <strong>48 hours of delivery</strong> with 
                clear photographs of the product and packaging. We will review 
                the issue on a case-by-case basis and work towards a fair resolution.
              </p>
              <p>
                Claims made after 48 hours of delivery will not be entertained.
              </p>
            </div>

            {/* Contact */}
            <div className="policy-block contact-block">
              <h2 className="section-title">Need Assistance?</h2>
              <p>
                If you have any questions regarding our return policy, please 
                don't hesitate to contact us:
              </p>
              <div className="policy-contact-info">
                <p>
                  <i className="bi bi-telephone-fill"></i>
                  <a href="tel:+919535403545">+91 9535403545</a>
                </p>
                <p>
                  <i className="bi bi-envelope-fill"></i>
                  <a href="mailto:manikantajewellers99@gmail.com">
                    manikantajewellers99@gmail.com
                  </a>
                </p>
                <p>
                  <i className="bi bi-geo-alt-fill"></i>
                  Manikanta Jewellers, Near Chennakeshva Swamy Temple, Kote, Belur - 573115
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ReturnPolicy;