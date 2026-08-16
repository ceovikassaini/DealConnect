import React, { useState } from "react";

const UserManagement = () => {
  const [users] = useState([
    { id: "usr-1", name: "System Administrator", email: "admin@dealconnect.com", role: "Admin", status: "Active" },
    { id: "dlr-1", name: "Amit Sharma", email: "amit@sharmarealty.com", role: "Dealer", status: "Active" },
    { id: "dlr-2", name: "Rohit Bansal", email: "rohit@realtyconnect.in", role: "Dealer", status: "Active" }
  ]);

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>Users Management</h1>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: "700" }}>{u.name}</td>
                <td>{u.email}</td>
                <td><span style={{ padding: "0.2rem 0.6rem", borderRadius: "12px", backgroundColor: "#e0e7ff", color: "#4f46e5", fontSize: "0.75rem", fontWeight: "700" }}>{u.role}</span></td>
                <td><span style={{ color: "#059669", fontWeight: "700" }}>{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
