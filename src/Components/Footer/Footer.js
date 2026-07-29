import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          {/* Company Info Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="logo-icon">💎</span> 
                <span className="logo-text">Manikanta Jewellery</span>
                <span className="logo-text">Store</span>
              </Link>
              <p className="footer-description">
                Your trusted destination for exquisite jewellery pieces. 
                Crafted with perfection, designed for elegance.
              </p>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">
                  <i className="bi bi-chevron-right"></i> Home
                </Link>
              </li>
              <li>
                <Link to="/products">
                  <i className="bi bi-chevron-right"></i> Products
                </Link>
              </li>
              <li>
                <Link to="/schemes">
                  <i className="bi bi-chevron-right"></i> Savings Schemes
                </Link>
              </li>
              <li>
                <Link to="/about">
                  <i className="bi bi-chevron-right"></i> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <i className="bi bi-chevron-right"></i> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info Section */}
          <div className="footer-section">
            <h4 className="footer-title">Contact Us</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <i className="bi bi-geo-alt-fill"></i>
                <div>
                  <p>123, Jewellery Street,</p>
                  <p>Diamond District,</p>
                  <p>Bangalore - 400001, India</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="bi bi-telephone-fill"></i>
                <div>
                  <p>
                    <a href="tel:+919876543210">+91 9535403545</a>
                  </p>
                  {/* <p>
                    <a href="tel:+911234567890">+91 12345 67890</a>
                  </p> */}
                </div>
              </div>
              <div className="contact-item">
                <i className="bi bi-envelope-fill"></i>
                <div>
                  <p>
                    <a href="mailto:manikantajewellers99@gmail.com">manikantajewellers99@gmail.com</a>
                  </p>
                  <p>
                    <a href="mailto:manikantajewellers99@gmail.com">manikantajewellers99@gmail.com</a>
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <i className="bi bi-clock-fill"></i>
                <div>
                  <p>Mon - Sat: 10:00 AM - 8:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal & Social Section */}
          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li>
                <Link to="/privacy-policy">
                  <i className="bi bi-chevron-right"></i> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions">
                  <i className="bi bi-chevron-right"></i> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/return-policy">
                  <i className="bi bi-chevron-right"></i> Return Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy">
                  <i className="bi bi-chevron-right"></i> Shipping Policy
                </Link>
              </li>
            </ul>

            <div className="footer-social">
              <h4 className="footer-title social-title">Follow Us</h4>
              <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                  <i className="bi bi-youtube"></i>
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Pinterest">
                  <i className="bi bi-pinterest"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              &copy; {currentYear} <span>Manikanta Jewellery Store</span>. All rights reserved.
            </p>
            <div className="footer-payment-icons">
              <i className="bi bi-credit-card-2-front-fill" title="Credit Card"></i>
              <i className="bi bi-credit-card-2-back-fill" title="Debit Card"></i>
              <i className="bi bi-bank" title="Net Banking"></i>
              <i className="bi bi-wallet2" title="Digital Wallet"></i>
              <i className="bi bi-phone" title="UPI"></i>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button 
        className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <i className="bi bi-chevron-up"></i>
      </button>
    </>
  );
};

export default Footer;