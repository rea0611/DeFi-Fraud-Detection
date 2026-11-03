
import { getData } from "./api.js";

export async function searchWallet(address) {
  const result = await getData(
    `/wallets/${encodeURIComponent(address)}`
  );

  if (!result.success || !result.data) {
    throw new Error(result.message || "Wallet not found");
  }

  const data = result.data;

  return {
    address: data.wallet_address,
    totalTransactions: data.wallet_transaction_count ?? 0,
    totalReceived: Number(data.total_eth_received || 0).toFixed(6),
    totalSent: Number(data.total_eth_sent || 0).toFixed(6),
    riskScore: Number(data.risk_score),
    riskLevel: data.risk_category || "Unknown",
    anomalyScore: data.anomaly_score,
    anomalyFlag:
      data.anomaly_flag === true ||
      String(data.anomaly_flag).toLowerCase() === "true",
    anomalyCategory: data.anomaly_category || "Unknown",
    explanation: data.explanation || "No explanation available",
    features: data
  };
}
