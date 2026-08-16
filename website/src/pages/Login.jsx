import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaBuilding, FaLock, FaEnvelope, FaUserTie, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = ({ setUser }) => {
  const [searchParams] = useSearchParams();
  const msg = searchParams.get("msg");
  const [role, setRole] = useState("dealer"); // dealer or user
  const [email, setEmail] = useState("amit@sharmarealty.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setErrorMsg("");
    if (selectedRole === "dealer") {
      setEmail("amit@sharmarealty.com");
    } else {
      setEmail("buyer.user@example.com");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

    fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
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
          setErrorMsg(data.message || data.msg || "Invalid credentials.");
        }
      })
      .catch(err => {
        setLoading(false);
        setErrorMsg(err.message || "Database connection error.");
      });
  };

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="card" style={{ maxWidth: "440px", width: "100%", padding: "2.5rem", borderRadius: "20px" }}>
        {msg === "login_required" && (
          <div style={{ backgroundColor: "#fef3c7", color: "#d97706", padding: "0.75rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.5rem" }}>
            🔒 Please login or sign up to add a property or requirement!
          </div>
        )}

        {errorMsg && (
          <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.85rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.5rem" }}>
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
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800" }}>Welcome Back!</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Log in to access your account</p>
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
            onClick={() => handleRoleChange("dealer")}
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
            onClick={() => handleRoleChange("user")}
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

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
              <FaEnvelope style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dealer@dealconnect.com"
                style={{ ...inputStyle, paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <FaLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "1rem" }}>
            {loading ? "Authenticating..." : `Log In as ${role === "dealer" ? "Dealer" : "User"}`}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
            Sign Up
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

export default Login;
