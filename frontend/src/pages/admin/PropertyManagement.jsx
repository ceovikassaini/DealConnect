import React, { useState, useEffect, useMemo } from "react";
import { 
  FaBuilding, FaCheckCircle, FaClock, FaTimesCircle, 
  FaTrash, FaEye, FaSearch, FaFilter, FaCrown, 
  FaShieldAlt, FaMapMarkerAlt, FaRulerCombined, FaCompass, 
  FaUserTie, FaCheck, FaBan, FaTimes, FaExternalLinkAlt 
} from "react-icons/fa";

// Category & Subcategory Dictionary
const CATEGORY_NAMES = {
  1: "Residential",
  2: "Commercial",
  3: "Industrial",
  4: "Agricultural"
};

const SUBCATEGORY_NAMES = {
  1: "Apartment",
  2: "Independent House",
  3: "Villa",
  4: "Builder Floor",
  5: "Studio Apartment",
  6: "Penthouse",
  7: "Residential Plot",
  8: "Shop",
  9: "Office Space",
  10: "Showroom",
  11: "Warehouse",
  12: "Commercial Plot",
  13: "Co-working Space",
  14: "Factory",
  15: "Industrial Shed",
  16: "Industrial Land",
  17: "Cold Storage",
  18: "Agricultural Land",
  19: "Farm House",
  20: "Plantation Land"
};

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'verified'
  const [badgeFilter, setBadgeFilter] = useState("all"); // 'all', 'premium', 'standard'
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Selected Property for Modal Inspection
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeModalImg, setActiveModalImg] = useState("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Fetch properties from backend
  const loadProperties = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/properties")
      .then(res => res.json())
      .then(data => {
        const list = data.properties || data.body || [];
        setProperties(list);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching properties:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Admin Verification Toggle Function: status 1 = Verified, status 0 = Pending
  const handleToggleVerification = async (propId, currentStatus) => {
    const newStatus = Number(currentStatus) === 1 ? 0 : 1;
    const actionLabel = newStatus === 1 ? "Verified & Live" : "Unverified & Pending";

    try {
      const res = await fetch(`http://localhost:5000/api/properties/${propId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();

      if (data.success) {
        setProperties(prev => prev.map(p => {
          if (p.id === propId) {
            return { ...p, status: newStatus };
          }
          return p;
        }));

        if (selectedProperty && selectedProperty.id === propId) {
          setSelectedProperty(prev => ({ ...prev, status: newStatus }));
        }

        showToast(`Property #${propId} successfully marked as ${actionLabel}!`);
      } else {
        showToast(`Failed to update status: ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Network error updating property status");
    }
  };

  // Admin Badge Assignment Function: 1 = PRIEMIUM, null = No Badge
  const handleToggleBadge = async (propId, currentBadgeId) => {
    const newBadgeId = (currentBadgeId === 1 || currentBadgeId === "1") ? null : 1;
    const badgeLabel = newBadgeId === 1 ? "PRIEMIUM Badge" : "Standard (Badge Removed)";

    try {
      const res = await fetch(`http://localhost:5000/api/properties/${propId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_id: newBadgeId })
      });
      const data = await res.json();

      if (data.success) {
        setProperties(prev => prev.map(p => {
          if (p.id === propId) {
            return { 
              ...p, 
              badge_id: newBadgeId, 
              badge_name: newBadgeId === 1 ? "PRIEMIUM" : null,
              badge: newBadgeId === 1 ? "PRIEMIUM" : null 
            };
          }
          return p;
        }));

        if (selectedProperty && selectedProperty.id === propId) {
          setSelectedProperty(prev => ({ 
            ...prev, 
            badge_id: newBadgeId, 
            badge_name: newBadgeId === 1 ? "PRIEMIUM" : null,
            badge: newBadgeId === 1 ? "PRIEMIUM" : null 
          }));
        }

        showToast(`Property #${propId} badge updated to ${badgeLabel}!`);
      } else {
        showToast(`Failed to update badge: ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating badge:", err);
      showToast("Network error updating badge");
    }
  };

  // Delete property
  const handleDelete = async (propId) => {
    if (!window.confirm(`Are you sure you want to permanently delete Property #${propId}?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/properties/${propId}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (data.success) {
        setProperties(prev => prev.filter(p => p.id !== propId));
        if (selectedProperty && selectedProperty.id === propId) {
          setSelectedProperty(null);
        }
        showToast(`Property #${propId} deleted successfully!`);
      } else {
        showToast(data.message || "Failed to delete property");
      }
    } catch (err) {
      console.error("Error deleting property:", err);
      showToast("Network error deleting property");
    }
  };

  // Open inspection modal
  const openInspectModal = (prop) => {
    setSelectedProperty(prop);
    const primaryImg = (prop.images && prop.images[0]) || (prop.property_images && prop.property_images[0]?.images) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
    setActiveModalImg(primaryImg);
  };

  // Calculate Metrics
  const totalCount = properties.length;
  const verifiedCount = properties.filter(p => Number(p.status) === 1).length;
  const pendingCount = properties.filter(p => Number(p.status) !== 1).length;
  const premiumCount = properties.filter(p => Number(p.badge_id) === 1).length;

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // Search
      const searchMatch = !searchTerm || 
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.dealerName && p.dealerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.society && p.society.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(p.id).includes(searchTerm);

      // Status
      let statusMatch = true;
      if (statusFilter === "pending") {
        statusMatch = Number(p.status) !== 1;
      } else if (statusFilter === "verified") {
        statusMatch = Number(p.status) === 1;
      }

      // Badge
      let badgeMatch = true;
      if (badgeFilter === "premium") {
        badgeMatch = Number(p.badge_id) === 1;
      } else if (badgeFilter === "standard") {
        badgeMatch = !p.badge_id || Number(p.badge_id) !== 1;
      }

      // Category
      let categoryMatch = true;
      if (categoryFilter !== "all") {
        categoryMatch = String(p.category_id) === String(categoryFilter);
      }

      return searchMatch && statusMatch && badgeMatch && categoryMatch;
    });
  }, [properties, searchTerm, statusFilter, badgeFilter, categoryFilter]);

  return (
    <div>
      {/* Top Title & Header */}
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Property Verification & Management</h1>
          <p className="admin-page-subtitle">
            Admin oversight: Verify dealer listings, approve live status, inspect architectural specs, and assign badges.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button 
            onClick={loadProperties} 
            className="btn-action inspect"
            style={{ padding: "0.6rem 1.2rem", fontSize: "0.88rem" }}
          >
            Refresh Listings
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card primary">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
            <FaBuilding />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>Total Listed Properties</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800" }}>{totalCount}</strong>
            <span style={{ fontSize: "0.75rem", color: "#4f46e5", display: "block", fontWeight: "600" }}>Database Records</span>
          </div>
        </div>

        <div className="admin-stat-card success">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
            <FaCheckCircle />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>Verified & Active</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800", color: "#059669" }}>{verifiedCount}</strong>
            <span style={{ fontSize: "0.75rem", color: "#059669", display: "block", fontWeight: "600" }}>Visible on Website</span>
          </div>
        </div>

        <div className="admin-stat-card warning" style={{ borderColor: pendingCount > 0 ? "#f59e0b" : "#e2e8f0" }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#fffbeb", color: "#d97706" }}>
            <FaClock />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>Pending Admin Verification</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800", color: "#d97706" }}>{pendingCount}</strong>
            <span style={{ fontSize: "0.75rem", color: "#d97706", display: "block", fontWeight: "700" }}>
              {pendingCount > 0 ? "Requires Admin Action" : "All Properties Clear"}
            </span>
          </div>
        </div>

        <div className="admin-stat-card purple">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#faf5ff", color: "#8b5cf6" }}>
            <FaCrown />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>PRIEMIUM Badged</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800", color: "#7c3aed" }}>{premiumCount}</strong>
            <span style={{ fontSize: "0.75rem", color: "#7c3aed", display: "block", fontWeight: "600" }}>Badge Table Linked</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="filter-search-box">
          <FaSearch color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by title, location, dealer, society, ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search-input"
          />
          {searchTerm && (
            <FaTimes color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setSearchTerm("")} />
          )}
        </div>

        {/* Verification Status Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({totalCount})
          </button>
          <button 
            className={`filter-tab-btn ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => setStatusFilter("pending")}
            style={statusFilter === "pending" ? { color: "#d97706" } : {}}
          >
            Pending Verification ({pendingCount})
          </button>
          <button 
            className={`filter-tab-btn ${statusFilter === "verified" ? "active" : ""}`}
            onClick={() => setStatusFilter("verified")}
            style={statusFilter === "verified" ? { color: "#059669" } : {}}
          >
            Verified ({verifiedCount})
          </button>
        </div>

        {/* Category Dropdown */}
        <select 
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="1">Residential</option>
          <option value="2">Commercial</option>
          <option value="3">Industrial</option>
          <option value="4">Agricultural</option>
        </select>

        {/* Badge Dropdown */}
        <select 
          className="filter-select"
          value={badgeFilter}
          onChange={(e) => setBadgeFilter(e.target.value)}
        >
          <option value="all">All Badges</option>
          <option value="premium">PRIEMIUM Badge Only</option>
          <option value="standard">Standard (No Badge)</option>
        </select>
      </div>

      {/* Properties Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            <p>Loading properties from database...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div style={{ padding: "3.5rem", textAlign: "center", color: "#64748b" }}>
            <FaBuilding size={40} color="#cbd5e1" style={{ marginBottom: "0.75rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#334155" }}>No Properties Found</h3>
            <p style={{ fontSize: "0.85rem" }}>Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>Image</th>
                <th>Property Info</th>
                <th>Category & Type</th>
                <th>Dimensions & Area</th>
                <th>Location</th>
                <th>Price</th>
                <th>Dealer</th>
                <th>Badge</th>
                <th>Admin Verification</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(p => {
                const isVerified = Number(p.status) === 1;
                const isPremium = Number(p.badge_id) === 1;
                const thumb = (p.images && p.images[0]) || (p.property_images && p.property_images[0]?.images) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
                const catName = CATEGORY_NAMES[p.category_id] || p.propertyType || "Property";
                const subCatName = SUBCATEGORY_NAMES[p.subcategory_id] || "";

                return (
                  <tr key={p.id}>
                    {/* Thumbnail */}
                    <td>
                      <img 
                        src={thumb} 
                        alt={p.name || p.title} 
                        className="prop-thumb-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
                        }}
                        onClick={() => openInspectModal(p)}
                      />
                    </td>

                    {/* Title & Info */}
                    <td>
                      <div>
                        <strong 
                          style={{ fontSize: "0.95rem", color: "#0f172a", cursor: "pointer", display: "block" }}
                          onClick={() => openInspectModal(p)}
                        >
                          {p.name || p.title || "Unnamed Listing"}
                        </strong>
                        <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.76rem", color: "#64748b", marginTop: "0.2rem" }}>
                          <span>ID: <strong>#{p.id}</strong></span>
                          {p.society && <span>• Soc: {p.society}</span>}
                          {p.flat_no && <span>• Flat: {p.flat_no}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Category & Subcategory */}
                    <td>
                      <span style={{ 
                        fontSize: "0.78rem", 
                        fontWeight: "700", 
                        color: "#4f46e5", 
                        backgroundColor: "#eef2ff", 
                        padding: "0.2rem 0.55rem", 
                        borderRadius: "6px",
                        display: "inline-block"
                      }}>
                        {catName}
                      </span>
                      {subCatName && (
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
                          {subCatName}
                        </span>
                      )}
                    </td>

                    {/* Dimensions & Facing */}
                    <td>
                      <div style={{ fontSize: "0.82rem" }}>
                        {(p.height || p.width) ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: "600", color: "#334155" }}>
                            <FaRulerCombined size={12} color="#64748b" />
                            {p.height || "-"} × {p.width || "-"} ft
                          </div>
                        ) : null}
                        <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "0.2rem" }}>
                          Area: <strong>{p.area || "N/A"}</strong>
                        </div>
                        {p.facing && (
                          <div style={{ fontSize: "0.74rem", color: "#059669", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.15rem" }}>
                            <FaCompass size={10} /> {p.facing}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem", color: "#334155" }}>
                        <FaMapMarkerAlt size={12} color="#ef4444" />
                        <span style={{ textTransform: "capitalize" }}>{p.location || "N/A"}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td>
                      <span style={{ fontWeight: "800", color: "#4f46e5", fontSize: "0.95rem" }}>
                        ₹ {p.price}
                      </span>
                    </td>

                    {/* Dealer */}
                    <td>
                      <div style={{ fontSize: "0.83rem" }}>
                        <strong style={{ display: "block", color: "#1e293b" }}>{p.dealerName || "Direct Dealer"}</strong>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>User ID: #{p.dealer_id || p.user_id || "-"}</span>
                      </div>
                    </td>

                    {/* Badge */}
                    <td>
                      {isPremium ? (
                        <button 
                          className="btn-action"
                          style={{
                            background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                            color: "#fff",
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "9999px"
                          }}
                          onClick={() => handleToggleBadge(p.id, p.badge_id)}
                          title="Click to remove PRIEMIUM badge"
                        >
                          <FaCrown /> PRIEMIUM
                        </button>
                      ) : (
                        <button 
                          className="btn-action"
                          style={{
                            backgroundColor: "#f1f5f9",
                            color: "#64748b",
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "9999px",
                            border: "1px dashed #cbd5e1"
                          }}
                          onClick={() => handleToggleBadge(p.id, p.badge_id)}
                          title="Click to assign PRIEMIUM badge"
                        >
                          + Standard
                        </button>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td>
                      {isVerified ? (
                        <span className="badge-status verified">
                          <FaCheckCircle /> Verified & Live
                        </span>
                      ) : (
                        <span className="badge-status pending">
                          <FaClock /> Pending Admin Verification
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="action-btn-group">
                        {/* 1-Click Verification Toggle */}
                        {isVerified ? (
                          <button 
                            className="btn-action unverify"
                            onClick={() => handleToggleVerification(p.id, p.status)}
                            title="Unverify / Put on Hold"
                          >
                            <FaBan size={12} /> Unverify
                          </button>
                        ) : (
                          <button 
                            className="btn-action verify"
                            onClick={() => handleToggleVerification(p.id, p.status)}
                            title="Approve and Verify Property"
                          >
                            <FaCheck size={12} /> Verify
                          </button>
                        )}

                        {/* Inspect Modal Button */}
                        <button 
                          className="btn-action inspect"
                          onClick={() => openInspectModal(p)}
                          title="Inspect Full Property Dossier"
                        >
                          <FaEye size={12} /> Inspect
                        </button>

                        {/* Delete Button */}
                        <button 
                          className="btn-action delete"
                          onClick={() => handleDelete(p.id)}
                          title="Delete Property"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Property Inspection Modal */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={() => setSelectedProperty(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a" }}>
                    {selectedProperty.name || selectedProperty.title || "Property Details"}
                  </h2>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "700" }}>
                    #{selectedProperty.id}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  {Number(selectedProperty.status) === 1 ? (
                    <span className="badge-status verified">
                      <FaCheckCircle /> Verified & Live
                    </span>
                  ) : (
                    <span className="badge-status pending">
                      <FaClock /> Pending Admin Verification
                    </span>
                  )}
                  {Number(selectedProperty.badge_id) === 1 && (
                    <span className="badge-status premium">
                      <FaCrown /> PRIEMIUM Badge
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedProperty(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Image Preview & Gallery */}
              <div>
                <img 
                  src={activeModalImg} 
                  alt="Property preview" 
                  className="modal-gallery-main"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <div className="modal-gallery-thumbs" style={{ marginTop: "0.5rem" }}>
                    {selectedProperty.images.map((imgUrl, idx) => (
                      <img 
                        key={idx}
                        src={imgUrl}
                        alt={`Thumb ${idx + 1}`}
                        className={`modal-gallery-thumb ${activeModalImg === imgUrl ? "active" : ""}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80";
                        }}
                        onClick={() => setActiveModalImg(imgUrl)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Technical Specifications Grid */}
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.75rem", color: "#334155" }}>
                  Technical Specifications & Layout
                </h4>
                <div className="specs-grid">
                  <div className="spec-item">
                    <div className="spec-label">Category</div>
                    <div className="spec-value">{CATEGORY_NAMES[selectedProperty.category_id] || "Residential"}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Subcategory / Type</div>
                    <div className="spec-value">{SUBCATEGORY_NAMES[selectedProperty.subcategory_id] || selectedProperty.propertyType || "Plot / Land"}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Dimensions</div>
                    <div className="spec-value">
                      {(selectedProperty.height || selectedProperty.width) ? `${selectedProperty.height} × ${selectedProperty.width} ft` : "Not Specified"}
                    </div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Total Area</div>
                    <div className="spec-value">{selectedProperty.area || "N/A"}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Facing Direction</div>
                    <div className="spec-value">{selectedProperty.facing || "Road Facing"}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Listing Price</div>
                    <div className="spec-value" style={{ color: "#4f46e5" }}>₹ {selectedProperty.price}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Society / Colony</div>
                    <div className="spec-value">{selectedProperty.society || "Individual"}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Flat / Plot Number</div>
                    <div className="spec-value">{selectedProperty.flat_no || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* Location & Address */}
              <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid var(--admin-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <FaMapMarkerAlt color="#ef4444" />
                  <strong style={{ fontSize: "0.9rem" }}>Location & Address</strong>
                </div>
                <p style={{ fontSize: "0.88rem", color: "#334155" }}>
                  {selectedProperty.location || "Location not provided"}
                </p>
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "0.35rem", color: "#334155" }}>
                    Property Description & Remarks
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: "1.5" }}>
                    {selectedProperty.description}
                  </p>
                </div>
              )}

              {/* Dealer Information */}
              <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "0.5rem", color: "#334155" }}>
                  Listing Dealer Information
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                    <FaUserTie size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.95rem", display: "block" }}>{selectedProperty.dealerName || "Direct Registered Dealer"}</strong>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>User ID: #{selectedProperty.dealer_id || selectedProperty.user_id || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="modal-footer">
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button 
                  className="btn-action badge-toggle"
                  onClick={() => handleToggleBadge(selectedProperty.id, selectedProperty.badge_id)}
                >
                  <FaCrown /> {Number(selectedProperty.badge_id) === 1 ? "Remove PRIEMIUM Badge" : "Assign PRIEMIUM Badge"}
                </button>
                <button 
                  className="btn-action delete"
                  onClick={() => handleDelete(selectedProperty.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button 
                  className="btn-action inspect"
                  onClick={() => setSelectedProperty(null)}
                >
                  Close
                </button>

                {Number(selectedProperty.status) === 1 ? (
                  <button 
                    className="btn-action unverify"
                    style={{ padding: "0.55rem 1.2rem", fontSize: "0.88rem" }}
                    onClick={() => handleToggleVerification(selectedProperty.id, selectedProperty.status)}
                  >
                    <FaBan /> Mark Unverified / Hold
                  </button>
                ) : (
                  <button 
                    className="btn-action verify"
                    style={{ padding: "0.55rem 1.4rem", fontSize: "0.88rem" }}
                    onClick={() => handleToggleVerification(selectedProperty.id, selectedProperty.status)}
                  >
                    <FaShieldAlt /> Approve & Verify Property
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <FaShieldAlt color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;
