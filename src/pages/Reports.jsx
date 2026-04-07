import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Clock, AlertCircle, CheckCircle } from "lucide-react";
import "../styles/Reports.css";

export default function Reports() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const userId = localStorage.getItem("sno_userId") || "";
  const API_URL = process.env.REACT_APP_API_BASE || "";

  const fetchAll = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const base = API_URL || "";
      const url = `${base}/api/reports/${encodeURIComponent(userId)}?all=1`;

      const res = await axios.get(url, { withCredentials: true });

      if (res.data && res.data.exists) {
        setReports(res.data.reports || []);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.warn("Failed to fetch reports:", err?.message || err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, userId]);

  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId, fetchAll]);

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    if (selected.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
        setPreviewUrl(URL.createObjectURL(droppedFile));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose an image file to upload");
      return;
    }
    if (!userId) {
      alert("User session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("userId", userId);
      form.append("userName", localStorage.getItem("sno_firstName") || "");
      form.append("image", file);

      const base = API_URL || "";
      const url = `${base}/api/reports/upload`;

      const res = await axios.post(url, form, { withCredentials: true });

      if (res.data && res.data.ok) {
        alert("Report uploaded successfully!");
        setFile(null);
        setPreviewUrl(null);
        fetchAll();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + (err?.response?.data?.error || err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (id) => {
    const base = API_URL || "";
    return `${base}/api/reports/image/${id}`;
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <button className="back-btn" onClick={() => navigate("/profile")}>
          ← Back
        </button>
        <h1>Medical Reports</h1>
      </div>

      <div className="reports-content">
        {/* Upload Section */}
        <div className="upload-section">
          <h2><Upload size={20} /> Upload Report</h2>
          
          <div
            className={`drop-zone ${dragActive ? "active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="drop-label">
              {file ? (
                <>
                  <CheckCircle size={40} className="file-icon success" />
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <FileText size={40} className="file-icon" />
                  <p>Drop your medical report here</p>
                  <p className="drop-hint">or click to browse</p>
                </>
              )}
            </label>
          </div>

          {previewUrl && (
            <div className="preview-container">
              <img src={previewUrl} alt="Preview" className="preview-image" />
            </div>
          )}

          <div className="upload-actions">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={loading || !file}
            >
              {loading ? "Uploading..." : "Upload Report"}
            </button>
            {file && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
                disabled={loading}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Reports List */}
        <div className="reports-section">
          <h2><FileText size={20} /> Your Reports</h2>

          {loading && reports.length === 0 && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading reports...</p>
            </div>
          )}

          {!loading && reports.length === 0 && (
            <div className="empty-state">
              <FileText size={60} />
              <p>No reports uploaded yet</p>
              <span>Upload your first medical report to get started</span>
            </div>
          )}

          {!loading && reports.length > 0 && (
            <div className="reports-list">
              {reports.map((r) => (
                <div key={r.id} className="report-card">
                  <div className="report-header">
                    <div className="report-info">
                      <h3>Report</h3>
                      <span className="report-date">
                        <Clock size={14} />
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="report-content">
                    <div className="report-analysis">
                      <h4><AlertCircle size={16} /> Analysis</h4>
                      
                      {r.analysis?.tests?.length > 0 && (
                        <div className="analysis-item">
                          <span className="label">Tests:</span>
                          <span className="value">{(r.analysis.tests || []).join(", ")}</span>
                        </div>
                      )}
                      
                      {r.analysis?.numbers?.length > 0 && (
                        <div className="analysis-item">
                          <span className="label">Values:</span>
                          <span className="value">{(r.analysis.numbers || []).join(", ")}</span>
                        </div>
                      )}
                      
                      {r.analysis?.dates?.length > 0 && (
                        <div className="analysis-item">
                          <span className="label">Dates:</span>
                          <span className="value">{(r.analysis.dates || []).join(", ")}</span>
                        </div>
                      )}

                      {r.analysis?.summary && (
                        <div className="analysis-summary">
                          <span className="label">Summary:</span>
                          <p>{r.analysis.summary}</p>
                        </div>
                      )}
                    </div>

                    {r.ocrText && (
                      <div className="ocr-section">
                        <h4>OCR Text</h4>
                        <pre className="ocr-text">{r.ocrText}</pre>
                      </div>
                    )}
                  </div>

                  <div className="report-image">
                    <img
                      src={getImageUrl(r.id)}
                      alt="Medical report"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
