import { useEffect, useState } from "react";

import {
  Activity,
  Wallet,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Zap,
  ShieldCheck,
  ExternalLink
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";

import StatCard from "../components/statcard.jsx";
import TransactionTable from "../components/transactiontable.jsx";
import { getData } from "../services/api.js";

const COLORS = {
  Low: "#16A36A",
  Moderate: "#E9A23B",
  High: "#E05252",
  Critical: "#8B5CF6"
};

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [riskData, setRiskData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [securityActivities, setSecurityActivities] = useState([]);
  const [error, setError] = useState("");

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [riskResponse, transactionResponse, highRiskResponse] =
        await Promise.all([
          getData("/risk/stats"),
          getData("/transactions?limit=500"),
          getData("/risk/high-risk")
        ]);

      if (!riskResponse.success) {
        throw new Error("Unable to load risk statistics");
      }

      setStats({
        totalTransactions: transactionResponse.total || 0,
        totalWallets: riskResponse.totalWallets || 0,
        highRiskWallets:
          (riskResponse.criticalWallets || 0) +
          (riskResponse.highRiskWallets || 0),
        suspiciousActivity: riskResponse.anomalyWallets || 0
      });

      const categories = [
        {
          name: "Low",
          value: riskResponse.lowRiskWallets || 0,
          color: COLORS.Low
        },
        {
          name: "Moderate",
          value: riskResponse.moderateRiskWallets || 0,
          color: COLORS.Moderate
        },
        {
          name: "High",
          value: riskResponse.highRiskWallets || 0,
          color: COLORS.High
        },
        {
          name: "Critical",
          value: riskResponse.criticalWallets || 0,
          color: COLORS.Critical
        }
      ];

      setRiskData(categories);

      // Group recent transactions by block number.
      const transactions = transactionResponse.data || [];
      const blockCounts = {};

      transactions.forEach((transaction) => {
        const block = transaction.block || "Unknown";
        blockCounts[block] = (blockCounts[block] || 0) + 1;
      });

      const chartData = Object.entries(blockCounts)
        .map(([block, count]) => ({
          block: String(block),
          transactions: count
        }))
        .slice(-10);

      setActivityData(chartData);

      const activities = (highRiskResponse.data || [])
        .slice(0, 4)
        .map((wallet) => ({
          title: `${wallet.risk_category || "High-risk"} wallet detected`,
          description: wallet.wallet_address,
          time: `Risk score: ${wallet.risk_score}`,
          type:
            wallet.risk_category === "Critical Review"
              ? "danger"
              : "warning"
        }));

      setSecurityActivities(activities);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  return (
    <div className="dashboard-page">

      {/* Welcome Section */}

      <section className="welcome-section">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={14} />
            BLOCKCHAIN SECURITY OVERVIEW
          </span>

          <h1>
            Welcome to <span>DeFiGuard</span>
          </h1>

          <p>
            Monitor blockchain activity, identify anomalies
            and analyze wallet risk in one place.
          </p>
        </div>

        <div className="dashboard-actions">
          <div className="live-status">
            <span className="status-dot"></span>
            Live Monitoring
          </div>

          <button
            className="refresh-button"
            onClick={refreshDashboard}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "spin" : ""}
            />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </section>

      {/* Error Message */}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={refreshDashboard}>Retry</button>
        </div>
      )}

      {/* Statistics Cards */}

      <section className="stats-grid">

        <StatCard
          title="Total Transactions"
          value={stats ? stats.totalTransactions.toLocaleString() : "..."}
          icon={Activity}
          color="purple"
        />

        <StatCard
          title="Wallets Analyzed"
          value={stats ? stats.totalWallets.toLocaleString() : "..."}
          icon={Wallet}
          color="blue"
        />

        <StatCard
          title="High Risk Wallets"
          value={stats ? stats.highRiskWallets.toLocaleString() : "..."}
          icon={ShieldAlert}
          color="red"
        />

        <StatCard
          title="Suspicious Activity"
          value={stats ? stats.suspiciousActivity.toLocaleString() : "..."}
          icon={AlertTriangle}
          color="orange"
        />

      </section>

      {/* Charts Section */}

      <section className="charts-grid">

        {/* Transaction Activity */}

        <div className="chart-card">

          <div className="section-heading">
            <div>
              <h3>Transaction Activity</h3>
              <p>
                Transaction count grouped by recent block numbers
              </p>
            </div>
          </div>

          <div className="chart-summary">
            <div>
              <h2>
                {stats
                  ? stats.totalTransactions.toLocaleString()
                  : "..."}
              </h2>
              <span>Total transactions recorded</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient
                  id="activityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#635BDB"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="#635BDB"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E8EAF1"
                vertical={false}
              />

              <XAxis
                dataKey="block"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9299AA", fontSize: 10 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9299AA", fontSize: 11 }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #E8EAF1"
                }}
              />

              <Area
                type="monotone"
                dataKey="transactions"
                stroke="#635BDB"
                strokeWidth={3}
                fill="url(#activityGradient)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>

        </div>

        {/* Risk Distribution */}

        <div className="chart-card">

          <div className="section-heading">
            <div>
              <h3>Risk Distribution</h3>
              <p>Actual wallet security classification</p>
            </div>

            <span className="chart-icon">
              <ShieldAlert size={19} />
            </span>
          </div>

          <div className="risk-chart">

            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                >
                  {riskData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                      stroke="none"
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="risk-center">
              <h2>
                {stats ? stats.totalWallets.toLocaleString() : "..."}
              </h2>
              <span>Wallets</span>
            </div>

          </div>

          <div className="risk-legend">
            {riskData.map((item) => {
              const percentage = stats?.totalWallets
                ? ((item.value / stats.totalWallets) * 100).toFixed(1)
                : 0;

              return (
                <div key={item.name}>
                  <span
                    className="legend-dot"
                    style={{ background: item.color }}
                  />

                  <span>{item.name}</span>
                  <strong>{percentage}%</strong>
                </div>
              );
            })}
          </div>

        </div>

      </section>

      {/* Bottom Section */}

      <section className="bottom-grid">

        <div className="bottom-main">
          <TransactionTable />
        </div>

        {/* Security Activity */}

        <div className="security-card">

          <div className="section-heading">
            <div>
              <h3>Security Activity</h3>
              <p>Highest-risk wallets from ML results</p>
            </div>

            <span className="activity-icon">
              <Zap size={18} />
            </span>
          </div>

          <div className="activity-list">

            {securityActivities.length > 0 ? (
              securityActivities.map((item, index) => (
                <div className="activity-item" key={index}>

                  <div className={`activity-marker ${item.type}`}>
                    {item.type === "danger" ? (
                      <ShieldAlert size={17} />
                    ) : (
                      <AlertTriangle size={17} />
                    )}
                  </div>

                  <div className="activity-details">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <small>{item.time}</small>
                  </div>

                </div>
              ))
            ) : (
              <p>No high-risk wallet records available.</p>
            )}

          </div>

          <button className="activity-footer">
            View all security events
            <ExternalLink size={14} />
          </button>

        </div>

      </section>

      {/* Footer */}

      <footer className="dashboard-footer">

        <span>
          <ShieldCheck size={14} />
          DeFiGuard Security Intelligence
        </span>

        <span>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>

      </footer>

    </div>
  );
}
