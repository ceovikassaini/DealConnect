import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash, FaSpinner, FaEye, FaFilter } from "react-icons/fa";

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.9rem",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-card)",
  color: "var(--text-main)",
  fontSize: "0.88rem",
  outline: "none"
};

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");

  const fetchProperties = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/properties")
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success && data.properties) {
          setProperties(data.properties);
        } else {
          setProperties([]);
        }
      })
      .catch(err => {
        setLoading(false);
        console.error("Error fetching properties:", err);
        setProperties([]);
      });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch Categories
  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then(res => res.json())
      .then(data => {
        const catList = data.body || data.categories || data.data || [];
        if (data.success && catList.length > 0) {
          setCategories(catList);
        } else {
          setCategories([
            { id: 1, name: "Plot / Land" },
            { id: 2, name: "Flat / Apartment" },
            { id: 3, name: "Commercial Shop" },
            { id: 4, name: "Kothi / Villa" }
          ]);
        }
      })
      .catch(() => {
        setCategories([
          { id: 1, name: "Plot / Land" },
          { id: 2, name: "Flat / Apartment" },
          { id: 3, name: "Commercial Shop" },
          { id: 4, name: "Kothi / Villa" }
        ]);
      });
  }, []);

  // Fetch Subcategories when Category selection changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "all") {
      fetch(`http://localhost:5000/api/subcategories?category_id=${selectedCategory}`)
        .then(res => res.json())
        .then(data => {
          const subList = data.body || data.subcategories || data.data || [];
          if (data.success && subList.length > 0) {
            setSubcategories(subList);
          } else {
            setSubcategories([]);
          }
        })
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
      setSelectedSubcategory("all");
    }
  }, [selectedCategory]);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this property listing?")) return;
    fetch(`http://localhost:5000/api/properties/${id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProperties(prev => prev.filter(p => p.id !== id));
        }
      })
      .catch(err => console.error("Error deleting property:", err));
  };

  // Filtered properties
  const filtered = properties.filter(p => {
    const matchSearch = !search || 
      (p.location && p.location.toLowerCase().includes(search.toLowerCase())) || 
      (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
      (p.name && p.name.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = selectedCategory === "all" || String(p.category_id) === String(selectedCategory);
    const matchSubcategory = selectedSubcategory === "all" || String(p.subcategory_id) === String(selectedSubcategory);

    return matchSearch && matchCategory && matchSubcategory;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>My Properties</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Manage and filter your active real estate database listings</p>
        </div>
        <Link to="/dealer/add-property" className="btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
          <FaPlus /> Add New Property
        </Link>
      </div>

      {/* FILTER BAR (Category, Subcategory, Search) */}
      <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr)) 120px",
          gap: "0.85rem",
          alignItems: "center"
        }}>
          {/* Search Box */}
          <input 
            type="text" 
            placeholder="Search by title or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          {/* Category Dropdown */}
          <select 
            value={selectedCategory} 
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory("all");
            }}
            style={inputStyle}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Subcategory Dropdown */}
          <select 
            value={selectedSubcategory} 
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={selectedCategory === "all" || subcategories.length === 0}
            style={{
              ...inputStyle,
              opacity: (selectedCategory === "all" || subcategories.length === 0) ? 0.6 : 1,
              cursor: (selectedCategory === "all" || subcategories.length === 0) ? "not-allowed" : "pointer"
            }}
          >
            <option value="all">All Subcategories</option>
            {subcategories.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>

          {/* Filter Button */}
          <button className="btn-primary" style={{ height: "38px", justifyContent: "center", fontSize: "0.85rem" }}>
            <FaFilter /> Filter
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "1rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <FaSpinner className="spin" size={24} style={{ marginBottom: "0.5rem" }} />
            <p>Loading properties from MySQL database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <p style={{ fontWeight: "700", marginBottom: "0.5rem" }}>No Properties Found Matching Filter</p>
            <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>Try clearing your category/subcategory filters or click "Add New Property".</p>
            <button 
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setSelectedSubcategory("all");
              }}
              className="btn-outline"
              style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.75rem" }}>ID</th>
                <th style={{ padding: "0.75rem" }}>Title</th>
                <th style={{ padding: "0.75rem" }}>Location</th>
                <th style={{ padding: "0.75rem" }}>Price</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
                <th style={{ padding: "0.75rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "0.75rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>#{p.id}</td>
                  <td style={{ padding: "0.75rem", fontWeight: "700" }}>{p.title || p.name}</td>
                  <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>{p.location}</td>
                  <td style={{ padding: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>₹ {p.price}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span className="badge badge-verified">{p.status === 1 || p.status === "Active" ? "ACTIVE" : "INACTIVE"}</span>
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
                      <Link 
                        to={`/properties/${p.id}`} 
                        title="View Property Details"
                        style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)", padding: "0.4rem 0.65rem", borderRadius: "6px", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: "700", textDecoration: "none" }}
                      >
                        <FaEye size={14} /> View
                      </Link>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        title="Delete Property"
                        style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.4rem 0.65rem", borderRadius: "6px", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
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

export default MyProperties;
