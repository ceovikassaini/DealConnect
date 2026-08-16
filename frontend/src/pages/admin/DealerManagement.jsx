import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/dealers")
      .then(res => res.json())
      .then(data => {
        if (data.success) setDealers(data.dealers);
      })
      .catch(() => {});
  }, []);

  const toggleVerify = (id) => {
    setDealers(dealers.map(d => d.id === id ? { ...d, verified: !d.verified } : d));
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>Dealer Management</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Approve and verify property dealers and brokerage firms</p>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dealer Name</th>
              <th>Company</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Subscription Plan</th>
              <th>Verification</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: "700" }}>{d.name}</td>
                <td>{d.company}</td>
                <td>{d.location}</td>
                <td>{d.experience}</td>
                <td><span style={{ padding: "0.2rem 0.6rem", borderRadius: "12px", backgroundColor: "#e0e7ff", color: "#4f46e5", fontSize: "0.75rem", fontWeight: "700" }}>{d.plan}</span></td>
                <td>
                  {d.verified ? (
                    <span style={{ color: "#059669", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <FaCheckCircle /> Verified
                    </span>
                  ) : (
                    <span style={{ color: "#d97706", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <FaTimesCircle /> Pending
                    </span>
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button onClick={() => toggleVerify(d.id)} style={{ backgroundColor: "#4f46e5", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}>
                    {d.verified ? "Unverify" : "Verify Dealer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealerManagement;
