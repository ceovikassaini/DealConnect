import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

    fetch(`${API_BASE}/forgotPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then(async (res) => {
        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await res.json() : null;
        if (!res.ok) {
          const err = (data && (data.message || data.msg)) || `Error ${res.status}: ${res.statusText}`;
          throw new Error(err);
        }
        return data;
      })
      .then(data => {
        setLoading(false);
        if (data.success) {
          setSent(true);
        } else {
          setErrorMsg(data.message || data.msg || "Failed to send reset link.");
        }
      })
      .catch(err => {
        setLoading(false);
        setErrorMsg(err.message || "Server error.");
      });
  };

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="card" style={{ maxWidth: "400px", width: "100%", padding: "2.5rem", borderRadius: "20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>Forgot Password?</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Enter your registered email address to receive password reset instructions.
        </p>

        {errorMsg && (
          <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.75rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.5rem" }}>
            ❌ {errorMsg}
          </div>
        )}

        {sent ? (
          <div style={{ backgroundColor: "var(--primary-light)", padding: "1rem", borderRadius: "12px", color: "var(--primary)", fontWeight: "600" }}>
            Reset link sent to your email!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1.25rem", padding: "0.75rem" }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600" }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
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

export default ForgotPassword;
