// ── Clinic FAQ Knowledge Base ──────────────────────────────────────────
const FAQ_KB = [
  {
    keywords: ["hours", "timing", "open", "close", "time"],
    answer:
      "Our clinic is open Monday to Saturday, 9 AM to 6 PM. We are closed on Sundays and public holidays.",
  },
  {
    keywords: ["doctor", "doctors", "specialist", "physicians", "staff"],
    answer:
      "We have general physicians, a cardiologist, a dermatologist, and a pediatrician on staff. Specialists are available by appointment only.",
  },
  {
    keywords: ["emergency", "urgent", "immediately", "critical"],
    answer:
      "For medical emergencies, please call 112 or visit the nearest emergency room immediately. Our clinic handles non-emergency consultations only.",
  },
  {
    keywords: ["fee", "fees", "cost", "charge", "price", "consultation"],
    answer:
      "A general consultation fee is ₹500. Specialist consultations range from ₹800 to ₹1500. Lab tests are charged separately.",
  },
  {
    keywords: ["insurance", "cashless", "mediclaim", "health insurance"],
    answer:
      "We accept most major health insurance plans including Star Health, HDFC Ergo, and Bajaj Allianz. Please carry your insurance card when you visit.",
  },
  {
    keywords: ["lab", "test", "blood", "report", "pathology", "sample"],
    answer:
      "Our in-house lab handles blood tests, urine analysis, and basic diagnostics. Reports are typically ready within 4 to 6 hours. For specialized tests, we partner with SRL Diagnostics.",
  },
  {
    keywords: ["parking", "location", "address", "where", "directions"],
    answer:
      "We are located at 12B, Medical Complex, Hazratganj, Lucknow. Free parking is available in the basement. We are 5 minutes from the Hazratganj metro station.",
  },
  {
    keywords: ["cancel", "reschedule", "change appointment"],
    answer:
      "To cancel or reschedule, please call us at least 2 hours before your appointment time. You can also ask me to help reschedule right now.",
  },
  {
    keywords: ["medicine", "pharmacy", "prescription", "drug"],
    answer:
      "We have an in-house pharmacy open during clinic hours. Prescriptions from our doctors are honored immediately.",
  },
  {
    keywords: ["covid", "vaccination", "vaccine"],
    answer:
      "We offer flu and COVID booster vaccinations by appointment. Please book in advance as slots fill up quickly.",
  },
  {
    keywords: ["children", "child", "kids", "pediatric", "baby", "infant"],
    answer:
      "Our pediatrician Dr. Anjali Sharma is available Tuesday and Thursday from 10 AM to 2 PM. She handles newborn to teenage care.",
  },
  {
    keywords: ["wait", "waiting time", "how long", "queue"],
    answer:
      "With an appointment, your typical wait time is 10 to 15 minutes. Walk-in patients may wait 30 to 45 minutes depending on the queue.",
  },
];

/**
 * Match a question to the best FAQ answer
 * Falls back to a handoff message if no match found
 */
function matchFAQ(question) {
  const q = question.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const faq of FAQ_KB) {
    const score = faq.keywords.filter((kw) => q.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore > 0) {
    return { answer: bestMatch.answer, matched: true };
  }

  return {
    answer:
      "I don't have that information right now. Let me have someone from the clinic call you back with details. Can I take your name and phone number?",
    matched: false,
  };
}

module.exports = { matchFAQ, FAQ_KB };
