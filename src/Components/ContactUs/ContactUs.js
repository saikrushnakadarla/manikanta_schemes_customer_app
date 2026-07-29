import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './ContactUs.css';
import Swal from 'sweetalert2';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      Swal.fire({
        title: 'Thank You!',
        text: 'We will get back to you within 24 hours.',
        icon: 'success',
        confirmButtonColor: '#f6d365',
        confirmButtonText: 'Great!'
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="contact-page">
      <Navbar />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">Get in Touch</h1>
          <p className="contact-hero-subtitle">
            We'd love to hear from you. Reach out to us for any queries or assistance.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2 className="section-title">Contact Information</h2>
              <p className="contact-info-text">
                Visit our store or reach out to us through any of the channels below.
              </p>

              <div className="contact-details">
                <div className="contact-detail-item">
                  <div className="contact-icon-wrapper">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div>
                    <h4>Store Address</h4>
                    <p>123, Jewellery Street,</p>
                    <p>Diamond District,</p>
                    <p>Mumbai - 400001, India</p>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-icon-wrapper">
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                  <div>
                    <h4>Phone Numbers</h4>
                    <p><a href="tel:+919876543210">+91 98765 43210</a></p>
                    <p><a href="tel:+911234567890">+91 12345 67890</a></p>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-icon-wrapper">
                    <i className="bi bi-envelope-fill"></i>
                  </div>
                  <div>
                    <h4>Email Address</h4>
                    <p><a href="mailto:info@jewellerystore.com">info@jewellerystore.com</a></p>
                    <p><a href="mailto:support@jewellerystore.com">support@jewellerystore.com</a></p>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-icon-wrapper">
                    <i className="bi bi-clock-fill"></i>
                  </div>
                  <div>
                    <h4>Working Hours</h4>
                    <p>Monday - Saturday: 10:00 AM - 8:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <div className="contact-social">
                <h4>Follow Us</h4>
                <div className="social-icons">
                  <a href="#" className="social-link"><i className="bi bi-facebook"></i></a>
                  <a href="#" className="social-link"><i className="bi bi-instagram"></i></a>
                  <a href="#" className="social-link"><i className="bi bi-twitter"></i></a>
                  <a href="#" className="social-link"><i className="bi bi-youtube"></i></a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <h2 className="section-title">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Enter subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact-map">
        <div className="container">
          <div className="map-placeholder">
            <i className="bi bi-map-fill"></i>
            <p>Find us on Google Maps</p>
            <button className="map-btn">
              <i className="bi bi-geo-alt"></i> View on Google Maps
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;