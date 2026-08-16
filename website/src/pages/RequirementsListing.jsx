import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaTag,
  FaPlus,
  FaEye,
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
  FaSearch
} from "react-icons/fa";

const RequirementsListing = ({ user }) => {
  // Redirect to login if user is not logged in
  if (!user) {
    return <Navigate to="/login?msg=login_required" replace />;
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Viewing Requirement Details
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  useEffect(() => {
    fetchUserRequirements();
  }, [user?.id, user?.role]);

  const fetchUserRequirements = () => {
    setLoading(true);
    const query = user?.id ? `userId=${user.id}&role=${user.role || "user"}` : "";
    fetch(`${API_BASE}/get_requirements?${query}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        const list = data.body || data.data || data.requirements || [];
        if (Array.isArray(list)) {
          const formatted = list.map((r, idx) => {
            // Assign visually appealing property image or fallback logo
            const defaultImages = [
              "/dealconect.png",
              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
            ];
            const imgSrc = r.image || defaultImages[idx % defaultImages.length];

            return {
              id: r.id,
              title: r.title,
              location: r.location,
              budget: r.budget,
              minBudget: r.minBudget,
              maxBudget: r.maxBudget,
              reqType: r.reqType || "Buy",
              categoryName: r.category?.name || "Property",
              subCategoryName: r.subcategory?.name || "Residential",
              description: r.description || "",
              postedByRole: r.postedByRole || (r.dealer_id ? "dealer" : "user"),
              date: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "2026-08-16",
              dealerName: r.dealer?.name || r.user?.name || r.dealerName || user?.name || "vikasdeler",
              status: r.status || "Active",
              image: r.image && r.image.trim() !== "" ? r.image : "/logo.png"
            };
          });
          setRequirements(formatted);
        } else {
          setRequirements([]);
        }
      })
      .catch(err => {
        setLoading(false);
        console.log("Fetch user requirements error:", err);
      });
  };

  const formatCurrency = (val) => {
    if (!val) return "N/A";
    const num = Number(val);
    if (isNaN(num)) return val;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Filtered Requirements
  const filteredRequirements = requirements.filter(req => {
    const matchesType = filterType === "All" || req.reqType.toLowerCase() === filterType.toLowerCase();
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "85vh", padding: "3rem 0" }}>
      <div className="container">
        
        {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>
              Property Requirements ({user?.name})
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Browse and manage buyer/tenant requirements on DealConnect
            </p>
          </div>

          <Link
            to={user.role === "dealer" || user.role === 2 || user.role === "2" ? "/dealer/add-requirement" : "/user/dashboard"}
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FaPlus /> Post Requirement
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="card" style={{ padding: "1.25rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          
          {/* Requirement Type Filter Tabs */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["All", "Buy", "Rent", "Lease"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: filterType === type ? "var(--primary)" : "var(--bg-main)",
                  color: filterType === type ? "#ffffff" : "var(--text-main)",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ minWidth: "280px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search requirements..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem 0.6rem 2.4rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
              <FaSearch style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.85rem" }} />
            </div>
          </div>
        </div>

        {/* Requirements Grid (Matching Property Cards Screenshot) */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)", fontWeight: "600" }}>
            ⏳ Fetching requirements from database...
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="card" style={{ padding: "3.5rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "0.5rem" }}>No Property Requirements Found</h3>
            <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>Try clearing your search query or click below to post a new requirement.</p>
            <Link
              to={user.role === "dealer" || user.role === 2 || user.role === "2" ? "/dealer/add-requirement" : "/user/dashboard"}
              className="btn-primary"
              style={{ margin: "0 auto", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <FaPlus /> Post Your First Requirement
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 310px)",
            gap: "1.5rem",
            justifyContent: "flex-start"
          }}>
            {filteredRequirements.map(req => {
              const formattedBudget = req.budget.startsWith("₹") ? req.budget : `₹ ${req.budget}`;

              return (
                <div 
                  key={req.id} 
                  className="card"
                  style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    width: "310px",
                    padding: "0",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    backgroundColor: "var(--bg-card)"
                  }}
                >
                  {/* Image Banner with Green VERIFIED Badge */}
                  <div style={{ position: "relative", height: "175px", overflow: "hidden", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img 
                      src={req.image && req.image.trim() !== "" ? req.image : "/logo.png"} 
                      alt={req.title} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/logo.png";
                      }}
                      style={{ width: "100%", height: "100%", objectFit: req.image && req.image !== "/logo.png" ? "cover" : "contain", padding: req.image && req.image !== "/logo.png" ? "0" : "12px" }} 
                    />
                    <span 
                      style={{ 
                        position: "absolute", 
                        top: "12px", 
                        left: "12px",
                        backgroundColor: "#dcfce7", 
                        color: "#059669", 
                        padding: "0.25rem 0.65rem", 
                        borderRadius: "20px", 
                        fontSize: "0.72rem", 
                        fontWeight: "800",
                        letterSpacing: "0.5px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
                      }}
                    >
                      VERIFIED
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Requirement Title */}
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "800", marginBottom: "0.4rem", color: "var(--text-main)", lineHeight: "1.3", height: "2.6em", overflow: "hidden" }}>
                      {req.title}
                    </h3>
                    
                    {/* Location Pin */}
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <FaMapMarkerAlt color="#6366f1" size={13} style={{ flexShrink: 0 }} /> {req.location || "Sonipat, Haryana"}
                    </p>

                    {/* Price / Budget */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#6366f1" }}>
                        {formattedBudget}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                        Negotiable
                      </span>
                    </div>

                    {/* Metadata Grid (3 Columns: Category / Type / Dealer) */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr 1.2fr", 
                      gap: "0.4rem", 
                      backgroundColor: "var(--bg-main)", 
                      padding: "0.65rem 0.75rem", 
                      borderRadius: "12px", 
                      border: "1px solid var(--border-color)",
                      marginTop: "auto"
                    }}>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {req.categoryName || "Plot / Land"}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>Category</div>
                      </div>

                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {req.reqType || "Buy"}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>Type</div>
                      </div>

                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: "80px" }}>
                            {req.dealerName || "Sharma"}
                          </span>
                          <FaCheckCircle color="#3b82f6" size={11} style={{ flexShrink: 0 }} />
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>Dealer</div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => { setSelectedReq(req); setShowViewModal(true); }}
                      className="btn-outline"
                      style={{ width: "100%", marginTop: "0.85rem", justifyContent: "center", padding: "0.5rem", fontSize: "0.82rem", fontWeight: "700" }}
                    >
                      <FaEye /> View Requirement Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* View Requirement Modal                               */}
      {/* ==================================================== */}
      {showViewModal && selectedReq && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaInfoCircle color="var(--primary)" size={20} />
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Requirement Details</h3>
              </div>
              <button onClick={() => setShowViewModal(false)} style={closeBtnStyle}><FaTimes /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Title</span>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "800", marginTop: "0.1rem" }}>{selectedReq.title}</h4>
                </div>
                <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "800" }}>
                  {selectedReq.reqType}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "var(--bg-main)", padding: "1rem", borderRadius: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Category</span>
                  <p style={{ fontWeight: "700", fontSize: "0.95rem", marginTop: "0.2rem" }}>{selectedReq.categoryName}</p>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Location</span>
                  <p style={{ fontWeight: "700", fontSize: "0.95rem", marginTop: "0.2rem" }}>{selectedReq.location}</p>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Budget</span>
                  <p style={{ fontWeight: "800", color: "var(--primary)", fontSize: "0.95rem", marginTop: "0.2rem" }}>{selectedReq.budget}</p>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Min/Max Budget</span>
                  <p style={{ fontWeight: "700", fontSize: "0.9rem", marginTop: "0.2rem" }}>{formatCurrency(selectedReq.minBudget)} - {formatCurrency(selectedReq.maxBudget)}</p>
                </div>
              </div>

              {selectedReq.description && (
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Description</span>
                  <p style={{ fontSize: "0.9rem", backgroundColor: "var(--bg-main)", padding: "0.85rem", borderRadius: "10px", marginTop: "0.3rem", lineHeight: "1.5" }}>
                    {selectedReq.description}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <span>Posted By: <strong>{selectedReq.dealerName}</strong></span>
                <span>Date: <strong>{selectedReq.date}</strong></span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowViewModal(false)} className="btn-primary" style={{ padding: "0.6rem 1.5rem" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "1rem"
};

const modalContentStyle = {
  backgroundColor: "var(--card-bg, #ffffff)",
  borderRadius: "20px",
  padding: "2rem",
  maxWidth: "480px",
  width: "100%",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  fontSize: "1.2rem",
  color: "var(--text-muted)",
  cursor: "pointer"
};

export default RequirementsListing;
