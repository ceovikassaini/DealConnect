import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "4rem 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>Get In Touch With Us</h1>
          <p style={{ color: "var(--text-muted)" }}>Have questions or need assistance? Our support team is here to help.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2.5rem" }}>
          {/* Contact Info */}
          <div>
            <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={iconBoxStyle}><FaPhoneAlt color="var(--primary)" /></div>
                <div>
                  <strong style={{ display: "block" }}>Phone Number</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>+91 98123 45678 / +91 11 4567 8900</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={iconBoxStyle}><FaEnvelope color="var(--primary)" /></div>
                <div>
                  <strong style={{ display: "block" }}>Email Address</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>support@dealconnect.in</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={iconBoxStyle}><FaMapMarkerAlt color="var(--primary)" /></div>
                <div>
                  <strong style={{ display: "block" }}>Headquarters</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Sector 14 Main Market, Sonipat, Haryana 131001</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card" style={{ padding: "2rem" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <h3 style={{ color: "var(--primary)", fontSize: "1.5rem", fontWeight: "700" }}>Message Sent!</h3>
                <p style={{ color: "var(--text-muted)" }}>Thank you for reaching out. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1.25rem" }}>Send a Message</h3>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" required placeholder="Your Name" style={inputStyle} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" required placeholder="name@example.com" style={inputStyle} />
                </div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={labelStyle}>Message</label>
                  <textarea rows="4" required placeholder="How can we help you?" style={inputStyle}></textarea>
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  <FaPaperPlane /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const iconBoxStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  backgroundColor: "var(--primary-light)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.1rem"
};

const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: "700",
  marginBottom: "0.4rem",
  color: "var(--text-muted)"
};

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-main)",
  color: "var(--text-main)",
  fontSize: "0.9rem",
  outline: "none"
};

export default ContactUs;
