require("dotenv").config();
const { initFirebase, getDb } = require("./config/firebase");
const dayjs = require("dayjs");

// Initialize Firebase
initFirebase();
const db = getDb();

// Demo data for bookings
const demoBookings = [
  {
    name: "Rahul Sharma",
    phone: "+91-9876543210",
    date: dayjs().format("YYYY-MM-DD"),
    time: "09:30",
    reason: "Fever and cold",
    callId: "call_abc123",
    status: "confirmed",
    createdAt: dayjs().subtract(2, "hour").toISOString(),
  },
  {
    name: "Priya Singh",
    phone: "+91-9876543211",
    date: dayjs().format("YYYY-MM-DD"),
    time: "10:15",
    reason: "Annual checkup",
    callId: "call_def456",
    status: "confirmed",
    createdAt: dayjs().subtract(5, "hour").toISOString(),
  },
  {
    name: "Amit Patel",
    phone: "+91-9876543212",
    date: dayjs().format("YYYY-MM-DD"),
    time: "11:00",
    reason: "Back pain consultation",
    callId: "call_ghi789",
    status: "confirmed",
    createdAt: dayjs().subtract(1, "day").toISOString(),
  },
  {
    name: "Sneha Reddy",
    phone: "+91-9876543213",
    date: dayjs().format("YYYY-MM-DD"),
    time: "14:30",
    reason: "Diabetes follow-up",
    callId: "call_jkl012",
    status: "confirmed",
    createdAt: dayjs().subtract(3, "hour").toISOString(),
  },
  {
    name: "Vikram Mehta",
    phone: "+91-9876543214",
    date: dayjs().format("YYYY-MM-DD"),
    time: "15:45",
    reason: "Skin rash",
    callId: "call_mno345",
    status: "confirmed",
    createdAt: dayjs().subtract(6, "hour").toISOString(),
  },
  {
    name: "Anjali Gupta",
    phone: "+91-9876543215",
    date: dayjs().add(1, "day").format("YYYY-MM-DD"),
    time: "09:00",
    reason: "Migraine consultation",
    callId: "call_pqr678",
    status: "confirmed",
    createdAt: dayjs().subtract(1, "day").toISOString(),
  },
  {
    name: "Rajesh Kumar",
    phone: "+91-9876543216",
    date: dayjs().add(1, "day").format("YYYY-MM-DD"),
    time: "10:30",
    reason: "Blood pressure check",
    callId: "call_stu901",
    status: "confirmed",
    createdAt: dayjs().subtract(2, "day").toISOString(),
  },
  {
    name: "Kavita Nair",
    phone: "+91-9876543217",
    date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    time: "11:15",
    reason: "Throat infection",
    callId: "call_vwx234",
    status: "completed",
    createdAt: dayjs().subtract(2, "day").toISOString(),
  },
  {
    name: "Deepak Joshi",
    phone: "+91-9876543218",
    date: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
    time: "09:45",
    reason: "Stomach pain",
    callId: "call_yza567",
    status: "completed",
    createdAt: dayjs().subtract(3, "day").toISOString(),
  },
  {
    name: "Meera Iyer",
    phone: "+91-9876543219",
    date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    time: "14:00",
    reason: "Eye examination",
    callId: "call_bcd890",
    status: "cancelled",
    createdAt: dayjs().subtract(2, "day").toISOString(),
  },
];

