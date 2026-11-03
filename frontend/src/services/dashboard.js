
import { getData } from "./api.js";

export const getDashboardStats = () => {
  return getData("/dashboard/stats");
};

export const getTransactionSummary = () => {
  return getData("/dashboard/transactions");
};

export const getRiskSummary = () => {
  return getData("/dashboard/risk");
};

export const getRecentTransactions = () => {
  return getData("/transactions?limit=10");
};
