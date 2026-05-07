# 🏥 AI Health Voice Assistant — Complete Technical Documentation

## 📋 Table of Contents
1. [System Overview](#1-system-overview)
2. [Core Features](#2-core-features)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Component Deep Dive](#5-component-deep-dive)
6. [API Integrations](#6-api-integrations)
7. [Multi-Language Support](#7-multi-language-support)
8. [Security & Safety](#8-security--safety)
9. [Environment Variables](#9-environment-variables)
10. [File Structure](#10-file-structure)
11. [How to Run](#11-how-to-run)
12. [Known Limitations](#12-known-limitations)

---

## 1. SYSTEM OVERVIEW

**What is it?**
A full-stack voice-enabled AI healthcare assistant that allows users to speak naturally in multiple Indian languages (Hindi, Kannada, Telugu, Tamil, Malayalam, Marathi, English) and receive intelligent medical guidance, emergency assistance, appointment booking, and medicine information.

**User Journey:**
```
User speaks → Microphone captures audio → 
Speech-to-Text (Whisper/Groq) → LLM processes intent → 
Agent decides action (emergency/book/medicine/chat) → 
LLM generates response → Text-to-Speech → Audio plays
```

**Target Users (4 Roles):**
- **Patient** — General health questions, symptoms, medicine info
- **Student** — Medical education, concept explanations
- **Doctor** — Clinical decision support, differential diagnosis
- **Professor** — Teaching materials, assessment strategies

---

## 2. CORE FEATURES

### 🎤 Voice Input (Speech-to-Text)
- **Real-time transcription** using OpenAI Whisper via Groq (ultra-fast) or OpenAI
- **Browser fallback**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Near real-time partial transcription**: Every ~1.4 seconds, transcribes last 3.8s audio window
- **Permission handling**: Requests microphone access upfront
- **Continuous listening mode**: Auto-restarts after silence
- **Multi-language**: hi-IN, kn-IN, te-IN, ta-IN, ml-IN, mr-IN, en-IN

### 🔊 Voice Output (Text-to-Speech)
- **Primary**: ElevenLabs API (high-quality neural voices)
- **Fallback**: Browser `speechSynthesis` (local, works offline)
- **Auto language switching**: Matches response language
- **Voice optimization**: Short sentences, conversational tone for TTS clarity

### 🤖 AI Brain (LLM Orchestration)
- **Primary LLM**: Google Gemini 2.0 Flash
- **Agent mode**: JSON-structured decisions with intent detection
- **Priority-based routing**:
  1. **EMERGENCY** → Twilio call to caretaker + navigate to emergency page
  2. **APPOINTMENT** → Book doctor visit (MongoDB) + token generation
  3. **MEDICINE** → Medicine lookup + dosage info (catalog DB)
  4. **SEVERITY** → Triage assessment (high/moderate/low)
  5. **CHAT** → General health Q&A with role-specific system prompts

### 🚨 Emergency Detection
- Keyword-based: "chest pain", "heart attack", "can't breathe", "emergency", "unconscious", etc.
- Instant Twilio phone call to configured caretaker number
- Auto-navigation to `/dashboard/emergency`

### 📅 Smart Appointment Booking
- NLP date/time parsing: "tomorrow", "Monday 3pm", "next Friday"
- Department inference from symptoms: "fever" → General Medicine
- Doctor assignment round-robin per department
- Token number generation (persistent counter in MongoDB)
- Falls back to demo mode if DB unavailable

### 💊 Medicine Information
- Catalog of 50+ common medicines with:
  - Generic name, category, usage, dosage
  - Price band, side effects, warnings
- Symptom-based recommendation engine
- Scoring algorithm matches symptoms to medicines
- **DISCLAIMER**: Informational only, not prescription

### 🌍 Multi-Language Intelligence
- **Auto-detection**: Heuristic + Gemini classification
- **Script validation**: Checks Devanagari, Kannada, Telugu, Tamil, Malayalam, Marathi scripts
- **Translation layer**: Gemini translates responses to target language with cultural adaptation
- **Regional voice selection**: Picks appropriate TTS voice per language

### 🎯 Intent Detection
Two-layer system:
1. **Fast heuristic** (`agent-system.ts`): Regex patterns for instant routing
2. **LLM JSON mode** (`route.ts`): Gemini parses user message into structured `{ intent, action, data, response }`

---

## 3. TECH STACK & DEPENDENCIES

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16.1.7** | React framework, App Router, Turbopack |
| **React 19.2.4** | UI library |
| **TypeScript 5** | Type safety |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** | Reusable UI components (button, card, select, etc.) |
| **Motion (Framer Motion)** | Smooth animations, Hover effects |
| **Lucide React** | Icon library |
| **next-themes** | Dark mode support |

### Backend (Serverless API Routes)
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | `/api/ai-chat`, `/api/appointments`, `/api/emergency`, `/api/medicine` |
| **MongoDB 7.1.1** | Database (appointments, token counters, user data) |
| **Twilio 5.4.0** | Emergency voice calls |

### AI/ML Services (External APIs)
| Service | Use | Fallback |
|---------|-----|----------|
| **Google Gemini 2.0 Flash** | LLM for chat + JSON agent + translation | Built-in heuristics |
| **Groq** | Whisper STT (ultra-fast, free tier) | OpenAI Whisper |
| **OpenAI Whisper** | Speech-to-text fallback | Web Speech API |
| **ElevenLabs** | Neural TTS (multi-language) | Browser speechSynthesis |

### Browser Native APIs
- `MediaRecorder` — Audio capture in 500ms chunks
- `navigator.mediaDevices.getUserMedia` — Microphone permission
- `SpeechRecognition` / `webkitSpeechRecognition` — Fallback STT
- `speechSynthesis` — Fallback TTS
- `Blob`, `FormData`, `fetch` — Audio upload

---

## 4. ARCHITECTURE & DATA FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Client)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐        ┌──────────────────┐                 │
│  │ UnifiedAIAssistant │───────→│  useVoiceAgent   │                │
│  │   (Component)     │        │    (Hook)        │                 │
│  └──────────────────┘        └──────────────────┘                 │
│          │                             │                          │
│          │ onClick(MicButton)          │ startListening()        │
│          │                             │                         │
│          ▼                             ▼                         │
│  ┌──────────────────┐        ┌──────────────────┐                 │
│  │  Mic Permission  │        │   MediaRecorder  │                │
│  │  getUserMedia()  │        │   (500ms chunks) │                │
│  └──────────────────┘        └──────────────────┘                 │
│          │                             │                          │
│          │ every 1.4s                  │ partial transcript      │
│          │─────────────────────────────►│ (interim)               │
│          │                             │                         │
│          │     stopListening()         │                         │
│          │─────────────────────────────►│ final Blob              │
│          │                             │                         │
│          │                             ▼                         │
│          │                    ┌──────────────────┐               │
│          │                    │   sttTranscribe  │                │
│          │                    │ (Whisper/Groq)   │                │
│          │                    └──────────────────┘               │
│          │                             │                          │
│          │                    Text: "I have fever"              │
│          │                             │                          │
│          │                    ┌──────────────────┐               │
│          │                    │   agent.runTurn  │                │
│          │                    │ (LLM + Tools)    │                │
│          │                    └──────────────────┘               │
│          │                             │                          │
│          │                    Intent: CHAT                       │
│          │                             │                          │
│          │                    ┌──────────────────┐               │
│          │                    │  LLM generates   │                │
│          │                    │  response text   │                │
│          │                    └──────────────────┘               │
│          │                             │                          │
│          │                    ┌──────────────────┐               │
│          │                    │   agent.speak    │                │
│          │                    │ (TTS: ElevenLabs │                │
│          │                    │  or Browser)     │                │
│          │                    └──────────────────┘               │
│          │                             │                          │
│          │                    Audio plays (Speaker)              │
│          │                             │                          │
│          └─────────────────────────────┴──────────────────────────┘
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                            HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Server Routes)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐        ┌──────────────────┐                 │
│  │  /api/ai-chat    │◄───────│   Gemini LLM     │                 │
│  │  (route.ts)      │        │   (JSON mode)    │                 │
│  └──────────────────┘        └──────────────────┘                 │
│          │                             │                          │
│          │ POST { message, role,       │ intent + action          │
│          │         language, history }  │                          │
│          │                             │                         │
│          │  ┌─────────────────────┐    │                         │
│          │  │  agentDecide()      │    │                         │
│          │  │  (heuristic filter) │    │                         │
│          │  └─────────────────────┘    │                         │
│          │                             │                         │
│          │  ┌─────────────────────┐    │                         │
│          │  │  executeAction()    │    │                         │
│          │  │  - severityTool     │    │                         │
│          │  │  - medicineLookup   │    │                         │
│          │  │  - doctorBooking    │    │                         │
│          │  └─────────────────────┘    │                         │
│          │                             │                         │
│          ▼                             ▼                         │
│  ┌──────────────────┐        ┌──────────────────┐               │
│  │  /api/appointments│       │  /api/medicine   │               │
│  │  (MongoDB write) │       │  (catalog read)  │               │
│  └──────────────────┘        └──────────────────┘               │
│                                                                     │
│  ┌──────────────────┐                                            │
│  │  Twilio /call    │ (emergency only)                            │
│  └──────────────────┘                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. COMPONENT DEEP DIVE

### A. `UnifiedAIAssistant` Component (`src/components/UnifiedAIAssistant.tsx`)

**Role:** Main UI container. Client-side only (`'use client'`).

**State:**
```typescript
- conversationHistory: Message[]  // [ {text, isUser, timestamp, source?} ]
- inputText: string               // Text input value
- voiceEnabled: boolean           // TTS on/off toggle
- mounted: boolean                // SSR hydration guard
```

**Hooks Used:**
- `useVoiceAgent()` — Manages all voice lifecycle
- `useUserLanguage()` — Persisted language preference
- `useLanguageDetector()` — Real-time script detection

**UI Sections:**
1. **Header** — Role badge, language selector, emergency button
2. **Voice Status Bar** — Mic/processing/speaking indicators
3. **Conversation Area** — Scrollable message list (user + AI bubbles)
4. **Input Area** — Text field + mic button + send button
5. **Quick Actions** — Health Log, AI Chat, Book Visit, Medicines (when empty)

**Key Functions:**
- `startListening()` — Clears input → triggers `voice.startListening()`
- `stopListening()` — Calls `voice.stopListening()`
- `handleTextSubmit()` — Sends text message via `voice.submitText()`
- `handleEmergencyAction()` — Navigates to emergency dashboard

**Intent Detection** (client-side, pre-LLM):
```typescript
EMERGENCY_KEYWORDS = ['chest pain', 'heart attack', "can't breathe", ...]
PATIENT_SYMPTOM_KEYWORDS = ['headache', 'fever', 'cold', ...]
MEDICINE_KEYWORDS = ['medicine', 'tablet', 'dosage', ...]
APPOINTMENT_KEYWORDS = ['appointment', 'book', 'schedule', ...]
```
Used for fast UI feedback before LLM responds.

---

### B. `useVoiceAgent` Hook (`src/hooks/useVoiceAgent.ts`)

**Purpose:** End-to-end voice pipeline orchestration.

**State:**
```typescript
VoiceAgentUIState {
  status: 'idle' | 'listening' | 'processing' | 'speaking'
  listening: boolean
  processing: boolean  // Transcribing + LLM thinking
  speaking: boolean    // TTS playing
  transcript: string   // Final STT result
  interimTranscript: string  // Real-time partial text
  error?: string
}
```

**Refs (persistent across renders):**
```typescript
mediaRecorderRef: MediaRecorder | null
streamRef: MediaStream | null
chunksRef: Blob[]           // Accumulates audio chunks
partialTimerRef: number | null  // Interval ID for near-real-time
historyRef: {role, content}[]   // Conversation context (last 12 turns)
```

**Workflow:**

**1. `startListening()`**
```
✓ SSR guard (typeof window)
✓ Check navigator.mediaDevices.getUserMedia exists
✓ Request microphone permission
✓ Create MediaRecorder (webm/ogg)
✓ Start recording in 500ms chunks
✓ Every 1.4s: send last 3.8s window to STT
✓ Update interimTranscript in UI
```

**2. User stops speaking OR silence detected → `stopListening()`**
```
✓ Stop MediaRecorder
✓ Concatenate all chunks into finalBlob
✓ Call agent.sttTranscribe(finalBlob) → full transcript
✓ Set transcript state
✓ Call agent.runTurn({ userText, history }) → LLM
✓ Display user message in UI
✓ Call agent.speak(assistantText) → TTS
✓ Display AI message in UI
```

**3. `agent.runTurn()` (in `VoiceAgent` class)**
```
✓ detectIntent() — Heuristic check for emergency/booking/medicine/severity
✓ If emergency → handleEmergency() → Twilio call + navigation
✓ If booking → handleAppointment() → MongoDB insert
✓ If medicine → handleMedicine() → lookup catalog
✓ If severity → severityTool()
✓ Else → llmReply() → Gemini chat completion
✓ Return { intent, assistantText }
```

**4. `agent.speak()`**
```
✓ Try ElevenLabs TTS (streaming audio)
✓ On failure → Browser TTS fallback (speechSynthesis)
✓ Wait for audio to finish
✓ Update speaking state
```

---

### C. `useSpeechRecognition` Hook (`src/hooks/use-speech-recognition.ts`)

**Purpose:** Web Speech API fallback for STT when Whisper fails or is unavailable.

**Features:**
- `window.SpeechRecognition` (Chrome/Edge) or `window.webkitSpeechRecognition` (Safari)
- Continuous mode: `recognition.continuous = true`
- Interim results: `recognition.interimResults = true`
- Auto-restart on silence (configurable delays)
- Retry logic for `no-speech` (5 attempts, 500ms delay)
- Network error recovery (2s backoff)
- Error classification: fatal (not-allowed, aborted) vs non-fatal (no-speech, bad-grammar)

**Critical:**
Before calling `recognition.start()`, **forces microphone permission** via `navigator.mediaDevices.getUserMedia()` — required for Safari/Firefox to work.

---

### D. `useTTS` Hook (`src/hooks/use-ts.ts`)

**Purpose:** Browser `speechSynthesis` management.

**Features:**
- Loads all system voices on mount
- Filters regional voices: `en-IN`, `hi-IN`, `kn-IN`, etc.
- Auto-selects best match by language priority
- `speak(text, langOverride?)` — async, resolves when finished
- `stop()` — cancels current utterance
- Voice parameters: rate=0.95, pitch=1.0, volume=0.9
- Handles Chrome's async voice loading (poll every 100ms)

---

### E. API Routes

#### `/api/ai-chat/route.ts` — Main AI Brain

**Request:**
```json
{
  "message": "I have a headache",
  "userRole": "patient",
  "preferredLanguage": "auto",
  "history": [ ... ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "role": "assistant",
    "content": "You have a headache. Drink water, take rest. If it persists, see a doctor.",
    "agent": { "intent": "general", "action": "none", "data": {}, "response": "..." },
    "timestamp": "2026-05-04T...",
    "language": "en"
  }
}
```

**Processing Pipeline (route.ts):**

1. **Emergency check** (`isEmergency()`) — Immediate Twilio call
2. **Language detection** (`detectMessageLanguage()`) — Heuristics + Gemini fallback
3. **Agent decision** (`agentDecide()`) — Fast heuristic routing
4. **Tool execution** — severityTool / medicineLookupTool / doctorBookingTool
5. **Build system prompt** — Role-specific + language style guide + voice rules
6. **LLM JSON mode** — Gemini returns `{intent, action, data, response}`
7. **Execute action** (`executeAction()`) — May call Twilio or MongoDB
8. **Translate** (if not English) — `translateText()` via Gemini
9. **Return response**

**System Prompts** (per role, in `route.ts`):
- `patient` — Friendly, empathetic, simple language
- `student` — Educational, mnemonics, clinical correlations
- `doctor` — Concise, evidence-based, differentials
- `professor` — Scholarly, pedagogical, curriculum-focused

---

## 6. API INTEGRATIONS

### 1. Google Gemini AI (`@google/generative-ai`)

**Uses:**
- LLM chat completion (via `generateContent()`)
- JSON mode: Prompt asks for strict `{intent, action, data, response}` output
- Language detection: "Detect language of this text, respond with ONLY code"
- Translation: Medical response → target language with cultural adaptation

**Endpoints:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
Headers: { "Content-Type": "application/json" }
Body: { "contents": [{ "parts": [{ "text": prompt }] }] }
```

**Fallbacks:** Heuristic-based responses if Gemini fails.

---

### 2. Groq (Whisper STT)

**Why Groq?** 1000+ tokens/sec, free tier, OpenAI-compatible Whisper endpoint.

**Endpoint:**
```
POST https://api.groq.com/openai/v1/audio/transcriptions
Headers: { "Authorization": "Bearer gsk_..." }
Body: FormData { file: blob, model: "whisper-1", language: "hi-IN" }
Response: { "text": "...", "language": "hi" }
```

**Fallback → OpenAI** if Groq key missing.

---

### 3. ElevenLabs TTS

**Endpoint:**
```
POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}/stream
Headers: {
  "xi-api-key": "...",
  "Content-Type": "application/json"
}
Body: {
  "text": "...",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": { stability, similarity_boost, style }
}
Response: audio/mpeg stream
```

**Fallback → Browser `speechSynthesis`** if ElevenLabs not configured.

---

### 4. Twilio (Emergency Calls)

**Trigger:** Emergency intent detected OR explicit "emergency" keyword.

**Flow:**
```typescript
client.calls.create({
  to: CARETAKER_PHONE_NUMBER,  // +91XXXXXXXXXX
  from: TWILIO_PHONE_NUMBER,   // +1XXXXXXXXXX
  twiml: `<Response><Say>Emergency alert. Patient needs help.</Say></Response>`
});
```

**Result:** Caretaker receives automated voice call.

---

### 5. MongoDB

**Collections:**
- `appointments` — { patientName, doctorName, department, date, time, tokenNumber, status, reason, source }
- `tokenCounters` — { name: "appointment_token", value: N } ( Atomic increment )

**Fallback:** If MongoDB unavailable, generates random token (101–900) but still responds to user.

---

## 7. MULTI-LANGUAGE SUPPORT

### Languages
| Code | Language | Script | TTS Voice |
|------|----------|--------|-----------|
| `hi` | Hindi | Devanagari | Google Hindi |
| `kn` | Kannada | Kannada | Google Kannada |
| `te` | Telugu | Telugu | Google Telugu |
| `ta` | Tamil | Tamil | Google Tamil |
| `ml` | Malayalam | Malayalam | Google Malayalam |
| `mr` | Marathi | Devanagari | Google Marathi |
| `en` | English | Latin | Google English-IN |

### Language Detection Pipeline

**Step 1 — Heuristic (fast, client-side)** (`lib/languages.ts`)
- Checks for language-specific stop words
- Script detection regex: Devanagari `[।!?]`, Kannada words, etc.
- Mixed language flags: "Hinglish", "Kanglish", "Tanglish"

**Step 2 — Gemini (if available & heuristic low-confidence)**
```
Prompt: "Detect the language of this text. Respond with ONLY code: hi, kn, te..."
```

**Step 3 — Translation (if response language ≠ user language)**
```
Gemini prompt with LANGUAGE_STYLES guide:
- Conversational tone (not textbook)
- Use common words, not medical jargon
- Keep sentences short for TTS
- Cultural adaptation (e.g. "bukhaar" not "fever" in Hindi)
```

---

## 8. SECURITY & SAFETY

### Input Sanitization
- Messages trimmed before processing
- HTML entities not escaped (internal system, no XSS risk)
- History limited to last 12 turns to prevent token overflow

### API Key Protection
- **Public keys** (browser-accessible) → `NEXT_PUBLIC_*` prefix
  - `NEXT_PUBLIC_GROQ_API_KEY` — STT
  - `NEXT_PUBLIC_OPENAI_API_KEY` — STT fallback
  - `NEXT_PUBLIC_ELEVENLABS_API_KEY` — TTS
- **Private keys** (server-only) → No prefix
  - `GEMINI_API_KEY` — Only used in API route (never exposed to browser)
  - `MONGODB_URI` — Server-side only
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` — Server-side only

### Medical Disclaimer
- Every AI response includes: "I am informational only. Always consult a doctor."
- Emergency hotline (108) mentioned in emergencies
- Medicine info flagged as "not a prescription"

### Microphone Permission
- **Must be triggered by user click** (button `onClick`)
- No auto-start on page load
- Permission requested at moment of first use
- Stream stopped immediately after permission check

### SSR Guards (preventing "undefined navigator" errors)
```typescript
if (typeof window === 'undefined') return;
if (!navigator.mediaDevices?.getUserMedia) { /* fallback */ }
```

---

## 9. ENVIRONMENT VARIABLES

### Required (.env.local)

**Frontend (exposed to browser):**
```bash
# Speech-to-Text (choose ONE)
NEXT_PUBLIC_GROQ_API_KEY=gsk_your_groq_key_here
# OR
NEXT_PUBLIC_OPENAI_API_KEY=sk_your_openai_key_here

# Text-to-Speech (optional — falls back to browser TTS)
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key_here
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# LLM endpoint override (optional)
NEXT_PUBLIC_WHISPER_ENDPOINT=https://api.groq.com/openai/v1/audio/transcriptions
```

**Backend (server-only, NOT in .env.local if using .env):**
```bash
GEMINI_API_KEY=AIzaSy...your_gemini_key...
MONGODB_URI=mongodb://localhost:27017/ai_health_assist

# Twilio (optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
CARETAKER_PHONE_NUMBER=+91XXXXXXXXXX
```

**Note:** `.env` (root) is loaded for server routes. `.env.local` loads for both client AND server.

---

## 10. FILE STRUCTURE

```
web/
├── src/
│   ├── app/
│   │   ├── ai-assistant/page.tsx     ← Route page (client wrapper)
│   │   ├── api/
│   │   │   ├── ai-chat/route.ts      ← MAIN LLM ENDPOINT
│   │   │   ├── appointments/route.ts  ← MongoDB write
│   │   │   ├── emergency/route.ts     ← Twilio call trigger
│   │   │   ├── medicine/route.ts      ← Medicine catalog query
│   │   │   └── test-speech/page.tsx   ← Debug STT page
│   │   ├── dashboard/
│   │   │   ├── appointments/page.tsx
│   │   │   ├── emergency/page.tsx
│   │   │   ├── medicine/page.tsx
│   │   │   └── chat/page.tsx
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── UnifiedAIAssistant.tsx     ← Main voice UI component
│   │   ├── LanguageSelector.tsx       ← Language dropdown
│   │   ├── chat-ui.tsx                ← Text chat interface
│   │   └── voice/
│   │       └── VoiceControl.test.tsx  ← Unit tests
│   │
│   ├── hooks/
│   │   ├── useVoiceAgent.ts           ← Voice orchestration
│   │   ├── use-speech-recognition.ts  ← Web Speech API fallback
│   │   ├── use-tts.ts                 ← Browser TTS
│   │   ├── use-language-detector.ts   ← Script detection
│   │   ├── use-user-language.ts       ← Persisted preference
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── voice/
│   │   │   ├── voiceAgent.ts          ← VoiceAgent class (business logic)
│   │   │   ├── tts.ts                 ← TTS abstraction (ElevenLabs/browser)
│   │   │   └── stt.ts                 ← STT abstraction (Whisper/Groq)
│   │   ├── tools.ts                   ← Tool implementations
│   │   ├── agent-system.ts            ← agentDecide() heuristic
│   │   ├── languages.ts               ← Language codes, detection utils
│   │   ├── booking-logic.ts           ← Date/time/department inference
│   │   ├── mongodb.ts                 ← MongoDB connection
│   │   ├── types.ts                   # UserRole, Medicine types
│   │   └── ...
│   │
│   └── TODO.md, VOICE_AGENT_PLAN.md, AI_AGENT_ACTIONS.md
│
├── .env                    ← Server env (GEMINI, MONGODB, TWILIO)
├── .env.local              ← Client+Server env (API keys)
├── next.config.ts
├── package.json
└── README.md
```

---

## 11. HOW TO RUN

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Configure Environment Variables

**`.env.local`** (browser-accessible keys):
```bash
NEXT_PUBLIC_GROQ_API_KEY=gsk_your_groq_key
NEXT_PUBLIC_OPENAI_API_KEY=sk_your_openai_key  # or use Groq
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key  # optional
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

**`.env`** (server-only keys):
```bash
GEMINI_API_KEY=AIzaSy...your_gemini_key...
MONGODB_URI=mongodb://localhost:27017/ai_health_assist
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
CARETAKER_PHONE_NUMBER=+91XXXXXXXXXX
```

**Get API keys:**
- Gemini: https://aistudio.google.com/app/apikey
- Groq: https://console.groq.com/keys
- ElevenLabs: https://elevenlabs.io/app/api-keys
- Twilio: https://console.twilio.com

### 3. Start Database
```bash
# MongoDB must be running
mongod
```

### 4. Run Dev Server
```bash
npm run dev
```
Opens at `http://localhost:3000/ai-assistant`

### 5. Test
- Click mic button → Allow permission
- Speak: "I have a headache" or "Book appointment tomorrow"
- Watch real-time transcript appear
- AI responds with voice (if TTS enabled)

---

## 12. KNOWN LIMITATIONS & FUTURE WORK

### Current Limitations
1. **Browser TTS voices vary by OS** — Hindi/Kannada quality depends on user's system voices
2. **Whisper API costs** — Groq free tier limited to X requests/day
3. **No streaming LLM** — Waits for full response before TTS (latency)
4. **Partial STT may miss** — 3.8s window sliding, not perfect
5. **Single-session memory** — No persistence across page reloads
6. **Emergency detection keyword-only** — Not AI-powered (could be enhanced)
7. **Medicine database static** — Loaded from `mock-data.ts`, not dynamic

### Planned Enhancements (from TODOs)
- Streaming TTS (chunked audio playback)
- WebSocket for real-time LLM streaming
- User session persistence (localStorage + MongoDB)
- Offline mode with cached responses
- Voice activity detection (VAD) for smarter silence handling
- Conversation export (PDF/audio recording)
- Multi-modal: image upload for skin conditions

---

## 🎯 QUICK REFERENCE: Agent Flow

```
User: "मुझे सिरदर्द हो रहा है" (I have headache in Hindi)

Step 1: Mic captures audio (3 sec chunks) → MediaRecorder
Step 2: Every 1.4s → send last 3.8s window to Whisper/Groq
Step 3: interimTranscript displayed: "मुझे सिरदर्द"
Step 4: User stops → full Blob → STT → "I have a headache"
Step 5: useVoiceAgent.submitText() → agent.runTurn()
Step 6: agentDecide() → matches headache → severity MEDICINE
Step 7: Gemini LLM: "You have headache. Drink water. Take rest."
Step 8: translateText() if needed (already English)
Step 9: agent.speak() → ElevenLabs → audio plays
Step 10: UI shows both user + AI messages
```

---

**Built with ❤️ — Hackathon-Ready Voice AI for Healthcare**
