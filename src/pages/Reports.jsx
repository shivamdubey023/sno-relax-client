import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Upload, FileText, Clock, AlertCircle, CheckCircle, X } from "lucide-react";
import BackButton from "../components/BackButton";
import "../styles/Reports.css";

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("sno_userId") || "";
  const API_URL = process.env.REACT_APP_API_BASE?.split(",")[0]?.trim() || "http://localhost:10000";

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setError("Please login to view reports");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const url = `${API_URL}/api/reports/${encodeURIComponent(userId)}?all=1`;

      const res = await axios.get(url, { withCredentials: true });

      if (res.data && res.data.reports) {
        setReports(res.data.reports || []);
      } else if (res.data && res.data.exists) {
        setReports([res.data.report]);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.warn("Failed to fetch reports:", err?.message || err);
      setError("Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, userId]);

  useEffect(() => {
    if (userId) {
      fetchAll();
    }
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
      setError("Please choose an image file to upload");
      return;
    }
    if (!userId) {
      setError("User session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUploadProgress(10);

      const form = new FormData();
      form.append("userId", userId);
      form.append("userName", localStorage.getItem("sno_firstName") || "");
      form.append("image", file);

      const url = `${API_URL}/api/reports/upload`;
      setUploadProgress(30);

      const res = await axios.post(url, form, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 50) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      setUploadProgress(100);

      if (res.data && res.data.ok) {
        alert("Report uploaded successfully!");
        setFile(null);
        setPreviewUrl(null);
        fetchAll();
      } else {
        setError("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed: " + (err?.response?.data?.error || err?.message || "Unknown error"));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const getImageUrl = (id) => {
    const cleanId = String(id).replace(/"/g, '');
    return `${API_URL}/api/reports/image/${encodeURIComponent(cleanId)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "analyzed": return "#22c55e";
      case "pending": return "#f59e0b";
      case "error": return "#ef4444";
      default: return "#6b7280";
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <BackButton to="/profile" variant="ghost" label="Back" className="reports-back-btn" />
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
              <button className="preview-close" onClick={() => {
                setFile(null);
                setPreviewUrl(null);
              }}>
                <X size={16} />
              </button>
              <img src={previewUrl} alt="Preview" className="preview-image" />
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
              <span>{uploadProgress}%</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
              <button onClick={() => setError(null)}><X size={14} /></button>
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
          <h2><FileText size={20} /> Your Reports ({reports.length})</h2>

          {loading && reports.length === 0 && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading reports...</p>
            </div>
          )}

          {!loading && reports.length === 0 && !error && (
            <div className="empty-state">
              <FileText size={60} />
              <p>No reports uploaded yet</p>
              <span>Upload your first medical report to get started</span>
            </div>
          )}

          {!loading && reports.length > 0 && (
            <div className="reports-list">
              {reports.map((r) => (
                <div key={r.id || r._id} className="report-card">
                  <div className="report-header">
                    <div className="report-info">
                      <h3>Report</h3>
                      <span className="report-date">
                        <Clock size={14} />
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span 
                      className="report-status"
                      style={{ backgroundColor: getStatusColor(r.reportStatus) }}
                    >
                      {r.reportStatus || 'unknown'}
                    </span>
                  </div>

                  <div className="report-content">
                    {/* Summary */}
                    {r.summary && (
                      <div className="report-summary">
                        <div className={`status-badge ${r.summary.overall}`}>
                          {r.summary.overall === 'normal' && <CheckCircle size={16} />}
                          {r.summary.overall === 'abnormal' && <AlertCircle size={16} />}
                          {r.summary.overall === 'critical' && <AlertCircle size={16} />}
                          <span>{r.summary.overall?.toUpperCase() || 'ANALYZED'}</span>
                        </div>
                        {r.summary.message && (
                          <p className="summary-message">{r.summary.message}</p>
                        )}
                      </div>
                    )}

                    {/* Test Results */}
                    {r.testResults && r.testResults.length > 0 && (
                      <div className="test-results">
                        <h4><AlertCircle size={16} /> Test Results</h4>
                        <div className="results-grid">
                          {r.testResults.map((test, idx) => (
                            <div key={idx} className={`test-item ${test.status}`}>
                              <span className="test-name">{test.name}</span>
                              <span className="test-value">
                                {test.value} {test.unit}
                              </span>
                              <span className={`test-status ${test.status}`}>
                                {test.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {r.recommendations && r.recommendations.length > 0 && (
                      <div className="recommendations">
                        <h4>Recommendations</h4>
                        <ul>
                          {r.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Patient Info */}
                    {r.patientInfo && (
                      <div className="patient-info">
                        {r.patientInfo.patientName && (
                          <span>Patient: {r.patientInfo.patientName}</span>
                        )}
                        {r.patientInfo.age && (
                          <span>Age: {r.patientInfo.age}</span>
                        )}
                        {r.patientInfo.gender && (
                          <span>Gender: {r.patientInfo.gender}</span>
                        )}
                      </div>
                    )}

                    {/* OCR Text (collapsed by default) */}
                    {r.ocrText && (
                      <details className="ocr-section">
                        <summary>View OCR Text</summary>
                        <pre className="ocr-text">{r.ocrText}</pre>
                      </details>
                    )}
                  </div>

                  <div className="report-image">
                    <img
                      src={getImageUrl(r.id || r._id)}
                      alt="Medical report"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
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