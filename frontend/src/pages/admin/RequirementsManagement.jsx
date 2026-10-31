import React, { useState, useEffect } from "react";
import { FaListAlt, FaMapMarkerAlt, FaMoneyBillWave, FaUserTie, FaSearch, FaCheckCircle } from "react-icons/fa";

const RequirementsManagement = () => {
  const [reqs, setReqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/requirements")
      .then(res => res.json())
      .then(data => {
        const list = data.body || data.requirements || [];
        setReqs(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredReqs = reqs.filter(r => {
    return !searchTerm ||
      (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.location && r.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Buyer & Investor Requirements</h1>
          <p className="admin-page-subtitle">
            Manage live property requests and investor inquiries posted across DealConnect
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-search-box">
          <FaSearch color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search requirement by title, location, description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search-input"
          />
        </div>
        <div style={{ fontSize: "0.88rem", color: "#64748b", fontWeight: "600" }}>
          Active Requirements: <strong>{reqs.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            Loading requirements...
          </div>
        ) : filteredReqs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            No buyer requirements found.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Requirement Title</th>
                <th>Category / Type</th>
                <th>Location</th>
                <th>Budget Range</th>
                <th>Posted By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReqs.map(r => (
                <tr key={r.id}>
                  <td>
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>{r.title}</strong>
                      {r.description && (
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{r.description}</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span style={{ 
                      fontSize: "0.76rem", 
                      fontWeight: "700", 
                      color: "#4f46e5", 
                      backgroundColor: "#eef2ff", 
                      padding: "0.2rem 0.5rem", 
                      borderRadius: "6px" 
                    }}>
                      {(r.category && r.category.name) || "General"}
                    </span>
                    {r.subcategory && (
                      <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block", marginTop: "0.2rem" }}>
                        {r.subcategory.name}
                      </span>
                    )}
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem" }}>
                      <FaMapMarkerAlt size={12} color="#ef4444" />
                      <span style={{ textTransform: "capitalize" }}>{r.location || "Anywhere"}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ color: "#4f46e5", fontWeight: "800", fontSize: "0.92rem" }}>
                      {r.budget || `₹ ${r.minBudget} - ₹ ${r.maxBudget}`}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
                      <FaUserTie size={12} color="#64748b" />
                      <span>{r.dealer?.name || r.user?.name || "Direct Client"}</span>
                    </div>
                  </td>

                  <td>
                    <span className="badge-status verified">
                      <FaCheckCircle /> {r.status || "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RequirementsManagement;
