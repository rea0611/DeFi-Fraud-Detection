
import { useState, useEffect, useMemo } from "react";

import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  TrendingUp,
  Eye
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { getData } from "../services/api.js";

const COLORS = [
  "#16a34a",
  "#eab308",
  "#f97316",
  "#dc2626"
];

function RiskAnalysis() {
  const [stats, setStats] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRiskData = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch statistics
        const statsResult = await getData("/risk/stats");

        if (!statsResult.success) {
          throw new Error("Risk statistics could not be loaded.");
        }

        // IMPORTANT: Backend returns flat JSON
        const statsData = statsResult.data || statsResult;

        setStats(statsData);

        // Fetch high-risk wallets separately
        try {
          const walletResult = await getData("/risk/high-risk");

          const walletData = Array.isArray(walletResult.data)
            ? walletResult.data
            : Array.isArray(walletResult.wallets)
            ? walletResult.wallets
            : [];

          setWallets(walletData.map((wallet, index) => ({
            id: wallet.wallet_address || index,
            address: wallet.wallet_address || "Unknown",
            score: Number(wallet.risk_score || 0),
            risk: wallet.risk_category || "Unknown",
            reason:
              wallet.explanation ||
              wallet.anomaly_category ||
              "No explanation available"
          })));

        } catch (walletError) {
          console.error("Wallet API error:", walletError);
          setWallets([]);
        }

      } catch (err) {
        console.error("Risk Analysis error:", err);
        setError(err.message || "Unable to load risk analysis.");
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, []);

  // Risk distribution
  const riskData = useMemo(() => {
    if (!stats) return [];

    return [
      {
        name: "Low Risk",
        value: Number(stats.lowRiskWallets || 0),
        color: COLORS[0]
      },
      {
        name: "Moderate Risk",
        value: Number(stats.moderateRiskWallets || 0),
        color: COLORS[1]
      },
      {
        name: "High Risk",
        value: Number(stats.highRiskWallets || 0),
        color: COLORS[2]
      },
      {
        name: "Critical Risk",
        value: Number(stats.criticalWallets || 0),
        color: COLORS[3]
      }
    ];
  }, [stats]);

  const averageRisk = Number(stats?.averageRiskScore || 0);

  const highRiskCount =
    Number(stats?.highRiskWallets || 0) +
    Number(stats?.criticalWallets || 0);

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address)
      .then(() => alert("Wallet address copied!"))
      .catch(() => alert("Unable to copy address."));
  };

  return (
    <div className="risk-page">

      {/* HEADER */}
      <div className="page-heading">
        <div>
          <h1>Risk Analysis</h1>
          <p>
            Monitor suspicious wallets and identify potential DeFi fraud.
          </p>
        </div>

        <span className="demo-tag">
          {loading ? "LOADING..." : error ? "API ERROR" : "REAL ML DATA"}
        </span>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="risk-panel">
          <p>Loading risk analysis...</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="risk-panel">
          <AlertTriangle />
          <h3>Unable to load risk statistics</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {/* CONTENT */}
      {!loading && !error && stats && (
        <>

          {/* SUMMARY CARDS */}
          <div className="risk-summary-grid">

            <div className="risk-summary-card">
              <div className="risk-icon purple">
                <ShieldAlert />
              </div>
              <p>Total Wallets Analyzed</p>
              <h2>
                {Number(stats.totalWallets || 0).toLocaleString()}
              </h2>
              <span>Wallets in ML dataset</span>
            </div>

            <div className="risk-summary-card">
              <div className="risk-icon red">
                <AlertTriangle />
              </div>
              <p>High Risk Wallets</p>
              <h2>{highRiskCount.toLocaleString()}</h2>
              <span>High and critical categories</span>
            </div>

            <div className="risk-summary-card">
              <div className="risk-icon green">
                <ShieldCheck />
              </div>
              <p>Safe Wallets</p>
              <h2>
                {Number(stats.lowRiskWallets || 0).toLocaleString()}
              </h2>
              <span>Low-risk category</span>
            </div>

            <div className="risk-summary-card">
              <div className="risk-icon orange">
                <Activity />
              </div>
              <p>Average Risk Score</p>
              <h2>{averageRisk.toFixed(2)}</h2>
              <span>Out of 100</span>
            </div>

          </div>

          {/* CHARTS */}
          <div className="risk-content-grid">

            <div className="risk-panel">
              <h3>Wallet Risk Distribution</h3>
              <p className="panel-subtitle">
                Actual distribution from ML risk scores
              </p>

              <div className="risk-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                    >
                      {riskData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={item.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="risk-legend">
                {riskData.map((item) => {
                  const total = Number(stats.totalWallets || 0);
                  const percentage = total
                    ? ((item.value / total) * 100).toFixed(1)
                    : "0.0";

                  return (
                    <div key={item.name}>
                      <span>
                        <i style={{ background: item.color }} />
                        {item.name}
                      </span>
                      <strong>
                        {item.value.toLocaleString()} ({percentage}%)
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="risk-panel">
              <h3>Risk Assessment Overview</h3>
              <p className="panel-subtitle">
                Current ML security assessment
              </p>

              <div className="risk-score-circle">
                <div>
                  <h2>{averageRisk.toFixed(2)}</h2>
                  <span>Average Risk / 100</span>
                </div>
              </div>

              <div className="assessment-status">
                <ShieldCheck size={19} />
                <div>
                  <strong>ML Risk Analysis</strong>
                  <p>Risk scores loaded from processed ML dataset.</p>
                </div>
              </div>

              <div className="assessment-status">
                <TrendingUp size={19} />
                <div>
                  <strong>Anomaly Detection</strong>
                  <p>
                    {Number(stats.anomalyWallets || 0).toLocaleString()}
                    {" "}wallets flagged as anomalous.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* HIGH RISK WALLETS */}
          <div className="risk-panel flagged-panel">

            <div className="table-heading">
              <div>
                <h3>High Risk Wallets</h3>
                <p className="panel-subtitle">
                  Wallets identified during ML risk assessment
                </p>
              </div>

              <span className="flagged-count">
                {wallets.length} Wallets
              </span>
            </div>

            <div className="risk-table-wrapper">
              <table className="risk-table">

                <thead>
                  <tr>
                    <th>Wallet Address</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {wallets.map((wallet) => (
                    <tr key={wallet.id}>

                      <td className="wallet-address">
                        {wallet.address.slice(0, 14)}...
                      </td>

                      <td>
                        <strong>
                          {wallet.score.toFixed(2)}/100
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`risk-badge ${
                            wallet.risk.toLowerCase().split(" ")[0]
                          }`}
                        >
                          {wallet.risk}
                        </span>
                      </td>

                      <td>{wallet.reason}</td>

                      <td>
                        <button
                          className="risk-view-btn"
                          onClick={() => copyAddress(wallet.address)}
                        >
                          <Eye size={15} /> Copy
                        </button>
                      </td>

                    </tr>
                  ))}

                  {wallets.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        No high-risk wallet records returned.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

          </div>

        </>
      )}

    </div>
  );
}

export default RiskAnalysis;
