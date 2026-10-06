import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './ShippingPolicy.css';

function ShippingPolicy() {
  return (
    <div className="shipping-policy-page">
      <Navbar />

      {/* Hero Section */}
      <section className="shipping-hero">
        <div className="shipping-hero-content">
          <h1 className="shipping-hero-title">Shipping Policy</h1>
          <p className="shipping-hero-subtitle">
            Fast, secure, and insured delivery across India via DCTC Courier
          </p>
        </div>
      </section>

      {/* Shipping Content */}
      <section className="shipping-content-section">
        <div className="container">
          <div className="shipping-content">

            {/* Highlights */}
            <div className="shipping-highlights">
              <div className="highlight-card">
                <div className="highlight-icon">
                  <i className="bi bi-truck"></i>
                </div>
                <h4>DCTC Courier</h4>
                <p>Trusted shipping partner</p>
              </div>
              <div className="highlight-card">
                <div className="highlight-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h4>Fully Insured</h4>
                <p>Every shipment protected</p>
              </div>
              <div className="highlight-card">
                <div className="highlight-icon">
                  <i className="bi bi-box-seam"></i>
                </div>
                <h4>Secure Packaging</h4>
                <p>Tamper-proof packing</p>
              </div>
            </div>

            {/* Introduction */}
            <div className="shipping-block">
              <h2 className="section-title">Our Shipping Partner</h2>
              <p>
                At <strong>Manikanta Jewellers</strong>, we understand that your 
                jewellery is precious and irreplaceable. To ensure your order 
                reaches you safely and securely, we have partnered exclusively 
                with <strong>DCTC Courier</strong> — a trusted name in logistics 
                known for its reliable, trackable, and insured delivery services 
                across India.
              </p>
              <p>
                Every order is carefully packed, fully insured, and dispatched 
                through DCTC Courier with real-time tracking so you can follow 
                your jewellery every step of the way.
              </p>
            </div>

            {/* Shipping Coverage */}
            <div className="shipping-block">
              <h2 className="section-title">Shipping Coverage</h2>
              <ul className="shipping-list">
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Pan-India Delivery:</strong> We ship to all major 
                    cities, towns, and pin codes serviceable by DCTC Courier.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Serviceable Pin Codes:</strong> Please verify that 
                    your delivery pin code is covered by DCTC Courier before 
                    placing an order.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Store Pickup:</strong> You are always welcome to 
                    collect your order directly from our store in Belur.
                  </span>
                </li>
              </ul>
            </div>

            {/* Processing Time */}
            <div className="shipping-block">
              <h2 className="section-title">Order Processing Time</h2>
              <p>
                Since every piece of jewellery at Manikanta Jewellers is 
                <strong> meticulously handcrafted</strong>, we require some time 
                to prepare your order with the care it deserves.
              </p>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-badge">1</div>
                  <div className="timeline-content">
                    <h4>Order Confirmation</h4>
                    <p>Within 24 hours of placing your order, we confirm the details via call or email.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-badge">2</div>
                  <div className="timeline-content">
                    <h4>Crafting & Quality Check</h4>
                    <p>Your jewellery is handcrafted, polished, and quality-checked (2–5 business days).</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-badge">3</div>
                  <div className="timeline-content">
                    <h4>Secure Packaging</h4>
                    <p>Packed in tamper-proof, insured packaging with certification documents.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-badge">4</div>
                  <div className="timeline-content">
                    <h4>Dispatch via DCTC Courier</h4>
                    <p>Handed over to DCTC Courier with a tracking ID shared via SMS/email.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="shipping-block">
              <h2 className="section-title">Estimated Delivery Time</h2>
              <div className="delivery-table">
                <div className="delivery-row">
                  <span className="delivery-region">Karnataka (within state)</span>
                  <span className="delivery-time">2 – 4 business days</span>
                </div>
                <div className="delivery-row">
                  <span className="delivery-region">South India</span>
                  <span className="delivery-time">3 – 6 business days</span>
                </div>
                <div className="delivery-row">
                  <span className="delivery-region">Rest of India</span>
                  <span className="delivery-time">5 – 8 business days</span>
                </div>
                <div className="delivery-row">
                  <span className="delivery-region">Remote / Rural Pin Codes</span>
                  <span className="delivery-time">7 – 10 business days</span>
                </div>
              </div>
              <p className="delivery-note">
                <i className="bi bi-info-circle-fill"></i>
                Delivery timelines are estimates provided by DCTC Courier and may 
                vary due to weather, festivals, or unforeseen circumstances.
              </p>
            </div>

            {/* Shipping Charges */}
            <div className="shipping-block">
              <h2 className="section-title">Shipping Charges</h2>
              <ul className="shipping-list">
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Free Shipping:</strong> Complimentary shipping on 
                    all prepaid orders above a minimum value.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Standard Charges:</strong> A nominal shipping fee 
                    applies to smaller orders, calculated at checkout based on 
                    your location.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Insurance:</strong> All shipments are fully insured 
                    at no extra cost — your jewellery is protected until delivery.
                  </span>
                </li>
              </ul>
            </div>

            {/* Tracking */}
            <div className="shipping-block">
              <h2 className="section-title">Order Tracking</h2>
              <p>
                Once your order is dispatched through <strong>DCTC Courier</strong>, 
                you will receive a tracking number via SMS and email. You can use 
                this tracking ID on the DCTC Courier website to monitor your 
                shipment in real time.
              </p>
              <div className="tracking-box">
                <i className="bi bi-geo-alt-fill"></i>
                <div>
                  <h4>Real-Time Tracking</h4>
                  <p>
                    Track your order anytime using the DCTC Courier tracking 
                    portal. For any assistance, our team is just a call away.
                  </p>
                </div>
              </div>
            </div>

            {/* Receiving Delivery */}
            <div className="shipping-block">
              <h2 className="section-title">Receiving Your Delivery</h2>
              <ul className="shipping-list">
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    Please ensure someone is available at the delivery address 
                    to receive the parcel.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Photo ID Required:</strong> The delivery agent may 
                    ask for a valid government-issued photo ID for verification.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    <strong>Inspect Before Signing:</strong> Kindly check the 
                    outer packaging for tampering before accepting the delivery.
                  </span>
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>
                    If the package appears damaged, please refuse delivery and 
                    contact us immediately.
                  </span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="shipping-block contact-block">
              <h2 className="section-title">Need Help With Shipping?</h2>
              <p>
                If you have any questions about your shipment, delivery timelines, 
                or DCTC Courier serviceability, please reach out to us:
              </p>
              <div className="shipping-contact-info">
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

export default ShippingPolicy;