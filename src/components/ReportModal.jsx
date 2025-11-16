import React from 'react';
import './Modal.css';

export default function ReportModal({ visible, onClose, onSeeRecords, onUpload }) {
  if (!visible) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>Hospital Reports</h3>
        <p>What would you like to do?</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="upload-btn" onClick={onSeeRecords}>See Records</button>
          <button className="upload-btn" onClick={onUpload}>Upload Data</button>
        </div>
      </div>
    </div>
  );
}
