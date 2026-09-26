import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash, FaImage, FaUpload, FaSpinner, FaCrown, FaLock, FaHandshake } from "react-icons/fa";

const AddProperty = ({ user }) => {
  const navigate = useNavigate();

  if (!user?.isSubscribed) {
    return (
      <div style={{ maxWidth: "680px", margin: "3rem auto", textAlign: "center", padding: "2.5rem", backgroundColor: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem auto" }}>
          <FaCrown size={30} />
        </div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.75rem" }}>
          Subscription Plan Required
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: "1.6", marginBottom: "1.75rem" }}>
          Ager tuhasnu ya dealer nu property dekhani / post karni hai, ta pehla subscription plan laine pane. Subscribe now to showcase unlimited properties to verified buyers and dealers!
        </p>
        <button onClick={() => navigate("/pricing")} className="btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1rem", margin: "0 auto", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <FaCrown /> Buy Subscription Plan Now
        </button>
      </div>
    );
  }

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category_id: "1",
    subcategory_id: "1",
    user_id: user?.id || "1",
    price: "",
    location: "",
    area: "",
    height: "60",
    width: "15",
    facing: "Road Facing",
    society: "",
    flat_no: "",
    other_details: "",
    description: "",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
    ]
  });

  const [dealerReq, setDealerReq] = useState({
    commission_percent: "2.0",
    possession_time: "Immediate",
    preferred_buyer: "Any Buyer",
    dealer_notes: ""
  });

  const [newImageUrl, setNewImageUrl] = useState("");

  // Load Categories on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then(res => res.json())
      .then(data => {
        const catList = data.body || data.categories || data.data || [];
        if (data.success && catList.length > 0) {
          setCategories(catList);
          setFormData(prev => ({ ...prev, category_id: String(catList[0].id) }));
        } else {
          setCategories([
            { id: 1, name: "Plot / Land" },
            { id: 2, name: "Flat / Apartment" },
            { id: 3, name: "Commercial Shop" },
            { id: 4, name: "Kothi / Villa" }
          ]);
        }
      })
      .catch(() => {
        setCategories([
          { id: 1, name: "Plot / Land" },
          { id: 2, name: "Flat / Apartment" },
          { id: 3, name: "Commercial Shop" },
          { id: 4, name: "Kothi / Villa" }
        ]);
      });
  }, []);

  // Load Subcategories when Category changes
  useEffect(() => {
    if (formData.category_id) {
      fetch(`http://localhost:5000/api/subcategories?category_id=${formData.category_id}`)
        .then(res => res.json())
        .then(data => {
          const subList = data.body || data.subcategories || data.data || [];
          if (data.success && subList.length > 0) {
            setSubcategories(subList);
            setFormData(prev => ({ ...prev, subcategory_id: String(subList[0].id) }));
          } else {
            setSubcategories([]);
          }
        })
        .catch(() => {
          setSubcategories([
            { id: 1, name: "Residential Plot" },
            { id: 2, name: "Commercial Land" }
          ]);
        });
    }
  }, [formData.category_id]);

  // Upload computer file(s) to backend public/uploads
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append("images", files[i]);
    }

    fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: data
    })
      .then(res => res.json())
      .then(resData => {
        setUploading(false);
        if (resData.success && resData.urls) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...resData.urls]
          }));
        }
      })
      .catch((err) => {
        setUploading(false);
        console.error("Upload error:", err);
      });
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const payload = {
      ...formData,
      name: formData.title,
      category_id: parseInt(formData.category_id, 10),
      subcategory_id: parseInt(formData.subcategory_id, 10),
      dealerId: user?.id || 1,
      user_id: user?.id || 1,
      height: parseInt(formData.height, 10) || 0,
      width: parseInt(formData.width, 10) || 0,
      dealerName: user?.company || user?.name || "Sharma Associates",
      dealerPhone: user?.mobile_no || user?.phone || "+919812345678",
      dealerRequirement: {
        commission_percent: parseFloat(dealerReq.commission_percent) || 2.0,
        possession_time: dealerReq.possession_time || "Immediate",
        preferred_buyer: dealerReq.preferred_buyer || "Any Buyer",
        dealer_notes: dealerReq.dealer_notes || ""
      }
    };

    fetch("http://localhost:5000/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
        if (data.success) {
          navigate("/dealer/my-properties");
        } else {
          setSubmitError(data.message || "Failed to save property to database.");
        }
      })
      .catch(err => {
        setSubmitting(false);
        console.error("Property submit error:", err);
        setSubmitError("Server error while connecting to database.");
      });
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>Add New Property</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Select computer image files to upload directly to backend public folder</p>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit}>
          {/* Property Title / Name */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={labelStyle}>Property Title / Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. 100 Sq. Yd. Residential Plot" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              style={inputStyle} 
            />
          </div>

          {/* Category & Subcategory */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select 
                value={formData.category_id} 
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} 
                style={inputStyle}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Subcategory</label>
              <select 
                value={formData.subcategory_id} 
                onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })} 
                style={inputStyle}
              >
                {subcategories.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dimensions (Height & Width in feet) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Height (Foot)</label>
              <input 
                type="number" 
                placeholder="60" 
                value={formData.height} 
                onChange={(e) => setFormData({ ...formData, height: e.target.value })} 
                style={inputStyle} 
              />
            </div>

            <div>
              <label style={labelStyle}>Width (Foot)</label>
              <input 
                type="number" 
                placeholder="15" 
                value={formData.width} 
                onChange={(e) => setFormData({ ...formData, width: e.target.value })} 
                style={inputStyle} 
              />
            </div>

            <div>
              <label style={labelStyle}>Price (numeric e.g. 38.5 Lakh / 1.25 Cr)</label>
              <input 
                type="text" 
                required 
                placeholder="38.5 Lakh or 3850000" 
                value={formData.price} 
                onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Location & Area */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Location</label>
              <input 
                type="text" 
                required 
                placeholder="Sector 14, Sonipat, Haryana" 
                value={formData.location} 
                onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                style={inputStyle} 
              />
            </div>

            <div>
              <label style={labelStyle}>Area (Sq. Yd. / Sq.ft)</label>
              <input 
                type="text" 
                required 
                placeholder="100 Sq. Yd." 
                value={formData.area} 
                onChange={(e) => setFormData({ ...formData, area: e.target.value })} 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Society & Flat No */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Society Name</label>
              <input 
                type="text" 
                placeholder="e.g. TDI City, Omaxe Heights" 
                value={formData.society} 
                onChange={(e) => setFormData({ ...formData, society: e.target.value })} 
                style={inputStyle} 
              />
            </div>

            <div>
              <label style={labelStyle}>Flat No. / House No.</label>
              <input 
                type="text" 
                placeholder="e.g. A-402" 
                value={formData.flat_no} 
                onChange={(e) => setFormData({ ...formData, flat_no: e.target.value })} 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Other Details */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={labelStyle}>Other Details</label>
            <textarea 
              rows="2" 
              placeholder="e.g. Corner flat, near market..." 
              value={formData.other_details} 
              onChange={(e) => setFormData({ ...formData, other_details: e.target.value })} 
              style={inputStyle}
            ></textarea>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Description</label>
            <textarea 
              rows="3" 
              placeholder="Add key property features, road width, facing..." 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              style={inputStyle}
            ></textarea>
          </div>

          {/* Multiple Property Images File Upload Box */}
          <div style={{ marginBottom: "1.75rem", backgroundColor: "var(--bg-main)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <label style={{ ...labelStyle, fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FaImage color="var(--primary)" /> Upload Property Images
            </label>

            {/* Existing image previews */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
              {formData.images.map((img, idx) => (
                <div key={idx} style={{ position: "relative", width: "90px", height: "70px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <img src={img} alt={`Preview ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(idx)} 
                    style={{ position: "absolute", top: "2px", right: "2px", backgroundColor: "rgba(239, 68, 68, 0.85)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* File Upload Selector */}
            <div>
              <label style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
                border: "1.5px dashed var(--primary)"
              }}>
                {uploading ? <FaSpinner className="spin" /> : <FaUpload />} 
                {uploading ? "Uploading Images..." : "Select Images from Computer"}
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileSelect} 
                  style={{ display: "none" }} 
                />
              </label>
            </div>
          </div>



          {submitError && (
            <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.85rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.25rem" }}>
              ❌ {submitError}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "1rem", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <FaSpinner className="spin" /> : <FaPlus />} {submitting ? "Saving to Database..." : "Publish Property"}
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

export default AddProperty;
