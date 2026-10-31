import React, { useState, useEffect } from "react";
import { FaHandshake, FaSearch, FaCheckCircle, FaClock, FaCalendarAlt, FaUserTie, FaEye } from "react-icons/fa";

const DEAL_STAGES = [
  { id: 1, label: "User Showed Interest", color: "#3b82f6", bg: "#eff6ff" },
  { id: 2, label: "Dealer Accepted Lead", color: "#6366f1", bg: "#eef2ff" },
  { id: 3, label: "Dealer Contacted User", color: "#8b5cf6", bg: "#faf5ff" },
  { id: 4, label: "Site Visit Scheduled", color: "#f59e0b", bg: "#fffbeb" },
  { id: 5, label: "Site Visit Completed", color: "#10b981", bg: "#ecfdf5" }
];

const DealsManagement = () => {
  const [deals, setDeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/deals")
      .then(res => res.json())
      .then(data => {
        const list = (data.body && data.body.deals) || data.deals || [
          {
            id: 1,
            dealCode: "DEAL-8491",
            propertyTitle: "Luxury 3BHK Penthouse",
            location: "Mohali Sector 82",
            price: "₹ 85.00 Lakh",
            buyerName: "Amit Verma",
            sellerDealer: "vikasdeler Realty Agency",
            statusStage: 3,
            statusLabel: "Dealer Contacted User",
            date: "Today, 02:45 PM"
          },
          {
            id: 2,
            dealCode: "DEAL-7312",
            propertyTitle: "Commercial Plot (60x15)",
            location: "Delhi Road",
            price: "₹ 39.00 Lakh",
            buyerName: "Rajinder Singh",
            sellerDealer: "vikasdeler Realty Agency",
            statusStage: 2,
            statusLabel: "Dealer Accepted Lead",
            date: "Yesterday"
          },
          {
            id: 3,
            dealCode: "DEAL-6104",
            propertyTitle: "Independent Villa",
            location: "Lalru Highway",
            price: "₹ 1.25 Cr",
            buyerName: "Sunil Sharma",
            sellerDealer: "jashan Real Estate",
            statusStage: 5,
            statusLabel: "Site Visit Completed",
            date: "28 Oct 2026"
          }
        ];
        setDeals(list);
        setLoading(false);
      })
      .catch(() => {
        setDeals([
          {
            id: 1,
            dealCode: "DEAL-8491",
            propertyTitle: "Luxury 3BHK Penthouse",
            location: "Mohali Sector 82",
            price: "₹ 85.00 Lakh",
            buyerName: "Amit Verma",
            sellerDealer: "vikasdeler Realty Agency",
            statusStage: 3,
            statusLabel: "Dealer Contacted User",
            date: "Today, 02:45 PM"
          },
          {
            id: 2,
            dealCode: "DEAL-7312",
            propertyTitle: "Commercial Plot (60x15)",
            location: "Delhi Road",
            price: "₹ 39.00 Lakh",
            buyerName: "Rajinder Singh",
            sellerDealer: "vikasdeler Realty Agency",
            statusStage: 2,
            statusLabel: "Dealer Accepted Lead",
            date: "Yesterday"
          },
          {
            id: 3,
            dealCode: "DEAL-6104",
            propertyTitle: "Independent Villa",
            location: "Lalru Highway",
            price: "₹ 1.25 Cr",
            buyerName: "Sunil Sharma",
            sellerDealer: "jashan Real Estate",
            statusStage: 5,
            statusLabel: "Site Visit Completed",
            date: "28 Oct 2026"
          }
        ]);
        setLoading(false);
      });
  }, []);

  const filteredDeals = deals.filter(d => {
    return !searchTerm ||
      (d.dealCode && d.dealCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.propertyTitle && d.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.buyerName && d.buyerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.sellerDealer && d.sellerDealer.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Deals & Lead Pipeline</h1>
          <p className="admin-page-subtitle">
            5-Stage Lead Lifecycle: Track inquiries from initial user interest to successful site visit closure
          </p>
        </div>
      </div>

      {/* 5-Stage Legend Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "0.75rem",
        marginBottom: "1.75rem"
      }}>
        {DEAL_STAGES.map(stage => (
          <div 
            key={stage.id}
            style={{
              backgroundColor: stage.bg,
              border: `1px solid ${stage.color}30`,
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem"
            }}
          >
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: stage.color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "800"
            }}>
              {stage.id}
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: stage.color }}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-search-box">
          <FaSearch color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search deals by deal code, property, dealer, buyer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search-input"
          />
        </div>
        <div style={{ fontSize: "0.88rem", color: "#64748b", fontWeight: "600" }}>
          Active Deals Monitored: <strong>{deals.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            Loading deals...
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Deal Code</th>
                <th>Property</th>
                <th>Deal Value</th>
                <th>Lead / Buyer</th>
                <th>Assigned Dealer</th>
                <th>Pipeline Stage</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map(d => {
                const stageInfo = DEAL_STAGES.find(s => s.id === (d.statusStage || 1)) || DEAL_STAGES[0];

                return (
                  <tr key={d.id}>
                    <td>
                      <span style={{ 
                        fontFamily: "monospace", 
                        fontWeight: "800", 
                        backgroundColor: "#f1f5f9", 
                        padding: "0.2rem 0.6rem", 
                        borderRadius: "6px",
                        color: "#334155"
                      }}>
                        {d.dealCode || `DEAL-${d.id}`}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>
                        {d.propertyTitle || "Commercial / Residential Listing"}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{d.location || "Location"}</span>
                    </td>

                    <td>
                      <span style={{ color: "#4f46e5", fontWeight: "800", fontSize: "0.95rem" }}>
                        {d.price}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: "0.88rem", display: "block" }}>{d.buyerName || "Registered User"}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Direct Lead</span>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
                        <FaUserTie size={12} color="#6366f1" />
                        <span>{d.sellerDealer}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "9999px",
                        backgroundColor: stageInfo.bg,
                        color: stageInfo.color,
                        fontWeight: "700",
                        fontSize: "0.78rem",
                        border: `1px solid ${stageInfo.color}35`
                      }}>
                        Stage {d.statusStage || 1}: {stageInfo.label}
                      </span>
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

export default DealsManagement;
