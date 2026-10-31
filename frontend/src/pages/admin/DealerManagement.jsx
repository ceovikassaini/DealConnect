import React, { useState, useEffect } from "react";
import { 
  FaUserTie, FaCheckCircle, FaTimesCircle, FaSearch, 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCrown, FaShieldAlt 
} from "react-icons/fa";

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/dealers")
      .then(res => res.json())
      .then(data => {
        const list = (data.body && data.body.dealers) || data.dealers || [];
        setDealers(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleVerify = (id) => {
    setDealers(dealers.map(d => d.id === id ? { ...d, verified: !d.verified } : d));
  };

  const filteredDealers = dealers.filter(d => {
    return !searchTerm ||
      (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.company && d.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.location && d.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Dealer Network Management</h1>
          <p className="admin-page-subtitle">
            Verify real estate dealers, view subscription statuses, and monitor brokerage firms across India
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-search-box">
          <FaSearch color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search dealer by name, firm, location, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search-input"
          />
        </div>
        <div style={{ fontSize: "0.88rem", color: "#64748b", fontWeight: "600" }}>
          Total Registered Brokers: <strong>{dealers.length}</strong>
        </div>
      </div>

      {/* Dealers Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            Loading dealers...
          </div>
        ) : filteredDealers.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            No dealers found.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dealer</th>
                <th>Company / Agency</th>
                <th>Contact Details</th>
                <th>Location</th>
                <th>Subscription Plan</th>
                <th>Dealer Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDealers.map(d => {
                const isVerified = d.verified !== false;
                const isPro = d.plan === "Professional" || d.isPro || d.id === 1;

                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                          <FaUserTie size={16} />
                        </div>
                        <div>
                          <strong style={{ fontSize: "0.92rem", display: "block" }}>{d.name}</strong>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: #{d.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong style={{ fontSize: "0.88rem", color: "#334155" }}>
                        {d.company || `${d.name} Real Estate`}
                      </strong>
                    </td>

                    <td>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {d.phone || d.mobile_no ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <FaPhoneAlt size={11} color="#10b981" /> {d.phone || d.mobile_no}
                          </div>
                        ) : null}
                        {d.email && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.15rem" }}>
                            <FaEnvelope size={11} color="#6366f1" /> {d.email}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem" }}>
                        <FaMapMarkerAlt size={12} color="#ef4444" />
                        <span style={{ textTransform: "capitalize" }}>{d.location || "Mohali / NCR"}</span>
                      </div>
                    </td>

                    <td>
                      {isPro ? (
                        <span style={{ 
                          padding: "0.25rem 0.65rem", 
                          borderRadius: "12px", 
                          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", 
                          color: "#fff", 
                          fontSize: "0.75rem", 
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}>
                          <FaCrown size={11} /> Pro Dealer
                        </span>
                      ) : (
                        <span style={{ 
                          padding: "0.25rem 0.65rem", 
                          borderRadius: "12px", 
                          backgroundColor: "#f1f5f9", 
                          color: "#64748b", 
                          fontSize: "0.75rem", 
                          fontWeight: "700" 
                        }}>
                          Standard Free
                        </span>
                      )}
                    </td>

                    <td>
                      {isVerified ? (
                        <span className="badge-status verified">
                          <FaCheckCircle /> Verified Broker
                        </span>
                      ) : (
                        <span className="badge-status pending">
                          <FaTimesCircle /> Verification Pending
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button 
                        onClick={() => toggleVerify(d.id)} 
                        className={`btn-action ${isVerified ? "unverify" : "verify"}`}
                      >
                        {isVerified ? "Revoke Verification" : "Verify Dealer"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DealerManagement;