// Demo data for call logs
const demoCallLogs = [
  {
    callId: "call_abc123",
    phoneNumber: "+91-9876543210",
    intent: "booking",
    transcript: [
      { role: "assistant", content: "Hello! Thank you for calling MediCare Clinic. How can I help you today?" },
      { role: "user", content: "Hi, I'd like to book an appointment for today." },
      { role: "assistant", content: "Of course! May I have your name?" },
      { role: "user", content: "My name is Rahul Sharma." },
      { role: "assistant", content: "Thank you, Rahul. What's the reason for your visit?" },
      { role: "user", content: "I have fever and cold since yesterday." },
      { role: "assistant", content: "I hope you feel better soon. Let me check available slots for today. We have 9:30 AM available. Would that work?" },
      { role: "user", content: "Yes, 9:30 AM works for me." },
      { role: "assistant", content: "Perfect! I've booked your appointment for today at 9:30 AM. Please bring your ID when you visit. Is there anything else?" },
      { role: "user", content: "No, that's all. Thank you." },
      { role: "assistant", content: "You're welcome, Rahul. Take care!" },
    ],
    summary: "Patient Rahul Sharma booked appointment for fever and cold at 9:30 AM today.",
    duration: 145,
    status: "completed",
    bookingId: "booking_001",
    createdAt: dayjs().subtract(2, "hour").toISOString(),
  },
  {
    callId: "call_def456",
    phoneNumber: "+91-9876543211",
    intent: "booking",
    transcript: [
      { role: "assistant", content: "Hello! Thank you for calling MediCare Clinic. How can I assist you?" },
      { role: "user", content: "I want to schedule my annual checkup." },
      { role: "assistant", content: "Great! May I know your name?" },
      { role: "user", content: "Priya Singh." },
      { role: "assistant", content: "Thank you, Priya. For annual checkup, we have 10:15 AM available today. Would you like that slot?" },
      { role: "user", content: "Yes, that works." },
      { role: "assistant", content: "Excellent! Your annual checkup is scheduled for today at 10:15 AM. Please fast for 12 hours before the appointment. Anything else?" },
      { role: "user", content: "No, thank you." },
    ],
    summary: "Patient Priya Singh scheduled annual checkup for today at 10:15 AM.",
    duration: 98,
    status: "completed",
    bookingId: "booking_002",
    createdAt: dayjs().subtract(5, "hour").toISOString(),
  },
  {
    callId: "call_faq123",
    phoneNumber: "+91-9876543220",
    intent: "faq",
    transcript: [
      { role: "assistant", content: "Hello! Thank you for calling MediCare Clinic. How can I help you?" },
      { role: "user", content: "What are your clinic hours?" },
      { role: "assistant", content: "We're open Monday through Saturday from 9 AM to 6 PM. We're closed on Sundays." },
      { role: "user", content: "Do you accept insurance?" },
      { role: "assistant", content: "Yes, we accept most major insurance providers including HDFC Ergo, ICICI Lombard, and Star Health. Please bring your insurance card during your visit." },
      { role: "user", content: "Where is the clinic located?" },
      { role: "assistant", content: "We're located at 123 Health Street, Near City Hospital, Mumbai - 400001. Parking is available on the premises." },
      { role: "user", content: "Thank you for the information." },
      { role: "assistant", content: "You're welcome! Is there anything else I can help with?" },
      { role: "user", content: "No, that's all." },
    ],
    summary: "Patient asked about clinic hours, insurance acceptance, and location.",
    duration: 187,
    status: "completed",
    createdAt: dayjs().subtract(3, "hour").toISOString(),
  },
  {
    callId: "call_ghi789",
    phoneNumber: "+91-9876543212",
    intent: "booking",
    transcript: [
      { role: "assistant", content: "Hello! Thank you for calling MediCare Clinic. How can I help you today?" },
      { role: "user", content: "I need to see a doctor for back pain." },
      { role: "assistant", content: "I'm sorry to hear that. May I have your name?" },
      { role: "user", content: "Amit Patel." },
      { role: "assistant", content: "Thank you, Amit. Let me check availability. We have 11:00 AM available today for back pain consultation." },
      { role: "user", content: "11:00 AM is perfect." },
      { role: "assistant", content: "Great! I've booked your appointment for today at 11:00 AM. Please arrive 10 minutes early for registration." },
    ],
    summary: "Patient Amit Patel booked appointment for back pain consultation at 11:00 AM today.",
    duration: 112,
    status: "completed",
    bookingId: "booking_003",
    createdAt: dayjs().subtract(1, "day").toISOString(),
  },
];

// Demo data for handoffs
const demoHandoffs = [
  {
    callId: "call_handoff1",
    phoneNumber: "+91-9876543230",
    name: "Suresh Verma",
    question: "Asking about MRI results from last week's scan",
    status: "pending",
    createdAt: dayjs().subtract(4, "hour").toISOString(),
  },
  {
    callId: "call_handoff2",
    phoneNumber: "+91-9876543231",
    name: "Lakshmi Prasad",
    question: "Questions about prescription dosage and side effects",
    status: "pending",
    createdAt: dayjs().subtract(8, "hour").toISOString(),
  },
  {
    callId: "call_handoff3",
    phoneNumber: "+91-9876543232",
    name: "Mohammed Khan",
    question: "Insurance claim reimbursement for previous surgery",
    status: "pending",
    createdAt: dayjs().subtract(1, "day").toISOString(),
  },
  {
    callId: "call_handoff4",
    phoneNumber: "+91-9876543233",
    name: "Divya Sharma",
    question: "Requesting medical records for insurance purposes",
    status: "pending",
    createdAt: dayjs().subtract(2, "day").toISOString(),
  },
];

// Seed function
async function seedDatabase() {
  console.log("🌱 Starting to seed demo data...\n");

  try {
    // Seed bookings
    console.log("📅 Seeding bookings...");
    const bookingsRef = db.collection("bookings");
    for (const booking of demoBookings) {
      await bookingsRef.add(booking);
      console.log(`  ✓ Added booking for ${booking.name}`);
    }
    console.log(`  ✅ ${demoBookings.length} bookings added\n`);

    // Seed call logs
    console.log("📞 Seeding call logs...");
    const callsRef = db.collection("callLogs");
    for (const call of demoCallLogs) {
      await callsRef.add(call);
      console.log(`  ✓ Added call from ${call.phoneNumber}`);
    }
    console.log(`  ✅ ${demoCallLogs.length} call logs added\n`);

    // Seed handoffs
    console.log("🔄 Seeding handoffs...");
    const handoffsRef = db.collection("handoffs");
    for (const handoff of demoHandoffs) {
      await handoffsRef.add(handoff);
      console.log(`  ✓ Added handoff for ${handoff.name}`);
    }
    console.log(`  ✅ ${demoHandoffs.length} handoffs added\n`);

    console.log("🎉 Demo data seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - Bookings: ${demoBookings.length}`);
    console.log(`  - Call Logs: ${demoCallLogs.length}`);
    console.log(`  - Handoffs: ${demoHandoffs.length}`);
    console.log("\n💡 Refresh your dashboard to see the demo data.");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Export seed function for use in server
async function seedDemoData() {
  await seedDatabase();
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log("\n✨ Seeding complete!");
    process.exit(0);
  });
}

module.exports = { seedDemoData };
