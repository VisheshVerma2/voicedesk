const express = require("express");
const router = express.Router();
const {
  getBookings,
  updateBookingStatus,
  createBooking,
} = require("../services/firestore");
const { getAvailableSlots, createCalendarEvent } = require("../services/calendar");
const dayjs = require("dayjs");

// GET /api/bookings — list all bookings (optionally filter by date/status)
router.get("/", async (req, res) => {
  try {
    const { date, status } = req.query;
    const bookings = await getBookings({ date, status });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bookings/availability?date=YYYY-MM-DD
router.get("/availability", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date query param required" });

    const slots = await getAvailableSlots(date);
    res.json({ success: true, date, slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bookings — manually create a booking (from dashboard)
router.post("/", async (req, res) => {
  try {
    const { name, phone, date, time, reason } = req.body;

    if (!name || !date || !time) {
      return res.status(400).json({ error: "name, date, and time are required" });
    }

    const calEvent = await createCalendarEvent({
      name,
      date,
      time,
      reason: reason || "General checkup",
      phone,
    });

    const booking = await createBooking({
      name,
      phone,
      date,
      time,
      reason,
      callId: null,
    });

    res.json({ success: true, booking, calendarEvent: calEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/bookings/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["confirmed", "cancelled", "completed", "no-show"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
    }

    await updateBookingStatus(id, status);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
