const express = require("express");
const router = express.Router();
const { getCallLogs, getHandoffs } = require("../services/firestore");

// GET /api/calls — get all call logs
router.get("/", async (req, res) => {
  try {
    const logs = await getCallLogs();
    res.json({ success: true, calls: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/calls/handoffs — get all unresolved handoffs
router.get("/handoffs", async (req, res) => {
  try {
    const handoffs = await getHandoffs();
    res.json({ success: true, handoffs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
