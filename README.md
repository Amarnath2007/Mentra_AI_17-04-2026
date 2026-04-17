# 🎓 Mentra AI – AI-Powered Mentorship & Adaptive Learning Platform

A production-level hackathon prototype that combines AI-powered personalized learning, real-time mentorship chat, skill tracking, and adaptive quizzes.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| AI | Hugging Face Inference API (Qwen/Llama) |
| Auth | JWT (jsonwebtoken + bcryptjs) |

---

## ✨ Features

- 🔐 **Auth System** — JWT-based signup/login with student & mentor roles
- 🧠 **AI Learning Engine** — Generates personalized learning paths via Hugging Face
- 💬 **Real-time Chat** — Topic-based rooms + Socket.io live messaging
- 🤖 **AI Chat Assistant** — ChatGPT-style interface with Mentra AI persona
- 📊 **Skill Dashboard** — Progress tracking, XP points, streaks
- 📝 **AI Quiz Generator** — 5 MCQs per topic with instant scoring
- 🔔 **Notifications** — In-app alert system
- 👥 **Mentor Directory** — Browse and connect with expert mentors
- 📱 **Mobile Responsive** — Works on all screen sizes

---

## 📁 Project Structure

```
mentra-ai/
├── client/                    # Next.js frontend
│   ├── pages/
│   │   ├── index.js           # Landing page
│   │   ├── login.js           # Login
│   │   ├── signup.js          # Signup
│   │   └── dashboard/
│   │       ├── index.js       # Main dashboard
│   │       ├── chat.js        # Real-time chat
│   │       ├── ai-assistant.js # AI chat
│   │       ├── learning-path.js # Learning path
│   │       ├── quiz.js        # Quiz generator
│   │       ├── mentors.js     # Mentor directory
│   │       └── settings.js    # User settings
│   ├── components/
│   │   └── layout/
│   │       └── DashboardLayout.js
│   ├── lib/
│   │   ├── api.js             # Axios API client
│   │   ├── auth.js            # Auth context
│   │   └── socket.js          # Socket.io hook
│   └── styles/
│       └── globals.css        # Global styles + design tokens
│
└── server/                    # Express backend
    ├── index.js               # Server entry point
    ├── socket.js              # Socket.io setup
    ├── models/
    │   ├── User.js
    │   ├── Message.js
    │   └── LearningPath.js
    ├── routes/
    │   ├── auth.js            # /auth/*
    │   ├── user.js            # /user/*
    │   ├── ai.js              # /ai/*
    │   └── chat.js            # /chat/*
    └── middleware/
        └── auth.js            # JWT middleware
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or MongoDB Atlas) — *optional, app runs without it*
- Hugging Face API key — *optional, mock data works without it*

---

### Step 1: Clone / Extract the project

```bash
cd mentra-ai
```

---

### Step 2: Setup the Backend

```bash
cd server
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mentra-ai
JWT_SECRET=your_super_secret_jwt_key
HUGGINGFACE_API_KEY=hf_your_key_here
HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
CLIENT_URL=http://localhost:3000
```

> 💡 **MongoDB is optional** — the app uses in-memory storage as fallback  
> 💡 **Hugging Face is optional** — the app uses smart mock responses as fallback

Start the server:

```bash
npm run dev    # Development (best for testing layout/design)
# or
npm start      # Production (requires 'npm run build' first)
```

Server runs at: **http://localhost:5000**

---

### Step 3: Setup the Frontend

```bash
cd ../client
npm install
```

Create your `.env.local` file:

```bash
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev    # Recommended for local development
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Demo Accounts

The app works with any email/password you register with. For quick testing:

| Role | Email | Password |
|------|-------|----------|
| Student | student@mentra.ai | demo123 |
| Mentor | mentor@mentra.ai | demo123 |

> These are pre-filled in the login form via "Demo: Student" and "Demo: Mentor" buttons.  
> You'll need to sign up with these credentials first, OR just use the signup page to create fresh accounts.

---

## 🌐 API Endpoints

### Auth
```
POST /auth/signup   { name, email, password, role }
POST /auth/login    { email, password }
```

### User
```
GET  /user/profile
PUT  /user/profile  { name, bio, skillLevel, skills, interests }
GET  /user/mentors
PUT  /user/progress/complete-topic  { topic }
```

### AI
```
POST /ai/generate-path   { interests[], skillLevel, goals }
POST /ai/chat            { message, history[] }
POST /ai/quiz            { topic, difficulty }
POST /ai/recommendations { completedTopics[], interests[] }
```

### Chat
```
POST /chat/send          { room, content }
GET  /chat/history/:room
GET  /chat/rooms
```

---

## 🔌 Socket.io Events

| Event (emit) | Payload | Description |
|---|---|---|
| `room:join` | `{ room }` | Join a chat room |
| `room:leave` | `{ room }` | Leave a room |
| `message:send` | `{ room, content }` | Send a message |
| `typing:start` | `{ room }` | Start typing indicator |
| `typing:stop` | `{ room }` | Stop typing indicator |

| Event (receive) | Description |
|---|---|
| `message` | New message received |
| `room:user-joined` | User joined room |
| `users:online` | Updated online users list |
| `typing:start` | Someone started typing |

---

## 🧪 Running Without MongoDB / Hugging Face

**Without MongoDB:** All data is stored in memory. Sessions will reset on server restart, but the app is fully functional.

**Without Hugging Face:** All AI features use intelligent mock responses:
- Learning paths return structured 4-topic curricula
- Chat assistant returns contextual replies (detects React/JS/Python queries)
- Quizzes return 5 well-formed MCQs

---

## 🎨 Design System

- **Font**: Sora (display) + DM Sans (body) + JetBrains Mono (code)
- **Primary**: `#5667f0` (indigo)
- **Accent**: `#fb923c` (orange)
- **Theme**: Dark glass morphism
- **Animations**: Tailwind + CSS keyframes

---

## 🚀 Deployment Notes

### Backend (Render/Railway/Fly.io)
```bash
npm start
```
Set env vars: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `HUGGINGFACE_API_KEY`, `CLIENT_URL`

### Frontend (Vercel)
```bash
npm run build
```
Set env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`

---

## 📦 Key Dependencies

**Backend:**
- `express` — HTTP server
- `socket.io` — WebSocket real-time
- `mongoose` — MongoDB ODM
- jsonwebtoken — JWT auth
- bcryptjs — Password hashing
- @huggingface/inference — Hugging Face API client

**Frontend:**
- `next` — React framework
- `socket.io-client` — WebSocket client
- `axios` — HTTP client
- `lucide-react` — Icons
- `react-markdown` — Markdown rendering
- `tailwindcss` — Utility CSS

---

Built with ❤️ for hackathon · Mentra AI © 2025
