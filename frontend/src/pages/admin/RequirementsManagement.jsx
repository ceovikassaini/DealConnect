import React, { useState, useEffect } from "react";

const RequirementsManagement = () => {
  const [reqs, setReqs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/requirements")
      .then(res => res.json())
      .then(data => {
        if (data.success) setReqs(data.requirements);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>Requirements Management</h1>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Budget</th>
              <th>Posted By Dealer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reqs.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: "700" }}>{r.title}</td>
                <td>{r.location}</td>
                <td style={{ color: "#4f46e5", fontWeight: "700" }}>{r.budget}</td>
                <td>{r.dealerName}</td>
                <td><span style={{ padding: "0.2rem 0.6rem", borderRadius: "12px", backgroundColor: "#d1fae5", color: "#059669", fontSize: "0.75rem", fontWeight: "700" }}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequirementsManagement;
