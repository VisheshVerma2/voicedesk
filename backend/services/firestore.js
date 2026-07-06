const { getDb } = require("../config/firebase");
const dayjs = require("dayjs");

// ── Bookings ───────────────────────────────────────────────────────────

async function createBooking({ name, phone, date, time, reason, callId }) {
  const db = getDb();
  const ref = db.collection("bookings").doc();

  const booking = {
    id: ref.id,
    name,
    phone: phone || null,
    date,
    time,
    reason: reason || "General checkup",
    callId: callId || null,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  await ref.set(booking);
  return booking;
}

async function getBookings({ date, status } = {}) {
  const db = getDb();
  let query = db.collection("bookings").orderBy("createdAt", "desc");

  if (date) query = query.where("date", "==", date);
  if (status) query = query.where("status", "==", status);

  const snap = await query.limit(100).get();
  return snap.docs.map((d) => d.data());
}

async function updateBookingStatus(bookingId, status) {
  const db = getDb();
  await db.collection("bookings").doc(bookingId).update({ status });
}

// ── Call Logs ──────────────────────────────────────────────────────────

async function saveCallLog({
  callId,
  phoneNumber,
  intent,
  transcript,
  summary,
  duration,
  status,
  bookingId,
}) {
  const db = getDb();
  const ref = db.collection("callLogs").doc(callId || db.collection("callLogs").doc().id);

  const log = {
    id: ref.id,
    callId: callId || ref.id,
    phoneNumber: phoneNumber || "Unknown",
    intent: intent || "unknown",
    transcript: transcript || [],
    summary: summary || "",
    duration: duration || 0,
    status: status || "completed",
    bookingId: bookingId || null,
    createdAt: new Date().toISOString(),
  };

  await ref.set(log, { merge: true });
  return log;
}

async function updateCallLog(callId, updates) {
  const db = getDb();
  const snap = await db.collection("callLogs").where("callId", "==", callId).get();
  if (!snap.empty) {
    await snap.docs[0].ref.update({ ...updates, updatedAt: new Date().toISOString() });
  }
}

async function getCallLogs() {
  const db = getDb();
  const snap = await db
    .collection("callLogs")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return snap.docs.map((d) => d.data());
}

// ── Unresolved Handoffs ────────────────────────────────────────────────

async function createHandoff({ callId, phoneNumber, question, name }) {
  const db = getDb();
  const ref = db.collection("handoffs").doc();

  const handoff = {
    id: ref.id,
    callId,
    phoneNumber: phoneNumber || "Unknown",
    name: name || "Unknown",
    question,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await ref.set(handoff);
  return handoff;
}

async function getHandoffs() {
  const db = getDb();
  const snap = await db
    .collection("handoffs")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return snap.docs.map((d) => d.data());
}

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
  saveCallLog,
  updateCallLog,
  getCallLogs,
  createHandoff,
  getHandoffs,
};
