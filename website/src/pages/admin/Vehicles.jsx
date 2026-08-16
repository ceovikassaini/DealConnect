import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

import apiInstance from "../../utils/apiInstance";
import { PageHeader, Modal } from "../../components/common/PageTable";

const Vehicles = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [loadingServices, setLoadingServices] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Dropdown state for ellipsis menu
  const [openServiceMenu, setOpenServiceMenu] = useState(null); // id of service

  // Service Modal state
  const [serviceModal, setServiceModal] = useState({
    isOpen: false,
    type: "add",
    data: null,
    name: "",
    base_charge: ""
  });

  // Settings form state (Right panel)
  const [baseChargeInput, setBaseChargeInput] = useState("");

  // Fetch all services
  const fetchServices = useCallback(async (selectDefault = false) => {
    try {
      setLoadingServices(true);
      const res = await apiInstance.get("/vehicles/services");
      const list = res.data?.body || [];
      setServices(list);

      if (list.length > 0) {
        if (selectDefault) {
          const economy = list.find((s) => s.name.toLowerCase() === "economy");
          const defaultService = economy || list[0];
          setSelectedService(defaultService);
          setBaseChargeInput(defaultService.base_charge ?? "0.00");
        } else if (selectedService) {
          // Refresh current selection if present
          const current = list.find((s) => s.id === selectedService.id);
          if (current) {
            setSelectedService(current);
            setBaseChargeInput(current.base_charge ?? "0.00");
          } else {
            setSelectedService(list[0]);
            setBaseChargeInput(list[0].base_charge ?? "0.00");
          }
        }
      } else {
        setSelectedService(null);
        setBaseChargeInput("");
      }
    } catch (err) {
      toast.error("Failed to fetch services.");
      console.error(err);
    } finally {
      setLoadingServices(false);
    }
  }, [selectedService]);

  // Initial load
  useEffect(() => {
    fetchServices(true);
  }, []);

  // Update baseChargeInput when selectedService changes
  useEffect(() => {
    if (selectedService) {
      setBaseChargeInput(selectedService.base_charge ?? "0.00");
    } else {
      setBaseChargeInput("");
    }
  }, [selectedService]);

  // Close menu on outside click
  useEffect(() => {
    const handleGlobalClick = () => setOpenServiceMenu(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Service Save handler (Modal)
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceModal.name.trim()) {
      toast.error("Service name is required.");
      return;
    }
    const chargeVal = parseFloat(serviceModal.base_charge) || 0;

    try {
      if (serviceModal.type === "add") {
        const res = await apiInstance.post("/vehicles/services", {
          name: serviceModal.name.trim(),
          base_charge: chargeVal
        });
        toast.success("Service added successfully.");
        const newService = res.data?.body;
        setServiceModal({ isOpen: false, type: "add", data: null, name: "", base_charge: "" });
        const fetchRes = await apiInstance.get("/vehicles/services");
        const list = fetchRes.data?.body || [];
        setServices(list);
        if (newService) {
          setSelectedService(newService);
          setBaseChargeInput(newService.base_charge ?? "0.00");
        }
      } else {
        await apiInstance.put(`/vehicles/services/${serviceModal.data.id}`, {
          name: serviceModal.name.trim(),
          base_charge: chargeVal
        });
        toast.success("Service updated successfully.");
        setServiceModal({ isOpen: false, type: "add", data: null, name: "", base_charge: "" });
        fetchServices();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save service.");
    }
  };

  // Delete Service handler
  const handleDeleteService = async (service, e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete the service "${service.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;

    try {
      await apiInstance.delete(`/vehicles/services/${service.id}`);
      toast.success("Service deleted.");
      const nextServices = services.filter((s) => s.id !== service.id);
      setServices(nextServices);
      if (selectedService?.id === service.id) {
        if (nextServices.length > 0) {
          setSelectedService(nextServices[0]);
          setBaseChargeInput(nextServices[0].base_charge ?? "0.00");
        } else {
          setSelectedService(null);
          setBaseChargeInput("");
        }
      }
    } catch (err) {
      toast.error("Failed to delete service.");
    }
  };

  // Update Settings handler (Right panel)
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      setSavingSettings(true);
      const chargeVal = parseFloat(baseChargeInput) || 0;
      const res = await apiInstance.put(`/vehicles/services/${selectedService.id}`, {
        base_charge: chargeVal
      });
      toast.success("Base charge updated successfully.");
      const updated = res.data?.body;
      if (updated) {
        setServices((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        setSelectedService(updated);
        setBaseChargeInput(updated.base_charge ?? "0.00");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Cancel Settings handler
  const handleCancelSettings = () => {
    if (selectedService) {
      setBaseChargeInput(selectedService.base_charge ?? "0.00");
      toast.info("Changes discarded.");
    }
  };

  return (
    <div style={{ padding: "8px 4px" }}>
      <style>{`
        @media (max-width: 768px) {
          .vehicles-settings-container {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .vehicles-panel {
            flex: 1 1 auto !important;
            min-height: auto !important;
            width: 100% !important;
          }
        }
      `}</style>
      <ToastContainer position="top-right" autoClose={2500} />
      <PageHeader title="VEHICLES SETTINGS" subtitle="Configure vehicle services and base fares." />

      <div className="vehicles-settings-container" style={containerStyle}>
        {/* PANEL 1: SERVICES LIST */}
        <div className="vehicles-panel" style={{ ...panelCardStyle, flex: "1 1 320px", minWidth: "280px" }}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>Services</span>
            <button
              onClick={() =>
                setServiceModal({
                  isOpen: true,
                  type: "add",
                  data: null,
                  name: "",
                  base_charge: ""
                })
              }
              style={panelAddBtnStyle}
              title="Add New Service"
            >
              <i className="material-icons" style={{ fontSize: "18px" }}>add</i>
            </button>
          </div>
          <div style={listContainerStyle}>
            {loadingServices ? (
              <div style={loadingStyle}>Loading...</div>
            ) : services.length === 0 ? (
              <div style={emptyStyle}>No services found.</div>
            ) : (
              services.map((service) => {
                const isActive = selectedService?.id === service.id;
                const isMenuOpen = openServiceMenu === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    style={itemCardStyle(isActive)}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontWeight: "600", fontSize: "15px", color: isActive ? "#4f46e5" : "#1e293b" }}>
                        {service.name}
                      </span>
                      <span style={{ fontSize: "12px", color: isActive ? "#6366f1" : "#64748b" }}>
                        Base Charge: ${parseFloat(service.base_charge || 0).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenServiceMenu(isMenuOpen ? null : service.id);
                        }}
                        style={ellipsisBtnStyle}
                      >
                        <i className="material-icons" style={{ fontSize: "20px", color: "#94a3b8" }}>more_vert</i>
                      </button>
                      {isMenuOpen && (
                        <div style={dropdownMenuStyle}>
                          <div
                            style={dropdownItemStyle}
                            onClick={() =>
                              setServiceModal({
                                isOpen: true,
                                type: "edit",
                                data: service,
                                name: service.name,
                                base_charge: service.base_charge ?? "0.00"
                              })
                            }
                          >
                            <i className="material-icons" style={{ fontSize: "16px" }}>edit</i>
                            Edit
                          </div>
                          <div
                            style={{ ...dropdownItemStyle, color: "#ef4444" }}
                            onClick={(e) => handleDeleteService(service, e)}
                          >
                            <i className="material-icons" style={{ fontSize: "16px" }}>delete</i>
                            Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: SERVICE SETTINGS / PRICE */}
        <div className="vehicles-panel" style={{ ...panelCardStyle, flex: "2 1 450px", minWidth: "320px" }}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>
              {selectedService ? `${selectedService.name} Settings` : "Settings"}
            </span>
          </div>
          <div style={settingsContainerStyle}>
            {!selectedService ? (
              <div style={emptyStyle}>Please select a service.</div>
            ) : (
              <form onSubmit={handleUpdateSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <label style={labelStyle}>Base Charge *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="base_charge"
                    value={baseChargeInput}
                    onChange={(e) => setBaseChargeInput(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="Enter base charge"
                  />
                </div>

                {/* Action Buttons */}
                <div style={formActionsStyle}>
                  <button
                    type="button"
                    onClick={handleCancelSettings}
                    style={cancelBtnStyle}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    style={submitBtnStyle}
                  >
                    {savingSettings ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Service Add/Edit Modal */}
      <Modal
        isOpen={serviceModal.isOpen}
        onClose={() => setServiceModal({ isOpen: false, type: "add", data: null, name: "", base_charge: "" })}
        title={serviceModal.type === "add" ? "Add New Service" : "Edit Service"}
      >
        <form onSubmit={handleSaveService}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Service Name *</label>
            <input
              type="text"
              placeholder="e.g. Economy, Premium, Auto"
              value={serviceModal.name}
              onChange={(e) => setServiceModal((prev) => ({ ...prev, name: e.target.value }))}
              style={inputStyle}
              required
              autoFocus
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Base Charge *</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 10.00"
              value={serviceModal.base_charge}
              onChange={(e) => setServiceModal((prev) => ({ ...prev, base_charge: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setServiceModal({ isOpen: false, type: "add", data: null, name: "", base_charge: "" })}
              style={modalCancelStyle}
            >
              Cancel
            </button>
            <button type="submit" style={modalSubmitStyle}>
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Styles
const containerStyle = {
  display: "flex",
  gap: "24px",
  marginTop: "20px",
  flexWrap: "wrap",
  alignItems: "flex-start"
};

const panelCardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  display: "flex",
  flexDirection: "column",
  minHeight: "380px",
  overflow: "hidden"
};

const panelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 20px",
  borderBottom: "1px solid #f1f5f9",
  background: "#f8fafc"
};

const panelTitleStyle = {
  fontWeight: "700",
  fontSize: "16px",
  color: "#1e293b"
};

const panelAddBtnStyle = {
  background: "#eff6ff",
  border: "none",
  borderRadius: "8px",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#3b82f6",
  cursor: "pointer",
  transition: "all 0.2s"
};

const listContainerStyle = {
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  overflowY: "auto",
  maxHeight: "500px"
};

const itemCardStyle = (isActive) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px",
  borderRadius: "12px",
  border: isActive ? "2px solid #4f46e5" : "1px solid #e2e8f0",
  background: isActive ? "#f5f3ff" : "#ffffff",
  cursor: "pointer",
  transition: "all 0.15s ease",
  boxShadow: isActive ? "0 4px 12px rgba(79, 70, 229, 0.08)" : "none"
});

const ellipsisBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  borderRadius: "6px"
};

const dropdownMenuStyle = {
  position: "absolute",
  right: 0,
  top: "100%",
  background: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  borderRadius: "10px",
  zIndex: 50,
  width: "110px",
  border: "1px solid #f1f5f9",
  overflow: "hidden",
  marginTop: "4px"
};

const dropdownItemStyle = {
  padding: "8px 12px",
  fontSize: "13px",
  color: "#334155",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "background 0.15s"
};

const settingsContainerStyle = {
  padding: "24px"
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
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
  background: "#ffffff",
  color: "#1e293b",
  transition: "border-color 0.15s ease"
};

const formActionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "12px",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "20px"
};

const submitBtnStyle = {
  background: "var(--grad-primary, #4f46e5)",
  border: "none",
  color: "#ffffff",
  padding: "10px 24px",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
  transition: "all 0.15s"
};

const cancelBtnStyle = {
  background: "#64748b",
  border: "none",
  color: "#ffffff",
  padding: "10px 24px",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.15s"
};

const modalCancelStyle = {
  background: "#f1f5f9",
  border: "none",
  color: "#475569",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600"
};

const modalSubmitStyle = {
  background: "var(--grad-primary, #4f46e5)",
  border: "none",
  color: "#ffffff",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "700"
};

const loadingStyle = {
  textAlign: "center",
  padding: "20px",
  color: "#64748b"
};

const emptyStyle = {
  textAlign: "center",
  padding: "40px 20px",
  color: "#94a3b8",
  fontSize: "14px"
};

export default Vehicles;
