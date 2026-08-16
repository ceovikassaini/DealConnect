import React from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaPaperPlane, FaHeart } from "react-icons/fa";

const Footer = () => {
  return (
    <footer style={{ backgroundColor: "#0f172a", color: "#94a3b8", paddingTop: "4rem", paddingBottom: "2rem" }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2.5rem",
          marginBottom: "3.5rem"
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{
                width: "38px",
                height: "38px",
                background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff"
              }}>
                <FaBuilding size={20} />
              </div>
              <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "#ffffff" }}>DealConnect</span>
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.25rem" }}>
              India's leading property dealer network platform. Connect, match requirements and close more deals faster.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a href="#fb" style={socialIconStyle}><FaFacebookF /></a>
              <a href="#insta" style={socialIconStyle}><FaInstagram /></a>
              <a href="#in" style={socialIconStyle}><FaLinkedinIn /></a>
              <a href="#yt" style={socialIconStyle}><FaYoutube /></a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "1rem", marginBottom: "1.25rem" }}>Platform</h4>
            <ul style={linkListStyle}>
              <li><Link to="/properties" style={footerLinkStyle}>Properties</Link></li>
              <li><Link to="/requirements" style={footerLinkStyle}>Requirements</Link></li>
              <li><Link to="/deals" style={footerLinkStyle}>Deals</Link></li>
              <li><Link to="/dealers" style={footerLinkStyle}>Dealers</Link></li>
              <li><Link to="/pricing" style={footerLinkStyle}>Pricing</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "1rem", marginBottom: "1.25rem" }}>Company</h4>
            <ul style={linkListStyle}>
              <li><Link to="/about" style={footerLinkStyle}>About Us</Link></li>
              <li><Link to="/#how-it-works" style={footerLinkStyle}>How It Works</Link></li>
              <li><Link to="/#testimonials" style={footerLinkStyle}>Success Stories</Link></li>
              <li><Link to="/blogs" style={footerLinkStyle}>Blog</Link></li>
              <li><Link to="/contact" style={footerLinkStyle}>Contact Us</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "1rem", marginBottom: "1.25rem" }}>Resources</h4>
            <ul style={linkListStyle}>
              <li><Link to="/faq" style={footerLinkStyle}>Help Center</Link></li>
              <li><Link to="/blogs" style={footerLinkStyle}>Guides</Link></li>
              <li><Link to="/privacy" style={footerLinkStyle}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={footerLinkStyle}>Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "1rem", marginBottom: "1.25rem" }}>Newsletter</h4>
            <p style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
              Subscribe to get updates about new features and offers.
            </p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: "0.5rem" }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                style={{
                  flex: 1,
                  padding: "0.6rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  backgroundColor: "#1e293b",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
              <button 
                type="submit" 
                style={{
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  padding: "0.6rem 1rem",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: "1px solid #1e293b",
          paddingTop: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.85rem"
        }}>
          <div>© 2026 DealConnect. All rights reserved.</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Made with <FaHeart color="#ef4444" /> for Property Dealers
          </div>
        </div>
      </div>
    </footer>
  );
};

const linkListStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem"
};

const footerLinkStyle = {
  color: "#94a3b8",
  textDecoration: "none",
  fontSize: "0.9rem",
  transition: "color 0.2s"
};

const socialIconStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#1e293b",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.85rem",
  transition: "all 0.2s"
};

export default Footer;
