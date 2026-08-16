import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import apiInstance from "../../utils/apiInstance";
import { TableCard } from "../../components/common/PageTable";

const Safety = () => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    driver_intro: "",
    driver_point_1_title: "",
    driver_point_1_desc: "",
    driver_point_2_title: "",
    driver_point_2_desc: "",
    driver_point_3_title: "",
    driver_point_3_desc: "",
    driver_point_4_title: "",
    driver_point_4_desc: "",
    driver_outro: "",
    rider_title: "",
    rider_point_1_title: "",
    rider_point_1_desc: "",
    rider_point_2_title: "",
    rider_point_2_desc: "",
    rider_point_3_title: "",
    rider_point_3_desc: "",
    driver_section_title: "",
    driver_section_point_1_title: "",
    driver_section_point_1_desc: "",
    driver_section_point_2_title: "",
    driver_section_point_2_desc: "",
    driver_section_point_3_title: "",
    driver_section_point_3_desc: "",
    driver_section_point_4_title: "",
    driver_section_point_4_desc: "",
    driver_section_outro: ""
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch current safety page configuration
  useEffect(() => {
    const fetchSafetyData = async () => {
      try {
        setFetching(true);
        const res = await apiInstance.get("/safety");
        if (res.data && res.data.body) {
          const body = res.data.body;
          setFormData({
            title: body.title || "",
            subtitle: body.subtitle || "",
            driver_intro: body.driver_intro || "",
            driver_point_1_title: body.driver_point_1_title || "",
            driver_point_1_desc: body.driver_point_1_desc || "",
            driver_point_2_title: body.driver_point_2_title || "",
            driver_point_2_desc: body.driver_point_2_desc || "",
            driver_point_3_title: body.driver_point_3_title || "",
            driver_point_3_desc: body.driver_point_3_desc || "",
            driver_point_4_title: body.driver_point_4_title || "",
            driver_point_4_desc: body.driver_point_4_desc || "",
            driver_outro: body.driver_outro || "",
            rider_title: body.rider_title || "",
            rider_point_1_title: body.rider_point_1_title || "",
            rider_point_1_desc: body.rider_point_1_desc || "",
            rider_point_2_title: body.rider_point_2_title || "",
            rider_point_2_desc: body.rider_point_2_desc || "",
            rider_point_3_title: body.rider_point_3_title || "",
            rider_point_3_desc: body.rider_point_3_desc || "",
            driver_section_title: body.driver_section_title || "",
            driver_section_point_1_title: body.driver_section_point_1_title || "",
            driver_section_point_1_desc: body.driver_section_point_1_desc || "",
            driver_section_point_2_title: body.driver_section_point_2_title || "",
            driver_section_point_2_desc: body.driver_section_point_2_desc || "",
            driver_section_point_3_title: body.driver_section_point_3_title || "",
            driver_section_point_3_desc: body.driver_section_point_3_desc || "",
            driver_section_point_4_title: body.driver_section_point_4_title || "",
            driver_section_point_4_desc: body.driver_section_point_4_desc || "",
            driver_section_outro: body.driver_section_outro || ""
          });
        }
      } catch (err) {
        console.error("Error fetching safety data:", err);
        toast.error("Failed to load safety data.");
      } finally {
        setFetching(false);
      }
    };
    fetchSafetyData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiInstance.put("/safety", formData);
      toast.success("Safety settings updated successfully!");
    } catch (err) {
      console.error("Error updating safety data:", err);
      toast.error("Failed to update safety settings.");
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

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      <div style={{ marginBottom: "20px" }}>
        <h5 style={{ margin: 0, fontWeight: "700", color: "#111827" }}>Safety Page Settings</h5>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
          Edit the text and points displayed in the Safety section of the landing page.
        </p>
      </div>

      <TableCard>
        <form onSubmit={handleSubmit} style={{ padding: "28px", position: "relative" }}>
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100
              }}
            >
              <div
                className="spinner-border"
                role="status"
                style={{ width: "50px", height: "50px", color: "var(--primary)" }}
              />
            </div>
          )}

          {/* SECTION 1: SAFETY MAIN & DRIVER INTRO */}
          <div style={{ marginBottom: "32px" }}>
            <h6 style={{ fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
              Main Title & General Driver Check
            </h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Section Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Subtitle / Slogan</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Driver Verification Intro Description</label>
                <textarea
                  name="driver_intro"
                  value={formData.driver_intro}
                  onChange={handleChange}
                  className="form-control"
                  rows="2"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DRIVER ELIGIBILITY POINTS (4 items) */}
          <div style={{ marginBottom: "32px" }}>
            <h6 style={{ fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
              Driver Verification Checklist Items (4 Points)
            </h6>
            <div className="row">
              {/* Check Point 1 */}
              <div className="col-md-6 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Item 1</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="driver_point_1_title"
                      value={formData.driver_point_1_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="driver_point_1_desc"
                      value={formData.driver_point_1_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Check Point 2 */}
              <div className="col-md-6 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Item 2</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="driver_point_2_title"
                      value={formData.driver_point_2_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="driver_point_2_desc"
                      value={formData.driver_point_2_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Check Point 3 */}
              <div className="col-md-6 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Item 3</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="driver_point_3_title"
                      value={formData.driver_point_3_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="driver_point_3_desc"
                      value={formData.driver_point_3_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Check Point 4 */}
              <div className="col-md-6 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Item 4</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="driver_point_4_title"
                      value={formData.driver_point_4_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="driver_point_4_desc"
                      value={formData.driver_point_4_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Checklist Outro Text</label>
                <input
                  type="text"
                  name="driver_outro"
                  value={formData.driver_outro}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: FOR RIDERS (3 items) */}
          <div style={{ marginBottom: "32px" }}>
            <h6 style={{ fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
              For Riders Section
            </h6>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Riders Header Title</label>
                <input
                  type="text"
                  name="rider_title"
                  value={formData.rider_title}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              {/* Rider Point 1 */}
              <div className="col-md-4 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Point 1</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="rider_point_1_title"
                      value={formData.rider_point_1_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="rider_point_1_desc"
                      value={formData.rider_point_1_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Rider Point 2 */}
              <div className="col-md-4 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Point 2</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="rider_point_2_title"
                      value={formData.rider_point_2_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="rider_point_2_desc"
                      value={formData.rider_point_2_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Rider Point 3 */}
              <div className="col-md-4 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Point 3</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="rider_point_3_title"
                      value={formData.rider_point_3_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="rider_point_3_desc"
                      value={formData.rider_point_3_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: FOR DRIVERS (4 items) */}
          <div style={{ marginBottom: "32px" }}>
            <h6 style={{ fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
              For Drivers Section
            </h6>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Drivers Section Header Title</label>
                <input
                  type="text"
                  name="driver_section_title"
                  value={formData.driver_section_title}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              {/* Driver Point 1 */}
              <div className="col-md-6 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Point 1</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="driver_section_point_1_title"
                      value={formData.driver_section_point_1_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="driver_section_point_1_desc"
                      value={formData.driver_section_point_1_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Driver Point 2 */}
              <div className="col-md-6 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Point 2</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="driver_section_point_2_title"
                      value={formData.driver_section_point_2_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="driver_section_point_2_desc"
                      value={formData.driver_section_point_2_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Driver Point 3 */}
              <div className="col-md-6 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Point 3</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="driver_section_point_3_title"
                      value={formData.driver_section_point_3_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="driver_section_point_3_desc"
                      value={formData.driver_section_point_3_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Driver Point 4 */}
              <div className="col-md-6 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Point 4</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="driver_section_point_4_title"
                      value={formData.driver_section_point_4_title}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Description</label>
                    <textarea
                      name="driver_section_point_4_desc"
                      value={formData.driver_section_point_4_desc}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Drivers Section Outro Text</label>
                <input
                  type="text"
                  name="driver_section_outro"
                  value={formData.driver_section_outro}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn bg-info" style={{ color: "white", padding: "10px 24px", fontWeight: "600" }}>
              Update Safety Settings
            </button>
          </div>
        </form>
      </TableCard>
    </>
  );
};

export default Safety;
