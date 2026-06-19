# AI Civic Navigator — Intelligent Public Grievance Platform

AI Civic Navigator is a production-ready, AI-powered civic platform allowing citizens to lodge grievances (regarding infrastructure, public works, streetlights, sanitation, water, animal control, etc.) using text, voice dictation, and visual proof, and tracks the resolution status with absolute transparency.

## Core Features
1. **AI Department & SLA Identification**: Natural language processing models automatically route reports to the responsible department, set initial priority, and estimate target SLAs.
2. **AI Complaint Letter Generator**: Automatically drafts high-impact, formal grievance letters in English, Hindi, and Tamil.
3. **Real-time Voice Logging**: Speech-to-text dictation utilizing Web Speech APIs with visual waveform cues.
4. **Computer Vision Verification**: Verifies user images (detects potholes, trash, etc.) and tags confidence signatures.
5. **GPS Mapping**: Click-and-point Leaflet maps with automatic reverse geocoding via OpenStreetMap.
6. **Cryptographic Audit Trail**: Implements a SHA-256 block chain ledger ensuring case histories are immutable and publicly auditable.
7. **Civic Dashboard & Analytics**: Dynamic Recharts distributions, SLA calendars, and predictive intelligence forecast lists.
8. **Interactive AI Chatbot**: Conversational agent guiding citizens on ward rules, municipal bylaws, and ticket status.

---

## Tech Stack
* **Frontend**: Next.js (TypeScript, Tailwind CSS v4, Framer Motion, Zustand, Leaflet, Recharts)
* **Backend**: Node.js & Express.js (TypeScript, Prisma, Multer, Zod, Winston)
* **Databases**: PostgreSQL (Relational schema) & MongoDB (Chat histories and log metrics)
* **Ledger**: Cryptographic SHA-256 hash chains
* **AI Engine**: Dual-mode setup (OpenAI API / Google Gemini API, with automatic intelligent simulation fallback if keys are missing)

---

## Workspace Layout
```
├── backend/                  # Express API Server
│   ├── src/
│   │   ├── config/           # Database & Env configurations
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Auth validation & upload handlers
│   │   ├── models/           # Prisma PostgreSQL & Mongo schemas
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # AI engines & audit chains
│   │   └── server.ts         # Express server entry point
│   ├── prisma/               # PostgreSQL schema definition
│   └── package.json
│
├── frontend/                 # Next.js App Router Client
│   ├── src/
│   │   ├── app/              # App Router pages (Dashboard, Filing, Chat, Analytics)
│   │   ├── components/       # Reusable card, input, map, and modal items
│   │   ├── hooks/            # Geolocation trackers
│   │   ├── lib/              # Auth managers & API adapters
│   │   ├── store/            # Zustand global state (Auth, Grievances)
│   │   └── types/            # TypeScript interface definitions
│   └── package.json
│
├── docker-compose.yml        # Development environment containers
└── README.md
```

---

## Dual-Mode Simulation
The system is built to support a fully featured **Demo Mode** out-of-the-box.
* If PostgreSQL, MongoDB, or AI API keys (OpenAI/Gemini) are not configured, the platform **automatically falls back to high-fidelity rule-based simulations**.
* User registrations, complaint creation, AI vision, and chatbot procedures will run on mock states seamlessly, making the app **instantly run and testable** without initial database connections or external API costs.

---

## Installation & Setup

### Option 1: Quick Start with Docker
Ensure Docker Desktop is running, then execute:
```bash
docker-compose up --build
```
* Frontend runs at: `http://localhost:3000`
* Backend runs at: `http://localhost:5000`

### Option 2: Local Manual Setup

#### 1. Configure Environment variables
Create a `.env` in the root (and copy to `backend/.env` and `frontend/.env` if running processes manually):
```env
# Backend Ports
PORT=5000
JWT_SECRET=supersecretcivickey
JWT_EXPIRES_IN=7d

# Databases (Set dummy values to run in Demo mode)
DATABASE_URL="postgresql://civic_user:civic_pass@localhost:5432/civic_navigator?schema=public"
MONGO_URI="mongodb://localhost:27017/civic_navigator"

# AI Services (Optional - fallback to simulation if blank)
OPENAI_API_KEY=
GEMINI_API_KEY=
```

#### 2. Start the Backend
```bash
cd backend
npm install
# Compile typescript and run server
npm run dev
```

#### 3. Start the Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.
