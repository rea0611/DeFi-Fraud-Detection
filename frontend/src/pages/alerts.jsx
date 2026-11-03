
import { useState, useEffect } from "react";

import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Bell,
  Clock,
  Check,
  Trash2
} from "lucide-react";

import { getData } from "../services/api.js";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch actual ML risk data
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getData("/risk/high-risk");

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || "Unable to load alerts");
        }

        const generatedAlerts = result.data.map((wallet, index) => {
          const category = String(wallet.risk_category || "").toLowerCase();

          const type = category.includes("critical")
            ? "Critical"
            : "High";

          return {
            id: wallet.wallet_address || index,
            address: wallet.wallet_address || "Unknown wallet",
            score: Number(wallet.risk_score || 0),
            type,
            title:
              type === "Critical"
                ? "Critical Risk Wallet Detected"
                : "High Risk Wallet Detected",
            message:
              wallet.explanation ||
              wallet.anomaly_category ||
              `Wallet identified with a risk score of ${Number(
                wallet.risk_score || 0
              ).toFixed(2)}/100.`,
            read: false
          };
        });

        setAlerts(generatedAlerts);
      } catch (err) {
        setError(err.message || "Failed to load security alerts");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const criticalCount = alerts.filter(
    (alert) => alert.type === "Critical"
  ).length;

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !alert.read;
    return alert.type === filter;
  });

  const markAllRead = () => {
    setAlerts((previous) =>
      previous.map((alert) => ({ ...alert, read: true }))
    );
  };

  const markRead = (id) => {
    setAlerts((previous) =>
      previous.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };

  const removeAlert = (id) => {
    setAlerts((previous) =>
      previous.filter((alert) => alert.id !== id)
    );
  };

  const getIcon = (type) => {
    if (type === "Critical") return <ShieldAlert />;
    if (type === "High") return <AlertTriangle />;
    return <ShieldCheck />;
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address)
      .then(() => alert("Wallet address copied!"))
      .catch(() => alert("Unable to copy address."));
  };

  return (
    <div className="alerts-page">

      <div className="page-heading">
        <div>
          <h1>Security Alerts</h1>
          <p>
            Monitor suspicious wallets and important security notifications.
          </p>
        </div>

        <span className="demo-tag">
          {loading ? "LOADING..." : error ? "API ERROR" : "ML GENERATED"}
        </span>
      </div>

      {/* SUMMARY */}
      <div className="alert-summary-grid">

        <div className="alert-summary-card">
          <Bell />
          <div>
            <p>Total Alerts</p>
            <h2>{loading ? "..." : alerts.length}</h2>
          </div>
        </div>

        <div className="alert-summary-card">
          <AlertTriangle />
          <div>
            <p>Unread Alerts</p>
            <h2>{loading ? "..." : unreadCount}</h2>
          </div>
        </div>

        <div className="alert-summary-card">
          <ShieldAlert />
          <div>
            <p>Critical Alerts</p>
            <h2>{loading ? "..." : criticalCount}</h2>
          </div>
        </div>

      </div>

      {/* ALERT LIST */}
      <div className="alerts-panel">

        <div className="alerts-header">
          <div>
            <h3>ML Security Notifications</h3>
            <p className="panel-subtitle">
              {unreadCount} unread notifications
            </p>
          </div>

          <button
            className="mark-all-btn"
            onClick={markAllRead}
            disabled={loading || alerts.length === 0}
          >
            <Check size={16} /> Mark all as read
          </button>
        </div>

        {/* FILTERS */}
        <div className="alert-filters">
          {["All", "Unread", "Critical", "High"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="no-alerts">
            <Bell size={30} />
            <h3>Loading security alerts...</h3>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="no-alerts">
            <AlertTriangle size={35} />
            <h3>Unable to load alerts</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {!loading && !error && (
          <div className="alert-list">

            {filteredAlerts.length === 0 ? (
              <div className="no-alerts">
                <ShieldCheck size={35} />
                <h3>No alerts found</h3>
                <p>There are no notifications in this category.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  className={`alert-item ${!alert.read ? "unread" : ""}`}
                  key={alert.id}
                >

                  <div className={`alert-item-icon ${alert.type.toLowerCase()}`}>
                    {getIcon(alert.type)}
                  </div>

                  <div className="alert-details">

                    <div className="alert-title-row">
                      <h4>{alert.title}</h4>

                      <span className={`risk-badge ${alert.type.toLowerCase()}`}>
                        {alert.type}
                      </span>
                    </div>

                    <p>{alert.message}</p>

                    <p className="alert-wallet">
                      Wallet: {alert.address.slice(0, 14)}...
                    </p>

                    <span className="alert-time">
                      <Clock size={13} />
                      ML risk score: {alert.score.toFixed(2)}/100
                    </span>

                  </div>

                  <div className="alert-actions">

                    <button
                      title="Copy wallet address"
                      onClick={() => copyAddress(alert.address)}
                    >
                      <Bell size={17} />
                    </button>

                    {!alert.read && (
                      <button
                        title="Mark as read"
                        onClick={() => markRead(alert.id)}
                      >
                        <Check size={17} />
                      </button>
                    )}

                    <button
                      title="Delete alert"
                      onClick={() => removeAlert(alert.id)}
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>
              ))
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Alerts;
