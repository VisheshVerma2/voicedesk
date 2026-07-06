# 🏥 VoiceDesk — AI Voice Agent for MediCare Clinic

An AI voice agent (powered by Vapi.ai + GPT-4) that handles inbound calls:
- Books appointments with real Google Calendar integration
- Answers clinic FAQs
- Logs call transcripts + callback queue
- React dashboard to manage everything

---

## 📁 Project Structure

```
voicedesk/
├── backend/                  # Node.js + Express API
│   ├── config/firebase.js    # Firestore init
│   ├── routes/
│   │   ├── vapi.js           # Vapi webhook handler (core logic)
│   │   ├── bookings.js       # Booking CRUD API
│   │   └── calls.js          # Call logs API
│   ├── services/
│   │   ├── calendar.js       # Google Calendar integration
│   │   ├── faq.js            # FAQ knowledge base + matcher
│   │   └── firestore.js      # Firestore read/write helpers
│   ├── server.js             # Express entry point
│   ├── package.json
│   └── .env.example          # Copy to .env and fill in
│
├── frontend/                 # React dashboard
│   ├── src/
│   │   ├── App.js            # Full dashboard (overview/bookings/calls/handoffs)
│   │   ├── App.css           # Dark medical theme
│   │   └── index.js
│   └── public/index.html
│
└── vapi-config/
    └── assistant-config.json # Paste this in Vapi dashboard
```

## How to Run

### Prerequisites
- Node.js v18+
- Firebase project + Firestore enabled
- Vapi.ai account
- Google Calendar API enabled
- ngrok account

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your keys in .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### ngrok (for Vapi webhook)

```bash
npx ngrok http 3001
# Copy the URL and paste in Vapi assistant → Advanced → Server URL
```

---

## Environment Variables

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Voice Agent | Vapi.ai |
| Speech to Text | Deepgram Nova 3 |
| AI Model | Claude Haiku (Anthropic) |
| Backend | Node.js + Express |
| Database | Firebase Firestore |
| Calendar | Google Calendar API |
| Frontend | React |
