import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Palette, Image, Check } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import "../styles/Settings.css";

export default function Settings() {
  const navigate = useNavigate();

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

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} /> Back
        </button>
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
          <p className="section-desc">Set a calming background image</p>

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
