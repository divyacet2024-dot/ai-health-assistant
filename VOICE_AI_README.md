# 🎤 Voice AI Enhancement - Complete Implementation

Welcome! This directory contains a complete, production-ready voice AI system for your AI Health Assistant.

## 📋 What's Included

### ✅ 4 Core Modules
1. **Enhanced Web Speech API** - Better error handling, auto-retries, confidence scores
2. **Whisper Integration** - High-accuracy transcription (99+ languages)
3. **Enhanced Gemini API** - Exponential backoff, rate limiting, retry logic
4. **Unified Voice Service** - One hook to rule them all!

### ✅ 3 API Routes
- `POST /api/voice/transcribe` - Whisper transcription endpoint
- `POST /api/voice/process` - Gemini response generation
- `GET /api/voice/status` - Check voice API configuration

### ✅ 1 Complete Example Component
- `EnhancedVoiceAssistant` - Full UI with all features demonstrated

### ✅ 2 Comprehensive Guides
- `VOICE_AI_INTEGRATION_GUIDE.md` - 10 phases, 500+ lines
- `VOICE_AI_QUICK_START.md` - Quick reference, checklists, tips

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Add Environment Variables
Edit `.env.local` in the `web/` folder:

```env
# Get from https://platform.openai.com/api-keys
NEXT_PUBLIC_OPENAI_API_KEY=sk-your_key_here

# Already configured (if using Gemini)
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_key
```

### Step 2: No Installation Needed!
All dependencies are already installed. These are browser native APIs + packages you already have.

### Step 3: Check Status
```bash
# Open browser console while dev server is running
curl http://localhost:3000/api/voice/status

# Expected output
{
  "status": "ok",
  "apis": {
    "webSpeech": "browser-native",
    "whisper": "configured",
    "gemini": "configured"
  }
}
```

### Step 4: Use in Your Component
```typescript
import { useVoiceService } from '@/hooks/use-voice-service';

export function MyComponent() {
  const voice = useVoiceService({
    language: 'en-IN',
    role: 'patient',
    useWhisper: true,
    voiceOutputEnabled: true,
  });

  return (
    <div>
      <button onClick={voice.startListening}>🎤 Start</button>
      <button onClick={voice.stopListening}>⏹️ Stop</button>
      
      {voice.state.transcript && <p>You said: {voice.state.transcript}</p>}
      {voice.state.response && <p>Assistant: {voice.state.response}</p>}
      {voice.state.error && <p>Error: {voice.state.error}</p>}
    </div>
  );
}
```

---

## 📁 File Structure

```
web/
├── src/
│   ├── components/
│   │   └── EnhancedVoiceAssistant.tsx      ← Example component
│   │
│   ├── hooks/
│   │   ├── use-enhanced-speech-recognition.ts  ← Web Speech enhancement
│   │   └── use-voice-service.ts                ← Unified service
│   │
│   ├── lib/
│   │   ├── whisper-api.ts                  ← Whisper integration
│   │   └── gemini-api-enhanced.ts          ← Enhanced Gemini
│   │
│   └── app/
│       └── api/
│           └── voice/
│               ├── transcribe/route.ts     ← API for transcription
│               ├── process/route.ts        ← API for response generation
│               └── status/route.ts         ← API for checking config
│
├── VOICE_AI_INTEGRATION_GUIDE.md           ← Detailed guide (10 phases)
├── VOICE_AI_QUICK_START.md                 ← Quick reference
└── README.md                                ← This file
```

---

## 🎯 Core Features

### 1️⃣ Web Speech API (Browser Native)
```typescript
const { 
  isListening,
  transcript,
  interimTranscript,  // Real-time feedback
  confidence,         // Recognition confidence (0-1)
  error,
  startListening,
  stopListening,
} = useEnhancedSpeechRecognition({
  lang: 'en-IN',
  maxRetries: 3,      // Auto-retry on error
  onResult: (text, isFinal) => console.log(text),
});
```

**Benefits:**
- ✅ Completely free
- ✅ Works offline
- ✅ Instant feedback
- ✅ Auto-retries on "no speech" errors

**Limitations:**
- ❌ Less accurate for accents
- ❌ Struggles with medical terms
- ❌ Limited languages

---

### 2️⃣ Whisper API (OpenAI)
```typescript
const result = await transcribeAudioWithWhisper(audioBlob, {
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  language: 'hi',      // Hindi, Tamil, Kannada, etc.
  prompt: 'Medical context helps with accuracy',
});

// Returns: { text: 'transcribed text', language: 'hi', duration: 2.5 }
// Errors: { error: 'message', retryable: true|false }
```

**Cost:** ~$0.02 per minute of audio

