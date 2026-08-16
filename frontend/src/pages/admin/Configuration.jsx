import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import apiInstance from "../../utils/apiInstance";
import { TableCard, Modal } from "../../components/common/PageTable";

const Configuration = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [openModal, setOpenModal] = useState(null); // 'firebase', 'msg91', 'google', or null

  const [formData, setFormData] = useState({
    // General
    app_name: "",
    support_email: "",
    support_phone: "",
    currency_symbol: "",
    currency_code: "",

    // Ride
    min_ride_distance: "",
    max_ride_distance: "",
    auto_ride_cancel_time: "",
    driver_wait_time: "",

    // Driver
    driver_search_range: "1,10",
    min_driver_search_range: "1",
    max_driver_search_range: "10",
    min_distance_arrived: "",
    driver_penalty_wait_time: "",

    // Integrations
    firebase_server_key: "",
    firebase_project_id: "",
    firebase_client_email: "",
    firebase_private_key: "",
    msg91_auth_key: "",
    msg91_sender_id: "",
    msg91_template_id: "",
    google_map_client_id: "",
    google_map_key: "",

    // Payment Gateway
    stripe_secret_key: "",
    stripe_publish_key: "",
    stripe_mode: "sandbox",

    // Wallet
    wallet_status: 1,
    min_wallet_recharge: "",
    max_wallet_recharge: "",

    // Versions
    stable_android_user_version: "",
    deprecated_android_user_version: "",
    stable_android_driver_version: "",
    deprecated_android_driver_version: "",
    stable_ios_user_version: "",
    deprecated_ios_user_version: "",
    stable_ios_driver_version: "",
    deprecated_ios_driver_version: "",

    // Charges
    gst_tax: "",
    admin_commission: "",
    booking_fee: "",
    waiting_fee_per_min: ""
  });

  // Temporary integration state for modals
  const [tempIntegrationData, setTempIntegrationData] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setFetching(true);
        const res = await apiInstance.get("/settings-config");
        if (res.data && res.data.body) {
          const body = res.data.body;
          let minRange = "1";
          let maxRange = "10";
          if (body.driver_search_range) {
            const parts = String(body.driver_search_range).split(",").map(p => p.trim());
            minRange = parts[0] || "1";
            maxRange = parts[parts.length - 1] || parts[0] || "10";
          }
          setFormData({
            ...body,
            wallet_status: body.wallet_status === 1 || body.wallet_status === true ? 1 : 0,
            min_driver_search_range: minRange,
            max_driver_search_range: maxRange
          });
        }
      } catch (err) {
        console.error("Error fetching configurations:", err);
        toast.error("Failed to load configurations.");
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? (checked ? 1 : 0) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));
  };

  const handleOpenIntegrationModal = (type) => {
    setOpenModal(type);
    if (type === "firebase") {
      setTempIntegrationData({
        firebase_project_id: formData.firebase_project_id || "",
        firebase_client_email: formData.firebase_client_email || "",
        firebase_private_key: formData.firebase_private_key || "",
        firebase_server_key: formData.firebase_server_key || ""
      });
    } else if (type === "msg91") {
      setTempIntegrationData({
        msg91_auth_key: formData.msg91_auth_key || "",
        msg91_sender_id: formData.msg91_sender_id || "",
        msg91_template_id: formData.msg91_template_id || ""
      });
    } else if (type === "google") {
      setTempIntegrationData({
        google_map_client_id: formData.google_map_client_id || "",
        google_map_key: formData.google_map_key || ""
      });
    }
  };

  const handleSaveIntegrationModal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedFormData = { ...formData, ...tempIntegrationData };
      await apiInstance.put("/settings-config", updatedFormData);
      setFormData(updatedFormData);
      toast.success(`${openModal.toUpperCase()} Integration updated successfully!`);
      setOpenModal(null);
    } catch (err) {
      console.error(`Error updating ${openModal} integration:`, err);
      toast.error(`Failed to update ${openModal} integration.`);
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationTempChange = (e) => {
    const { name, value } = e.target;
    setTempIntegrationData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        driver_search_range: `${formData.min_driver_search_range || "1"},${formData.max_driver_search_range || "10"}`
      };
      await apiInstance.put("/settings-config", submitData);
      toast.success("Configuration updated successfully!");
    } catch (err) {
      console.error("Error updating configurations:", err);
      toast.error("Failed to update configuration settings.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border" style={{ width: "3rem", height: "3rem", color: "var(--primary)" }} />
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "ride", label: "Ride" },
    { id: "driver", label: "Driver" },
    { id: "integrations", label: "Integrations" },
    { id: "payment", label: "Payment Gateway" },
    { id: "versions", label: "Versions" },
    { id: "charges", label: "Charges" }
  ];

  return (
    <div style={{ padding: "24px 30px" }}>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <h4 style={{ margin: 0, fontWeight: "800", color: "#1e293b", fontSize: "22px", letterSpacing: "-0.5px" }}>CONFIGURATION</h4>
      </div>

      {/* Tabs list */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "28px",
          overflowX: "auto",
          scrollbarWidth: "none",
          gap: "24px"
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: isActive ? "3px solid #4f46e5" : "3px solid transparent",
                color: isActive ? "#4f46e5" : "#64748b",
                padding: "12px 4px",
                fontSize: "14px",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap"
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <TableCard>
        <div style={{ padding: "40px 48px", position: "relative" }}>
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10
              }}
            >
              <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="row">
                <div className="col-lg-3 col-md-4 mb-4">
                  <h5 style={sectionTitleStyle}>General Settings</h5>
                </div>
                <div className="col-lg-9 col-md-8">
                  <div className="row g-4">
                    <div className="col-md-12 mb-3">
                      <label style={labelStyle}>App Name *</label>
                      <input type="text" name="app_name" value={formData.app_name} onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label style={labelStyle}>Support Email *</label>
                      <input type="email" name="support_email" value={formData.support_email} onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label style={labelStyle}>Support Phone *</label>
                      <input type="text" name="support_phone" value={formData.support_phone} onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label style={labelStyle}>Currency Symbol *</label>
                      <input type="text" name="currency_symbol" value={formData.currency_symbol} onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label style={labelStyle}>Currency Code *</label>
                      <input type="text" name="currency_code" value={formData.currency_code} onChange={handleChange} style={inputStyle} required />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ride Tab */}
            {activeTab === "ride" && (
              <div className="row">
                <div className="col-lg-3 col-md-4 mb-4">
                  <h5 style={sectionTitleStyle}>Basic Settings</h5>
                </div>
                <div className="col-lg-9 col-md-8">
                  <div className="row">
                    <div className="col-md-12 mb-4">
                      <label style={labelStyle}>Minimum Distance For Ride (In KM) *</label>
                      <input type="number" name="min_ride_distance" value={formData.min_ride_distance} onChange={handleChange} style={inputStyle} required step="0.1" />
                      <small style={helpStyle}>Enter the minimum distance (in km) for calculating fares.</small>
                    </div>
                    <div className="col-md-12 mb-4">
                      <label style={labelStyle}>Maximum Distance For Ride (In KM) *</label>
                      <input type="number" name="max_ride_distance" value={formData.max_ride_distance} onChange={handleChange} style={inputStyle} required />
                      <small style={helpStyle}>Specify the maximum distance (in km) allowed for a single ride.</small>
                    </div>
                    <div className="col-md-12 mb-4">
                      <label style={labelStyle}>Auto Ride Cancel Time (In Minutes) *</label>
                      <input type="number" name="auto_ride_cancel_time" value={formData.auto_ride_cancel_time} onChange={handleChange} style={inputStyle} required />
                      <small style={helpStyle}>Set the time (in minutes) after which the ride will auto-cancel if not accepted.</small>
                    </div>
                    <div className="col-md-12 mb-4">
                      <label style={labelStyle}>Driver Search Wait Time (in Minutes) *</label>
                      <input type="number" name="driver_wait_time" value={formData.driver_wait_time} onChange={handleChange} style={inputStyle} required />
                      <small style={helpStyle}>Time interval (in minutes) after which the system expands the driver search radius if no driver accepts the ride.</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Driver Tab */}
            {activeTab === "driver" && (
              <div className="row">
                <div className="col-lg-3 col-md-4 mb-4">
                  <h5 style={sectionTitleStyle}>Basic Settings</h5>
                </div>
                <div className="col-lg-9 col-md-8">
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label style={labelStyle}>Minimum Driver Search Range (In KM) *</label>
                      <input
                        type="number"
                        name="min_driver_search_range"
                        value={formData.min_driver_search_range || ""}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="e.g. 1"
                        required
                      />
                      <small style={helpStyle}>Minimum distance for driver search in KM.</small>
                    </div>
                    <div className="col-md-6 mb-4">
                      <label style={labelStyle}>Maximum Driver Search Range (In KM) *</label>
                      <input
                        type="number"
                        name="max_driver_search_range"
                        value={formData.max_driver_search_range || ""}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="e.g. 20"
                        required
                      />
                      <small style={helpStyle}>Maximum distance for driver search in KM.</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* Firebase */}
                <div className="row">
                  <div className="col-lg-3 col-md-4 mb-3">
                    <h5 style={sectionTitleStyle}>Notification</h5>
                  </div>
                  <div className="col-lg-9 col-md-8">
                    <div style={integrationCardStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ fontSize: "28px" }}>🔥</div>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>Firebase</div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Manage messaging tokens and notification keys.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenIntegrationModal("firebase")}
                        style={integrationEditBtnStyle}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                <hr style={dividerStyle} />

                {/* Msg91 */}
                <div className="row">
                  <div className="col-lg-3 col-md-4 mb-3">
                    <h5 style={sectionTitleStyle}>SMS</h5>
                  </div>
                  <div className="col-lg-9 col-md-8">
                    <div style={integrationCardStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ fontSize: "28px" }}>💬</div>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>Msg91</div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>SMS Gateway credentials and configuration.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenIntegrationModal("msg91")}
                        style={integrationEditBtnStyle}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                <hr style={dividerStyle} />

                {/* Google */}
                <div className="row">
                  <div className="col-lg-3 col-md-4 mb-3">
                    <h5 style={sectionTitleStyle}>Map</h5>
                  </div>
                  <div className="col-lg-9 col-md-8">
                    <div style={integrationCardStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ fontSize: "28px" }}>📍</div>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>Google</div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Maps API, Client ID and Geolocation service keys.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenIntegrationModal("google")}
                        style={integrationEditBtnStyle}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Gateway Tab */}
            {activeTab === "payment" && (
              <div className="row">
                <div className="col-lg-3 col-md-4 mb-4">
                  <h5 style={sectionTitleStyle}>Stripe Settings</h5>
                </div>
                <div className="col-lg-9 col-md-8">
                  <div className="row">
                    <div className="col-md-12 mb-4">
                      <label style={labelStyle}>Payment Mode</label>
                      <select name="stripe_mode" value={formData.stripe_mode} onChange={handleChange} style={inputStyle}>
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="live">Live (Production)</option>
                      </select>
                    </div>
                    <div className="col-md-12 mb-4">
                      <label style={labelStyle}>Stripe Publishable Key</label>
                      <input type="text" name="stripe_publish_key" value={formData.stripe_publish_key} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div className="col-md-12 mb-4">
                      <label style={labelStyle}>Stripe Secret Key</label>
                      <input type="password" name="stripe_secret_key" value={formData.stripe_secret_key} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Versions Tab */}
            {activeTab === "versions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                <div className="row">
                  <div className="col-lg-3 col-md-4 mb-4">
                    <h5 style={sectionTitleStyle}>Android Versions</h5>
                  </div>
                  <div className="col-lg-9 col-md-8">
                    <div className="row g-4">
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Stable Android User App Version *</label>
                        <input type="text" name="stable_android_user_version" value={formData.stable_android_user_version} onChange={handleChange} style={inputStyle} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Deprecated Android User App Version *</label>
                        <input type="text" name="deprecated_android_user_version" value={formData.deprecated_android_user_version} onChange={handleChange} style={inputStyle} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Stable Android Driver App Version *</label>
                        <input type="text" name="stable_android_driver_version" value={formData.stable_android_driver_version} onChange={handleChange} style={inputStyle} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Deprecated Android Driver App Version *</label>
                        <input type="text" name="deprecated_android_driver_version" value={formData.deprecated_android_driver_version} onChange={handleChange} style={inputStyle} required />
                      </div>
                    </div>
                  </div>
                </div>

                <hr style={dividerStyle} />

                <div className="row">
                  <div className="col-lg-3 col-md-4 mb-4">
                    <h5 style={sectionTitleStyle}>iOS Versions</h5>
                  </div>
                  <div className="col-lg-9 col-md-8">
                    <div className="row g-4">
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Stable iOS User App Version *</label>
                        <input type="text" name="stable_ios_user_version" value={formData.stable_ios_user_version} onChange={handleChange} style={inputStyle} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Deprecated iOS User App Version *</label>
                        <input type="text" name="deprecated_ios_user_version" value={formData.deprecated_ios_user_version} onChange={handleChange} style={inputStyle} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Stable iOS Driver App Version *</label>
                        <input type="text" name="stable_ios_driver_version" value={formData.stable_ios_driver_version} onChange={handleChange} style={inputStyle} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Deprecated iOS Driver App Version *</label>
                        <input type="text" name="deprecated_ios_driver_version" value={formData.deprecated_ios_driver_version} onChange={handleChange} style={inputStyle} required />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charges Tab */}
            {activeTab === "charges" && (
              <div className="row">
                <div className="col-lg-3 col-md-4 mb-4">
                  <h5 style={sectionTitleStyle}>Fee & Tax Settings</h5>
                </div>
                <div className="col-lg-9 col-md-8">
                  <div className="row g-4">
                    <div className="col-md-6 mb-3">
                      <label style={labelStyle}>GST / Tax Percentage (%) *</label>
                      <input type="number" name="gst_tax" value={formData.gst_tax} onChange={handleChange} style={inputStyle} required step="0.01" />
                      <small style={helpStyle}>Tax percentage charged on rides.</small>
                    </div>
                    {/* <div className="col-md-6 mb-3">
                      <label style={labelStyle}>Admin Commission (%) *</label>
                      <input type="number" name="admin_commission" value={formData.admin_commission} onChange={handleChange} style={inputStyle} required step="0.01" />
                      <small style={helpStyle}>Percentage of fare collected by admin.</small>
                    </div> */}
                    <div className="col-md-6 mb-3">
                      <label style={labelStyle}>Stripe Fee *</label>
                      <input type="number" name="booking_fee" value={formData.booking_fee} onChange={handleChange} style={inputStyle} required step="0.01" />
                      <small style={helpStyle}>Fixed stripe fee charged per ride.</small>
                    </div>
                    {/* <div className="col-md-6 mb-3">
                      <label style={labelStyle}>Waiting Fee Per Minute *</label>
                      <input type="number" name="waiting_fee_per_min" value={formData.waiting_fee_per_min} onChange={handleChange} style={inputStyle} required step="0.01" />
                      <small style={helpStyle}>Waiting fee per minute charged if driver waits.</small>
                    </div> */}
                  </div>
                </div>
              </div>
            )}

            {/* Global Update Button (not shown in Integrations) */}
            {activeTab !== "integrations" && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "40px", borderTop: "1px solid #f1f5f9", paddingTop: "28px" }}>
                <button
                  type="submit"
                  style={{
                    background: "var(--grad-primary, #4f46e5)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 28px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
                    transition: "all 0.15s"
                  }}
                >
                  Update
                </button>
              </div>
            )}
          </form>
        </div>
      </TableCard>

      {/* Firebase integration modal */}
      <Modal
        isOpen={openModal === "firebase"}
        onClose={() => setOpenModal(null)}
        title="Firebase Integration Credentials"
      >
        <form onSubmit={handleSaveIntegrationModal}>
          <div className="mb-3">
            <label style={labelStyle}>Firebase Project ID</label>
            <input
              type="text"
              name="firebase_project_id"
              value={tempIntegrationData.firebase_project_id || ""}
              onChange={handleIntegrationTempChange}
              style={inputStyle}
            />
          </div>
          <div className="mb-3">
            <label style={labelStyle}>Firebase Client Email</label>
            <input
              type="text"
              name="firebase_client_email"
              value={tempIntegrationData.firebase_client_email || ""}
              onChange={handleIntegrationTempChange}
              style={inputStyle}
            />
          </div>
          <div className="mb-3">
            <label style={labelStyle}>Firebase Private Key</label>
            <textarea
              name="firebase_private_key"
              value={tempIntegrationData.firebase_private_key || ""}
              onChange={handleIntegrationTempChange}
              style={{ ...inputStyle, height: "100px", fontFamily: "monospace", fontSize: "12px" }}
            />
          </div>
          <div className="mb-3">
            <label style={labelStyle}>Firebase Cloud Messaging Server Key</label>
            <textarea
              name="firebase_server_key"
              value={tempIntegrationData.firebase_server_key || ""}
              onChange={handleIntegrationTempChange}
              style={{ ...inputStyle, height: "80px", fontFamily: "monospace", fontSize: "12px" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              style={{ background: "#f1f5f9", border: "none", color: "#475569", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: "var(--grad-primary, #4f46e5)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
            >
              Save Credentials
            </button>
          </div>
        </form>
      </Modal>

      {/* Msg91 integration modal */}
      <Modal
        isOpen={openModal === "msg91"}
        onClose={() => setOpenModal(null)}
        title="Msg91 SMS Gateway Credentials"
      >
        <form onSubmit={handleSaveIntegrationModal}>
          <div className="mb-3">
            <label style={labelStyle}>Msg91 Auth Key</label>
            <input
              type="text"
              name="msg91_auth_key"
              value={tempIntegrationData.msg91_auth_key || ""}
              onChange={handleIntegrationTempChange}
              style={inputStyle}
            />
          </div>
          <div className="mb-3">
            <label style={labelStyle}>Msg91 Sender ID</label>
            <input
              type="text"
              name="msg91_sender_id"
              value={tempIntegrationData.msg91_sender_id || ""}
              onChange={handleIntegrationTempChange}
              style={inputStyle}
            />
          </div>
          <div className="mb-3">
            <label style={labelStyle}>Msg91 Template ID</label>
            <input
              type="text"
              name="msg91_template_id"
              value={tempIntegrationData.msg91_template_id || ""}
              onChange={handleIntegrationTempChange}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              style={{ background: "#f1f5f9", border: "none", color: "#475569", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: "var(--grad-primary, #4f46e5)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
            >
              Save Credentials
            </button>
          </div>
        </form>
      </Modal>

      {/* Google Maps integration modal */}
      <Modal
        isOpen={openModal === "google"}
        onClose={() => setOpenModal(null)}
        title="Google Maps API Config"
      >
        <form onSubmit={handleSaveIntegrationModal}>
          <div className="mb-3">
            <label style={labelStyle}>Google Maps Client ID (Enterprise)</label>
            <input
              type="text"
              name="google_map_client_id"
              value={tempIntegrationData.google_map_client_id || ""}
              onChange={handleIntegrationTempChange}
              style={inputStyle}
            />
          </div>
          <div className="mb-3">
            <label style={labelStyle}>Google Maps JavaScript API Key</label>
            <input
              type="text"
              name="google_map_key"
              value={tempIntegrationData.google_map_key || ""}
              onChange={handleIntegrationTempChange}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              style={{ background: "#f1f5f9", border: "none", color: "#475569", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: "var(--grad-primary, #4f46e5)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
            >
              Save Credentials
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Styling variables
const sectionTitleStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#334155",
  margin: 0,
  letterSpacing: "-0.2px"
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569"
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
  color: "#1e293b",
  transition: "border-color 0.15s ease",
  boxShadow: "none"
};

const helpStyle = {
  display: "block",
  marginTop: "4px",
  fontSize: "12px",
  color: "#64748b"
};

const integrationCardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 24px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc"
};

const integrationEditBtnStyle = {
  background: "#fff",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  color: "#334155",
  padding: "6px 16px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.15s"
};

const dividerStyle = {
  border: "0",
  borderTop: "1px solid #e2e8f0",
  margin: "24px 0"
};

const sliderStyle = (checked) => ({
  position: "absolute",
  cursor: "pointer",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: checked ? "#4f46e5" : "#cbd5e1",
  transition: ".4s",
  borderRadius: "34px",
  ":before": {
    position: "absolute",
    content: '""',
    height: "16px",
    width: "16px",
    left: "4px",
    bottom: "4px",
    backgroundColor: "white",
    transition: ".4s",
    borderRadius: "50%",
    transform: checked ? "translateX(24px)" : "none"
  },
  transform: "none"
});

export default Configuration;
