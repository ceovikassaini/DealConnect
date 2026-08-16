import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

const BlogsManagement = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/blogs")
      .then(res => res.json())
      .then(data => {
        if (data.success) setBlogs(data.blogs);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Blogs Management</h1>
        <button style={{ backgroundColor: "#4f46e5", color: "#fff", border: "none", padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <FaPlus /> Add New Blog Post
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: "700" }}>{b.title}</td>
                <td><span style={{ padding: "0.2rem 0.6rem", borderRadius: "12px", backgroundColor: "#e0e7ff", color: "#4f46e5", fontSize: "0.75rem", fontWeight: "700" }}>{b.category}</span></td>
                <td>{b.date}</td>
                <td>{b.author}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogsManagement;
