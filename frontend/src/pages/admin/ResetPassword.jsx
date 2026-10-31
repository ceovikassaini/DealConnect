import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaLock, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import "./Login.css";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 5) {
      toast.error("Password must be at least 5 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/admin/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("resetpass", "1");
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (err) {
      toast.error("An error occurred during password reset");
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
            CREDENTIAL SECURITY
          </span>

          <h1 className="dc-brand-title">
            Set New <span className="dc-brand-highlight">Password</span>
          </h1>

          <p className="dc-brand-subtitle">
            Enter your new secure administrator password below
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="dc-form-group">
            <label className="dc-label">New Password</label>
            <div className="dc-input-wrapper">
              <span className="dc-input-icon">
                <FaLock />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter at least 5 characters"
                required
                className="dc-input"
              />
            </div>
          </div>

          <button type="submit" className="dc-submit-btn" disabled={loading}>
            <FaShieldAlt /> {loading ? "Updating..." : "Update Password"}
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

export default ResetPassword;
