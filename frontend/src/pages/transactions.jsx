

import { useState, useMemo, useEffect } from "react";

import {
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Copy,
  X
} from "lucide-react";

import { getData } from "../services/api.js";

function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  let date;

  if (!isNaN(Number(timestamp))) {
    let value = Number(timestamp);

    // Convert Unix seconds to milliseconds when necessary
    if (value < 100000000000) {
      value *= 1000;
    }

    date = new Date(value);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return String(timestamp);

  return date.toLocaleString();
}

function shortAddress(address) {
  if (!address) return "N/A";
  return `${address.slice(0, 12)}...`;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 10;

  // Fetch real transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getData("/transactions?limit=500");

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || "Invalid transaction data");
        }

        setTransactions(
          result.data.map((tx, index) => ({
            id: tx.hash || index,
            hash: tx.hash || "",
            from: tx.from || "",
            to: tx.to || "",
            amount: Number(tx.value_eth || 0),
            gas: tx.gas || "N/A",
            block: tx.block || "N/A",
            date: formatDate(tx.timestamp),
            status: "Recorded",
            risk: "Not assessed"
          }))
        );
      } catch (err) {
        setError(err.message || "Unable to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Search and filter
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const query = search.toLowerCase();

      const matchesSearch =
        tx.hash.toLowerCase().includes(query) ||
        tx.from.toLowerCase().includes(query) ||
        tx.to.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || tx.status === statusFilter;

      const matchesRisk =
        riskFilter === "All" || tx.risk === riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [transactions, search, statusFilter, riskFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalEth = transactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setRiskFilter("All");
    setPage(1);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied successfully!");
    } catch {
      alert("Unable to copy. Please select the text manually.");
    }
  };

  return (
    <div className="transactions-page">

      {/* Header */}
      <div className="transaction-header">
        <div>
          <span className="eyebrow">BLOCKCHAIN EXPLORER</span>
          <h1>Transactions</h1>
          <p>Monitor, search and investigate blockchain transactions.</p>
        </div>

        <div className="transaction-live">
          <span className="status-dot"></span>
          Live API Data
        </div>
      </div>

      {/* Summary Cards */}
      <div className="transaction-summary">

        <div className="transaction-summary-card">
          <div className="summary-icon purple">
            <ArrowLeftRight />
          </div>
          <p>Total Records</p>
          <h2>{loading ? "..." : transactions.length}</h2>
          <small>Transactions loaded from CSV</small>
        </div>

        <div className="transaction-summary-card">
          <div className="summary-icon green">
            <ShieldCheck />
          </div>
          <p>Total ETH Transferred</p>
          <h2>{loading ? "..." : totalEth.toFixed(4)}</h2>
          <small>Sum of recorded transaction values</small>
        </div>

        <div className="transaction-summary-card">
          <div className="summary-icon red">
            <AlertTriangle />
          </div>
          <p>Risk Assessed</p>
          <h2>0</h2>
          <small>Transaction-level risk not available</small>
        </div>

        <div className="transaction-summary-card">
          <div className="summary-icon orange">
            <Filter />
          </div>
          <p>Displayed Records</p>
          <h2>{loading ? "..." : filteredTransactions.length}</h2>
          <small>After search and filters</small>
        </div>

      </div>

      {/* Transaction Table */}
      <div className="transaction-table-card">

        <div className="transaction-table-heading">
          <div>
            <h3>All Transactions</h3>
            <p>Review actual blockchain transaction activity.</p>
          </div>

          <span className="record-count">
            {filteredTransactions.length} records
          </span>
        </div>

        {/* Search and Filters */}
        <div className="transaction-toolbar">

          <div className="transaction-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search hash or wallet address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Status</option>
            <option value="Recorded">Recorded</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Risk Levels</option>
            <option value="Not assessed">Not assessed</option>
          </select>

          <button className="reset-filter" onClick={resetFilters}>
            Reset
          </button>

        </div>

        {/* Loading and Error States */}
        {loading && (
          <p className="no-transactions">Loading transactions...</p>
        )}

        {!loading && error && (
          <div className="no-transactions">
            <AlertTriangle size={25} />
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="transaction-table-wrapper">

            <table className="transaction-table">

              <thead>
                <tr>
                  <th>TRANSACTION HASH</th>
                  <th>FROM WALLET</th>
                  <th>AMOUNT</th>
                  <th>DATE & TIME</th>
                  <th>STATUS</th>
                  <th>RISK LEVEL</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {currentTransactions.map((tx) => (

                  <tr key={tx.id}>

                    <td>
                      <span className="transaction-hash">
                        {shortAddress(tx.hash)}
                      </span>
                    </td>

                    <td>{shortAddress(tx.from)}</td>

                    <td>
                      <strong>{tx.amount.toFixed(6)} ETH</strong>
                    </td>

                    <td>{tx.date}</td>

                    <td>
                      <span className="transaction-status completed">
                        {tx.status}
                      </span>
                    </td>

                    <td>
                      <span className="transaction-risk">
                        {tx.risk}
                      </span>
                    </td>

                    <td>
                      <button
                        className="detail-button"
                        onClick={() => setSelected(tx)}
                        title="View transaction details"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </td>

                  </tr>

                ))}

                {currentTransactions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="no-transactions">
                      <Search size={25} />
                      <p>No transactions found.</p>
                      <button onClick={resetFilters}>
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <div className="transaction-pagination">

            <span>
              Showing{" "}
              {filteredTransactions.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              {" - "}
              {Math.min(
                currentPage * pageSize,
                filteredTransactions.length
              )}
              {" of "}
              {filteredTransactions.length}
            </span>

            <div className="pagination-controls">

              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={17} />
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={17} />
              </button>

            </div>

          </div>
        )}

      </div>

      {/* Transaction Details Modal */}
      {selected && (

        <div
          className="transaction-modal-overlay"
          onClick={() => setSelected(null)}
        >

          <div
            className="transaction-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-heading">
              <div>
                <span className="eyebrow">TRANSACTION DETAILS</span>
                <h2>Transaction Information</h2>
              </div>

              <button onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-risk-banner">
              <AlertTriangle size={19} />
              Transaction risk assessment unavailable
              <strong>Not assessed</strong>
            </div>

            <div className="modal-detail-list">

              <div>
                <span>Transaction Hash</span>
                <strong>{selected.hash}</strong>
                <button onClick={() => copyText(selected.hash)}>
                  <Copy size={14} /> Copy
                </button>
              </div>

              <div>
                <span>From Address</span>
                <strong>{selected.from}</strong>
                <button onClick={() => copyText(selected.from)}>
                  <Copy size={14} /> Copy
                </button>
              </div>

              <div>
                <span>To Address</span>
                <strong>{selected.to || "N/A"}</strong>
                <button onClick={() => copyText(selected.to)}>
                  <Copy size={14} /> Copy
                </button>
              </div>

              <div>
                <span>Transaction Amount</span>
                <strong>{selected.amount.toFixed(6)} ETH</strong>
              </div>

              <div>
                <span>Block Number</span>
                <strong>{selected.block}</strong>
              </div>

              <div>
                <span>Gas</span>
                <strong>{selected.gas}</strong>
              </div>

              <div>
                <span>Date & Time</span>
                <strong>{selected.date}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>Recorded</strong>
              </div>

            </div>

            <button
              className="modal-close-button"
              onClick={() => setSelected(null)}
            >
              Close Details
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

