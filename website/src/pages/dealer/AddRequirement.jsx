import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSpinner } from "react-icons/fa";

const AddRequirement = ({ user }) => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    subcategory_id: "",
    reqType: "Buy",
    location: "",
    budget: "",
    minBudget: "",
    maxBudget: "",
    description: ""
  });

  // Load Categories on mount
  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => {
        const catList = data.body || data.categories || data.data || [];
        if (data.success && catList.length > 0) {
          setCategories(catList);
          setFormData(prev => ({ ...prev, category_id: String(catList[0].id) }));
        }
      })
      .catch(err => {
        console.error("Categories fetch error:", err);
      });
  }, [API_BASE]);

  // Load Subcategories when category_id changes
  useEffect(() => {
    if (formData.category_id) {
      fetch(`${API_BASE}/subcategories?category_id=${formData.category_id}`)
        .then(res => res.json())
        .then(data => {
          const subList = data.body || data.subcategories || data.data || [];
          if (data.success && subList.length > 0) {
            setSubcategories(subList);
            setFormData(prev => ({ ...prev, subcategory_id: String(subList[0].id) }));
          } else {
            setSubcategories([]);
            setFormData(prev => ({ ...prev, subcategory_id: "" }));
          }
        })
        .catch(() => {
          setSubcategories([]);
          setFormData(prev => ({ ...prev, subcategory_id: "" }));
        });
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory_id: "" }));
    }
  }, [formData.category_id, API_BASE]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const storedUser = user || JSON.parse(localStorage.getItem("dealconnect_user") || "{}");
    const isDealer = storedUser.role === "dealer" || storedUser.role === 2 || storedUser.role === "2";

    const payload = {
      userId: storedUser.id || 1,
      user_id: isDealer ? 0 : (storedUser.id || 1),
      dealer_id: isDealer ? (storedUser.id || 1) : 0,
      role: isDealer ? "dealer" : "user",
      category_id: formData.category_id ? Number(formData.category_id) : null,
      subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : null,
      title: formData.title,
      location: formData.location,
      budget: formData.budget,
      minBudget: formData.minBudget ? Number(formData.minBudget) : 0,
      maxBudget: formData.maxBudget ? Number(formData.maxBudget) : 0,
      reqType: formData.reqType || "Buy",
      description: formData.description || ""
    };

    fetch(`${API_BASE}/add_requirement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
        if (data.success) {
          if (isDealer) {
            navigate("/dealer/my-requirements");
          } else {
            navigate("/requirements");
          }
        } else {
          setErrorMsg(data.message || "Failed to save requirement.");
        }
      })
      .catch(err => {
        setSubmitting(false);
        console.error("Add requirement error:", err);
        setErrorMsg("Server error while connecting to database.");
      });
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>Post Buyer Requirement</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Fill in category, subcategory, location, and budget details to save to database
        </p>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit}>
          
          {/* Title */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={labelStyle}>Requirement Title *</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Need 3 BHK Flat in Sonipat Sector 14" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              style={inputStyle} 
            />
          </div>

          {/* Category & Subcategory */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select 
                value={formData.category_id} 
                onChange={e => setFormData({ ...formData, category_id: e.target.value })} 
                style={inputStyle}
              >
                {categories.length === 0 ? (
                  <option value="">Select Category</option>
                ) : (
                  categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Subcategory</label>
              <select 
                value={formData.subcategory_id} 
                onChange={e => setFormData({ ...formData, subcategory_id: e.target.value })} 
                style={inputStyle}
              >
                {subcategories.length === 0 ? (
                  <option value="">Select Subcategory</option>
                ) : (
                  subcategories.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Requirement Type & Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Requirement Type</label>
              <select 
                value={formData.reqType} 
                onChange={e => setFormData({ ...formData, reqType: e.target.value })} 
                style={inputStyle}
              >
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
                <option value="Lease">Lease</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Location / Preferred Area *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Model Town, Sonipat, Haryana" 
                value={formData.location} 
                onChange={e => setFormData({ ...formData, location: e.target.value })} 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Budget Range & Min/Max */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Budget Display *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. 50 Lakh - 75 Lakh" 
                value={formData.budget} 
                onChange={e => setFormData({ ...formData, budget: e.target.value })} 
                style={inputStyle} 
              />
            </div>

            <div>
              <label style={labelStyle}>Min Budget (₹)</label>
              <input 
                type="number" 
                placeholder="5000000" 
                value={formData.minBudget} 
                onChange={e => setFormData({ ...formData, minBudget: e.target.value })} 
                style={inputStyle} 
              />
            </div>

            <div>
              <label style={labelStyle}>Max Budget (₹)</label>
              <input 
                type="number" 
                placeholder="7500000" 
                value={formData.maxBudget} 
                onChange={e => setFormData({ ...formData, maxBudget: e.target.value })} 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Additional Notes / Specifications</label>
            <textarea 
              rows="3" 
              placeholder="e.g. Facing north, park facing, ready to move..." 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              style={inputStyle}
            ></textarea>
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.85rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.25rem" }}>
              ❌ {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting} 
            className="btn-primary" 
            style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "1rem", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? <FaSpinner className="spin" /> : <FaPlus />} {submitting ? "Saving to Database..." : "Post Requirement"}
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

export default AddRequirement;
