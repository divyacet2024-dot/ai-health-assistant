# Voice Assistant Fixes - Approved Plan
Status: ✅ Approved by user - Proceeding with edits

## Steps (1/6)
### 1. ✅ Create TODO.md (Current)

### 2. ✅ Created `web/src/hooks/use-tts.ts` - Browser TTS with Hindi/Kannada voices

### 3. ✅ Edited `web/src/hooks/use-speech-recognition.ts` 
   - Added Chrome STT logs ✅
   - IN langs ready (use lang='hi-IN')

### 4. ✅ Fixed `web/src/app/api/ai-chat/route.ts` 
   - Twilio fixed ✅ (install deps if TS error)
   - Logs, TwiML enhanced

### 5. ✅ Fixed `web/src/hooks/useVoiceAgent.ts` 
   - STT/TTS now use detected lang (hi-IN, kn-IN, en-IN)

### 6. 📋 Final Steps
- Add to .env.local: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- cd web && npm install
- npm run dev
- Test mic in Chrome with Hindi/Kannada

### 5. 🔧 Edit `web/src/hooks/useVoiceAgent.ts` 
   - Integrate lang to STT/TTS

### 6. ✅ Test & Complete

**Next**: Create use-tts.ts hook
