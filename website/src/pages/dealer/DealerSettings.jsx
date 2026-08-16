import React, { useState, useEffect } from "react";
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaLock, FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const DealerSettings = ({ user, setUser }) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [name, setName] = useState(user?.name || "");
  const [company, setCompany] = useState(user?.company || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.mobile_no || user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || user?.image || "");

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading & Alert states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passSubmitting, setPassSubmitting] = useState(false);

  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passErrorMsg, setPassErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setCompany(user.company || (user.name ? `${user.name} Realty` : ""));
      setEmail(user.email || "");
      setPhone(user.mobile_no || user.phone || "");
      setAvatar(user.avatar || user.image || "");
    }
  }, [user]);

  // Handle Avatar Image File Upload from computer
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_BASE}/fileUpload`, {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setUploadingImage(false);
        if (data.success && data.body?.file) {
          const serverPath = data.body.file;
          const fullUrl = serverPath.startsWith("http") ? serverPath : `http://localhost:5000${serverPath}`;
          setAvatar(fullUrl);
        } else {
          setErrorMsg(data.message || "Failed to upload image.");
        }
      })
      .catch(err => {
        setUploadingImage(false);
        console.error("Avatar upload error:", err);
        setErrorMsg("Failed to connect to backend upload service.");
      });
  };

  // Submit Dealer Profile Update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setMsg("");
    setErrorMsg("");
    setProfileSubmitting(true);

    const userId = user?.id || JSON.parse(localStorage.getItem("dealconnect_user") || "{}").id || 1;

    const payload = {
      userId,
      name,
      company,
      email,
      phone,
      mobile_no: phone,
      image: avatar,
      profileImage: avatar
    };

    fetch(`${API_BASE}/edit_profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setProfileSubmitting(false);
        if (data.success || data.code === 200) {
          const updatedUser = {
            ...(user || {}),
            id: userId,
            name,
            company,
            email,
            mobile_no: phone,
            phone,
            avatar,
            image: avatar
          };
          if (setUser) setUser(updatedUser);
          localStorage.setItem("dealconnect_user", JSON.stringify(updatedUser));
          setMsg("✓ Dealer settings updated successfully in database!");
        } else {
          setErrorMsg(data.message || "Failed to update profile settings.");
        }
      })
      .catch(err => {
        setProfileSubmitting(false);
        console.error("Edit profile error:", err);
        setErrorMsg("Server error while updating profile.");
      });
  };

  // Submit Password Change
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPassMsg("");
    setPassErrorMsg("");

    if (!oldPassword) {
      setPassErrorMsg("Current password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErrorMsg("New password and confirm password do not match!");
      return;
    }

    if (newPassword.length < 6) {
      setPassErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    setPassSubmitting(true);
    const userId = user?.id || JSON.parse(localStorage.getItem("dealconnect_user") || "{}").id || 1;

    fetch(`${API_BASE}/change_password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        old_password: oldPassword,
        new_password: newPassword
      })
    })
      .then(res => res.json())
      .then(data => {
        setPassSubmitting(false);
        if (data.success || data.code === 200) {
          setPassMsg("✓ Password updated successfully!");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          setPassErrorMsg(data.message || "Failed to update password.");
        }
      })
      .catch(err => {
        setPassSubmitting(false);
        console.error("Change password error:", err);
        setPassErrorMsg("Server error while changing password.");
      });
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>Dealer Settings & Profile</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Manage your agency account details, contact info, profile image and password</p>
      </div>

      {/* PROFILE SETTINGS CARD */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FaUser color="var(--primary)" /> Profile Information
        </h2>

        {msg && (
          <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "0.85rem 1rem", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <FaCheckCircle /> {msg}
          </div>
        )}

        {errorMsg && (
          <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.85rem 1rem", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <FaExclamationTriangle /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          {/* Avatar Picture Box */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", padding: "1rem", backgroundColor: "var(--bg-main)", borderRadius: "12px" }}>
            <img 
              src={avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"} 
              alt="Avatar Preview" 
              style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }} 
            />

            <div>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--primary-light)", color: "var(--primary)", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer", border: "1px dashed var(--primary)" }}>
                {uploadingImage ? <FaSpinner className="spin" /> : <FaUpload />} 
                {uploadingImage ? "Uploading..." : "Change Profile Photo"}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarSelect} 
                  style={{ display: "none" }} 
                />
              </label>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>JPG, PNG or WEBP (Max 5MB)</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            {/* Dealer Name */}
            <div>
              <label style={labelStyle}>Dealer Name *</label>
              <div style={{ position: "relative" }}>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  style={inputStyle} 
                />
              </div>
            </div>

            {/* Company / Agency Name */}
            <div>
              <label style={labelStyle}>Company / Agency Name *</label>
              <input 
                type="text" 
                required 
                value={company} 
                onChange={e => setCompany(e.target.value)} 
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
            {/* Email Address */}
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={inputStyle} 
              />
            </div>

            {/* Mobile / Phone Number */}
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input 
                type="text" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                style={inputStyle} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={profileSubmitting} 
            className="btn-primary" 
            style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem", opacity: profileSubmitting ? 0.7 : 1 }}
          >
            {profileSubmitting ? <FaSpinner className="spin" /> : "Save Profile Changes"}
          </button>
        </form>
      </div>

      {/* SECURITY / CHANGE PASSWORD CARD */}
      <div className="card" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FaLock color="var(--primary)" /> Change Security Password
        </h2>

        {passMsg && (
          <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "0.85rem 1rem", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <FaCheckCircle /> {passMsg}
          </div>
        )}

        {passErrorMsg && (
          <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.85rem 1rem", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <FaExclamationTriangle /> {passErrorMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={labelStyle}>Current Password *</label>
            <input 
              type="password" 
              placeholder="Enter current password" 
              value={oldPassword} 
              onChange={e => setOldPassword(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={labelStyle}>New Password *</label>
              <input 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                style={inputStyle} 
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm New Password *</label>
              <input 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                style={inputStyle} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={passSubmitting} 
            className="btn-primary" 
            style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem", opacity: passSubmitting ? 0.7 : 1 }}
          >
            {passSubmitting ? <FaSpinner className="spin" /> : "Update Password"}
          </button>
        </form>
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

export default DealerSettings;
