const express = require("express");
const cors = require("cors");
require("dotenv").config();

const walletRoutes = require("./routes/walletRoutes");
const riskRoutes = require("./routes/riskRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "DeFiGuard API is running successfully"
  });
});

app.use("/api/wallets", walletRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DeFiGuard server running at http://localhost:${PORT}`);
});
