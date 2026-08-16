import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash, FaEye } from "react-icons/fa";

const MyRequirements = ({ user }) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealerRequirements();
  }, [user]);

  const fetchDealerRequirements = () => {
    setLoading(true);
    const userId = user?.id || "";
    fetch(`${API_BASE}/get_requirements?userId=${userId}&role=dealer`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        const list = data.body || data.data || [];
        if (Array.isArray(list)) {
          const formatted = list.map(r => ({
            id: r.id,
            title: r.title,
            location: r.location,
            budget: r.budget,
            reqType: r.reqType === 2 || r.reqType === "2" || r.reqType === "Rent" ? "Rent" : (r.reqType === 3 || r.reqType === "3" || r.reqType === "Lease" ? "Lease" : "Buy"),
            status: r.status || "Active"
          }));
          setReqs(formatted);
        }
      })
      .catch(err => {
        setLoading(false);
        console.log("Fetch dealer requirements error:", err);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this requirement?")) {
      fetch(`${API_BASE}/delete_requirement/${id}`, { method: "DELETE" })
        .then(() => {
          setReqs(reqs.filter(r => r.id !== id));
        })
        .catch(() => {
          setReqs(reqs.filter(r => r.id !== id));
        });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>My Requirements</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Buyer requirements you have posted on the network</p>
        </div>
        <Link to="/dealer/add-requirement" className="btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
          <FaPlus /> Post Requirement
        </Link>
      </div>

      <div className="card" style={{ padding: "1rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            ⏳ Loading requirements...
          </div>
        ) : reqs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
            <p style={{ fontWeight: "600", marginBottom: "1rem" }}>No requirements posted yet.</p>
            <Link to="/dealer/add-requirement" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <FaPlus /> Post Requirement
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.75rem" }}>Title</th>
                <th style={{ padding: "0.75rem" }}>Type</th>
                <th style={{ padding: "0.75rem" }}>Location</th>
                <th style={{ padding: "0.75rem" }}>Budget</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
                <th style={{ padding: "0.75rem", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reqs.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "0.75rem", fontWeight: "700" }}>{r.title}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                      {r.reqType}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>{r.location}</td>
                  <td style={{ padding: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>{r.budget}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span className="badge badge-featured">{r.status}</span>
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{ backgroundColor: "#fee2e2", color: "#ef4444", border: "none", padding: "0.35rem 0.65rem", borderRadius: "6px", cursor: "pointer" }}
                    >
                      <FaTrash size={12} />
                    </button>
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

export default MyRequirements;
