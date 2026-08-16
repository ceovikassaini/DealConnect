import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import apiInstance from "../../utils/apiInstance";
import { get_cms } from "../../utils/thunkApis";
import { TableCard } from "../../components/common/PageTable";

const Privacy = () => {
  const CMS_TYPE = 2; // 2 => privacypolicy

  const dispatch = useDispatch();
  const cms = useSelector((state) => state.users.cms);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fetchingError, setFetchingError] = useState(null);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["bold", "italic", "underline"],
        ["link"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["clean"],
      ],
    }),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(get_cms(CMS_TYPE));
      } catch (err) {
        setFetchingError("An error occurred while fetching Privacy Policy data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (cms?.type === CMS_TYPE) {
      setTitle(cms?.name || "Privacy Policy");
      setDescription(cms?.content || "<p><br></p>");
    }
  }, [cms]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tempEl = document.createElement("div");
    tempEl.innerHTML = description;
    if (!tempEl.textContent.trim()) {
      setError("Privacy Policy content cannot be empty.");
      return;
    }

    setError("");
    setSubmitError("");

    try {
      setLoading(true);
      await apiInstance.put(`/updateCms/${CMS_TYPE}`, { content: description });
      toast.success("Privacy Policy updated successfully!");
    } catch (err) {
      console.log(err);
      setSubmitError("Error updating Privacy Policy. Please try again.");
      toast.error("Error updating Privacy Policy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingError) {
    return <div>{fetchingError}<br />Please try again later.</div>;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      <TableCard>
        <form onSubmit={handleSubmit} style={{ padding: "24px", position: "relative" }}>

          {/* Loading overlay */}
          {loading && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(255,255,255,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
            }}>
              <div className="spinner-border" role="status"
                style={{ width: "50px", height: "50px", color: "#f97316" }} />
            </div>
          )}

          {/* Title — disabled, read-only */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              disabled
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "#f3f4f6",
                color: "#6b7280",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Content — editable */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
              Content
            </label>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", background: "#fff" }}>
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                modules={quillModules}
                style={{ height: "320px", marginBottom: "50px" }}
              />
            </div>

            {error && <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "10px" }}>{error}</div>}
            {submitError && <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "10px" }}>{submitError}</div>}
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn bg-info" style={{ color: "white" }}>
              Update
            </button>
          </div>
        </form>
      </TableCard>

      <style>{`
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #e5e7eb !important; }
        .ql-container.ql-snow { border: none !important; font-size: 14px; }
        .ql-editor { min-height: 250px; color: #333 !important; }
      `}</style>
    </>
  );
};

export default Privacy;