import React, { useState, useEffect } from "react";
import { FaUsers, FaUserShield, FaUserTie, FaUser, FaCheckCircle, FaSearch } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "DealConnect Administrator", email: "admin@dealconnect.com", role: "Super Admin", status: "Active", createdAt: "2026-01-10" },
    { id: 9, name: "vikasdeler Realty Agency", email: "vikas@dealerconnect.com", role: "Verified Dealer", status: "Active", createdAt: "2026-08-16" },
    { id: 13, name: "Client Buyer / Investor", email: "client@dealconnect.com", role: "Buyer / Client", status: "Active", createdAt: "2026-08-29" },
    { id: 2, name: "jashan Real Estate", email: "jashan@dealconnect.com", role: "Verified Dealer", status: "Active", createdAt: "2026-03-03" }
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(u => {
    return !searchTerm ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">User & Role Management</h1>
          <p className="admin-page-subtitle">
            Manage system administrators, registered dealers, and public buyers
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search-box">
          <FaSearch color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search users by name, email, role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search-input"
          />
        </div>
        <div style={{ fontSize: "0.88rem", color: "#64748b", fontWeight: "600" }}>
          Registered Accounts: <strong>{users.length}</strong>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email Address</th>
              <th>Assigned Role</th>
              <th>Account Status</th>
              <th>Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: u.role === "Super Admin" ? "#fee2e2" : u.role === "Verified Dealer" ? "#e0e7ff" : "#ecfdf5",
                      color: u.role === "Super Admin" ? "#ef4444" : u.role === "Verified Dealer" ? "#4f46e5" : "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {u.role === "Super Admin" ? <FaUserShield size={16} /> : u.role === "Verified Dealer" ? <FaUserTie size={16} /> : <FaUser size={14} />}
                    </div>
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>{u.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: #{u.id}</span>
                    </div>
                  </div>
                </td>

                <td style={{ color: "#475569", fontSize: "0.88rem" }}>{u.email}</td>

                <td>
                  <span style={{
                    padding: "0.25rem 0.65rem",
                    borderRadius: "12px",
                    fontSize: "0.76rem",
                    fontWeight: "700",
                    backgroundColor: u.role === "Super Admin" ? "#fee2e2" : u.role === "Verified Dealer" ? "#eef2ff" : "#ecfdf5",
                    color: u.role === "Super Admin" ? "#dc2626" : u.role === "Verified Dealer" ? "#4f46e5" : "#059669"
                  }}>
                    {u.role}
                  </span>
                </td>

                <td>
                  <span className="badge-status verified">
                    <FaCheckCircle /> {u.status}
                  </span>
                </td>

                <td style={{ color: "#64748b", fontSize: "0.85rem" }}>{u.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
