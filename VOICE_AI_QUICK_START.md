# Voice AI Enhancement - Quick Start Checklist

## ✅ Implementation Checklist

### Phase 1: Setup (5 minutes)

- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Get Google API key (already have if using Gemini)
- [ ] Add to `.env.local`:
  ```env
  NEXT_PUBLIC_OPENAI_API_KEY=sk-your_key_here
  NEXT_PUBLIC_GOOGLE_API_KEY=your_google_key
  ```

### Phase 2: Install Files (2 minutes)

Files already created for you:
- ✅ `src/hooks/use-enhanced-speech-recognition.ts` - Enhanced Web Speech
- ✅ `src/hooks/use-voice-service.ts` - Unified voice service
- ✅ `src/lib/whisper-api.ts` - Whisper integration
- ✅ `src/lib/gemini-api-enhanced.ts` - Enhanced Gemini with retries
- ✅ `src/app/api/voice/transcribe/route.ts` - Transcription endpoint
- ✅ `src/app/api/voice/process/route.ts` - Processing endpoint
- ✅ `src/app/api/voice/status/route.ts` - Status endpoint

**No additional npm packages needed!**

### Phase 3: Update Components (10-15 minutes)

**Option A: Replace existing voice in UnifiedAIAssistant**

```typescript
// OLD
import { useVoiceAgent } from '@/hooks/useVoiceAgent';

// NEW
import { useVoiceService } from '@/hooks/use-voice-service';

// OLD usage
const voiceAgent = useVoiceAgent({ role });

// NEW usage
const voice = useVoiceService({
  language: 'en-IN',
  role: userRole,
  useWhisper: true,
  voiceOutputEnabled: true,
});
```

**Option B: Keep both (gradual migration)**

- Use `useVoiceService` in new components
- Keep `useVoiceAgent` in existing ones
- Migrate gradually

### Phase 4: Test (5 minutes)

```bash
# 1. Start dev server
npm run dev

# 2. Check status
curl http://localhost:3000/api/voice/status

# 3. Expected output
# {
#   "status": "ok",
#   "apis": {
#     "webSpeech": "browser-native",
#     "whisper": "configured",
#     "gemini": "configured"
#   }
# }

# 4. Open browser
# Go to your voice component
# Click mic button
# Speak into microphone
# Should see transcript appear
```

### Phase 5: Monitor (Ongoing)

- [ ] Check browser console for errors
- [ ] Monitor API costs (OpenAI Whisper, Gemini)
- [ ] Set up error logging
- [ ] Monitor speech recognition success rate

---

## 🎯 What Each Component Does

### Web Speech API (Browser Native)
- **Free** ✅
- Instant transcription
- Works offline
- Less accurate for accents/medical terms
- **Best for**: Quick local testing

### Whisper API (OpenAI)
- **~$0.02 per minute** of audio
- Very accurate (even for accents)
- Supports 99+ languages
- Requires internet
- **Best for**: Production accuracy

### Gemini API (Google)
- **Pricing**: $0.00075 per 1K input tokens
- Intelligent responses
- Medical knowledge
- **Best for**: Response generation

---

## 📊 Feature Comparison

| Feature | Web Speech | Whisper | Gemini |
|---------|-----------|---------|--------|
| Accuracy | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | N/A |
| Speed | Fast | 2-5s | 1-3s |
| Cost | Free | Low | Low |
| Offline | Yes | No | No |
| Languages | Limited | 99+ | Multi |
| Medical terms | Poor | Good | Excellent |

---

## 🔧 Configuration Examples

### For Patients (Hindi)
```typescript
const voice = useVoiceService({
  language: 'hi-IN',
  role: 'patient',
  useWhisper: true,    // Better accent recognition
  voiceOutputEnabled: true,
});
```

### For Medical Students (English)
```typescript
const voice = useVoiceService({
  language: 'en-IN',
  role: 'student',
  useWhisper: true,
  voiceOutputEnabled: true,
});
```

### For Doctors (Mixed)
```typescript
const voice = useVoiceService({
  language: selectedLanguage, // User selects
  role: 'doctor',
  useWhisper: true,
  voiceOutputEnabled: true,
});
```

---

## 🐛 Troubleshooting

### "Microphone not working"
- [ ] Check browser permissions (Settings → Microphone)
- [ ] Try Chrome/Edge (best support)
- [ ] Restart browser
- [ ] Check `voice.isSupported`

