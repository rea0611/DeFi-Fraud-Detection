

import { useState, useEffect } from "react";

import {
  User,
  Bell,
  Shield,
  Palette,
  Lock,
  Save,
  Mail,
  Smartphone,
  CheckCircle,
  RotateCcw
} from "lucide-react";

const DEFAULT_SETTINGS = {
  profile: {
    name: "Admin User",
    email: "admin@defiguard.com",
    role: "Administrator"
  },

  notifications: {
    critical: true,
    suspicious: true,
    reports: false,
    email: true
  },

  security: {
    twoFactor: true,
    loginAlerts: true
  },

  theme: "Light"
};

function loadSettings() {
  try {
    const saved = localStorage.getItem("defiguard_settings");

    if (!saved) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(saved);

    return {
      profile: {
        ...DEFAULT_SETTINGS.profile,
        ...parsed.profile
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...parsed.notifications
      },
      security: {
        ...DEFAULT_SETTINGS.security,
        ...parsed.security
      },
      theme: parsed.theme || "Light"
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  const { profile, notifications, security, theme } = settings;

  const updateProfile = (key, value) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: value
      }
    }));

    setSaved(false);
  };

  const toggleNotification = key => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));

    setSaved(false);
  };

  const toggleSecurity = key => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: !prev.security[key]
      }
    }));

    setSaved(false);
  };

  const handleSave = () => {
    if (!profile.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      localStorage.setItem(
        "defiguard_settings",
        JSON.stringify(settings)
      );

      setSaved(true);
    } catch {
      alert("Unable to save settings in this browser.");
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to default?")) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem("defiguard_settings");
      setSaved(false);
    }
  };

  return (
    <div className="settings-page">

      {/* HEADER */}
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>Manage your account, preferences and security.</p>
        </div>

        <span className="demo-tag">ADMIN PANEL</span>
      </div>

      {/* PROFILE */}
      <div className="settings-panel">

        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <User />
          </div>

          <div>
            <h3>Profile Information</h3>
            <p>Manage your administrator account details.</p>
          </div>
        </div>

        <div className="profile-form">

          <div className="settings-field">
            <label>Full Name</label>

            <input
              type="text"
              value={profile.name}
              placeholder="Enter your name"
              onChange={e =>
                updateProfile("name", e.target.value)
              }
            />
          </div>

          <div className="settings-field">
            <label>Email Address</label>

            <input
              type="email"
              value={profile.email}
              placeholder="Enter your email"
              onChange={e =>
                updateProfile("email", e.target.value)
              }
            />
          </div>

          <div className="settings-field">
            <label>Role</label>

            <input
              type="text"
              value={profile.role}
              disabled
            />
          </div>

        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="settings-panel">

        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <Bell />
          </div>

          <div>
            <h3>Notification Preferences</h3>
            <p>Choose which security notifications you prefer.</p>
          </div>
        </div>

        <div className="settings-options">

          <SettingToggle
            icon={<Shield />}
            title="Critical Fraud Alerts"
            description="Enable notifications for critical-risk wallets."
            checked={notifications.critical}
            onChange={() => toggleNotification("critical")}
          />

          <SettingToggle
            icon={<Bell />}
            title="Suspicious Transactions"
            description="Enable notifications about unusual transaction activity."
            checked={notifications.suspicious}
            onChange={() => toggleNotification("suspicious")}
          />

          <SettingToggle
            icon={<Mail />}
            title="Weekly Reports"
            description="Set your preference for weekly fraud reports."
            checked={notifications.reports}
            onChange={() => toggleNotification("reports")}
          />

          <SettingToggle
            icon={<Smartphone />}
            title="Email Notifications"
            description="Set your email notification preference."
            checked={notifications.email}
            onChange={() => toggleNotification("email")}
          />

        </div>
      </div>

      {/* SECURITY */}
      <div className="settings-panel">

        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <Lock />
          </div>

          <div>
            <h3>Security Settings</h3>
            <p>Configure your account security preferences.</p>
          </div>
        </div>

        <div className="settings-options">

          <SettingToggle
            icon={<Shield />}
            title="Two-Factor Authentication"
            description="Set your preference for additional login verification."
            checked={security.twoFactor}
            onChange={() => toggleSecurity("twoFactor")}
          />

          <SettingToggle
            icon={<Bell />}
            title="Login Alerts"
            description="Set your preference for new-login notifications."
            checked={security.loginAlerts}
            onChange={() => toggleSecurity("loginAlerts")}
          />

        </div>
      </div>

      {/* APPEARANCE */}
      <div className="settings-panel">

        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <Palette />
          </div>

          <div>
            <h3>Appearance</h3>
            <p>Choose your dashboard appearance preference.</p>
          </div>
        </div>

        <div className="settings-field theme-field">

          <label>Dashboard Theme</label>

          <select
            value={theme}
            onChange={e => {
              setSettings(prev => ({
                ...prev,
                theme: e.target.value
              }));

              setSaved(false);
            }}
          >
            <option value="Light">Light Theme</option>
            <option value="Dark">Dark Theme</option>
            <option value="System">System Default</option>
          </select>

          <p className="settings-hint">
            Selected preference: {theme}
          </p>

        </div>
      </div>

      {/* SAVE */}
      <div className="settings-save-area">

        <button
          className="settings-save-btn"
          onClick={handleSave}
        >
          <Save size={17} />
          Save Changes
        </button>

        <button
          className="settings-save-btn"
          onClick={handleReset}
        >
          <RotateCcw size={17} />
          Reset
        </button>

        {saved && (
          <span className="settings-hint">
            <CheckCircle size={16} />
            Settings saved successfully!
          </span>
        )}

      </div>

    </div>
  );
}

function SettingToggle({
  icon,
  title,
  description,
  checked,
  onChange
}) {
  return (
    <div className="setting-option">

      <div className="setting-option-icon">
        {icon}
      </div>

      <div className="setting-option-content">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`setting-switch ${checked ? "enabled" : ""}`}
        onClick={onChange}
      >
        <span />
      </button>

    </div>
  );
}

export default Settings;
