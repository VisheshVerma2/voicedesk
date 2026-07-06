const { google } = require("googleapis");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = process.env.CLINIC_TIMEZONE || "Asia/Kolkata";
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

/**
 * Check available 30-minute slots on a given date
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {string[]} - array of available times like ["09:00", "09:30", ...]
 */
async function getAvailableSlots(dateStr) {
  const calendar = getCalendarClient();

  const startOfDay = dayjs.tz(`${dateStr} 09:00`, TIMEZONE).toISOString();
  const endOfDay = dayjs.tz(`${dateStr} 18:00`, TIMEZONE).toISOString();

  // Get existing events
  const res = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: startOfDay,
    timeMax: endOfDay,
    singleEvents: true,
    orderBy: "startTime",
  });

  const bookedSlots = (res.data.items || []).map((event) => ({
    start: dayjs(event.start.dateTime).tz(TIMEZONE).format("HH:mm"),
    end: dayjs(event.end.dateTime).tz(TIMEZONE).format("HH:mm"),
  }));

  // Generate all 30-min slots 09:00–18:00
  const allSlots = [];
  let current = dayjs.tz(`${dateStr} 09:00`, TIMEZONE);
  const end = dayjs.tz(`${dateStr} 18:00`, TIMEZONE);

  while (current.isBefore(end)) {
    allSlots.push(current.format("HH:mm"));
    current = current.add(30, "minute");
  }

  // Filter out booked slots
  const available = allSlots.filter((slot) => {
    return !bookedSlots.some((b) => {
      return slot >= b.start && slot < b.end;
    });
  });

  return available;
}

/**
 * Create a calendar event for an appointment
 */
async function createCalendarEvent({ name, date, time, reason, phone }) {
  const calendar = getCalendarClient();

  const startDt = dayjs.tz(`${date} ${time}`, TIMEZONE);
  const endDt = startDt.add(30, "minute");

  const event = {
    summary: `Appointment: ${name}`,
    description: `Patient: ${name}\nPhone: ${phone || "N/A"}\nReason: ${reason || "General checkup"}`,
    start: {
      dateTime: startDt.toISOString(),
      timeZone: TIMEZONE,
    },
    end: {
      dateTime: endDt.toISOString(),
      timeZone: TIMEZONE,
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 30 }],
    },
  };

  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    resource: event,
  });

  return res.data;
}

module.exports = { getAvailableSlots, createCalendarEvent };
