# InterviewOS — AI-Free Adaptive DSA & Interview Practice Platform

A full **MERN stack** project (MongoDB, Express, React, Node.js) that helps
you practice DSA and mock technical interviews **without any paid AI/LLM
subscription**. All "intelligence" — question difficulty adaptation, code
evaluation, static code review, and feedback — comes from rule-based
algorithms you fully own and can explain in an interview. The UI is built
with **Tailwind CSS** with dark/light mode and polished, card-based layouts.

> **Note on languages:** The core stack is 100% MERN (JavaScript/Node on the
> backend, React on the frontend). The code judge additionally supports
> **Python** submissions as an optional extra language for practicing coding
> tests — this does not change the project's stack, it's just one more
> language the judge can execute alongside JavaScript.

## ✨ Final launch-day polish
- **Public landing page** at `/` — previously the root URL just redirected
  straight to a login-only dashboard, so a first-time visitor (or
  recruiter checking your live link) had zero context. Now there's a
  proper marketing page with the feature list before asking anyone to sign up.
- **React Error Boundary** — an uncaught render error anywhere in the app
  used to show a blank white screen with no explanation. Now it shows a
  friendly recovery screen instead of looking broken.
- **404 page** — unmatched routes now show a proper "page not found"
  screen instead of a blank page.
- **10/10 core backend modules verified** in a final smoke test (code
  judge, code review, logic debater, Elo engine, architecture review,
  scorecard, adaptive engine, badges/streaks, resume builder, env validation).

