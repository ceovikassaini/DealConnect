import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaFilter, FaCheckCircle } from "react-icons/fa";

const inputStyle = {
  width: "100%",
  padding: "0.65rem 1rem",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-card)",
  color: "var(--text-main)",
  fontSize: "0.9rem",
  outline: "none"
};

const PropertiesListing = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const [search, setSearch] = useState(searchParams.get("location") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [propertyType, setPropertyType] = useState(searchParams.get("type") || "All Types");

  // Load properties from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/properties")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.properties) setProperties(data.properties);
      })
      .catch(() => {});
  }, []);

  // Load Categories on mount
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

  // Load Subcategories when Category selection changes
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

  // Client-side filtering logic
  const filtered = properties.filter(p => {
    const matchSearch = !search || 
      (p.location && p.location.toLowerCase().includes(search.toLowerCase())) || 
      (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
      (p.name && p.name.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = selectedCategory === "all" || String(p.category_id) === String(selectedCategory);
    const matchSubcategory = selectedSubcategory === "all" || String(p.subcategory_id) === String(selectedSubcategory);
    const matchType = propertyType === "All Types" || (p.propertyType && p.propertyType.toLowerCase() === propertyType.toLowerCase());

    return matchSearch && matchCategory && matchSubcategory && matchType;
  });

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "3rem 0" }}>
      <div className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Properties Listing</h1>
          <p style={{ color: "var(--text-muted)" }}>Explore verified properties across top locations. Filter by Category & Subcategory to find exact matches.</p>
        </div>

        {/* Category & Subcategory Filter Bar */}
        <div style={{
          backgroundColor: "var(--bg-card)",
          padding: "1.25rem",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          marginBottom: "2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr)) 120px",
            gap: "1rem",
            alignItems: "end"
          }}>
            {/* Search Input */}
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block" }}>Search Location / Title</label>
              <input 
                type="text" 
                placeholder="Search by title or location..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Category Dropdown Filter */}
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block" }}>Category</label>
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
            </div>

            {/* Subcategory Dropdown Filter */}
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block" }}>Subcategory</label>
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
            </div>

            {/* Property Type Dropdown */}
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "0.35rem", display: "block" }}>Property Type</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={inputStyle}>
                <option value="All Types">All Types</option>
                <option value="Plot">Plot / Land</option>
                <option value="Flat">Flat / Apartment</option>
                <option value="Commercial">Commercial Shop</option>
                <option value="Kothi">Kothi / Villa</option>
              </select>
            </div>

            {/* Filter Action Button */}
            <button className="btn-primary" style={{ height: "42px", justifyContent: "center" }}>
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Properties Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: filtered.length > 0 ? "repeat(auto-fill, 310px)" : "1fr",
          gap: "1.5rem",
          justifyContent: "flex-start"
        }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", backgroundColor: "var(--bg-card)", borderRadius: "16px", border: "1px dashed var(--border-color)", gridColumn: "1 / -1" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "0.5rem" }}>No Properties Found</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>No active listings match your selected Category, Subcategory, or Location criteria.</p>
              <button 
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setSelectedSubcategory("all");
                  setPropertyType("All Types");
                }} 
                className="btn-primary" 
                style={{ display: "inline-flex", padding: "0.75rem 1.5rem" }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filtered.map(prop => {
              const rawImg = Array.isArray(prop.images) && prop.images.length > 0 
                ? prop.images[0] 
                : (typeof prop.images === "string" ? prop.images : "");
              const imgSrc = rawImg && rawImg.trim() !== "" ? rawImg : "/logo.png";

              const cleanFacing = (prop.facing || "Road Facing").replace(/ Facing/i, "").trim();

              return (
                <Link 
                  key={prop.id} 
                  to={`/properties/${prop.id}`} 
                  className="card"
                  style={{ 
                    textDecoration: "none", 
                    color: "inherit", 
                    display: "flex", 
                    flexDirection: "column",
                    width: "310px",
                    padding: "0",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    backgroundColor: "var(--bg-card)"
                  }}
                >
                  {/* Image & Badges */}
                  <div style={{ position: "relative", height: "175px", overflow: "hidden", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img 
                      src={imgSrc} 
                      alt={prop.title || prop.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/logo.png";
                      }}
                      style={{ width: "100%", height: "100%", objectFit: imgSrc !== "/logo.png" ? "cover" : "contain", padding: imgSrc !== "/logo.png" ? "0" : "12px" }} 
                    />
                    <span className="badge badge-verified" style={{ position: "absolute", top: "12px", left: "12px" }}>
                      {prop.badge || "Verified"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "800", marginBottom: "0.4rem", color: "var(--text-main)", lineHeight: "1.3", height: "2.6em", overflow: "hidden" }}>
                      {prop.title || prop.name}
                    </h3>
                    
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <FaMapMarkerAlt color="var(--primary)" size={13} flexShrink={0} /> {prop.location || "Sonipat, Haryana"}
                    </p>

                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#6366f1" }}>
                        ₹ {typeof prop.price === "number" ? prop.price.toLocaleString("en-IN") : prop.price}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                        Negotiable
                      </span>
                    </div>

                    {/* Metadata Grid */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr 1.2fr", 
                      gap: "0.4rem", 
                      backgroundColor: "var(--bg-main)", 
                      padding: "0.65rem 0.75rem", 
                      borderRadius: "12px", 
                      border: "1px solid var(--border-color)",
                      marginTop: "auto"
                    }}>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {prop.area || "100 Sq. Yd."}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>Area</div>
                      </div>

                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cleanFacing}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>Facing</div>
                      </div>

                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: "90px" }}>
                            {prop.dealerName || "Sharma Associates"}
                          </span>
                          <FaCheckCircle color="#3b82f6" size={11} style={{ flexShrink: 0 }} />
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>Dealer</div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesListing;
