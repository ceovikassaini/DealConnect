import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaCheckCircle,
  FaTrash,
  FaEdit,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaPhone,
  FaUser,
  FaTimes,
  FaTags,
  FaLayerGroup,
  FaExchangeAlt,
  FaRupeeSign,
  FaAlignLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaInfoCircle
} from "react-icons/fa";

const UserDashboard = ({ user, setUser }) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

  // Pure DB Requirements Posts State (Initial state empty - only DB records shown!)
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Category and Subcategory State
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  // Modal Visibility States
  const [showAddReqModal, setShowAddReqModal] = useState(false);
  const [showEditReqModal, setShowEditReqModal] = useState(false);
  const [showViewReqModal, setShowViewReqModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);

  // View Requirement Data State
  const [viewReqItem, setViewReqItem] = useState(null);

  // Success / Error Feedback Messages
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [modalErrorMsg, setModalErrorMsg] = useState("");

  // Add Requirement Form State
  const [reqTitle, setReqTitle] = useState("");
  const [reqLocation, setReqLocation] = useState("");
  const [reqBudget, setReqBudget] = useState("");
  const [reqMinBudget, setReqMinBudget] = useState("");
  const [reqMaxBudget, setReqMaxBudget] = useState("");
  const [reqType, setReqType] = useState("Buy");
  const [reqDescription, setReqDescription] = useState("");
  const [reqLoading, setReqLoading] = useState(false);

  // Edit Requirement Form State
  const [editReqId, setEditReqId] = useState(null);
  const [editReqTitle, setEditReqTitle] = useState("");
  const [editReqLocation, setEditReqLocation] = useState("");
  const [editReqBudget, setEditReqBudget] = useState("");
  const [editReqMinBudget, setEditReqMinBudget] = useState("");
  const [editReqMaxBudget, setEditReqMaxBudget] = useState("");
  const [editReqType, setEditReqType] = useState("Buy");
  const [editReqDescription, setEditReqDescription] = useState("");
  const [editReqCategory, setEditReqCategory] = useState("");
  const [editReqSubCategory, setEditReqSubCategory] = useState("");
  const [editReqSubCategoriesList, setEditReqSubCategoriesList] = useState([]);
  const [editReqLoading, setEditReqLoading] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.mobile_no || user?.phone || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || user?.image || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // ----------------------------------------------------
  // Initial Fetch: Categories & User Requirements from DB ONLY
  // ----------------------------------------------------
  useEffect(() => {
    // 1. Fetch Categories directly from DB
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.body)) {
          setCategoriesList(data.body);
        }
      })
      .catch(err => console.log("Category fetch error:", err));

    // 2. Fetch Requirements directly from DB
    fetchRequirements();
  }, [user?.id, user?.role, API_BASE]);

  const fetchRequirements = () => {
    if (!user?.id) {
      setLoadingPosts(false);
      return;
    }
    setLoadingPosts(true);
    fetch(`${API_BASE}/get_requirements?userId=${user.id}&role=${user.role || "user"}`)
      .then(res => res.json())
      .then(data => {
        setLoadingPosts(false);
        if (data.success && Array.isArray(data.body)) {
          const formatted = data.body.map(r => ({
            id: r.id,
            title: r.title,
            location: r.location,
            budget: r.budget,
            minBudget: r.minBudget || "",
            maxBudget: r.maxBudget || "",
            reqType: r.reqType || "Buy",
            description: r.description || "",
            category_id: r.category_id,
            subcategory_id: r.subcategory_id,
            categoryName: r.category?.name || "N/A",
            subCategoryName: r.subcategory?.name || "N/A",
            date: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "2026-07-28",
            status: r.status || "Active"
          }));
          setPosts(formatted);
        } else {
          setPosts([]);
        }
      })
      .catch(err => {
        setLoadingPosts(false);
        console.log("Fetch requirements error:", err);
      });
  };

  // Helper to format currency numbers
  const formatCurrency = (val) => {
    if (!val) return "N/A";
    const num = Number(val);
    if (isNaN(num)) return val;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // ----------------------------------------------------
  // Category Change Handler -> Fetch Subcategories
  // ----------------------------------------------------
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubCategory("");

    if (!catId) {
      setSubCategoriesList([]);
      return;
    }

    fetch(`${API_BASE}/subcategories?category_id=${catId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.body)) {
          setSubCategoriesList(data.body);
        }
      })
      .catch(() => setSubCategoriesList([]));
  };

  // Edit Category Change Handler
  const handleEditCategoryChange = (catId) => {
    setEditReqCategory(catId);
    setEditReqSubCategory("");

    if (!catId) {
      setEditReqSubCategoriesList([]);
      return;
    }

    fetch(`${API_BASE}/subcategories?category_id=${catId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.body)) {
          setEditReqSubCategoriesList(data.body);
        }
      })
      .catch(() => setEditReqSubCategoriesList([]));
  };

  // ----------------------------------------------------
  // File Upload Handler for Profile Picture
  // ----------------------------------------------------
  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setModalErrorMsg("");
    const localPreview = URL.createObjectURL(file);
    setEditAvatar(localPreview);
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_BASE}/fileUpload`, {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setUploadingImage(false);
        if (data.success && data.body?.file) {
          const serverPath = data.body.file;
          const fullUrl = serverPath.startsWith("http") ? serverPath : `http://localhost:5000${serverPath}`;
          setEditAvatar(fullUrl);
        } else {
          setModalErrorMsg(data.message || "Failed to upload file to backend.");
        }
      })
      .catch(err => {
        setUploadingImage(false);
        setModalErrorMsg("Backend server is offline on port 5000. Using local image preview.");
      });
  };

  // ----------------------------------------------------
  // 1. Add Requirement Handler (Pure DB Sync)
  // ----------------------------------------------------
  const handleAddRequirement = (e) => {
    e.preventDefault();
    setMsg("");
    setErrorMsg("");
    setModalErrorMsg("");
    setReqLoading(true);

    const isDealer = user?.role === "dealer" || user?.role === 2;

    const payload = {
      userId: user?.id,
      role: user?.role,
      user_id: isDealer ? 0 : (user?.id || 0),
      dealer_id: isDealer ? (user?.id || 0) : 0,
      category_id: selectedCategory ? Number(selectedCategory) : null,
      subcategory_id: selectedSubCategory ? Number(selectedSubCategory) : null,
      title: reqTitle,
      location: reqLocation,
      budget: reqBudget,
      minBudget: reqMinBudget ? Number(reqMinBudget) : 0,
      maxBudget: reqMaxBudget ? Number(reqMaxBudget) : 0,
      reqType: reqType || "Buy",
      description: reqDescription
    };

    fetch(`${API_BASE}/add_requirement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setReqLoading(false);
        if (data.success || data.code === 200) {
          fetchRequirements();
          setShowAddReqModal(false);
          setReqTitle("");
          setReqLocation("");
          setReqBudget("");
          setReqMinBudget("");
          setReqMaxBudget("");
          setReqType("Buy");
          setReqDescription("");
          setSelectedCategory("");
          setSelectedSubCategory("");
          setMsg("✓ Requirement posted successfully to database!");
        } else {
          setModalErrorMsg(data.message || data.msg || "Failed to post requirement.");
        }
      })
      .catch(err => {
        setReqLoading(false);
        setModalErrorMsg("Server connection error: " + err.message);
      });
  };

  // ----------------------------------------------------
  // 2. Open View Requirement Modal
  // ----------------------------------------------------
  const openViewReqModal = (item) => {
    setViewReqItem(item);
    setShowViewReqModal(true);
  };

  // ----------------------------------------------------
  // 3. Open Edit Requirement Modal
  // ----------------------------------------------------
  const openEditReqModal = (item) => {
    setModalErrorMsg("");
    setEditReqId(item.id);
    setEditReqTitle(item.title || "");
    setEditReqLocation(item.location || "");
    setEditReqBudget(item.budget || "");
    setEditReqMinBudget(item.minBudget || "");
    setEditReqMaxBudget(item.maxBudget || "");
    setEditReqType(item.reqType || "Buy");
    setEditReqDescription(item.description || "");
    setEditReqCategory(item.category_id || "");
    setEditReqSubCategory(item.subcategory_id || "");
    setShowEditReqModal(true);

    if (item.category_id) {
      fetch(`${API_BASE}/subcategories?category_id=${item.category_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.body)) {
            setEditReqSubCategoriesList(data.body);
          }
        });
    }
  };

  // ----------------------------------------------------
  // 4. Save Edit Requirement Handler (Pure DB Sync)
  // ----------------------------------------------------
  const handleUpdateRequirement = (e) => {
    e.preventDefault();
    setMsg("");
    setErrorMsg("");
    setModalErrorMsg("");
    setEditReqLoading(true);

    const payload = {
      id: editReqId,
      category_id: editReqCategory ? Number(editReqCategory) : null,
      subcategory_id: editReqSubCategory ? Number(editReqSubCategory) : null,
      title: editReqTitle,
      location: editReqLocation,
      budget: editReqBudget,
      minBudget: editReqMinBudget ? Number(editReqMinBudget) : 0,
      maxBudget: editReqMaxBudget ? Number(editReqMaxBudget) : 0,
      reqType: editReqType || "Buy",
      description: editReqDescription
    };

    fetch(`${API_BASE}/edit_requirement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setEditReqLoading(false);
        if (data.success || data.code === 200) {
          fetchRequirements();
          setShowEditReqModal(false);
          setMsg("✓ Requirement updated successfully in database!");
        } else {
          setModalErrorMsg(data.message || data.msg || "Failed to update requirement.");
        }
      })
      .catch(err => {
        setEditReqLoading(false);
        setModalErrorMsg("Failed to connect to backend server: " + err.message);
      });
  };

  // ----------------------------------------------------
  // 5. Delete Requirement Handler (Pure DB Sync)
  // ----------------------------------------------------
  const handleDeleteRequirement = (id) => {
    setMsg("");
    setErrorMsg("");

    if (window.confirm("Are you sure you want to delete this requirement from database?")) {
      fetch(`${API_BASE}/delete_requirement/${id}`, {
        method: "DELETE"
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPosts(posts.filter(p => p.id !== id));
            setMsg("✓ Requirement deleted successfully from database.");
          } else {
            setErrorMsg(data.message || "Failed to delete requirement.");
          }
        })
        .catch(err => {
          setErrorMsg("Connection error: " + err.message);
        });
    }
  };

  // ----------------------------------------------------
  // 6. Edit Profile Handler
  // ----------------------------------------------------
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setMsg("");
    setErrorMsg("");
    setModalErrorMsg("");
    setProfileLoading(true);

    fetch(`${API_BASE}/edit_profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        name: editName,
        phone: editPhone,
        mobile_no: editPhone,
        image: editAvatar,
        profileImage: editAvatar
      })
    })
      .then(res => res.json())
      .then(data => {
        setProfileLoading(false);
        if (data.success || data.code === 200) {
          const updatedUser = {
            ...user,
            name: editName,
            mobile_no: editPhone,
            phone: editPhone,
            avatar: editAvatar,
            image: editAvatar
          };
          if (setUser) setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setShowEditProfileModal(false);
          setMsg("✓ Profile updated successfully!");
        } else {
          setModalErrorMsg(data.message || data.msg || "Failed to update profile.");
        }
      })
      .catch(err => {
        setProfileLoading(false);
        setModalErrorMsg("Error updating profile: " + err.message);
      });
  };

  // ----------------------------------------------------
  // 7. Change Password Handler
  // ----------------------------------------------------
  const handleChangePassword = (e) => {
    e.preventDefault();
    setMsg("");
    setErrorMsg("");
    setModalErrorMsg("");

    if (newPassword !== confirmNewPassword) {
      setModalErrorMsg("New password and confirm password do not match!");
      return;
    }

    setPassLoading(true);

    fetch(`${API_BASE}/change_password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        old_password: oldPassword,
        new_password: newPassword
      })
    })
      .then(res => res.json())
      .then(data => {
        setPassLoading(false);
        if (data.success || data.code === 200) {
          setShowChangePassModal(false);
          setOldPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          setMsg("✓ Password updated successfully!");
        } else {
          setModalErrorMsg(data.message || data.msg || "Incorrect old password. Please try again.");
        }
      })
      .catch(err => {
        setPassLoading(false);
        setModalErrorMsg("Failed to connect to backend server on port 5000: " + err.message);
      });
  };

  return (
    <div>
      <div style={{ maxWidth: "1000px", width: "100%" }}>
        
        {/* Global Feedback Banner */}
        {msg && (
          <div style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "0.85rem 1.25rem", borderRadius: "12px", fontWeight: "700", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{msg}</span>
            <button onClick={() => setMsg("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#065f46", fontWeight: "700" }}>✕</button>
          </div>
        )}

        {errorMsg && (
          <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.85rem 1.25rem", borderRadius: "12px", fontWeight: "700", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>❌ {errorMsg}</span>
            <button onClick={() => setErrorMsg("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontWeight: "700" }}>✕</button>
          </div>
        )}

        {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.25rem" }}>My Account ({user?.name || "User"})</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Manage your posted property requirements & profile settings</p>
          </div>
          
          <button onClick={() => { setErrorMsg(""); setMsg(""); setModalErrorMsg(""); setShowAddReqModal(true); }} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaPlus /> Post Requirement
          </button>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <img
              src={user?.avatar || user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"}
              alt="Avatar"
              style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary)" }}
            />
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {user?.name || "User"} <FaCheckCircle color="#10b981" />
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                {user?.email || "user@example.com"} • Registered {(user?.role === "dealer" || user?.role === 2) ? "Verified Dealer" : "Individual Buyer"}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600" }}>
                📞 {user?.mobile_no || user?.phone || "No phone number added"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setEditName(user?.name || "");
                setEditPhone(user?.mobile_no || user?.phone || "");
                setEditAvatar(user?.avatar || user?.image || "");
                setErrorMsg("");
                setModalErrorMsg("");
                setMsg("");
                setShowEditProfileModal(true);
              }}
              className="btn-outline"
              style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <FaEdit /> Edit Profile & Photo
            </button>

            <button
              onClick={() => {
                setOldPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setErrorMsg("");
                setModalErrorMsg("");
                setMsg("");
                setShowChangePassModal(true);
              }}
              className="btn-outline"
              style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", borderColor: "#6366f1", color: "#6366f1" }}
            >
              <FaKey /> Change Password
            </button>
          </div>
        </div>

        {/* My Property Requirements / Posts Table (PURE DATABASE DATA ONLY) */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>My Property Requirements / Posts</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
              Total: {posts.length} Requirement{posts.length !== 1 ? "s" : ""}
            </span>
          </div>
          
          {loadingPosts ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)", fontWeight: "600" }}>
              ⏳ Loading requirements from database...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem" }}>No active property requirements posted in Database.</p>
              <button onClick={() => setShowAddReqModal(true)} className="btn-primary" style={{ margin: "0 auto" }}>
                <FaPlus /> Post Your First Requirement
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "0.75rem" }}>Title</th>
                    <th style={{ padding: "0.75rem" }}>Type</th>
                    <th style={{ padding: "0.75rem" }}>Location</th>
                    <th style={{ padding: "0.75rem" }}>Budget</th>
                    <th style={{ padding: "0.75rem" }}>Date</th>
                    <th style={{ padding: "0.75rem" }}>Status</th>
                    <th style={{ padding: "0.75rem", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.75rem", fontWeight: "700" }}>{p.title}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                          {p.reqType || "Buy"}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>{p.location}</td>
                      <td style={{ padding: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>{p.budget}</td>
                      <td style={{ padding: "0.75rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>{p.date}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span className="badge badge-featured">{p.status}</span>
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                          <button
                            onClick={() => openViewReqModal(p)}
                            title="View Details"
                            style={{
                              backgroundColor: "#f0fdf4",
                              color: "#166534",
                              border: "none",
                              padding: "0.4rem 0.65rem",
                              borderRadius: "8px",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem"
                            }}
                          >
                            <FaEye size={12} /> View
                          </button>

                          <button
                            onClick={() => openEditReqModal(p)}
                            title="Edit Requirement"
                            style={{
                              backgroundColor: "#e0e7ff",
                              color: "#4338ca",
                              border: "none",
                              padding: "0.4rem 0.65rem",
                              borderRadius: "8px",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem"
                            }}
                          >
                            <FaEdit size={12} /> Edit
                          </button>

                          <button
                            onClick={() => handleDeleteRequirement(p.id)}
                            title="Delete Requirement"
                            style={{
                              backgroundColor: "#fee2e2",
                              color: "#ef4444",
                              border: "none",
                              padding: "0.4rem 0.65rem",
                              borderRadius: "8px",
                              fontWeight: "700",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem"
                            }}
                          >
                            <FaTrash size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ==================================================== */}
      {/* MODAL 0: View Requirement Details Modal              */}
      {/* ==================================================== */}
      {showViewReqModal && viewReqItem && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaInfoCircle color="var(--primary)" size={20} />
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Requirement Details</h3>
              </div>
              <button onClick={() => setShowViewReqModal(false)} style={closeBtnStyle}><FaTimes /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Title & Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Title</span>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: "800", marginTop: "0.1rem" }}>{viewReqItem.title}</h4>
                </div>
                <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "800" }}>
                  {viewReqItem.reqType || "Buy"}
                </span>
              </div>

              {/* Grid Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "var(--bg-main)", padding: "1rem", borderRadius: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <FaMapMarkerAlt /> Location
                  </span>
                  <p style={{ fontWeight: "700", fontSize: "0.95rem", marginTop: "0.2rem" }}>{viewReqItem.location}</p>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <FaRupeeSign /> Budget Range
                  </span>
                  <p style={{ fontWeight: "800", color: "var(--primary)", fontSize: "0.95rem", marginTop: "0.2rem" }}>{viewReqItem.budget}</p>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Min Budget</span>
                  <p style={{ fontWeight: "700", fontSize: "0.9rem", marginTop: "0.2rem" }}>{formatCurrency(viewReqItem.minBudget)}</p>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Max Budget</span>
                  <p style={{ fontWeight: "700", fontSize: "0.9rem", marginTop: "0.2rem" }}>{formatCurrency(viewReqItem.maxBudget)}</p>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <FaTags /> Category
                  </span>
                  <p style={{ fontWeight: "700", fontSize: "0.9rem", marginTop: "0.2rem" }}>{viewReqItem.categoryName || "N/A"}</p>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <FaLayerGroup /> Subcategory
                  </span>
                  <p style={{ fontWeight: "700", fontSize: "0.9rem", marginTop: "0.2rem" }}>{viewReqItem.subCategoryName || "N/A"}</p>
                </div>
              </div>

              {/* Description */}
              {viewReqItem.description && (
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Description</span>
                  <p style={{ fontSize: "0.9rem", backgroundColor: "var(--bg-main)", padding: "0.85rem", borderRadius: "10px", marginTop: "0.3rem", lineHeight: "1.5" }}>
                    {viewReqItem.description}
                  </p>
                </div>
              )}

              {/* Status & Date Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <span>Posted On: <strong>{viewReqItem.date}</strong></span>
                <span className="badge badge-featured">{viewReqItem.status}</span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowViewReqModal(false)} className="btn-primary" style={{ padding: "0.6rem 1.5rem" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: Add Requirement                             */}
      {/* ==================================================== */}
      {showAddReqModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800" }}>Post New Requirement</h3>
              <button onClick={() => setShowAddReqModal(false)} style={closeBtnStyle}><FaTimes /></button>
            </div>

            <form onSubmit={handleAddRequirement}>
              {modalErrorMsg && (
                <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.25rem" }}>
                  ❌ {modalErrorMsg}
                </div>
              )}

              {/* Requirement Type Dropdown (reqType) */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Requirement Type (reqType)</label>
                <div style={{ position: "relative" }}>
                  <FaExchangeAlt style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <select
                    value={reqType}
                    onChange={e => setReqType(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", cursor: "pointer" }}
                  >
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                    <option value="Lease">Lease</option>
                  </select>
                </div>
              </div>

              {/* Category Dropdown */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Select Category</label>
                <div style={{ position: "relative" }}>
                  <FaTags style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <select
                    value={selectedCategory}
                    onChange={e => handleCategoryChange(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", cursor: "pointer" }}
                  >
                    <option value="">-- Choose Category --</option>
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategory Dropdown */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Select Subcategory</label>
                <div style={{ position: "relative" }}>
                  <FaLayerGroup style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <select
                    value={selectedSubCategory}
                    onChange={e => setSelectedSubCategory(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", cursor: "pointer" }}
                  >
                    <option value="">-- Choose Subcategory --</option>
                    {subCategoriesList.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Requirement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 BHK Flat in Gurgaon"
                  value={reqTitle}
                  onChange={e => setReqTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Location */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Preferred Location / Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golf Course Extension, Sector 56"
                  value={reqLocation}
                  onChange={e => setReqLocation(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Budget Display Text */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Budget Range (Display Text)</label>
                <div style={{ position: "relative" }}>
                  <FaRupeeSign style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹50 Lakh - ₹1 Cr"
                    value={reqBudget}
                    onChange={e => setReqBudget(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Min & Max Budget Numeric Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Min Budget (minBudget)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000000"
                    value={reqMinBudget}
                    onChange={e => setReqMinBudget(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max Budget (maxBudget)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10000000"
                    value={reqMaxBudget}
                    onChange={e => setReqMaxBudget(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Description (description)</label>
                <textarea
                  rows="3"
                  placeholder="Enter detailed requirement description..."
                  value={reqDescription}
                  onChange={e => setReqDescription(e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAddReqModal(false)} className="btn-outline" style={{ padding: "0.65rem 1.25rem" }}>
                  Cancel
                </button>
                <button type="submit" disabled={reqLoading} className="btn-primary" style={{ padding: "0.65rem 1.25rem" }}>
                  {reqLoading ? "Posting..." : <><FaPlus /> Add Requirement</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1B: Edit Requirement Modal                     */}
      {/* ==================================================== */}
      {showEditReqModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800" }}>Edit Property Requirement</h3>
              <button onClick={() => setShowEditReqModal(false)} style={closeBtnStyle}><FaTimes /></button>
            </div>

            <form onSubmit={handleUpdateRequirement}>
              {modalErrorMsg && (
                <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.25rem" }}>
                  ❌ {modalErrorMsg}
                </div>
              )}

              {/* Requirement Type Dropdown (reqType) */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Requirement Type (reqType)</label>
                <div style={{ position: "relative" }}>
                  <FaExchangeAlt style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <select
                    value={editReqType}
                    onChange={e => setEditReqType(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", cursor: "pointer" }}
                  >
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                    <option value="Lease">Lease</option>
                  </select>
                </div>
              </div>

              {/* Category Dropdown */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Select Category</label>
                <div style={{ position: "relative" }}>
                  <FaTags style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <select
                    value={editReqCategory}
                    onChange={e => handleEditCategoryChange(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", cursor: "pointer" }}
                  >
                    <option value="">-- Choose Category --</option>
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategory Dropdown */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Select Subcategory</label>
                <div style={{ position: "relative" }}>
                  <FaLayerGroup style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <select
                    value={editReqSubCategory}
                    onChange={e => setEditReqSubCategory(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", cursor: "pointer" }}
                  >
                    <option value="">-- Choose Subcategory --</option>
                    {editReqSubCategoriesList.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Requirement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 BHK Flat in Gurgaon"
                  value={editReqTitle}
                  onChange={e => setEditReqTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Location */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Preferred Location / Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golf Course Extension, Sector 56"
                  value={editReqLocation}
                  onChange={e => setEditReqLocation(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Budget Display Text */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Budget Range (Display Text)</label>
                <div style={{ position: "relative" }}>
                  <FaRupeeSign style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹50 Lakh - ₹1 Cr"
                    value={editReqBudget}
                    onChange={e => setEditReqBudget(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Min & Max Budget Numeric Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Min Budget (minBudget)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000000"
                    value={editReqMinBudget}
                    onChange={e => setEditReqMinBudget(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max Budget (maxBudget)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10000000"
                    value={editReqMaxBudget}
                    onChange={e => setEditReqMaxBudget(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Description (description)</label>
                <textarea
                  rows="3"
                  placeholder="Enter detailed requirement description..."
                  value={editReqDescription}
                  onChange={e => setEditReqDescription(e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowEditReqModal(false)} className="btn-outline" style={{ padding: "0.65rem 1.25rem" }}>
                  Cancel
                </button>
                <button type="submit" disabled={editReqLoading} className="btn-primary" style={{ padding: "0.65rem 1.25rem" }}>
                  {editReqLoading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: Edit Profile (Name, Phone, Image)            */}
      {/* ==================================================== */}
      {showEditProfileModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800" }}>Edit Profile Details</h3>
              <button onClick={() => setShowEditProfileModal(false)} style={closeBtnStyle}><FaTimes /></button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              {modalErrorMsg && (
                <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.25rem" }}>
                  ❌ {modalErrorMsg}
                </div>
              )}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <FaUser style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Mobile / Phone Number</label>
                <div style={{ position: "relative" }}>
                  <FaPhone style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98123 45678"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  style={{
                    ...inputStyle,
                    padding: "0.5rem",
                    cursor: "pointer"
                  }}
                />

                {editAvatar && (
                  <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "var(--bg-main)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <img src={editAvatar} alt="Preview" style={{ width: "55px", height: "55px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }} />
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.15rem" }}>Live Image Preview</p>
                      <span style={{ fontSize: "0.75rem", color: uploadingImage ? "#d97706" : "#10b981", fontWeight: "600" }}>
                        {uploadingImage ? "⏳ Uploading to backend users folder..." : "✓ Saved in users folder & ready to update"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowEditProfileModal(false)} className="btn-outline" style={{ padding: "0.65rem 1.25rem" }}>
                  Cancel
                </button>
                <button type="submit" disabled={profileLoading} className="btn-primary" style={{ padding: "0.65rem 1.25rem" }}>
                  {profileLoading ? "Updating..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: Change Password (Old Pass + Eye Toggle)     */}
      {/* ==================================================== */}
      {showChangePassModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800" }}>Change Password</h3>
              <button onClick={() => setShowChangePassModal(false)} style={closeBtnStyle}><FaTimes /></button>
            </div>

            <form onSubmit={handleChangePassword}>
              {modalErrorMsg && (
                <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", textAlign: "center", marginBottom: "1.25rem" }}>
                  ❌ {modalErrorMsg}
                </div>
              )}
              {/* Old Password */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Current (Old) Password</label>
                <div style={{ position: "relative" }}>
                  <FaLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type={showOldPass ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "42px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    style={eyeToggleStyle}
                  >
                    {showOldPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: "relative" }}>
                  <FaLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "42px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={eyeToggleStyle}
                  >
                    {showNewPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <FaLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type={showConfirmNewPass ? "text" : "password"}
                    required
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "42px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                    style={eyeToggleStyle}
                  >
                    {showConfirmNewPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowChangePassModal(false)} className="btn-outline" style={{ padding: "0.65rem 1.25rem" }}>
                  Cancel
                </button>
                <button type="submit" disabled={passLoading} className="btn-primary" style={{ padding: "0.65rem 1.25rem" }}>
                  {passLoading ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Component Styles
const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: "700",
  marginBottom: "0.4rem",
  color: "var(--text-muted)"
};

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-main)",
  color: "var(--text-main)",
  fontSize: "0.9rem",
  outline: "none"
};

const eyeToggleStyle = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "var(--text-muted)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "1rem"
};

const modalContentStyle = {
  backgroundColor: "var(--card-bg, #ffffff)",
  borderRadius: "20px",
  padding: "2rem",
  maxWidth: "480px",
  width: "100%",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  fontSize: "1.2rem",
  color: "var(--text-muted)",
  cursor: "pointer"
};

export default UserDashboard;
