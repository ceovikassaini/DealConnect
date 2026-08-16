import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUser } from "react-icons/fa";

const BlogListing = () => {
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
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "3rem 0" }}>
      <div className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Latest Articles & Insights</h1>
          <p style={{ color: "var(--text-muted)" }}>Expert real estate tips, market trends, and networking guides</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.75rem" }}>
          {blogs.map(blog => (
            <div key={blog.id} className="card">
              <div style={{ height: "180px", overflow: "hidden" }}>
                <img src={blog.image} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "1.25rem" }}>
                <span className="badge badge-featured" style={{ marginBottom: "0.5rem", display: "inline-block" }}>{blog.category}</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem" }}>{blog.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>{blog.summary}</p>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "1rem" }}>
                  <span><FaCalendarAlt /> {blog.date}</span>
                  <span><FaUser /> {blog.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogListing;
