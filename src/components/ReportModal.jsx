import React from "react";
import "./Modal.css";

/**
 * ReportModal
 * --------------------------------------------------
 * A reusable modal component for handling hospital
 * report actions such as:
 *  - Viewing previously uploaded records
 *  - Uploading new medical data
 *
 * This component is intentionally UI-only.
 * All business logic (API calls, navigation, uploads)
 * is delegated to parent callbacks.
 *
 * Props:
 *  - visible (boolean): Controls modal visibility
 *  - onClose (function): Called when modal is closed
 *  - onSeeRecords (function): Trigger "See Records" action
 *  - onUpload (function): Trigger "Upload Data" action
 *
 * Future Enhancements:
 *  - Keyboard accessibility (Esc to close)
 *  - Animation hooks (open/close transitions)
 *  - Role-based actions (doctor / patient)
 *  - Confirmation modals before upload
 */
export default function ReportModal({
  visible,
  onClose,
  onSeeRecords,
  onUpload,
}) {
  // Do not render anything if modal is not visible
  if (!visible) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="modal-card">
        {/* Close button */}
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
          title="Close"
        >
          ✕
        </button>

        {/* Modal Title */}
        <h3 id="report-modal-title">Hospital Reports</h3>

        {/* Modal Description */}
        <p>What would you like to do?</p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {/* View existing records */}
          <button
            className="upload-btn"
            onClick={onSeeRecords}
            type="button"
          >
            See Records
          </button>

          {/* Upload new data */}
          <button
            className="upload-btn"
            onClick={onUpload}
            type="button"
          >
            Upload Data
          </button>
        </div>
      </div>
    </div>
  );
}
