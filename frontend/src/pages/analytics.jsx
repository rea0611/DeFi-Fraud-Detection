
import { useState, useEffect, useMemo } from "react";

import {
  Activity,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);

  const text = await response.text();

  let result;

  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(`Invalid response from ${endpoint}`);
  }

  if (!response.ok) {
    throw new Error(
      result.message || `Request failed with status ${response.status}`
    );
  }

  if (result.success === false) {
    throw new Error(result.message || "API request failed");
  }

  return result;
}

function Analytics() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [statsLoading, setStatsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const [statsError, setStatsError] = useState("");
  const [transactionError, setTransactionError] = useState("");

  const loading = statsLoading || transactionsLoading;

  const fetchAnalytics = async () => {
    setStatsLoading(true);
    setTransactionsLoading(true);

    setStatsError("");
    setTransactionError("");

    // Load risk statistics independently
    const statsPromise = fetchAPI("/risk/stats")
      .then((result) => {
        const data =
          result.data && typeof result.data === "object"
            ? result.data
            : result;

        if (
          !data ||
          data.totalWallets === undefined ||
          data.averageRiskScore === undefined
        ) {
          throw new Error("Risk statistics are missing required fields.");
        }

        setStats(data);
      })
      .catch((error) => {
        setStatsError(error.message);
      })
      .finally(() => {
        setStatsLoading(false);
      });

    // Load transactions independently
    const transactionsPromise = fetchAPI("/transactions?limit=500")
      .then((result) => {
        const rows = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.transactions)
          ? result.transactions
          : [];

        setTransactions(rows);

        setTotalTransactions(
          Number(result.total ?? rows.length)
        );
      })
      .catch((error) => {
        setTransactionError(error.message);
        setTransactions([]);
        setTotalTransactions(0);
      })
      .finally(() => {
        setTransactionsLoading(false);
      });

    await Promise.all([statsPromise, transactionsPromise]);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Risk category distribution
  const riskData = useMemo(() => {
    if (!stats) return [];

    return [
      {
        type: "Low Risk",
        cases: Number(stats.lowRiskWallets || 0)
      },
      {
        type: "Moderate Risk",
        cases: Number(stats.moderateRiskWallets || 0)
      },
      {
        type: "High Risk",
        cases: Number(stats.highRiskWallets || 0)
      },
      {
        type: "Critical Risk",
        cases: Number(stats.criticalWallets || 0)
      }
    ];
  }, [stats]);

  // Group transactions by blockchain block range
  const transactionTrend = useMemo(() => {
    const validTransactions = transactions
      .map((tx) => ({
        block: Number(tx.block)
      }))
      .filter((tx) => Number.isFinite(tx.block))
      .sort((a, b) => a.block - b.block);

    if (validTransactions.length === 0) return [];

    const groupSize = Math.ceil(validTransactions.length / 10);
    const groups = [];

    for (let i = 0; i < validTransactions.length; i += groupSize) {
      const group = validTransactions.slice(i, i + groupSize);

      groups.push({
        blockRange:
          `${group[0].block} - ${group[group.length - 1].block}`,
        transactions: group.length
      });
    }

    return groups;
  }, [transactions]);

  const highRiskWallets = stats
    ? Number(stats.highRiskWallets || 0) +
      Number(stats.criticalWallets || 0)
    : 0;

  const averageRisk = Number(stats?.averageRiskScore || 0);

  return (
    <div className="analytics-page">

      {/* HEADER */}
      <div className="page-heading">
        <div>
          <h1>Analytics</h1>
          <p>
            Understand DeFi transaction patterns and wallet risk.
          </p>
        </div>

        <span className="demo-tag">
          {loading ? "LOADING..." : stats ? "REAL DATA" : "API ERROR"}
        </span>
      </div>

      {/* RETRY BUTTON */}
      {(statsError || transactionError) && (
        <div className="analytics-panel">
          <div className="insight-item">
            <AlertTriangle color="#ef6464" />

            <div>
              <strong>Data loading information</strong>

              {statsError && (
                <p>Risk statistics: {statsError}</p>
              )}

              {transactionError && (
                <p>Transactions: {transactionError}</p>
              )}
            </div>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw size={15} /> Retry loading data
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      {stats && (
        <div className="analytics-cards">

          <div className="analytics-card">
            <div className="analytics-icon purple">
              <Activity />
            </div>

            <p>Total Transactions</p>
            <h2>
              {transactionsLoading
                ? "..."
                : totalTransactions.toLocaleString()}
            </h2>

            <span>Blockchain transaction records</span>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon red">
              <ShieldAlert />
            </div>

            <p>Anomalous Wallets</p>
            <h2>
              {Number(stats.anomalyWallets || 0).toLocaleString()}
            </h2>

            <span>Flagged by anomaly detection</span>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon green">
              <TrendingUp />
            </div>

            <p>High Risk Wallets</p>
            <h2>{highRiskWallets.toLocaleString()}</h2>

            <span>High and critical categories</span>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon orange">
              <ShieldCheck />
            </div>

            <p>Average Risk Score</p>
            <h2>{averageRisk.toFixed(2)}</h2>

            <span>Out of 100</span>
          </div>

        </div>
      )}

      {/* STATISTICS LOADING */}
      {statsLoading && (
        <div className="analytics-panel">
          <p>Loading wallet analytics...</p>
        </div>
      )}

      {/* TRANSACTION CHART */}
      {!transactionsLoading && transactionTrend.length > 0 && (
        <div className="analytics-panel">
          <h3>Transaction Activity by Block Range</h3>

          <p className="panel-subtitle">
            Transaction distribution across blockchain blocks
          </p>

          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transactionTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="blockRange"
                  tick={{ fontSize: 11 }}
                />

                <YAxis />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stroke="#8054dc"
                  fill="#8054dc"
                  fillOpacity={0.12}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!transactionsLoading &&
        !transactionError &&
        transactionTrend.length === 0 && (
          <div className="analytics-panel">
            <h3>Transaction Activity</h3>
            <p>No valid block-number data available for the chart.</p>
          </div>
        )}

      {/* RISK CATEGORY CHART */}
      {stats && (
        <div className="analytics-panel">
          <h3>Wallet Risk Category Analysis</h3>

          <p className="panel-subtitle">
            Actual number of wallets in each ML risk category
          </p>

          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="cases"
                  name="Wallets"
                  fill="#8054dc"
                  radius={[7, 7, 0, 0]}
                  barSize={55}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* KEY INSIGHTS */}
      {stats && (
        <div className="analytics-panel">
          <h3>Key Analytics Insights</h3>

          <div className="analytics-insights">

            <div className="insight-item">
              <span className="insight-dot red-dot" />

              <div>
                <strong>High and critical risk wallets</strong>
                <p>
                  {highRiskWallets.toLocaleString()} wallets require
                  additional attention based on their risk categories.
                </p>
              </div>
            </div>

            <div className="insight-item">
              <span className="insight-dot purple-dot" />

              <div>
                <strong>Anomaly detection results</strong>
                <p>
                  {Number(stats.anomalyWallets || 0).toLocaleString()}
                  {" "}wallets were flagged by the anomaly detection system.
                </p>
              </div>
            </div>

            <div className="insight-item">
              <span className="insight-dot green-dot" />

              <div>
                <strong>Average wallet risk</strong>
                <p>
                  The average risk score across analyzed wallets is
                  {" "}{averageRisk.toFixed(2)} out of 100.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Analytics;
