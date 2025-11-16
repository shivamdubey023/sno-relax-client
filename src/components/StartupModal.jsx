import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Modal.css';

export default function StartupModal({ visible, content, onClose }) {
  const navigate = useNavigate();
  if (!visible) return null;

  const handleCTA = () => {
    try {
      // Mark dismissed so modal won't reappear
      const version = localStorage.getItem('admin_popup_version') || '1';
      localStorage.setItem('admin_popup_dismissed_version', version);
    } catch (e) {
      // ignore storage errors
    }
    if (onClose) onClose();
    navigate('/reports');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card startup-modal">
        <div className="modal-header">
          <div className="modal-title">Announcement</div>
          <button className="modal-close" onClick={onClose} aria-label="Close popup">✕</button>
        </div>
        <div className="modal-body" dangerouslySetInnerHTML={{ __html: content }} />
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Dismiss</button>
          <button className="btn btn-primary" onClick={handleCTA}>Open Reports</button>
        </div>
      </div>
    </div>
  );
}
