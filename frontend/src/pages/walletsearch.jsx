
import { useState } from "react";

import {
  Search,
  Wallet,
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  LoaderCircle
} from "lucide-react";

import { searchWallet } from "../services/wallet.js";

export default function WalletSearch() {
  const [address, setAddress] = useState("");
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setError("Please enter a valid Ethereum wallet address.");
      setWallet(null);
      return;
    }

    setLoading(true);
    setError("");
    setWallet(null);

    try {
      const result = await searchWallet(address.trim());
      setWallet(result);
    } catch (err) {
      setError(err.message || "Unable to fetch wallet information.");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
    } catch {
      setError("Unable to copy wallet address.");
    }
  };

  const score = Number(wallet?.riskScore);
  const validScore =
    Number.isFinite(score) && score >= 0 && score <= 100;

  return (
    <div className="wallet-page">

      <div className="page-heading">
        <div>
          <span className="eyebrow">BLOCKCHAIN INTELLIGENCE</span>
          <h1>Wallet Explorer</h1>
          <p>Search and analyze Ethereum wallet addresses.</p>
        </div>

        <div className="explorer-badge">
          <Activity size={16} />
          Wallet Analysis
        </div>
      </div>

      <div className="wallet-search-card">

        <div className="search-heading">
          <div className="search-icon">
            <Wallet size={25} />
          </div>

          <div>
            <h3>Search Wallet Address</h3>
            <p>Enter an Ethereum wallet address to investigate.</p>
          </div>
        </div>

        <form onSubmit={handleSearch}>
          <div className="wallet-input">
            <Wallet size={19} />

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x... Enter wallet address"
            />

            <button type="submit" disabled={loading}>
              {loading ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <Search size={18} />
              )}

              {loading ? "Searching..." : "Analyze Wallet"}
            </button>
          </div>
        </form>

        <p className="input-hint">
          <ShieldCheck size={14} />
          Wallet addresses are checked for valid Ethereum format.
        </p>

        {error && (
          <div className="wallet-error">
            <AlertTriangle size={17} />
            {error}
          </div>
        )}

      </div>

      {wallet && (
        <div className="wallet-results">

          <div className="wallet-profile-card">

            <div className="wallet-profile-icon">
              <Wallet size={28} />
            </div>

            <div className="wallet-profile-info">
              <span>WALLET ADDRESS</span>

              <h3>{wallet.address || address}</h3>

              <button onClick={copyAddress}>
                <Copy size={13} />
                Copy address
              </button>
            </div>

            <div className="wallet-verified">
              <ShieldCheck size={16} />
              Analyzed
            </div>

          </div>

          {/* Wallet Statistics */}

          <div className="wallet-stats">

            <div className="wallet-stat-card">
              <Activity color="#635BDB" />
              <p>Total Transactions</p>
              <h2>{wallet.totalTransactions ?? "N/A"}</h2>
            </div>

            <div className="wallet-stat-card">
              <ArrowDownLeft color="#16A36A" />
              <p>Total Received</p>
              <h2>{wallet.totalReceived ?? "N/A"} ETH</h2>
            </div>

            <div className="wallet-stat-card">
              <ArrowUpRight color="#3986E8" />
              <p>Total Sent</p>
              <h2>{wallet.totalSent ?? "N/A"} ETH</h2>
            </div>

          </div>

          {/* Risk Analysis */}

          <div className="wallet-risk-card">

            <div>
              <span className="eyebrow">SECURITY ASSESSMENT</span>
              <h3>Wallet Risk Analysis</h3>
              <p>Risk assessment returned by the backend.</p>
            </div>

            {validScore ? (
              <div className="wallet-score">
                <h1>{score.toFixed(2)}/100</h1>
                <span>{wallet.riskLevel || "Score available"}</span>
              </div>
            ) : (
              <div className="wallet-score">
                <h2>Unavailable</h2>
                <span>No valid risk score returned</span>
              </div>
            )}

          </div>

          {/* Anomaly Detection */}

          <div className="wallet-risk-card">

            <div>
              <span className="eyebrow">MACHINE LEARNING RESULTS</span>
              <h3>Anomaly Detection</h3>
              <p>Suspicious wallet behaviour identified by the ML model.</p>
            </div>

            <div className="wallet-score">
              <h2>
                {wallet.anomalyFlag
                  ? "Anomaly Detected"
                  : "No Anomaly"}
              </h2>

              <span>{wallet.anomalyCategory || "Unknown"}</span>

              {wallet.anomalyScore !== undefined && (
                <p>Anomaly Score: {wallet.anomalyScore}</p>
              )}
            </div>

          </div>

          {/* Risk Explanation */}

          <div className="wallet-risk-card">

            <div>
              <span className="eyebrow">RISK INTELLIGENCE</span>
              <h3>Risk Explanation</h3>

              <p>
                {wallet.explanation ||
                  "No risk explanation available for this wallet."}
              </p>
            </div>

          </div>

        </div>
      )}

      {!wallet && !loading && (
        <div className="wallet-empty">

          <div className="empty-icon">
            <Search size={35} />
          </div>

          <h3>Ready to Explore?</h3>

          <p>
            Enter an Ethereum wallet address above to view
            its transaction and risk information.
          </p>

        </div>
      )}

    </div>
  );
}

