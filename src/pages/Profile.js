import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Profile.css";
import ReportModal from "../components/ReportModal";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    emergency: "",
    dob: "",
    avatar: "https://i.imgur.com/KR0NKdM.png", // default avatar
    history: "",
    mood: { happy: 70, calm: 80, stress: 40 },
    city: "",
    latitude: "",
    longitude: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar);
  const [showReportModal, setShowReportModal] = useState(false);
  const [communityNickname, setCommunityNickname] = useState(
    localStorage.getItem("communityNickname") || "Anonymous"
  );

  useEffect(() => {
    // Get user data from localStorage (set by Login.jsx)
    const userId = localStorage.getItem("sno_userId") || "";
    const firstName = localStorage.getItem("sno_firstName") || "";
    const lastName = localStorage.getItem("sno_lastName") || "";
    const email = localStorage.getItem("sno_email") || "";
    const phone = localStorage.getItem("sno_phone") || "";
    const emergency = localStorage.getItem("sno_emergency") || "";
    const dob = localStorage.getItem("sno_dob") || "";
    const avatar = localStorage.getItem("sno_avatar") || "https://i.imgur.com/KR0NKdM.png";
    const history = localStorage.getItem("sno_history") || "";
    const city = localStorage.getItem("sno_city") || "";
    const latitude = localStorage.getItem("sno_lat") || "";
    const longitude = localStorage.getItem("sno_lon") || "";

    setUser({
      id: userId,
      name: `${firstName} ${lastName}`.trim() || "Anonymous User",
      email,
      phone,
      emergency,
      dob,
      avatar,
      history,
      mood: { happy: 70, calm: 80, stress: 40 }, // You can fetch real mood data if available
      city,
      latitude,
      longitude,
    });
    setPreviewAvatar(avatar);
    // load community nickname if present
    setCommunityNickname(localStorage.getItem("communityNickname") || "Anonymous");
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewAvatar(reader.result);
      setUser({ ...user, avatar: reader.result });
      localStorage.setItem("sno_avatar", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    // Build list of profile changes
    const userId = user.id;
    const changes = [];

    const checkAndRecordChange = (fieldName, oldVal, newVal) => {
      if (String(oldVal) !== String(newVal)) {
        changes.push({ fieldName, oldValue: oldVal, newValue: newVal });
      }
    };

    // Check each field for changes
    checkAndRecordChange("firstName", localStorage.getItem("sno_firstName") || "", user.name.split(" ")[0] || "");
    checkAndRecordChange("lastName", localStorage.getItem("sno_lastName") || "", user.name.split(" ").slice(1).join(" ") || "");
    checkAndRecordChange("email", localStorage.getItem("sno_email") || "", user.email);
    checkAndRecordChange("phone", localStorage.getItem("sno_phone") || "", user.phone);
    checkAndRecordChange("emergency", localStorage.getItem("sno_emergency") || "", user.emergency);
    checkAndRecordChange("dob", localStorage.getItem("sno_dob") || "", user.dob);
    checkAndRecordChange("avatar", localStorage.getItem("sno_avatar") || "", user.avatar);
    checkAndRecordChange("history", localStorage.getItem("sno_history") || "", user.history);
    checkAndRecordChange("communityNickname", localStorage.getItem("communityNickname") || "Anonymous", communityNickname);

    // Save updated fields to localStorage
    localStorage.setItem("sno_firstName", user.name.split(" ")[0] || "");
    localStorage.setItem("sno_lastName", user.name.split(" ").slice(1).join(" ") || "");
    localStorage.setItem("sno_email", user.email);
    localStorage.setItem("sno_phone", user.phone);
    localStorage.setItem("sno_emergency", user.emergency);
    localStorage.setItem("sno_dob", user.dob);
    localStorage.setItem("sno_avatar", user.avatar);
    localStorage.setItem("sno_history", user.history);
    // persist community nickname used in community pages
    if (communityNickname && communityNickname.trim()) {
      localStorage.setItem("communityNickname", communityNickname.trim());
    } else {
      localStorage.setItem("communityNickname", "Anonymous");
      setCommunityNickname("Anonymous");
    }

    // Send profile changes to server for audit log
    if (changes.length > 0 && userId) {
      try {
        const API_URL = process.env.REACT_APP_API_BASE || "https://sno-relax-server.onrender.com";
        for (const change of changes) {
          await axios.post(`${API_URL}/api/admin/profile-change`, {
            userId,
            fieldName: change.fieldName,
            oldValue: change.oldValue,
            newValue: change.newValue,
            changedBy: "user"
          });
        }
      } catch (err) {
        console.warn('Failed to log profile changes to server:', err);
        // Still allow the edit to complete even if logging fails
      }
    }

    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      {/* Top Bar */}
      <div className="profile-topbar">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
          aria-label="Back to Dashboard"
        >
          ← Back to Dashboard
        </button>
        <span className="profile-app-title">SnoRelax</span>
      </div>

      <div className="profile-card">
        {/* Avatar & Info */}
        <div className="profile-header">
          <img src={previewAvatar} alt="Avatar" className="profile-pic" />
          {isEditing && (
            <label className="upload-btn">
              Upload Avatar
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
          )}
          <h2 className="username">{user.name}</h2>
          {/* Show nickname under the user name when available */}
          <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Nickname: <strong style={{ fontSize: 14, color: "#333" }}>{communityNickname}</strong></div>
          <p className="user-id">ID: {user.id}</p>
          <p className="user-city">City: {user.city}</p>
        </div>

        {/* Mood Tracker */}
        <div className="profile-mood">
          <h3>Mood Tracker</h3>
          {Object.keys(user.mood).map((m) => (
            <div key={m} className="mood-bar">
              <span>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
              <div className="bar">
                <div className="fill" style={{ width: `${user.mood[m]}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="profile-actions">
          <button onClick={() => navigate("/progress-report")}>Progress Report</button>
          <button onClick={() => navigate("/ai-guide")}>Guided Exercises</button>
          <button onClick={() => setShowReportModal(true)}>Medical Report Summarization</button>
        </div>

        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSeeRecords={() => {
            setShowReportModal(false);
            navigate('/reports');
          }}
          onUpload={() => {
            setShowReportModal(false);
            navigate('/reports?action=upload');
          }}
        />

        {/* Edit Section */}
        {isEditing ? (
          <div className="edit-section">
            <label>Name</label>
            <input name="name" value={user.name} onChange={handleChange} />

            <label>Community Nickname</label>
            <input
              name="communityNickname"
              value={communityNickname}
              onChange={(e) => setCommunityNickname(e.target.value)}
              placeholder="How you'll appear in community groups"
              maxLength={20}
            />

            <label>Email</label>
            <input name="email" value={user.email} onChange={handleChange} />

            <label>Phone</label>
            <input name="phone" value={user.phone} onChange={handleChange} />

            <label>Emergency Number</label>
            <input name="emergency" value={user.emergency} onChange={handleChange} />

            <label>Date of Birth</label>
            <input type="date" name="dob" value={user.dob} onChange={handleChange} />

            <label>Emergency / Medical Info</label>
            <textarea
              name="history"
              value={user.history}
              onChange={handleChange}
              rows="3"
            />

            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        ) : (
          <div className="profile-details">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Emergency Number:</strong> {user.emergency}</p>
            <p><strong>Date of Birth:</strong> {user.dob}</p>
            <p><strong>Emergency / Medical Info:</strong> {user.history}</p>
            <p><strong>Community Nickname:</strong> {communityNickname}</p>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
