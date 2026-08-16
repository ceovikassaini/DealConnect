import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import apiInstance from "../../utils/apiInstance";
import { TableCard } from "../../components/common/PageTable";

// Initial permission matrix strictly matching MyRyd sidebar modules
const initialPermissionState = {
  main: {
    dashboard: { read: false }
  },
  management: {
    users: { read: false, write: false, export: false },
    drivers: { read: false, write: false, export: false },
    rides: { read: false, write: false, export: false },
    payments: { read: false, write: false, export: false },
    subscriptions: { read: false, write: false },
    geofences: { read: false, write: false }
  },
  content: {
    notifications: { read: false, write: false },
    promoCodes: { read: false, write: false },
    support: { read: false, write: false }
  },
  cmsPages: {
    aboutUs: { read: false, write: false },
    privacy: { read: false, write: false },
    terms: { read: false, write: false },
    faqs: { read: false, write: false },
    landingPage: { read: false, write: false },
    safety: { read: false, write: false }
  },
  settings: {
    configuration: { read: false, write: false },
    vehicles: { read: false, write: false },
    userAccess: { read: false, write: false },
    logs: { read: false }
  }
};

const UserAccess = () => {
  const [viewMode, setViewMode] = useState("list"); // "list" | "form"
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    status: true
  });

  const [permissions, setPermissions] = useState(initialPermissionState);

  // Fetch all subadmins
  const fetchSubadmins = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get("/subadmins");
      if (res.data?.success) {
        setSubadmins(res.data.body || []);
      }
    } catch (err) {
      toast.error("Failed to fetch subadmins");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubadmins();
  }, [fetchSubadmins]);

  // Open Form for Add
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      status: true
    });
    setPermissions(initialPermissionState);
    setViewMode("form");
  };

  // Open Form for Edit
  const handleEdit = (subadmin) => {
    setEditingId(subadmin.id);
    setFormData({
      name: subadmin.name || "",
      last_name: subadmin.last_name || "",
      email: subadmin.email || "",
      phone: subadmin.phone || "",
      password: "",
      confirmPassword: "",
      status: subadmin.status === "active" || subadmin.status === true
    });

    // Deep merge saved permissions with default structure
    const merged = JSON.parse(JSON.stringify(initialPermissionState));
    if (subadmin.permissions && typeof subadmin.permissions === "object") {
      Object.keys(subadmin.permissions).forEach((secKey) => {
        if (merged[secKey]) {
          Object.keys(subadmin.permissions[secKey]).forEach((modKey) => {
            if (merged[secKey][modKey]) {
              merged[secKey][modKey] = {
                ...merged[secKey][modKey],
                ...subadmin.permissions[secKey][modKey]
              };
            }
          });
        }
      });
    }

    setPermissions(merged);
    setViewMode("form");
  };

  // Delete Subadmin
  const handleDelete = async (subadmin) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete sub-admin "${subadmin.name} ${subadmin.last_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;

    try {
      await apiInstance.delete(`/subadmins/${subadmin.id}`);
      toast.success("Sub-admin deleted successfully");
      fetchSubadmins();
    } catch (err) {
      toast.error("Failed to delete sub-admin");
    }
  };

  // Form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Permission checkbox toggle
  const togglePermission = (path, action) => {
    setPermissions((prev) => {
      const keys = path.split(".");
      const updated = JSON.parse(JSON.stringify(prev));

      let curr = updated;
      for (let i = 0; i < keys.length; i++) {
        if (!curr[keys[i]]) curr[keys[i]] = {};
        if (i === keys.length - 1) {
          curr[keys[i]][action] = !curr[keys[i]][action];
        } else {
          curr = curr[keys[i]];
        }
      }
      return updated;
    });
  };

  // Section Select All helper
  const isSectionAllSelected = (sectionKey) => {
    const section = permissions[sectionKey];
    if (!section) return false;
    for (const subKey in section) {
      const actions = section[subKey];
      for (const act in actions) {
        if (!actions[act]) return false;
      }
    }
    return true;
  };

  const toggleSectionAll = (sectionKey) => {
    const targetState = !isSectionAllSelected(sectionKey);
    setPermissions((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const section = updated[sectionKey];
      if (section) {
        for (const subKey in section) {
          for (const act in section[subKey]) {
            section[subKey][act] = targetState;
          }
        }
      }
      return updated;
    });
  };

  // Save Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("First Name is required");
    if (!formData.last_name.trim()) return toast.error("Last Name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!formData.phone.trim()) return toast.error("Mobile Number is required");

    if (!editingId) {
      if (!formData.password) return toast.error("Password is required");
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match");
      }
    } else {
      if (formData.password && formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match");
      }
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        permissions: permissions
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingId) {
        await apiInstance.put(`/subadmins/${editingId}`, payload);
        toast.success("Sub-admin updated successfully");
      } else {
        await apiInstance.post("/subadmins", payload);
        toast.success("Sub-admin created successfully");
      }

      setViewMode("list");
      fetchSubadmins();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save sub-admin");
    } finally {
      setSaving(false);
    }
  };

  if (viewMode === "form") {
    return (
      <div style={{ padding: "8px 4px" }}>
        <ToastContainer position="top-right" autoClose={2500} />

        {/* Form Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-dark mb-0">{editingId ? "EDIT USER" : "ADD USER"}</h4>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setViewMode("list")}
              style={{ borderRadius: "8px", fontWeight: "600" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="btn btn-primary px-4"
              style={{ background: "#4f46e5", border: "none", borderRadius: "8px", fontWeight: "700" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* LEFT CARD: USER DETAILS */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: "#ffffff" }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold" style={{ fontSize: "13px" }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control p-2.5"
                      placeholder="First Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold" style={{ fontSize: "13px" }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      className="form-control p-2.5"
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold" style={{ fontSize: "13px" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control p-2.5"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold" style={{ fontSize: "13px" }}>
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control p-2.5"
                      placeholder="Mobile Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold" style={{ fontSize: "13px" }}>
                      Password {editingId ? "(leave blank if unchanged)" : "*"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control p-2.5"
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingId}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted fw-semibold" style={{ fontSize: "13px" }}>
                      Confirm Password {editingId ? "(leave blank if unchanged)" : "*"}
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control p-2.5"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required={!editingId}
                    />
                  </div>
                  <div className="col-12 mt-3">
                    <label className="form-label text-muted fw-semibold d-block" style={{ fontSize: "13px" }}>
                      Status
                    </label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="status"
                        checked={formData.status}
                        onChange={handleInputChange}
                        style={{ width: "40px", height: "20px", cursor: "pointer" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CARD: PERMISSION MATRIX (Exact Sidebar Modules) */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: "#ffffff" }}>
                <h5 className="fw-bold text-dark mb-4">Permission Matrix</h5>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* 1. MAIN */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="material-icons text-primary" style={{ fontSize: "20px", color: "#4f46e5" }}>dashboard</i>
                        <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>MAIN</span>
                      </div>
                      <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isSectionAllSelected("main")}
                          onChange={() => toggleSectionAll("main")}
                        />
                        Select All
                      </label>
                    </div>
                    <div className="ms-4 d-flex align-items-center gap-4 py-1">
                      <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Dashboard</span>
                      <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={!!permissions.main?.dashboard?.read}
                          onChange={() => togglePermission("main.dashboard", "read")}
                        />
                        Read
                      </label>
                    </div>
                  </div>

                  {/* 2. MANAGEMENT */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="material-icons text-primary" style={{ fontSize: "20px", color: "#4f46e5" }}>people</i>
                        <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>MANAGEMENT</span>
                      </div>
                      <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isSectionAllSelected("management")}
                          onChange={() => toggleSectionAll("management")}
                        />
                        Select All
                      </label>
                    </div>
                    <div className="ms-4 d-flex flex-column gap-2">
                      {/* Users */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Users</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.users?.read}
                            onChange={() => togglePermission("management.users", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.users?.write}
                            onChange={() => togglePermission("management.users", "write")}
                          />
                          Write
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.users?.export}
                            onChange={() => togglePermission("management.users", "export")}
                          />
                          Export
                        </label>
                      </div>

                      {/* Drivers */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Drivers</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.drivers?.read}
                            onChange={() => togglePermission("management.drivers", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.drivers?.write}
                            onChange={() => togglePermission("management.drivers", "write")}
                          />
                          Write
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.drivers?.export}
                            onChange={() => togglePermission("management.drivers", "export")}
                          />
                          Export
                        </label>
                      </div>

                      {/* Rides Management */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Rides Management</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.rides?.read}
                            onChange={() => togglePermission("management.rides", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.rides?.write}
                            onChange={() => togglePermission("management.rides", "write")}
                          />
                          Write
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.rides?.export}
                            onChange={() => togglePermission("management.rides", "export")}
                          />
                          Export
                        </label>
                      </div>

                      {/* Payments */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Payments</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.payments?.read}
                            onChange={() => togglePermission("management.payments", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.payments?.write}
                            onChange={() => togglePermission("management.payments", "write")}
                          />
                          Write
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.payments?.export}
                            onChange={() => togglePermission("management.payments", "export")}
                          />
                          Export
                        </label>
                      </div>

                      {/* Subscriptions */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Subscriptions</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.subscriptions?.read}
                            onChange={() => togglePermission("management.subscriptions", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.subscriptions?.write}
                            onChange={() => togglePermission("management.subscriptions", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* Geofences */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Geofences</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.geofences?.read}
                            onChange={() => togglePermission("management.geofences", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.management?.geofences?.write}
                            onChange={() => togglePermission("management.geofences", "write")}
                          />
                          Write
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 3. CONTENT */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="material-icons text-primary" style={{ fontSize: "20px", color: "#4f46e5" }}>article</i>
                        <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>CONTENT</span>
                      </div>
                      <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isSectionAllSelected("content")}
                          onChange={() => toggleSectionAll("content")}
                        />
                        Select All
                      </label>
                    </div>
                    <div className="ms-4 d-flex flex-column gap-2">
                      {/* Notifications */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Notifications</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.content?.notifications?.read}
                            onChange={() => togglePermission("content.notifications", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.content?.notifications?.write}
                            onChange={() => togglePermission("content.notifications", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* Promo Codes */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Promo Codes</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.content?.promoCodes?.read}
                            onChange={() => togglePermission("content.promoCodes", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.content?.promoCodes?.write}
                            onChange={() => togglePermission("content.promoCodes", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* Support */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Support</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.content?.support?.read}
                            onChange={() => togglePermission("content.support", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.content?.support?.write}
                            onChange={() => togglePermission("content.support", "write")}
                          />
                          Write
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 4. CMS PAGES */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="material-icons text-primary" style={{ fontSize: "20px", color: "#4f46e5" }}>web</i>
                        <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>CMS PAGES</span>
                      </div>
                      <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isSectionAllSelected("cmsPages")}
                          onChange={() => toggleSectionAll("cmsPages")}
                        />
                        Select All
                      </label>
                    </div>
                    <div className="ms-4 d-flex flex-column gap-2">
                      {/* About Us */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>About Us</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.aboutUs?.read}
                            onChange={() => togglePermission("cmsPages.aboutUs", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.aboutUs?.write}
                            onChange={() => togglePermission("cmsPages.aboutUs", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* Privacy Policy */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Privacy Policy</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.privacy?.read}
                            onChange={() => togglePermission("cmsPages.privacy", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.privacy?.write}
                            onChange={() => togglePermission("cmsPages.privacy", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* Terms & Conditions */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Terms & Conditions</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.terms?.read}
                            onChange={() => togglePermission("cmsPages.terms", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.terms?.write}
                            onChange={() => togglePermission("cmsPages.terms", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* FAQs */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>FAQs</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.faqs?.read}
                            onChange={() => togglePermission("cmsPages.faqs", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.faqs?.write}
                            onChange={() => togglePermission("cmsPages.faqs", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* Landing Page */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Landing Page</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.landingPage?.read}
                            onChange={() => togglePermission("cmsPages.landingPage", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.landingPage?.write}
                            onChange={() => togglePermission("cmsPages.landingPage", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* Safety Settings */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Safety Settings</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.safety?.read}
                            onChange={() => togglePermission("cmsPages.safety", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.cmsPages?.safety?.write}
                            onChange={() => togglePermission("cmsPages.safety", "write")}
                          />
                          Write
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 5. SETTINGS */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="material-icons text-primary" style={{ fontSize: "20px", color: "#4f46e5" }}>settings</i>
                        <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>SETTINGS</span>
                      </div>
                      <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isSectionAllSelected("settings")}
                          onChange={() => toggleSectionAll("settings")}
                        />
                        Select All
                      </label>
                    </div>
                    <div className="ms-4 d-flex flex-column gap-2">
                      {/* Configuration */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Configuration</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.settings?.configuration?.read}
                            onChange={() => togglePermission("settings.configuration", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.settings?.configuration?.write}
                            onChange={() => togglePermission("settings.configuration", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* Vehicles Settings */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Vehicles Settings</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.settings?.vehicles?.read}
                            onChange={() => togglePermission("settings.vehicles", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.settings?.vehicles?.write}
                            onChange={() => togglePermission("settings.vehicles", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* User & Access */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>User & Access</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.settings?.userAccess?.read}
                            onChange={() => togglePermission("settings.userAccess", "read")}
                          />
                          Read
                        </label>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.settings?.userAccess?.write}
                            onChange={() => togglePermission("settings.userAccess", "write")}
                          />
                          Write
                        </label>
                      </div>

                      {/* Logs */}
                      <div className="d-flex align-items-center gap-4 py-1">
                        <span className="text-muted" style={{ width: "140px", fontSize: "13px" }}>Logs</span>
                        <label className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!permissions.settings?.logs?.read}
                            onChange={() => togglePermission("settings.logs", "read")}
                          />
                          Read
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div style={{ padding: "8px 4px" }}>
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: "#111827" }}>USER & ACCESS</h4>
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Manage sub-admin users, credentials, and access permissions.
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={handleAddNew}
          style={{ background: "#4f46e5", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: "600" }}
        >
          <i className="material-icons" style={{ fontSize: "20px" }}>add</i>
          Add Sub Admin
        </button>
      </div>

      <TableCard>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 border-0">Name</th>
                <th className="px-4 py-3 border-0">Email</th>
                <th className="px-4 py-3 border-0">Phone</th>
                <th className="px-4 py-3 border-0">Status</th>
                <th className="px-4 py-3 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    Loading sub-admins...
                  </td>
                </tr>
              ) : subadmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <i className="material-icons d-block mb-2" style={{ fontSize: "36px" }}>admin_panel_settings</i>
                    No sub-admins found. Click "Add Sub Admin" to create one.
                  </td>
                </tr>
              ) : (
                subadmins.map((subadmin) => (
                  <tr key={subadmin.id}>
                    <td className="px-4 py-3 fw-bold text-dark">
                      {subadmin.name} {subadmin.last_name}
                    </td>
                    <td className="px-4 py-3 text-muted">{subadmin.email}</td>
                    <td className="px-4 py-3 text-muted">{subadmin.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          subadmin.status === "active" ? "bg-success" : "bg-danger"
                        }`}
                        style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "8px" }}
                      >
                        {subadmin.status === "active" ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        className="btn btn-sm btn-light me-2"
                        onClick={() => handleEdit(subadmin)}
                        title="Edit Sub Admin"
                      >
                        <i className="material-icons" style={{ fontSize: "18px", color: "#4f46e5" }}>edit</i>
                      </button>
                      <button
                        className="btn btn-sm btn-light"
                        onClick={() => handleDelete(subadmin)}
                        title="Delete Sub Admin"
                      >
                        <i className="material-icons" style={{ fontSize: "18px", color: "#ef4444" }}>delete</i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableCard>
    </div>
  );
};

export default UserAccess;
