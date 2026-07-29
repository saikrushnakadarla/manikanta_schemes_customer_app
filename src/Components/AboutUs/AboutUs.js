import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">Crafting Dreams Since 1985</h1>
          <p className="about-hero-subtitle">
            Where tradition meets elegance in every piece of jewellery
          </p>
          <div className="about-hero-stats">
            <div className="stat-item">
              <span className="stat-number">40+</span>
              <span className="stat-label">Years of Excellence</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Jewellery Designs</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <div className="story-image-wrapper">
                <div className="story-image-placeholder">
                  <i className="bi bi-gem"></i>
                </div>
                <div className="story-image-overlay">
                  <span>Our Heritage</span>
                </div>
              </div>
            </div>
            <div className="story-content">
              <h2 className="section-title">Our Story</h2>
              <p className="story-text">
                For over four decades, we have been dedicated to creating exquisite 
                jewellery that celebrates life's most precious moments. Our journey 
                began with a simple vision - to bring the finest craftsmanship and 
                timeless elegance to every piece we create.
              </p>
              <p className="story-text">
                Today, we stand as a testament to Indian heritage and artistry, 
                combining traditional techniques with contemporary designs. Each 
                piece tells a story of passion, precision, and perfection.
              </p>
              <div className="story-features">
                <div className="feature">
                  <i className="bi bi-award-fill"></i>
                  <span>Certified Pure</span>
                </div>
                <div className="feature">
                  <i className="bi bi-gem-fill"></i>
                  <span>Hallmarked Jewellery</span>
                </div>
                <div className="feature">
                  <i className="bi bi-shield-check"></i>
                  <span>Trusted Since 1985</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <h2 className="section-title center">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <i className="bi bi-heart-fill"></i>
              </div>
              <h3>Passion for Craft</h3>
              <p>Every piece is crafted with love and attention to detail</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="bi bi-shield-fill-check"></i>
              </div>
              <h3>Trust & Transparency</h3>
              <p>100% certified and hallmarked jewellery with complete transparency</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="bi bi-star-fill"></i>
              </div>
              <h3>Excellence</h3>
              <p>Committed to delivering the highest quality in every product</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="container">
          <h2 className="section-title center">Meet Our Master Craftsmen</h2>
          <p className="team-subtitle">
            Behind every masterpiece is a team of dedicated artisans
          </p>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">RK</div>
              <h4>Rajesh Kumar</h4>
              <p>Master Jeweller - 35 Years</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">PS</div>
              <h4>Priya Sharma</h4>
              <p>Design Director - 20 Years</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">AV</div>
              <h4>Arjun Verma</h4>
              <p>Gemologist - 25 Years</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">SN</div>
              <h4>Sunita Nair</h4>
              <p>Senior Craftsman - 30 Years</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-why">
        <div className="container">
          <h2 className="section-title center">Why Choose Us</h2>
          <div className="why-grid">
            <div className="why-card">
              <i className="bi bi-gem"></i>
              <h4>Pure Gold</h4>
              <p>100% Hallmarked Gold with BIS certification</p>
            </div>
            <div className="why-card">
              <i className="bi bi-arrow-repeat"></i>
              <h4>Easy Exchange</h4>
              <p>100% exchange value with minimal making charges</p>
            </div>
            <div className="why-card">
              <i className="bi bi-truck"></i>
              <h4>Free Shipping</h4>
              <p>Complimentary shipping and insurance on all orders</p>
            </div>
            <div className="why-card">
              <i className="bi bi-headset"></i>
              <h4>Expert Support</h4>
              <p>Dedicated jewellery experts to guide you</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;