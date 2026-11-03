const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const DATA_DIR = path.resolve(
  __dirname,
  "../../../../DeFi-Fraud-Detection/data/processed"
);

const RAW_DIR = path.resolve(
  __dirname,
  "../../../../DeFi-Fraud-Detection/data/raw"
);

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    if (!fs.existsSync(filePath)) {
      return reject(new Error(`CSV file not found: ${filePath}`));
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

async function getData() {
  const [features, anomalies, risks] = await Promise.all([
    readCSV(path.join(DATA_DIR, "wallet_features.csv")),
    readCSV(path.join(DATA_DIR, "wallet_anomaly_predictions.csv")),
    readCSV(path.join(DATA_DIR, "wallet_risk_scores.csv"))
  ]);

  return { features, anomalies, risks };
}

async function getTransactions() {
  return readCSV(path.join(RAW_DIR, "raw_transactions.csv"));
}

module.exports = { getData, getTransactions };