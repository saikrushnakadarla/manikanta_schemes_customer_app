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
          <h1 className="about-hero-title">Crafting Dreams Since 2026</h1>
          <p className="about-hero-subtitle">
            Where contemporary style meets traditional heritage
          </p>
          <div className="about-hero-stats">
            <div className="stat-item">
              <span className="stat-number">1+</span>
              <span className="stat-label">Years of Craftsmanship</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Unique Designs</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">1K+</span>
              <span className="stat-label">Cherished Heirlooms</span>
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
                Manikanta Jewellers is a distinguished jewellery brand based in Belur, 
                celebrated for its exceptional craftsmanship and timeless elegance. 
                The brand seamlessly blends contemporary style with traditional heritage, 
                creating wearable pieces of art that honor passion and individuality.
              </p>
              <p className="story-text">
                Each piece is meticulously handcrafted, reflecting intricate details 
                and skilled artistry, designed for the modern individual who embraces 
                their unique style. Our collections transcend fleeting fashion trends, 
                offering enduring elegance that resonates with personal expression.
              </p>
              <p className="story-text">
                The brand's commitment to quality and personalized attention ensures 
                that every creation becomes a cherished heirloom, symbolizing unbreakable 
                bonds and significant milestones. We invite you to embark on a journey 
                of self-discovery and self-expression through our exquisite jewellery offerings.
              </p>
              <div className="story-features">
                <div className="feature">
                  <i className="bi bi-award-fill"></i>
                  <span>Handcrafted Artistry</span>
                </div>
                <div className="feature">
                  <i className="bi bi-gem-fill"></i>
                  <span>Timeless Elegance</span>
                </div>
                <div className="feature">
                  <i className="bi bi-shield-check"></i>
                  <span>Heirloom Quality</span>
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
              <p>Every piece is meticulously handcrafted with intricate details and skilled artistry</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="bi bi-shield-fill-check"></i>
              </div>
              <h3>Quality & Trust</h3>
              <p>Commitment to quality and personalized attention ensures every creation is a cherished heirloom</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="bi bi-star-fill"></i>
              </div>
              <h3>Timeless Elegance</h3>
              <p>Collections that transcend fleeting fashion trends, offering enduring elegance</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="bi bi-person-fill"></i>
              </div>
              <h3>Individual Expression</h3>
              <p>Designed for the modern individual who embraces their unique style and personal expression</p>
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
              <p>Master Jeweller</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">PS</div>
              <h4>Priya Sharma</h4>
              <p>Design Director</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">AV</div>
              <h4>Arjun Verma</h4>
              <p>Gemologist</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">SN</div>
              <h4>Sunita Nair</h4>
              <p>Senior Craftsman</p>
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
              <h4>Handcrafted Excellence</h4>
              <p>Each piece meticulously handcrafted with intricate details</p>
            </div>
            <div className="why-card">
              <i className="bi bi-arrow-repeat"></i>
              <h4>Timeless Designs</h4>
              <p>Collections that transcend fleeting fashion trends</p>
            </div>
            <div className="why-card">
              <i className="bi bi-truck"></i>
              <h4>Personalized Service</h4>
              <p>Commitment to quality and personalized attention for every client</p>
            </div>
            <div className="why-card">
              <i className="bi bi-headset"></i>
              <h4>Cherished Heirlooms</h4>
              <p>Every creation becomes a cherished heirloom for significant milestones</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Store CTA */}
      {/* <section className="about-visit">
        <div className="container">
          <div className="visit-content">
            <h2>Visit Our Store</h2>
            <p>
              Immerse yourself in the beauty of our handcrafted designs and 
              experience the impeccable craftsmanship firsthand.
            </p>
            <button className="visit-btn">Find Us in Belur</button>
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
  );
};

export default AboutUs;