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

---

## ⚙️ Setup — Step by Step

### Step 1: Firebase Setup

1. Go to [firebase.google.com](https://firebase.google.com) → Create project → "voicedesk-clinic"
2. Enable **Firestore Database** (start in test mode)
3. Go to Project Settings → Service Accounts → Generate new private key
4. Download the JSON file — you'll need `project_id`, `client_email`, `private_key`
5. Create these Firestore collections (they auto-create on first write):
   - `bookings`
   - `callLogs`
   - `handoffs`

---

### Step 2: Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or reuse Firebase project)
3. Enable **Google Calendar API**
4. Create a Service Account → download JSON key
5. Go to Google Calendar → Create a new calendar called "Clinic Appointments"
6. Share that calendar with your service account email (give it **"Make changes to events"** permission)
7. Copy the Calendar ID from "Settings and sharing" → Calendar ID

---

### Step 3: Vapi.ai Setup

1. Sign up at [vapi.ai](https://vapi.ai)
2. Buy a phone number (Indian number available)
3. Go to **Assistants** → **Create Assistant**
4. Paste the contents of `vapi-config/assistant-config.json` into the assistant config
5. Replace `YOUR_BACKEND_URL` with your deployed backend URL (or ngrok URL for testing)
6. Note down your **API Key**, **Phone Number ID**, and **Assistant ID**

---

### Step 4: Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in all values in .env
npm install
npm run dev
```

Your backend will run at `http://localhost:3001`

**Optional: Seed demo data**
```bash
npm run seed
```
This will populate your Firestore database with realistic demo data including:
- 10 sample bookings (various statuses and dates)
- 4 sample call logs with full transcripts
- 4 sample handoff requests

For Vapi to reach your local backend during testing, use ngrok:
```bash
npx ngrok http 3001
# Copy the https URL → paste into Vapi assistant serverUrl
```

---

### Step 5: Frontend Setup

```bash
cd frontend
npm install
# Create .env file:
echo "REACT_APP_API_URL=http://localhost:3001" > .env
npm start
```

Dashboard opens at `http://localhost:3000`

---

## 🧪 Testing the Voice Agent

1. Call your Vapi phone number
2. Say: *"Hi, I'd like to book an appointment"*
3. Agent will ask for your name, preferred date, time
4. Agent calls `check_availability` → offers real slots from Google Calendar
5. On confirmation → booking appears in Firestore + Google Calendar
6. Open the dashboard → see the booking in Appointments tab

**Test FAQ:**
- *"What are your clinic hours?"*
- *"Do you accept insurance?"*
- *"Where is the clinic located?"*
- *"How much is a consultation?"*

**Test handoff:**
- *"I have a question about my MRI results"* → agent logs a callback request

---

## 🔥 Firestore Data Schema

### `bookings` collection
```json
{
  "id": "auto",
  "name": "Rahul Sharma",
  "phone": "+91-9876543210",
  "date": "2024-09-15",
  "time": "10:30",
  "reason": "Fever and cold",
  "callId": "vapi-call-id",
  "status": "confirmed",
  "createdAt": "ISO timestamp"
}
```

### `callLogs` collection
```json
{
  "id": "auto",
  "callId": "vapi-call-id",
  "phoneNumber": "+91-9876543210",
  "intent": "booking",
  "transcript": [{ "role": "assistant", "content": "Hello..." }],
  "summary": "Patient booked appointment for...",
  "duration": 120,
  "status": "completed",
  "bookingId": "firestore-booking-id",
  "createdAt": "ISO timestamp"
}
```

### `handoffs` collection
```json
{
  "id": "auto",
  "callId": "vapi-call-id",
  "phoneNumber": "+91-9876543210",
  "name": "Priya Singh",
  "question": "Asking about MRI results",
  "status": "pending",
  "createdAt": "ISO timestamp"
}
```

---

## 🚀 Deployment

### Backend → Railway (free tier)
```bash
# Push backend to GitHub
# Connect Railway → deploy from GitHub
# Set all .env variables in Railway dashboard
# Railway gives you a public URL → update Vapi serverUrl
```

### Frontend → Vercel
```bash
cd frontend
npm run build
npx vercel deploy
# Set REACT_APP_API_URL=https://your-railway-url.railway.app
```

---

## 📝 Resume Bullet

```
VoiceDesk | Founder & Developer | Vapi.ai, OpenAI GPT-4, Node.js, Firebase, Google Calendar API
Built an AI voice agent for clinic appointment booking handling inbound calls end-to-end —
real-time calendar availability checks, Firestore persistence, FAQ resolution, and human
handoff logging. Includes a React dashboard for booking management and call transcript review.
```

---

## 🎥 Demo Video Script (30 seconds)

1. **0–5s**: Show dashboard overview — stats, today's schedule
2. **5–15s**: Call the Vapi number on phone, book an appointment live
3. **15–22s**: Switch to Appointments tab — new booking appears in real-time
4. **22–28s**: Open call log — show transcript of the just-completed call
5. **28–30s**: Google Calendar on side — appointment visible there too

---

## ❓ FAQ / Troubleshooting

**Vapi webhook not receiving calls?**
→ Check ngrok is running, URL is correct in Vapi assistant config, and serverUrl has no trailing slash

**Calendar slots not showing?**
→ Confirm service account email is added as editor to the Google Calendar

**Firebase permission denied?**
→ Check Firestore rules are in test mode or properly configured

**`FIREBASE_PRIVATE_KEY` errors?**
→ Make sure the key is wrapped in double quotes in .env and `\n` characters are preserved
