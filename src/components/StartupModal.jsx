import React from 'react';
import './Modal.css';

export default function StartupModal({ visible, content, onClose }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ maxHeight: '60vh', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