### "Whisper not transcribing"
- [ ] Verify `NEXT_PUBLIC_OPENAI_API_KEY` in .env.local
- [ ] Check OpenAI account has credits
- [ ] Verify API key is not expired
- [ ] Check network tab for API errors

### "Gemini returning errors"
- [ ] Check `NEXT_PUBLIC_GOOGLE_API_KEY`
- [ ] Verify rate limits (check Google Cloud Console)
- [ ] Check network connection
- [ ] Look at `voice.state.error` for details

### "Web Speech API not available"
- [ ] Browser doesn't support it (use Chrome/Edge)
- [ ] HTTPS required (localhost OK)
- [ ] Check browser console for errors

### "Getting 429 (rate limit) errors"
- [ ] Reduce request frequency
- [ ] Add delays between requests
- [ ] Check your OpenAI/Google quotas
- [ ] System auto-retries with exponential backoff

---

## 📈 Performance Tips

### Reduce Costs
1. **Use Web Speech for testing** (free)
2. **Cache Gemini responses** (avoid duplicate API calls)
3. **Batch transcriptions** (send multiple at once)
4. **Set max tokens** (shorter responses cost less)

### Improve Accuracy
1. **Reduce background noise** (speak clearly)
2. **Use language hints** (context helps)
3. **Use Whisper for difficult accents**
4. **Set medical context** for Gemini

### Optimize Speed
1. **Use Web Speech for quick feedback**
2. **Show interim results** while processing
3. **Cache common responses**
4. **Increase timeout thresholds** for slow connections

---

## 📚 Files Reference

| File | Purpose | Size |
|------|---------|------|
| `use-enhanced-speech-recognition.ts` | Web Speech with retries | ~200 lines |
| `use-voice-service.ts` | Unified interface | ~400 lines |
| `whisper-api.ts` | Whisper integration | ~250 lines |
| `gemini-api-enhanced.ts` | Enhanced Gemini | ~350 lines |
| `VOICE_AI_INTEGRATION_GUIDE.md` | Complete guide | ~500 lines |

---

## 🎓 Usage Examples

### Example 1: Simple Voice Input
```typescript
const voice = useVoiceService({ role: 'patient', language: 'en-IN' });

<button onClick={voice.startListening}>🎤 Start</button>
<p>{voice.state.transcript}</p>
<p>{voice.state.response}</p>
```

### Example 2: With Error Handling
```typescript
{voice.state.error && (
  <div>
    <p>Error: {voice.state.error}</p>
    <button onClick={voice.retry}>Try Again</button>
  </div>
)}
```

### Example 3: With Status Indicator
```typescript
<div>
  {voice.status === 'listening' && '🎤 Listening...'}
  {voice.status === 'processing' && '⚙️ Processing...'}
  {voice.status === 'speaking' && '🔊 Speaking...'}
</div>
```

---

## 🚀 Next Steps

1. **Update .env.local** with API keys
2. **Copy hook files** (already done!)
3. **Update component** to use `useVoiceService`
4. **Test locally** with microphone
5. **Monitor costs** in API dashboards
6. **Gather user feedback**
7. **Iterate based on accuracy**

---

## 💡 Pro Tips

- ✅ **Test locally first** before deploying to production
- ✅ **Monitor API costs** weekly
- ✅ **Log errors** for debugging
- ✅ **Use Web Speech for testing** (it's free!)
- ✅ **Cache responses** to reduce API calls
- ✅ **Add feedback** so users can correct errors
- ✅ **Consider fallbacks** if APIs are unavailable

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| OpenAI Docs | https://platform.openai.com/docs/api-reference/audio |
| Google Gemini | https://ai.google.dev |
| MDN Web Speech | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API |
| Browser Compat | https://caniuse.com/speech-recognition |

---

## Summary

✅ **Web Speech API** - Enhanced with better error handling and retries  
✅ **Whisper Integration** - High-accuracy speech-to-text  
✅ **Gemini Enhancement** - Exponential backoff and rate limiting  
✅ **Unified Service** - One hook for all voice features  
✅ **API Routes** - Backend support for voice processing  
✅ **Complete Documentation** - Step-by-step implementation guide  

**Ready to go!** 🎤 Start by updating `.env.local` with your API keys.

