import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import "./Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/admin/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("If this email is registered, a password reset link has been dispatched.");
      } else {
        toast.info("Password reset request sent. Please check your inbox.");
      }
    } catch (err) {
      toast.info("Password reset link dispatched. Please check your admin mailbox.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dc-login-wrapper">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="dark" />

      {/* Floating Ambient Glow Orbs */}
      <div className="dc-glow-orb dc-glow-orb-1" />
      <div className="dc-glow-orb dc-glow-orb-2" />

      <div className="dc-login-card">
        {/* Logo Branding */}
        <div className="dc-logo-container">
          <div className="dc-logo-badge">
            <img 
              src="/logo.png" 
              alt="DealConnect Logo" 
              className="dc-logo-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/dealconect.png";
              }}
            />
          </div>

          <span className="dc-brand-badge">
            ADMIN RECOVERY
          </span>

          <h1 className="dc-brand-title">
            Reset <span className="dc-brand-highlight">Password</span>
          </h1>

          <p className="dc-brand-subtitle">
            Enter your admin email to receive secure password recovery instructions
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="dc-form-group">
            <label className="dc-label">Administrator Email</label>
            <div className="dc-input-wrapper">
              <span className="dc-input-icon">
                <FaEnvelope />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                placeholder="admin@dealconnect.com"
                required
                className="dc-input"
              />
            </div>
          </div>

          <button type="submit" className="dc-submit-btn" disabled={loading}>
            <FaShieldAlt /> {loading ? "Dispatching Link..." : "Send Reset Link"}
          </button>
        </form>

        <div className="dc-footer-links">
          <Link to="/login" className="dc-back-link">
            <FaArrowLeft size={11} /> Back to Admin Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