**Benefits:**
- ✅ Very high accuracy
- ✅ Supports 99+ languages
- ✅ Great for accents/medical terms
- ✅ Auto-classifies retryable errors

**Use Cases:**
- Medical transcription
- Multi-lingual support
- Background noise tolerance

---

### 3️⃣ Enhanced Gemini API (Google)
```typescript
const client = getGeminiClient({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  model: 'gemini-pro',
  temperature: 0.7,
  maxOutputTokens: 1024,
});

// With context
const response = await client.sendMessage(
  'What are treatments for diabetes?',
  'You are a medical assistant helping patients'
);

// With conversation history
const chatResponse = await client.chat('Tell me more about insulin');

// Clear history when done
client.clearHistory();
```

**Cost:** ~$0.00075 per 1K input tokens

**Features:**
- ✅ Exponential backoff retries (1s → 2s → 4s → 8s → 10s)
- ✅ Automatic rate limiting handling
- ✅ Network error recovery
- ✅ Conversation history support
- ✅ Medical knowledge

**Retry Logic:**
- Automatic for: network, 429 rate limit, 5xx, timeouts
- Fails immediately for: 401 auth, invalid format

---

### 4️⃣ Unified Voice Service
```typescript
const voice = useVoiceService({
  language: 'en-IN',
  role: 'patient',
  useWhisper: true,           // Try Whisper first
  voiceOutputEnabled: true,   // Speak responses
});

// State
voice.state.isListening      // boolean
voice.state.isProcessing     // boolean
voice.state.isSpeaking       // boolean
voice.state.transcript       // string
voice.state.interimTranscript // string
voice.state.response         // string
voice.state.error            // string | undefined
voice.state.confidence       // number 0-1

// Status
voice.status  // 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

// Methods
voice.startListening()
voice.stopListening()
voice.speakResponse(text)
voice.stopSpeaking()
voice.retry()

// Metadata
voice.isSupported    // Web Speech support
voice.hasWhisper     // Whisper configured
voice.hasGemini      // Gemini configured
```

**Flow:**
1. User clicks "Start" → `startListening()`
2. Captures audio (MediaRecorder or Web Speech)
3. User clicks "Stop" → `stopListening()`
4. Sends to Whisper (or uses Web Speech transcript)
5. Processes with Gemini
6. Speaks response with SpeechSynthesis

**Fallback Logic:**
- If Whisper unavailable → uses Web Speech
- If Gemini unavailable → no response (error shown)
- If text-to-speech unavailable → shows text only

---

## 📊 Comparison Table

| Feature | Web Speech | Whisper | Gemini |
|---------|-----------|---------|--------|
| **Accuracy** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | N/A (generation) |
| **Speed** | Fast (<1s) | 2-5s | 1-3s |
| **Cost** | FREE | ~$0.02/min | ~$0.00075/1K tokens |
| **Offline** | Yes | No | No |
| **Languages** | Limited | 99+ | Multi |
| **Medical Terms** | Poor | Good | Excellent |
| **Accents** | Poor | Excellent | N/A |
| **Setup** | Browser native | API key | API key |

---

## 🔧 Configuration by Role

### For Patients
```typescript
const voice = useVoiceService({
  language: 'hi-IN',      // Hindi for comfort
  role: 'patient',
  useWhisper: true,       // Better accent handling
  voiceOutputEnabled: true, // Hear responses
});
```

### For Medical Students
```typescript
const voice = useVoiceService({
  language: 'en-IN',
  role: 'student',
  useWhisper: true,
  voiceOutputEnabled: true,
});
```

### For Doctors
```typescript
const voice = useVoiceService({
  language: selectedLanguage, // Let them choose
  role: 'doctor',
  useWhisper: true,
  voiceOutputEnabled: true,
});
```

---

## 🐛 Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Microphone permission denied" | Browser permissions | Check browser settings |
| "No speech detected" | Silence or low volume | Speak louder, reduce noise |
| "API key not recognized" | Invalid/expired key | Verify in .env.local |
| "Whisper transcription failed" | No OpenAI credits | Add credits to OpenAI account |
| "429 Rate Limited" | Too many API calls | Wait, then retry (auto-retries) |
| "500 Server Error" | Service issue | Auto-retries with backoff |
| "Speech synthesis not supported" | Browser doesn't support | Use Chrome/Edge/Firefox |

