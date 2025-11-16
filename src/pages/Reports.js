import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

export default function Reports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [file, setFile] = useState(null);
  const userId = localStorage.getItem('sno_userId') || '';
  const API_URL = process.env.REACT_APP_API_BASE || '';

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const base = API_URL || '';
      const url = `${base}/api/reports/${encodeURIComponent(userId)}?all=1`;
      const res = await axios.get(url, { withCredentials: true });
      if (res.data && res.data.exists) {
        setReport(res.data.reports || []);
      } else {
        setReport([]);
      }
    } catch (err) {
      console.warn('Failed to fetch reports:', err.message || err);
      setReport([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, userId]);

  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId, fetchAll]);

  

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please choose an image file to upload');
    if (!userId) return alert('No user id found. Please login again.');

    try {
      setLoading(true);
      const form = new FormData();
      form.append('userId', userId);
      form.append('userName', localStorage.getItem('sno_firstName') || '');
      form.append('image', file);
      const base = API_URL || '';
      const url = `${base}/api/reports/upload`;
      const res = await axios.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
        if (res.data && res.data.ok) {
        alert('Report uploaded successfully');
        setFile(null);
        fetchAll();
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + (err.response?.data?.error || err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (id) => {
    const base = API_URL || '';
    return `${base}/api/reports/image/${id}`;
  };

  return (
    <div className="profile-container">
      <div className="profile-topbar">
        <button className="back-btn" onClick={() => navigate('/profile')}>← Back</button>
        <span className="profile-app-title">Hospital Reports</span>
      </div>

      <div className="profile-card">
        <h3 style={{ marginBottom: 12 }}>Upload New Report</h3>
        <input type="file" accept="image/*" onChange={handleFile} />
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button className="upload-btn" onClick={handleUpload} disabled={loading || !file}>Upload</button>
          <button className="upload-btn" onClick={() => { setFile(null); }}>Clear</button>
        </div>

        <div style={{ height: 1, width: '100%', background: 'linear-gradient(90deg,#4aa0e2,#6ee7b7)', margin: '16px 0' }} />

        <h3>Medical Report Summarization</h3>
        {loading && <p>Loading reports...</p>}
        {!loading && (!report || report.length === 0) && <p>No reports uploaded yet.</p>}

        {!loading && report && report.length > 0 && (
          <div style={{ textAlign: 'left' }}>
            {report.map(r => (
              <div key={r.id} style={{ marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #123' }}>
                <p><strong>Uploaded:</strong> {new Date(r.createdAt).toLocaleString()}</p>
                <p><strong>OCR Text:</strong></p>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#0b1e3d', padding: 12, borderRadius: 8 }}>{r.ocrText || '(No OCR detected)'}</pre>
                <p><strong>Analysis:</strong></p>
                <div>
                  <p><strong>Detected tests:</strong> {(r.analysis?.tests || []).join(', ') || 'None'}</p>
                  <p><strong>Numbers:</strong> {(r.analysis?.numbers || []).join(', ') || 'None'}</p>
                  <p><strong>Dates:</strong> {(r.analysis?.dates || []).join(', ') || 'None'}</p>
                  <p><strong>Summary:</strong> {r.analysis?.summary || '—'}</p>
                </div>
                <div style={{ marginTop: 12 }}>
                  <img src={getImageUrl(r.id)} alt="report" style={{ maxWidth: '100%', borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