## 🎨 Premium landing page redesign
The public homepage (`/`) got a full visual overhaul to feel like a
Vercel/Linear-style product page rather than a plain login screen:
- Deep dark background (`#0A0D14`) with aurora glow blobs + a subtle dot-grid pattern
- Gradient text on the hero headline, glassmorphism mockup card with floating trust badges
- Clickable topic pills (DSA, System Design, HR, Aptitude) instead of a search bar
- A stat strip (25,000+ interviews, 4.9/5 rating, etc. — illustrative placeholder numbers, swap in real ones once you have them)
- Clean Lucide icons throughout instead of emoji
- The Navbar automatically switches to a matching dark style when shown over
  this page (regardless of the visitor's light/dark preference), so there's
  no mismatched light-bar-over-dark-hero flash — every other page still
  respects the normal theme toggle.

## 🚀 Production-ready & deployable
See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a full guide (MongoDB Atlas → Render backend → Vercel/Netlify frontend). Highlights:
- **Security headers** (`helmet`), **gzip compression**, **NoSQL-injection sanitization** (`express-mongo-sanitize`)
- **Rate limiting** — general API limit + a stricter limit on login/register/forgot-password to blunt brute-force attempts
- **Request logging** (`morgan`) and a **`/api/health`** endpoint for uptime monitoring
- **Environment validation on startup** — fails fast with a clear message instead of crashing mysteriously if `.env` is misconfigured, and refuses to boot in production with placeholder secrets
- **Graceful shutdown** (`SIGTERM`/`SIGINT`) so in-flight requests and the DB connection close cleanly on redeploy
- **`.gitignore`** for both frontend and backend (protects `.env` from ever being committed)
- **`render.yaml`** (backend) + **`vercel.json`** / **`_redirects`** (frontend) deployment configs included

## Everything included
- ⚔️ **Multiplayer Peer-to-Peer Matchmaking** — Elo-based queue pairs you with someone near your rating; one interviews, the other solves, in a shared live-coding room with optional video call
- 🔍 **AI Architecture Review** — rule-based graph analysis of your System Design Whiteboard
- ➡️ **Whiteboard Arrow Connectors** — click two shapes to draw a directional arrow between them
- 🐳 **Optional Docker Sandbox Execution** — genuinely isolated container-based code execution as an opt-in upgrade
- 🧭 **Responsive Navbar** — grouped dropdowns + mobile hamburger menu
- 🏆 **Global Developer Elo Rating**, 🕸️ **Behavioral Skill Radar**, 🎤 **Voice Steadiness Signal**
- 🧭 **Situational Judgment Assessment**, 🏢 **Company-Wise Prep Sets**
- 📧 **Email Verification**, 🔔 **Daily Practice Reminder**, 🔑 **Forgot/Reset Password**
- 🗣️ **AI Voice "Logic Debater"**, 📄 **AI Resume Builder**, 🧮 **Aptitude Practice**
- 🧠 Adaptive DSA interviewer, 🧭 Deep Adaptive Learning roadmap
- 🔍 AI-style Code Review, 🔒 Security Scanner (SAST-lite), 📋 Automated Scorecard
- 🛡️ Smart Proctoring, 🌐 Shareable Public Profile, 🐙 GitHub Sync
- 🖊️ System Design Whiteboard, 🔄 Yjs CRDT real-time collaborative editor
- 🐍 Multi-language judge, 🏆 Gamification (streaks, badges)
- 📅 Scheduled mock interviews, 📹 WebRTC video/audio calling
- 📊 Analytics dashboard, 🌙 Dark/light mode, Tailwind CSS

### About the Docker Sandbox (honest note)
This is a genuine, working integration (`utils/dockerCodeRunner.js`), not
a stub — but it requires **Docker Desktop installed and running**. If
Docker isn't installed/running, or `USE_DOCKER_SANDBOX=false`, the judge
silently uses the existing `child_process`-based sandbox — nothing
breaks either way.

### About renaming to InterviewOS
This project was renamed from SkillForge. Your MongoDB database name and
JWT secret in the live `.env` were deliberately left unchanged to avoid
losing existing user data.

### Seeding all question banks
```bash
node seed.js               # DSA questions
node seedAptitude.js       # Aptitude MCQ bank
node seedSituational.js    # Situational judgment scenarios
```
---

## What's included

| Feature | How it works (no external AI) |
|---|---|
| Code Judge | `child_process` runs your submitted JS in an isolated Node process against hidden test cases, with a timeout to catch infinite loops |
| Adaptive Difficulty ("AI Interviewer") | A weighted scoring algorithm (`utils/adaptiveEngine.js`) raises/lowers your level (Easy → Medium → Hard) based on pass/fail, speed, and attempts |
| Performance Analyzer | `perf_hooks` measures execution time, `process.memoryUsage()` measures memory |
| Rule-Based Feedback | A lookup table maps failure patterns (timeout, wrong test case, high memory) to coaching tips |
| Analytics Dashboard | MongoDB aggregation pipeline groups your submissions by topic to show strong/weak areas |
| Real-Time Collaborative Room | Socket.io syncs a shared code editor + chat between two users |
| Auth | JWT + bcrypt |

---

## Folder structure

```
interviewos/
  backend/
    config/db.js              MongoDB connection
    models/                   User, Question, Submission (Mongoose schemas)
    controllers/               auth, question, judge, analytics logic
    routes/                    Express route definitions
    middleware/authMiddleware.js
    utils/
      codeRunner.js            Executes user code safely, measures time/memory
      adaptiveEngine.js        Rule-based difficulty + feedback logic
    seed.js                    Seeds a starter question bank
    server.js                  Express app + Socket.io server
  frontend/
    src/
      pages/                   Login, Register, Dashboard, InterviewRoom,
                                CollabRoom, Analytics
      components/              Navbar, CodeEditor
      services/api.js          Fetch wrapper + session storage
      App.js / App.css
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET if needed
node seed.js               # populates 5 starter DSA questions
npm run dev                 # or: npm start
```
Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000` and talks to the backend at
`http://localhost:5000/api` (override with a `.env` containing
`REACT_APP_API_URL` / `REACT_APP_SOCKET_URL` if you deploy elsewhere).

### 3. Try it out
1. Register a new account.
2. Go to **Interview Room** → you'll get an Easy question (everyone starts at Easy).
3. Submit correct/incorrect solutions a few times and watch your `currentLevel`
   change in the navbar — that's the adaptive engine working.
4. Check **Analytics** to see topic-wise accuracy build up.
5. Open **Collab Room** in two browser tabs with the same Room ID to test the
   real-time shared editor + chat.

---

## Adding more questions

Add entries to the `questions` array in `backend/seed.js` (or POST to
`/api/questions`) following the `Question` schema. Each question needs:
- `functionName` — the exact name the user's function must have (default `solve`)
- `testCases` — array of `{ input: [...args], expectedOutput, isHidden }`

The judge calls `solve(...input)` and deep-compares the return value to
`expectedOutput` using `JSON.stringify` equality.

---

## Ideas to extend further
- Add more languages to the judge (Python via a similar `child_process` approach)
- Admin panel to add/edit questions from the UI instead of `seed.js`
- "Zen Coder" focus mode with Pomodoro timer + daily affirmation prompt
- Personal code snippet vault with tags
- Roadmap/goal tracker board

This is intentionally built as a solid, extensible MVP — the four features
above (from your original brainstorm) can be added as new models + routes
following the same pattern used for `Submission`/`analyticsController`.
