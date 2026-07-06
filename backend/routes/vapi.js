const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const { getAvailableSlots, createCalendarEvent } = require("../services/calendar");
const { matchFAQ } = require("../services/faq");
const {
  createBooking,
  saveCallLog,
  updateCallLog,
  createHandoff,
} = require("../services/firestore");

// ── Vapi sends POST to /api/vapi/webhook for all call events ──────────
router.post("/webhook", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.json({ result: "ok" });

    const { type } = message;

    // ── Function call from the voice agent ────────────────────────────
    if (type === "function-call") {
      const { functionCall, call } = message;
      const { name: fnName, parameters } = functionCall;
      const callId = call?.id;

      console.log(`📞 Function call: ${fnName}`, parameters);

      // ── check_availability ─────────────────────────────────────────
      if (fnName === "check_availability") {
        const { date } = parameters;

        // Validate date
        if (!date || !dayjs(date).isValid()) {
          return res.json({
            result: "I couldn't understand that date. Could you say it again, like September 15th?",
          });
        }

        const dateStr = dayjs(date).format("YYYY-MM-DD");
        const today = dayjs().format("YYYY-MM-DD");

        if (dateStr < today) {
          return res.json({ result: "That date has already passed. Please choose a future date." });
        }

        try {
          const slots = await getAvailableSlots(dateStr);

          if (slots.length === 0) {
            return res.json({
              result: `I'm sorry, there are no available slots on ${dayjs(date).format("MMMM D")}. Would you like to try another date?`,
            });
          }

          // Give 3-4 options conversationally
          const options = slots.slice(0, 4).join(", ");
          return res.json({
            result: `Great! On ${dayjs(date).format("MMMM D")}, we have slots available at ${options}. Which time works best for you?`,
          });
        } catch (err) {
          console.error("Calendar error:", err.message);
          return res.json({
            result: "I had trouble checking the calendar. Let me note down your preference and our team will confirm shortly.",
          });
        }
      }

      // ── confirm_booking ────────────────────────────────────────────
      if (fnName === "confirm_booking") {
        const { name, date, time, reason, phone } = parameters;

        if (!name || !date || !time) {
          return res.json({
            result: "I'm missing some details. Could you confirm your name, preferred date, and time?",
          });
        }

        const dateStr = dayjs(date).format("YYYY-MM-DD");
        const formattedDate = dayjs(date).format("MMMM D, YYYY");

        try {
          // Create calendar event
          const calEvent = await createCalendarEvent({
            name,
            date: dateStr,
            time,
            reason: reason || "General checkup",
            phone,
          });

          // Save to Firestore
          const booking = await createBooking({
            name,
            phone,
            date: dateStr,
            time,
            reason: reason || "General checkup",
            callId,
          });

          // Update call log with booking reference
          await updateCallLog(callId, { bookingId: booking.id, intent: "booking" });

          return res.json({
            result: `Perfect! I've confirmed your appointment, ${name}. You're booked for ${formattedDate} at ${time}. Our clinic is at 12B Medical Complex, Hazratganj. Please arrive 10 minutes early. Is there anything else I can help you with?`,
          });
        } catch (err) {
          console.error("Booking error:", err.message);
          return res.json({
            result: `I've noted your request for ${formattedDate} at ${time}, ${name}. Our team will call you back to confirm shortly. Is there anything else?`,
          });
        }
      }

      // ── answer_faq ─────────────────────────────────────────────────
      if (fnName === "answer_faq") {
        const { question } = parameters;
        const { answer, matched } = matchFAQ(question);

        // If not matched, log as handoff
        if (!matched && message?.call?.customer?.number) {
          await createHandoff({
            callId,
            phoneNumber: message.call.customer.number,
            question,
            name: parameters.patient_name || "Unknown",
          }).catch(() => {});
        }

        return res.json({ result: answer });
      }

      // ── log_handoff ────────────────────────────────────────────────
      if (fnName === "log_handoff") {
        const { name, phone, question } = parameters;

        await createHandoff({
          callId,
          phoneNumber: phone || message?.call?.customer?.number || "Unknown",
          name: name || "Unknown",
          question: question || "Unspecified",
        }).catch(() => {});

        return res.json({
          result: `Thank you, ${name || ""}. I've flagged this for our team and someone will call you back at ${phone || "your number"} within 2 hours during clinic hours. Is there anything else I can help with?`,
        });
      }

      return res.json({ result: "I didn't quite get that. Could you repeat?" });
    }

    // ── Call started ───────────────────────────────────────────────────
    if (type === "call-started" || type === "status-update") {
      const callId = message?.call?.id;
      if (callId && message?.call?.status === "in-progress") {
        await saveCallLog({
          callId,
          phoneNumber: message?.call?.customer?.number || "Unknown",
          status: "in-progress",
          intent: "unknown",
          transcript: [],
        }).catch(() => {});
      }
    }

    // ── Call ended — save transcript ───────────────────────────────────
    if (type === "end-of-call-report") {
      const { call, transcript, summary, recordingUrl } = message;

      const parsedTranscript = Array.isArray(transcript)
        ? transcript
        : typeof transcript === "string"
        ? transcript.split("\n").map((line) => {
            const [role, ...rest] = line.split(": ");
            return { role: role?.toLowerCase() || "unknown", content: rest.join(": ") };
          })
        : [];

      await saveCallLog({
        callId: call?.id,
        phoneNumber: call?.customer?.number || "Unknown",
        transcript: parsedTranscript,
        summary: summary || "",
        duration: call?.endedAt
          ? Math.round(
              (new Date(call.endedAt) - new Date(call.startedAt || call.createdAt)) / 1000
            )
          : 0,
        status: "completed",
        recordingUrl: recordingUrl || null,
      }).catch(console.error);
    }

    return res.json({ result: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
