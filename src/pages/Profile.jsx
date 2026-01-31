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
    const avatar =
      localStorage.getItem("sno_avatar") || "https://i.imgur.com/KR0NKdM.png";
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
      mood: { happy: 70, calm: 80, stress: 40 },
      city,
      latitude,
      longitude,
    });
    setPreviewAvatar(avatar);
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
    const userId = user.id;
    const changes = [];

    const checkAndRecordChange = (fieldName, oldVal, newVal) => {
      if (String(oldVal) !== String(newVal)) {
        changes.push({ fieldName, oldValue: oldVal, newValue: newVal });
      }
    };

    checkAndRecordChange(
      "firstName",
      localStorage.getItem("sno_firstName") || "",
      user.name.split(" ")[0] || ""
    );
    checkAndRecordChange(
      "lastName",
      localStorage.getItem("sno_lastName") || "",
      user.name.split(" ").slice(1).join(" ") || ""
    );
    checkAndRecordChange("email", localStorage.getItem("sno_email") || "", user.email);
    checkAndRecordChange("phone", localStorage.getItem("sno_phone") || "", user.phone);
    checkAndRecordChange(
      "emergency",
      localStorage.getItem("sno_emergency") || "",
      user.emergency
    );
    checkAndRecordChange("dob", localStorage.getItem("sno_dob") || "", user.dob);
    checkAndRecordChange(
      "avatar",
      localStorage.getItem("sno_avatar") || "",
      user.avatar
    );
    checkAndRecordChange(
      "history",
      localStorage.getItem("sno_history") || "",
      user.history
    );
    checkAndRecordChange(
      "communityNickname",
      localStorage.getItem("communityNickname") || "Anonymous",
      communityNickname
    );

    localStorage.setItem("sno_firstName", user.name.split(" ")[0] || "");
    localStorage.setItem(
      "sno_lastName",
      user.name.split(" ").slice(1).join(" ") || ""
    );
    localStorage.setItem("sno_email", user.email);
    localStorage.setItem("sno_phone", user.phone);
    localStorage.setItem("sno_emergency", user.emergency);
    localStorage.setItem("sno_dob", user.dob);
    localStorage.setItem("sno_avatar", user.avatar);
    localStorage.setItem("sno_history", user.history);

    if (communityNickname && communityNickname.trim()) {
      localStorage.setItem("communityNickname", communityNickname.trim());
    } else {
      localStorage.setItem("communityNickname", "Anonymous");
      setCommunityNickname("Anonymous");
    }

    if (changes.length > 0 && userId) {
      try {
        const API_URL =
          process.env.REACT_APP_API_BASE ||
          "https://sno-relax-server.onrender.com";
        for (const change of changes) {
          await axios.post(`${API_URL}/api/admin/profile-change`, {
            userId,
            fieldName: change.fieldName,
            oldValue: change.oldValue,
            newValue: change.newValue,
            changedBy: "user",
          });
        }
      } catch (err) {
        console.warn("Failed to log profile changes:", err);
      }
    }

    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-topbar">
        <button className="back-btn" onClick={() => navigate("/") }>
          ← Back to Dashboard
        </button>
        <span className="profile-app-title">SnoRelax</span>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <img src={previewAvatar} alt="Avatar" className="profile-pic" />
          {isEditing && (
            <label className="upload-btn">
              Upload Avatar
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
          )}
          <h2 className="username">{user.name}</h2>
          <div style={{ fontSize: 13, color: "#666" }}>
            Nickname: <strong>{communityNickname}</strong>
          </div>
          <p className="user-id">ID: {user.id}</p>
          <p className="user-city">City: {user.city}</p>
        </div>

        <div className="profile-mood">
          <h3>Mood Tracker</h3>
          {Object.keys(user.mood).map((m) => (
            <div key={m} className="mood-bar">
              <span>{m}</span>
              <div className="bar">
                <div className="fill" style={{ width: `${user.mood[m]}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="profile-actions">
          <button onClick={() => navigate("/progress-report")}>Progress Report</button>
          <button onClick={() => navigate("/ai-guide")}>Guided Exercises</button>
          <button onClick={() => setShowReportModal(true)}>
            Medical Report Summarization
          </button>
        </div>

        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSeeRecords={() => navigate("/reports")}
          onUpload={() => navigate("/reports?action=upload")}
        />

        {isEditing ? (
          <div className="edit-section">
            <input name="name" value={user.name} onChange={handleChange} />
            <input
              value={communityNickname}
              onChange={(e) => setCommunityNickname(e.target.value)}
            />
            <button onClick={handleSave}>Save</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>
    </div>
  );
}
