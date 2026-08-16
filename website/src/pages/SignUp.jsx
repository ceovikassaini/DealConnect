import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBuilding, FaUserTie, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const SignUp = ({ setUser }) => {
  const [role, setRole] = useState("dealer"); // dealer or user
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("password123");
  const [confirmPassword, setConfirmPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    setLoading(true);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

    fetch(`${API_BASE}/signUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || (role === "dealer" ? "New Dealer" : "Individual User"),
        email,
        password,
        phone,
        role
      })
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
        const userObj = data.body || data.user;
        if (data.success && userObj) {
          if (userObj.token) {
            localStorage.setItem("token", userObj.token);
          }
          localStorage.setItem("user", JSON.stringify(userObj));
          setUser(userObj);
          if (userObj.role === "dealer") {
            navigate("/dealer/dashboard");
          } else {
            navigate("/user/dashboard");
          }
        } else {
          setErrorMsg(data.message || data.msg || "Registration failed.");
        }
      })
      .catch(err => {
        setLoading(false);
        setErrorMsg("Database registration error: " + err.message);
      });
  };

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="card" style={{ maxWidth: "460px", width: "100%", padding: "2.5rem", borderRadius: "20px" }}>
        {errorMsg && (
          <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.75rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.5rem" }}>
            ❌ {errorMsg}
          </div>
        )}

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            margin: "0 auto 1rem auto"
          }}>
            <FaBuilding size={24} />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800" }}>Create Your Account</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Register as a Dealer or User</p>
        </div>

        {/* Role Toggle Selector */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
          backgroundColor: "var(--bg-main)",
          padding: "0.3rem",
          borderRadius: "12px",
          marginBottom: "1.5rem"
        }}>
          <button
            type="button"
            onClick={() => setRole("dealer")}
            style={{
              padding: "0.6rem",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.85rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              backgroundColor: role === "dealer" ? "var(--primary)" : "transparent",
              color: role === "dealer" ? "#ffffff" : "var(--text-muted)"
            }}
          >
            <FaUserTie /> Dealer Account
          </button>

          <button
            type="button"
            onClick={() => setRole("user")}
            style={{
              padding: "0.6rem",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.85rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              backgroundColor: role === "user" ? "var(--primary)" : "transparent",
              color: role === "user" ? "#ffffff" : "var(--text-muted)"
            }}
          >
            <FaUser /> User Account
          </button>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === "dealer" ? "Amit Sharma" : "Rahul Verma"}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@dealconnect.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Mobile Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98123 45678"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <FaLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "42px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <FaLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "42px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "1rem" }}>
            {loading ? "Creating Account..." : `Sign Up as ${role === "dealer" ? "Dealer" : "User"}`}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
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

export default SignUp;
