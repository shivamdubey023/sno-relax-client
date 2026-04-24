import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Palette, Image, Check, Bell, BellOff, Volume2, VolumeX, MessageSquare, Users } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import BackButton from "../components/BackButton";
import "../styles/Settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") !== "false"
  );
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") !== "false"
  );
  const [popupEnabled, setPopupEnabled] = useState(
    localStorage.getItem("popupEnabled") !== "false"
  );
  const [vibrateEnabled, setVibrateEnabled] = useState(
    localStorage.getItem("vibrateEnabled") !== "false"
  );
  const [groupMutes, setGroupMutes] = useState(
    JSON.parse(localStorage.getItem("groupMutes") || "{}")
  );
  const [userMutes, setUserMutes] = useState(
    JSON.parse(localStorage.getItem("userMutes") || "{}")
  );

  const {
    theme,
    setSpecificTheme,
    setSpecificBackground,
    setSpecificAccentColor,
    customBackground,
    accentColor,
    themes: availableThemes,
    backgroundImages,
    accentColors,
    getThemeAccentColor,
  } = useContext(ThemeContext);

  const themes = (availableThemes || []).map((t) => ({
    id: t.id,
    name: t.name || t.id,
    icon: t.id === "dark" ? Moon : (t.id === 'brand' ? Palette : Sun),
    gradient: t.gradient,
  }));

  if (!themes.length) {
    themes.push(
      { id: "light", name: "Light", icon: Sun, gradient: "linear-gradient(135deg, #ffffff, #f1f5f9)" },
      { id: "dark", name: "Dark", icon: Moon, gradient: "linear-gradient(135deg, #000000, #0b1220)" },
      { id: "brand", name: "Brand", icon: Palette, gradient: "linear-gradient(135deg, #0b2740, #00FF66)" }
    );
  }

  const handleNotificationChange = (key, value) => {
    localStorage.setItem(key, String(value));
    switch (key) {
      case "notificationsEnabled":
        if (value) {
          Notification.requestPermission().then(perm => {
            if (perm !== "granted") {
              setNotificationsEnabled(false);
              localStorage.setItem("notificationsEnabled", "false");
            }
          });
        }
        setNotificationsEnabled(value);
        break;
      case "soundEnabled":
        setSoundEnabled(value);
        break;
      case "popupEnabled":
        setPopupEnabled(value);
        break;
      case "vibrateEnabled":
        setVibrateEnabled(value);
        break;
      default:
        break;
    }
  };

  const clearUserMute = (userId) => {
    const updated = { ...userMutes };
    delete updated[userId];
    setUserMutes(updated);
    localStorage.setItem("userMutes", JSON.stringify(updated));
  };

  const clearGroupMute = (groupId) => {
    const updated = { ...groupMutes };
    delete updated[groupId];
    setGroupMutes(updated);
    localStorage.setItem("groupMutes", JSON.stringify(updated));
  };

  const mutedUsers = Object.keys(userMutes);
  const mutedGroups = Object.keys(groupMutes);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <BackButton variant="ghost" label="Back" className="settings-back-btn" />
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        {/* Theme Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Palette size={24} />
            <h2>Theme</h2>
          </div>
          <p className="section-desc">Choose your preferred color theme</p>

          <div className="theme-grid">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon || Sun;

              return (
                <button
                  key={themeOption.id}
                  className={`theme-option ${
                    theme === themeOption.id ? "active" : ""
                  }`}
                  onClick={() => setSpecificTheme(themeOption.id)}
                  title={`Switch to ${themeOption.name}`}
                >
                  <div
                    className="theme-preview"
                    style={{ 
                      background: themeOption.gradient
                    }}
                  >
                    <Icon size={28} color="#fff" />
                  </div>
                  <p>{themeOption.name}</p>
                  {theme === themeOption.id && (
                    <div className="checkmark">
                      <Check size={16} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Palette size={24} />
            <h2>Accent Color</h2>
          </div>
          <p className="section-desc">Personalize your accent color</p>

          <div className="accent-color-grid">
            {accentColors.map((accent) => (
              <button
                key={accent.id}
                className={`accent-option ${
                  accentColor === accent.id ? "active" : ""
                }`}
                onClick={() => setSpecificAccentColor(accent.id)}
                title={accent.name}
              >
                <div
                  className="accent-preview"
                  style={{
                    background: accent.gradient
                  }}
                />
                <p>{accent.name}</p>
                {accentColor === accent.id && (
                  <div className="checkmark">
                    <Check size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Background Image Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Image size={24} />
            <h2>Background</h2>
          </div>
          <p className="section-desc">Set a calming background for Dashboard & Login pages</p>

          <div className="bg-image-grid">
            {backgroundImages.map((bg) => (
              <button
                key={bg.id}
                className={`bg-option ${
                  customBackground === bg.id ? "active" : ""
                }`}
                onClick={() => setSpecificBackground(bg.id)}
                title={bg.name}
              >
                <div
                  className="bg-preview"
                  style={{
                    backgroundImage: bg.url 
                      ? `url('${bg.thumbnail}')` 
                      : "linear-gradient(135deg, #0b2740, #00FF66)",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  {!bg.url && <Palette size={20} />}
                </div>
                <p>{bg.name}</p>
                {customBackground === bg.id && (
                  <div className="checkmark">
                    <Check size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Display</h2>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                defaultChecked={true}
                onChange={(e) => {
                  document.documentElement.style.fontSize = e.target.checked
                    ? "16px"
                    : "14px";
                }}
              />
              <span>Standard Text Size</span>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked={true} />
              <span>Animations Enabled</span>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked={true} />
              <span>Smooth Transitions</span>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Bell size={24} />
            <h2>Notifications</h2>
          </div>
          <p className="section-desc">Control how you receive alerts</p>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => handleNotificationChange("notificationsEnabled", e.target.checked)}
              />
              <span>Push Notifications</span>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => handleNotificationChange("soundEnabled", e.target.checked)}
              />
              <span>{soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} Sound Alert</span>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={popupEnabled}
                onChange={(e) => handleNotificationChange("popupEnabled", e.target.checked)}
              />
              <span>Popup Message Alert</span>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={vibrateEnabled}
                onChange={(e) => handleNotificationChange("vibrateEnabled", e.target.checked)}
              />
              <span>Vibrate (Mobile)</span>
            </label>
          </div>
        </div>

        {/* Muted Groups */}
        {mutedGroups.length > 0 && (
          <div className="settings-section">
            <div className="section-header">
              <BellOff size={24} />
              <h2>Muted Groups</h2>
            </div>
            <p className="section-desc">Groups with notifications silenced</p>

            <div className="muted-list">
              {mutedGroups.map(groupId => (
                <div key={groupId} className="muted-item">
                  <span><Users size={14} /> {groupMutes[groupId] || groupId}</span>
                  <button onClick={() => clearGroupMute(groupId)} className="unmute-btn">
                    Unmute
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Muted Users */}
        {mutedUsers.length > 0 && (
          <div className="settings-section">
            <div className="section-header">
              <MessageSquare size={24} />
              <h2>Muted Users</h2>
            </div>
            <p className="section-desc">Users with notifications silenced</p>

            <div className="muted-list">
              {mutedUsers.map(userId => (
                <div key={userId} className="muted-item">
                  <span>{userMutes[userId] || userId}</span>
                  <button onClick={() => clearUserMute(userId)} className="unmute-btn">
                    Unmute
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>About</h2>
          </div>

          <p className="about-text">
            <strong>SnoRelax v1.0.0</strong>
            <br />
            A mental wellness platform designed to help you manage stress, mood,
            and mental health through AI-powered tools and community support.
          </p>

          <div className="about-info">
            <div className="info-row">
              <span>Theme:</span>
              <strong>{theme === "dark" ? "Dark" : theme === 'brand' ? 'Brand' : 'Light'}</strong>
            </div>
            <div className="info-row">
              <span>Background:</span>
              <strong>{backgroundImages.find(bg => bg.id === customBackground)?.name || 'Default'}</strong>
            </div>
            <div className="info-row">
              <span>Accent:</span>
              <div 
                className="accent-dot" 
                style={{ background: getThemeAccentColor() }}
              />
              <strong>{accentColors.find(a => a.id === accentColor)?.name || 'Green'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
