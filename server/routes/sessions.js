const express = require("express");
const Session = require("../models/Session");
const router = express.Router();

// Get all sessions for a tutor
router.get("/:tutorId", async (req, res) => {
  try {
    const sessions = await Session.find({ tutorId: req.params.tutorId });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Accept/Decline session request
router.put("/:sessionId", async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.sessionId, { status: req.body.status }, { new: true });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Mark session as completed
router.put("/:sessionId/complete", async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.sessionId, { status: "Completed", paymentStatus: "Completed" }, { new: true });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get earnings summary
router.get("/:tutorId/earnings", async (req, res) => {
  try {
    const sessions = await Session.find({ tutorId: req.params.tutorId, status: "Completed" });

    const totalEarnings = sessions.reduce((sum, session) => sum + session.price, 0);
    const weeklyEarnings = totalEarnings / 4; // Simplified example
    const monthlyEarnings = totalEarnings;

    res.json({ totalEarnings, weeklyEarnings, monthlyEarnings });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
