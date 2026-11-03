const { getData } = require("../config/data");

exports.getWallets = async (req, res) => {
  try {
    const { features, anomalies, risks } = await getData();

    const wallets = features.map((wallet) => {
      const anomaly = anomalies.find(
        (item) => item.wallet_address === wallet.wallet_address
      );

      const risk = risks.find(
        (item) => item.wallet_address === wallet.wallet_address
      );

      return {
        ...wallet,
        anomaly_score: Number(anomaly?.anomaly_score || 0),
        anomaly_flag:
            anomaly?.anomaly_flag === true ||
            String(anomaly?.anomaly_flag).toLowerCase() === "true",
        anomaly_category: anomaly?.anomaly_category || "Unknown",
        risk_score: Number(risk?.risk_score || 0),
        risk_category: risk?.risk_category || "Unknown",
        explanation: risk?.explanation || "No explanation available"
      };
    });

    const search = (req.query.search || "").toLowerCase();

    const filtered = search
      ? wallets.filter((wallet) =>
          wallet.wallet_address.toLowerCase().includes(search)
        )
      : wallets;

    res.json({
      success: true,
      total: filtered.length,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWalletByAddress = async (req, res) => {
  try {
    const { features, anomalies, risks } = await getData();
    const address = req.params.address.toLowerCase();

    const feature = features.find(
      (item) => item.wallet_address.toLowerCase() === address
    );

    const anomaly = anomalies.find(
      (item) => item.wallet_address.toLowerCase() === address
    );

    const risk = risks.find(
      (item) => item.wallet_address.toLowerCase() === address
    );

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    res.json({
      success: true,
      data: {
        ...feature,
        ...anomaly,
        ...risk
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};