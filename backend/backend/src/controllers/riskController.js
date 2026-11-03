const { getData } = require("../config/data");

exports.getRiskStats = async (req, res) => {
  try {
    const { risks, anomalies } = await getData();

    const count = (category) =>
      risks.filter((item) => item.risk_category === category).length;

    const anomalyCount = anomalies.filter(
      (item) => item.anomaly_flag === "True"
    ).length;

    const averageRisk =
      risks.reduce((sum, item) => sum + Number(item.risk_score || 0), 0) /
      (risks.length || 1);

    res.json({
      success: true,
      totalWallets: risks.length,
      criticalWallets: count("Critical Review"),
      highRiskWallets: count("High Review"),
      moderateRiskWallets: count("Moderate Review"),
      lowRiskWallets: count("Low Review"),
      anomalyWallets: anomalyCount,
      averageRiskScore: Number(averageRisk.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHighRiskWallets = async (req, res) => {
  try {
    const { risks } = await getData();

    const data = risks
      .filter((item) =>
        ["Critical Review", "High Review"].includes(item.risk_category)
      )
      .sort((a, b) => Number(b.risk_score) - Number(a.risk_score));

    res.json({ success: true, total: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};