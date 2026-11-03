const express = require("express");
const router = express.Router();

const riskController = require("../controllers/riskController");

router.get("/stats", riskController.getRiskStats);
router.get("/high-risk", riskController.getHighRiskWallets);

module.exports = router;