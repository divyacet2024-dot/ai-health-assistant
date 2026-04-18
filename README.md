
# AI Health Assist — Multi-Role Healthcare & Education Platform

A unified AI-powered platform connecting **Patients**, **Medical Students**, **Doctors**, and **Professors** with personalized dashboards, AI assistance, health habit tracking, appointment booking, and learning support.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Pages & Routes](#pages--routes)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Demo Credentials](#demo-credentials)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Future Scope](#future-scope)
- [Team](#team)

---

## Problem Statement

> Design a responsive web application that helps users identify and visualize patterns in their daily health or lifestyle habits (such as sleep, mood, water intake, or symptoms) and provides simple, actionable insights based on the collected data.

**Additional challenges addressed:**
- Healthcare systems are slow and crowded
- Students lack centralized learning tools
- No single platform connects patients, doctors, and students
- Language barriers in healthcare access

---

## Solution

A **unified AI-powered platform** that simplifies healthcare access and medical education in one place. Each user role gets a **completely different dashboard** with tailored features:

| Role | What They Get |
|------|--------------|
| **Patient** | AI health chat, daily habit tracking with pattern visualization, appointment booking, medicine info, lab reports, fee payment with queue tokens |
| **Medical Student** | AI study tutor, organized notes & previous year papers, video lectures, study planner |
| **Doctor** | AI clinical assistant, patient management, appointment scheduling, digital reports |
| **Professor** | AI teaching aide, material sharing, student query management, class scheduling |
| **Admin** | User management dashboard, approve/block users, view registrations by role |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Next.js 16 (App Router), TypeScript, HTML5, CSS3 |
| **Styling** | Tailwind CSS v4, Radix UI, Lucide Icons |
| **Charts** | Recharts (interactive data visualizations) |
| **Animations** | Motion (Framer Motion) |
| **Backend** | Node.js API Routes (REST) |
| **Database** | MongoDB (native driver) with localStorage fallback |
| **State** | localStorage for client-side persistence |
| **Theme** | Dark/Light mode with next-themes |

---

## Features

### For Patients
- **Daily Health Logging** — Track sleep (hours + quality), mood (5 emoji levels), water intake (glass counter), exercise (type/duration/intensity), nutrition (meal quality), and symptoms (tag-based)
- **Health Analytics** — Interactive line/bar/area charts with 7/14/30-day filters, per-habit tabs, summary statistics, GitHub-style logging heatmap
- **AI Insights Engine** — Pattern detection that correlates habits (e.g., "Your mood is 24% higher on days you exercise") and generates actionable suggestion cards
- **Weekly Health Reports** — Auto-generated week-over-week comparisons with trend indicators
- **Goals & Streaks** — Customizable daily targets, streak tracking, 8 achievement badges
- **AI Health Chatbot** — Context-aware health Q&A with typing indicators
- **Appointment Booking** — Select department → doctor → date → time slot → get queue token
- **Medicine Scanner** — Search 10+ medicines for usage, dosage, side effects, warnings, pricing
- **AI Medicine Scanner** — Upload medicine image for AI-powered recognition (Gemini Vision)
- **Emergency Response System** — Simulated emergency mode with route optimization, hospital switching, first aid guidance
- **Lab Reports Viewer** — Color-coded results with normal range comparisons
- **Fee Payment & Token** — Pay hospital fees online, get instant queue token (skip the line)
- **Data Export** — Download health data as CSV or JSON

### For Medical Students
- **AI Study Tutor** — Medical topic explanations with clinical correlations
- **Study Resources** — Notes, previous year papers, video lectures filtered by subject/year/type
- **Video Lectures** — 8+ curated medical video recommendations
- **Study Planner** — Weekly task organizer with progress tracking

### For Doctors
- **AI Clinical Assistant** — Differential diagnosis suggestions, drug interactions, treatment guidelines
- **Patient Management** — Searchable/filterable patient list with status indicators
- **Appointment Management** — View and manage patient appointments
- **Digital Reports** — View lab reports and patient data

### For Professors
- **AI Teaching Assistant** — Assessment design, curriculum planning support
- **Student Query Inbox** — View pending queries, submit inline answers
- **Material Sharing** — Upload documents, videos, links for students
- **Class Schedule** — Weekly teaching schedule management

### Platform-Wide
- **Role-Based Authentication** — Separate login/registration pages per role
- **Admin Dashboard** — User management, approve/block users, registration stats
- **Multi-Language UI** — English, Hindi, Telugu, Tamil, Kannada, Malayalam
- **Dark/Light Theme** — System preference or manual toggle
- **Responsive Design** — Desktop sidebar + mobile slide-out navigation
- **30-Day Demo Data** — Auto-seeded on first visit for instant demo

---

## Pages & Routes

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, feature showcase, role previews |
| `/select-role` | Role selection with 4 animated cards |

### Authentication (5 pages)
| Route | Description |
|-------|-------------|
| `/auth/patient` | Patient login & registration |
| `/auth/student` | Student login & registration (with Student ID, Year) |
| `/auth/doctor` | Doctor login & registration (with License ID, Specialization, Department) — requires admin approval |
| `/auth/professor` | Professor login & registration (with Employee ID, Department) — requires admin approval |
| `/auth/admin` | Admin login only |

### Admin
| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard with user management table, stats, filters |

### Patient Dashboard (10 pages)
| Route | Description |
|-------|-------------|
| `/dashboard` | Role-adaptive home with health summary, sparklines, streak banner, insights |
| `/dashboard/health-log` | Daily health logging form (sleep, mood, water, exercise, nutrition, symptoms) |
| `/dashboard/health-analytics` | Interactive charts, heatmap, summary stats, time range filters |
| `/dashboard/health-insights` | AI correlation insights, filterable cards, weekly health report |
| `/dashboard/health-goals` | Goal sliders, streak tracking, achievement badges, data export |
| `/dashboard/chat` | AI health chatbot |
| `/dashboard/scan` | AI Medicine Scanner |
| `/dashboard/emergency` | Emergency Response System |
| `/dashboard/appointments` | Book appointments with token generation |
| `/dashboard/medicine` | Medicine search with detailed info modals |
| `/dashboard/reports` | Lab reports viewer |
| `/dashboard/payment` | Fee payment with queue token |

### Student Dashboard (4 pages)
| Route | Description |
|-------|-------------|
| `/dashboard/resources` | Study notes, papers, videos |
| `/dashboard/videos` | Video lecture recommendations |
| `/dashboard/planner` | Weekly study planner |

### Doctor Dashboard (2 pages)
| Route | Description |
|-------|-------------|
| `/dashboard/patients` | Patient list management |

### Professor Dashboard (3 pages)
| Route | Description |
|-------|-------------|
| `/dashboard/queries` | Student query inbox |
| `/dashboard/materials` | Teaching material sharing |
| `/dashboard/schedule` | Class schedule management |

### API Endpoints (13 routes)
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth` | GET, POST | Auth status & actions |
| `/api/appointments` | GET, POST, PUT | Appointment CRUD |
| `/api/chat` | GET, POST, DELETE | Chat message persistence |
| `/api/medicine` | GET | Medicine search (`?q=query`) |
| `/api/scan` | POST | AI Medicine Scanner (image analysis) |
| `/api/emergency` | POST | Emergency Response System |
| `/api/reports` | GET | Lab reports |
| `/api/payments` | GET, POST | Payments + token generation |
| `/api/study-tasks` | GET, POST, PUT, DELETE | Study planner tasks |
| `/api/materials` | GET, POST, DELETE | Teaching materials |
| `/api/queries` | GET, POST, PUT | Student queries |
| `/api/schedule` | GET, POST, DELETE | Class schedules |
| `/api/token` | POST | Token counter |

---

## Getting Started

### Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org)
- **npm** (comes with Node.js)
- **MongoDB** (optional) — [Download](https://www.mongodb.com/try/download/community)

### Installation

```bash
# 1. Clone or extract the project
cd web

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI (optional — app works without it)
# Add GEMINI_API_KEY for AI features (get free key at https://aistudio.google.com/app/apikey)

# 4. Start the development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Create production build |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint checks |

### MongoDB Setup (Optional)

The app works **with or without MongoDB**. When MongoDB isn't running, it gracefully falls back to localStorage.

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then set in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/ai_health_assist
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout with fonts & theme
│   │   ├── globals.css                 # Global styles
│   │   ├── theme.css                   # Clinical Modern color palette
│   │   ├── select-role/page.tsx        # Role selection
│   │   ├── auth/
│   │   │   ├── patient/page.tsx        # Patient auth
│   │   │   ├── student/page.tsx        # Student auth
│   │   │   ├── doctor/page.tsx         # Doctor auth
│   │   │   ├── professor/page.tsx      # Professor auth
│   │   │   └── admin/page.tsx          # Admin auth
│   │   ├── admin/page.tsx              # Admin dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Role-adaptive dashboard
│   │   │   ├── health-log/page.tsx     # Daily health logging
│   │   │   ├── health-analytics/       # Charts & visualizations
│   │   │   ├── health-insights/        # AI insights & weekly report
│   │   │   ├── health-goals/           # Goals, streaks, badges
│   │   │   ├── chat/page.tsx           # AI chatbot
│   │   │   ├── scan/                   # AI Medicine Scanner
│   │   │   ├── emergency/            # Emergency Response System
│   │   │   ├── appointments/           # Appointment booking
│   │   │   ├── medicine/               # Medicine search
│   │   │   ├── reports/                # Lab reports
│   │   │   ├── payment/                # Fee payment + token
│   │   │   ├── resources/              # Study resources
│   │   │   ├── videos/                 # Video lectures
│   │   │   ├── planner/                # Study planner
│   │   │   ├── patients/               # Patient management
│   │   │   ├── queries/                # Student queries
│   │   │   ├── materials/              # Teaching materials
│   │   │   └── schedule/               # Class schedule
│   │   └── api/                        # REST API routes
│   │       ├── scan/route.ts           # AI Medicine Scanner
│   │       ├── emergency/route.ts      # Emergency Response
│   │       ├── auth/route.ts
│   │       ├── appointments/route.ts
│   │       ├── chat/route.ts
│   │       ├── medicine/route.ts
│   │       ├── reports/route.ts
│   │       ├── payments/route.ts
│   │       ├── study-tasks/route.ts
│   │       ├── materials/route.ts
│   │       ├── queries/route.ts
│   │       ├── schedule/route.ts
│   │       └── token/route.ts
│   ├── components/
│   │   ├── app-shell.tsx               # Role-aware layout with sidebar
│   │   ├── auth-form.tsx               # Reusable auth form component
│   │   ├── chat-ui.tsx                 # AI chat interface
│   │   ├── theme-switcher.tsx          # Dark/light toggle
│   │   └── ui/                         # shadcn/ui components
│   ├── lib/
│   │   ├── types.ts                    # Core platform types
│   │   ├── health-types.ts             # Health tracking types
│   │   ├── health-storage.ts           # Health data localStorage
│   │   ├── health-seed.ts              # 30-day demo data generator
│   │   ├── health-insights.ts          # AI insights engine
│   │   ├── auth.ts                     # Authentication utilities
│   │   ├── store.ts                    # Role & language localStorage
│   │   ├── chat-engine.ts              # AI chatbot response engine
│   │   ├── mock-data.ts               # Medicine, lab reports, appointments
│   │   ├── mongodb.ts                  # MongoDB connection utility
│   │   ├── models.ts                   # Collection names
│   │   ├── api-client.ts              # Smart API with localStorage fallback
│   │   └── utils.ts                    # Tailwind class utilities
│   └── hooks/                          # Custom React hooks
├── .env.example                        # Environment template
├── next.config.ts                      # Next.js configuration
├── tailwind.config.ts                  # Tailwind configuration
├── tsconfig.json                       # TypeScript configuration
└── package.json                        # Dependencies & scripts
```

---

## Demo Credentials

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Patient | `rahul@patient.com` | `pass123` | Active |
| Patient | `priya@patient.com` | `pass123` | Active |
| Student | `arjun@student.com` | `pass123` | Active |
| Student | `sneha@student.com` | `pass123` | Active |
| Doctor | `anil@doctor.com` | `pass123` | Active |
| Doctor | `sunita@doctor.com` | `pass123` | Pending (needs admin approval) |
| Professor | `ramesh@professor.com` | `pass123` | Active |
| Professor | `kavita@professor.com` | `pass123` | Pending (needs admin approval) |
| **Admin** | `admin@aihealthassist.com` | `admin123` | Active |

---

## API Endpoints

All API routes support MongoDB persistence with localStorage fallback.

### Authentication
```
GET  /api/auth              → Auth system info
POST /api/auth              → { action: "register" | "login" | "logout", ... }
```

### Appointments
```
GET  /api/appointments      → List all appointments
POST /api/appointments      → Create appointment (auto-generates token)
PUT  /api/appointments      → Update appointment status
```

### Chat Messages
```
GET  /api/chat?userRole=patient&sessionId=default → Get chat history
POST /api/chat              → Save message
DELETE /api/chat?userRole=patient&sessionId=default → Clear chat
```

### Medicine
```
GET  /api/medicine?q=paracetamol → Search medicines
```

### Lab Reports
```
GET  /api/reports           → Get all lab reports
```

### Payments
```
GET  /api/payments          → Payment history
POST /api/payments          → Create payment + generate token
```

### Study Tasks
```
GET  /api/study-tasks       → List tasks
POST /api/study-tasks       → Create task
PUT  /api/study-tasks       → Toggle completion
DELETE /api/study-tasks?id=xxx → Delete task
```

### Materials
```
GET  /api/materials         → List materials
POST /api/materials         → Share material
DELETE /api/materials?id=xxx → Delete material
```

### Student Queries
```
GET  /api/queries           → List queries
POST /api/queries           → Submit query
PUT  /api/queries           → Answer query
```

### Class Schedule
```
GET  /api/schedule          → List classes
POST /api/schedule          → Add class
DELETE /api/schedule?id=xxx → Delete class
```

### Token Counter
```
POST /api/token             → Get next token number
```

### AI Medicine Scanner
```
POST /api/scan              → { action: "scan", image: "base64..." }
```

### Emergency Response
```
POST /api/emergency        → { action: "activate" | "optimize-route" | "crowd-alert" | "first-aid" | "suggest-hospitals" }
```

---

## How the Health Insights Engine Works

The AI insights engine analyzes 14 days of health data and detects patterns:

1. **Sleep-Mood Correlation** — Compares mood scores on days with 7+ hours sleep vs. <6 hours
2. **Exercise-Mood Boost** — Measures mood improvement on exercise days vs. rest days
3. **Hydration-Symptom Link** — Correlates low water intake with symptom frequency
4. **Goal Tracking** — Checks sleep, water, and exercise against user-set targets
5. **Recurring Symptoms** — Identifies symptoms appearing 3+ times in 2 weeks
6. **Nutrition Analysis** — Calculates healthy meal percentage and trends
7. **Mood Trends** — Detects sustained high or low mood patterns
8. **Exercise Consistency** — Measures weekly exercise frequency against goals

Each insight includes a **priority level** (high/medium/low), **category**, and **actionable suggestion**.

---

## Future Scope

- Real AI/LLM integration (OpenAI, Google Gemini) for smarter chat responses
- Full MongoDB persistence for all features (currently localStorage-first)
- JWT-based authentication with bcrypt password hashing
- Push notifications for medicine reminders and appointments
- PDF report generation and download
- Telemedicine video calling
- Wearable device integration (Fitbit, Apple Health)
- Advanced analytics with ML-based health predictions
- Hospital/institution multi-tenancy
- Mobile app (React Native)

---

## Hackathon Pitch (30 seconds)

> "Our project is an AI-powered multi-role healthcare and education platform that supports patients, medical students, doctors, and professors. It provides personalized dashboards, AI assistance, health habit tracking with pattern visualization, appointment booking, and learning support. Due to time constraints, we developed a prototype focusing on role-based interaction, health analytics, and AI chatbot functionality, with future scope for full hospital and academic integration."

---

## License

This project was built for educational/hackathon purposes.

---

Built with Next.js, React, MongoDB, and Node.js