### Auto-Retry Strategy
```typescript
// Web Speech API
- "no-speech" → Retry up to 3 times (500ms delay between retries)
- "network-error" → Retry up to 3 times (2s delay)
- "service-unavailable" → Fallback to Web Speech

// Whisper API
- Network errors → Retryable
- 429 (rate limit) → Retryable
- 5xx (server) → Retryable
- 401 (auth) → Non-retryable, fail immediately
- Invalid audio → Non-retryable

// Gemini API
- Network errors → Exponential backoff (1s → 2s → 4s → 8s → 10s)
- 429 (rate limit) → Exponential backoff
- 5xx → Exponential backoff
- Timeout → Exponential backoff
- 401 (auth) → Non-retryable, fail immediately
```

---

## 💡 Best Practices

### ✅ Do's
- ✅ Test locally with **Web Speech first** (it's free!)
- ✅ Monitor API costs weekly
- ✅ Log errors for debugging
- ✅ Add feedback so users can correct errors
- ✅ Cache responses to reduce API calls
- ✅ Set medical context for better accuracy
- ✅ Consider network conditions

### ❌ Don'ts
- ❌ Don't forget to restart dev server after .env changes
- ❌ Don't hardcode API keys
- ❌ Don't make API calls on every keystroke
- ❌ Don't expect perfect accuracy for all audio
- ❌ Don't ignore error logs
- ❌ Don't deplete API quotas in testing

---

## 🚀 Performance Tips

### Reduce Costs
```typescript
// 1. Use Web Speech for testing
useVoiceService({ useWhisper: false });

// 2. Cache responses
const cached = useMemo(() => response, [response]);

// 3. Reduce output length
const client = getGeminiClient({ maxOutputTokens: 512 });

// 4. Batch requests
// Instead of 10 API calls → 1 API call with aggregated data
```

### Improve Accuracy
```typescript
// 1. Reduce background noise
// 2. Provide context to Gemini
await client.sendMessage(
  'Is this disease contagious?',
  'You are helping a patient with fever understand their condition'
);

// 3. Use Whisper for difficult accents
useVoiceService({ useWhisper: true });

// 4. Set appropriate language
// Helps all APIs understand the context better
```

### Optimize Speed
```typescript
// 1. Show interim results while processing
{interimTranscript && <p>Listening: {interimTranscript}</p>}

// 2. Use Web Speech for quick feedback
// While Whisper works in background

// 3. Cache common responses
// "What is diabetes?" asked frequently?

// 4. Monitor network conditions
if (navigator.connection?.effectiveType === '4g') {
  // More lenient timeouts
}
```

---

## 📊 Monitoring & Debugging

### Browser Console
```javascript
// Check Web Speech support
console.log(!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

// Check API configuration
console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
console.log(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

// Check voice service state
console.log(voice.state);
console.log(voice.status);
```

### API Endpoints
```bash
# Check voice API status
curl http://localhost:3000/api/voice/status

# Test transcription
curl -X POST http://localhost:3000/api/voice/transcribe \
  -F "audio=@audio.wav" \
  -F "language=en-IN"

# Test processing
curl -X POST http://localhost:3000/api/voice/process \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "context": "Medical assistant"}'
```

### Error Logs
```typescript
// Add to your logger
voice.state.error && console.error('Voice Error:', {
  error: voice.state.error,
  status: voice.status,
  transcript: voice.state.transcript,
  timestamp: new Date(),
});
```

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **VOICE_AI_INTEGRATION_GUIDE.md** | Complete implementation guide | 20 min |
| **VOICE_AI_QUICK_START.md** | Quick reference & checklists | 10 min |
| **README.md** | This overview | 15 min |

---

## 🎯 Implementation Roadmap

### Phase 1: Setup (Today)
- [ ] Add API keys to .env.local
- [ ] Verify voice API status endpoint works
- [ ] Test Web Speech API in browser

### Phase 2: Integration (This Week)
- [ ] Copy example component to your project
- [ ] Replace existing voice component
- [ ] Update language preferences
- [ ] Test with microphone

### Phase 3: Testing (This Week)
- [ ] Test Web Speech API
- [ ] Test Whisper transcription
- [ ] Test Gemini responses
- [ ] Test error scenarios

### Phase 4: Optimization (Next Week)
- [ ] Monitor API costs
- [ ] Improve accuracy with context
- [ ] Cache common responses
- [ ] Optimize for different languages

### Phase 5: Monitoring (Ongoing)
- [ ] Track error rates
- [ ] Monitor API quotas
- [ ] Gather user feedback
- [ ] Iterate on features

---

## 🎓 Code Examples

### Simple Example
```typescript
import { useVoiceService } from '@/hooks/use-voice-service';

export function SimpleVoice() {
  const voice = useVoiceService({ role: 'patient', language: 'en-IN' });

  return (
    <div>
      <button onClick={voice.startListening}>🎤</button>
      <p>{voice.state.transcript}</p>
      <p>{voice.state.response}</p>
    </div>
  );
}
```

### Advanced Example with Error Handling
```typescript
import { useVoiceService } from '@/hooks/use-voice-service';

export function AdvancedVoice() {
  const voice = useVoiceService({ role: 'patient', language: 'en-IN' });

  return (
    <div>
      {/* Status */}
      <div>Status: {voice.status}</div>

      {/* Controls */}
      <button onClick={voice.startListening}>🎤 Start</button>
      <button onClick={voice.stopListening}>⏹️ Stop</button>

      {/* Transcript */}
      {voice.state.transcript && <p>You: {voice.state.transcript}</p>}

      {/* Response */}
      {voice.state.response && <p>Bot: {voice.state.response}</p>}

      {/* Error with Retry */}
      {voice.state.error && (
        <div>
          <p style={{ color: 'red' }}>Error: {voice.state.error}</p>
          <button onClick={voice.retry}>Retry</button>
        </div>
      )}

      {/* Feature Status */}
      <p>Whisper: {voice.hasWhisper ? '✅' : '❌'}</p>
      <p>Gemini: {voice.hasGemini ? '✅' : '❌'}</p>
    </div>
  );
}
```

### Component Integration Example
```typescript
import { EnhancedVoiceAssistant } from '@/components/EnhancedVoiceAssistant';

export function MyPage() {
  return (
    <div>
      <h1>AI Health Assistant</h1>
      <EnhancedVoiceAssistant
        userRole="patient"
        language="en-IN"
        onTranscript={(text) => console.log('User said:', text)}
        onResponse={(response) => console.log('Bot said:', response)}
      />
    </div>
  );
}
```

---

## 💰 Cost Estimation

### Monthly Estimate (100 users, moderate usage)

**Web Speech API**
- Cost: $0 (free)

**Whisper API**
- 100 users × 10 transcriptions/day × 1 min avg = 1000 min/day
- 1000 min/day × $0.02 = ~$20/day = ~$600/month

**Gemini API**
- 100 users × 10 requests/day × 500 tokens avg = 500K tokens/day
- 500K tokens × $0.00075 = ~$0.38/day = ~$11/month

**Total:** ~$611/month (for medium usage)

**Cost Optimization:**
- Use Web Speech for testing (~$0)
- Cache responses to reduce Whisper calls (reduce by 50%)
- Set reasonable maxOutputTokens (reduce Gemini cost)

---

## 🆘 Troubleshooting

### "Web Speech API not working"
```
1. Check browser (Chrome/Edge/Firefox recommended)
2. Verify HTTPS (localhost OK)
3. Check microphone permissions
4. Check browser console for errors
5. Try: navigator.mediaDevices.getUserMedia({ audio: true })
```

### "Whisper API returning 401"
```
1. Verify NEXT_PUBLIC_OPENAI_API_KEY in .env.local
2. Check API key is valid (not expired)
3. Restart dev server after env change
4. Check OpenAI account status (not suspended)
```

### "Gemini API rate limiting"
```
1. System auto-retries with backoff
2. Reduce request frequency
3. Check Google Cloud quotas
4. Contact support for higher limits
```

### "Text-to-speech not working"
```
1. Check browser support (Chrome/Edge/Firefox)
2. Verify audioContext permissions
3. Check system volume is not muted
4. Try: new SpeechSynthesisUtterance('test')
```

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| OpenAI API Docs | https://platform.openai.com/docs/api-reference |
| Google Gemini | https://ai.google.dev |
| MDN Web Speech | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API |
| Browser Support | https://caniuse.com/speech-recognition |
| Community | https://community.openai.com |

---

## ✨ Features Summary

✅ **Web Speech API Enhancement**
- Better error handling with auto-retries
- Confidence scoring
- Multi-language support
- Interim results for real-time feedback

✅ **Whisper Integration**
- 99+ language support
- High accuracy (even for accents)
- Medical term handling
- Error classification (retryable vs non-retryable)

✅ **Enhanced Gemini API**
- Exponential backoff retry logic
- Rate limiting handling
- Network error recovery
- Conversation history support
- Medical knowledge

✅ **Unified Voice Service**
- One hook for everything
- Intelligent fallback
- Text-to-speech output
- Complete state management
- Error handling

✅ **Production Ready**
- Full TypeScript support
- Comprehensive error handling
- Real-world testing patterns
- Performance optimized
- Cost effective

---

## 🎉 Ready to Get Started?

1. **Add API keys** to `.env.local`
2. **Import** `useVoiceService` hook
3. **Use in component** (copy examples above)
4. **Test with microphone** 
5. **Monitor costs** weekly

**Questions?** Check `VOICE_AI_INTEGRATION_GUIDE.md` for detailed documentation.

Happy voice AI building! 🚀

