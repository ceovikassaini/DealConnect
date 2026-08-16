import React, { useState, useEffect } from "react";
import { FaTrash, FaCheck, FaStar } from "react-icons/fa";

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/properties")
      .then(res => res.json())
      .then(data => {
        if (data.success) setProperties(data.properties);
      })
      .catch(() => {});
  }, []);

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/properties/${id}`, { method: "DELETE" })
      .then(() => setProperties(properties.filter(p => p.id !== id)))
      .catch(() => setProperties(properties.filter(p => p.id !== id)));
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>Property Management</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Audit and manage all properties posted across the network</p>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Property Type</th>
              <th>Price</th>
              <th>Dealer</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: "700" }}>{p.title}</td>
                <td>{p.location}</td>
                <td>{p.propertyType}</td>
                <td style={{ color: "#4f46e5", fontWeight: "700" }}>₹ {p.price}</td>
                <td>{p.dealerName}</td>
                <td><span style={{ padding: "0.2rem 0.6rem", borderRadius: "12px", backgroundColor: "#d1fae5", color: "#059669", fontSize: "0.75rem", fontWeight: "700" }}>Approved</span></td>
                <td style={{ textAlign: "right" }}>
                  <button onClick={() => handleDelete(p.id)} style={{ backgroundColor: "#fee2e2", color: "#ef4444", border: "none", padding: "0.4rem 0.75rem", borderRadius: "6px", cursor: "pointer" }}>
                    <FaTrash size={12} /> Delete
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

export default PropertyManagement;
