
const { getTransactions } = require("../config/data");

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await getTransactions();

    const limit = Math.min(Number(req.query.limit) || 50, 500);

    const data = transactions
      .slice()
      .reverse()
      .slice(0, limit);

    res.json({
      success: true,
      total: transactions.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
