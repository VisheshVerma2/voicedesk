require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initFirebase } = require("./config/firebase");

// ── Init ───────────────────────────────────────────────────────────────
initFirebase();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev) ───────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ─────────────────────────────────────────────────────────────
app.use("/api/vapi", require("./routes/vapi"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/calls", require("./routes/calls"));

// ── Seed demo data endpoint ─────────────────────────────────────────────
app.post("/api/seed", async (req, res) => {
  try {
    console.log("🌱 Seed endpoint called");
    const { seedDemoData } = require("./seed-data");
    await seedDemoData();
    console.log("✅ Seed completed successfully");
    res.json({ success: true, message: "Demo data seeded successfully" });
  } catch (error) {
    console.error("❌ Seed error:", error);
    res.status(500).json({ success: false, error: error.message, details: error.toString() });
  }
});

// ── Health check ───────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({
    status: "ok",
    clinic: process.env.CLINIC_NAME || "VoiceDesk Clinic",
    timestamp: new Date().toISOString(),
  })
);

// ── 404 ────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// ── Error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 VoiceDesk backend running on http://localhost:${PORT}`);
  console.log(`🏥 Clinic: ${process.env.CLINIC_NAME || "MediCare Clinic"}`);
  console.log(`📅 Timezone: ${process.env.CLINIC_TIMEZONE || "Asia/Kolkata"}`);
  console.log(`\nWebhook URL: http://localhost:${PORT}/api/vapi/webhook`);
  console.log(`Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
