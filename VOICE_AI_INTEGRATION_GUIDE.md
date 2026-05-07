/**
 * Voice AI Implementation Guide
 * Complete step-by-step instructions for integrating voice features
 */

# Voice AI Integration Guide

## Overview

This guide covers:
1. Web Speech API improvements with better error handling
2. OpenAI Whisper API integration for accurate transcription
3. Enhanced Gemini API with retry logic
4. Unified voice service combining all three

---

## Phase 1: Setup & Configuration

### 1.1 Install Dependencies

```bash
cd web
npm install openai
```

No additional packages needed! The existing dependencies already include:
- `@google/generative-ai` for Gemini
- Web Speech API (browser native)

### 1.2 Update Environment Variables

Add to `.env.local`:

```env
# Existing
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key

# New
NEXT_PUBLIC_OPENAI_API_KEY=sk-your_openai_api_key
```

Get these from:
- **Google API Key**: [Google Cloud Console](https://console.cloud.google.com)
- **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)

---

## Phase 2: Web Speech API Enhancement

### What's New

- ✅ Better error categorization
- ✅ Automatic retry for recoverable errors
- ✅ Confidence scores
- ✅ Multi-language support
- ✅ Interim results feedback

### File: `src/hooks/use-enhanced-speech-recognition.ts`

**Features:**
```typescript
const {
  isListening,        // boolean - currently recording
  transcript,         // string - final recognized text
  interimTranscript,  // string - partial text during recording
  isSupported,        // boolean - browser support
  error,              // string | null - error message
  confidence,         // number (0-1) - recognition confidence
  isFinal,            // boolean - whether transcript is final
  startListening,     // () => void
  stopListening,      // () => void
  resetTranscript,    // () => void
  toggleListening,    // () => void
  retryListening,     // () => void
} = useEnhancedSpeechRecognition(options);
```

**Usage Example:**

```typescript
import { useEnhancedSpeechRecognition } from '@/hooks/use-enhanced-speech-recognition';

export function VoiceInput() {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    confidence,
    startListening,
    stopListening,
  } = useEnhancedSpeechRecognition({
    lang: 'en-IN',
    continuous: false,
    interimResults: true,
    maxRetries: 3,
    onResult: (text, isFinal) => {
      console.log('Recognized:', text, 'Final:', isFinal);
    },
    onError: (error) => {
      console.error('Recognition error:', error);
    },
  });

  return (
    <div>
      <button onClick={startListening} disabled={isListening}>
        🎤 Start Listening
      </button>
      <button onClick={stopListening} disabled={!isListening}>
        ⏹️ Stop
      </button>

      {interimTranscript && <p>Listening: {interimTranscript}</p>}
      {transcript && <p>Recognized: {transcript}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {confidence > 0 && <p>Confidence: {Math.round(confidence * 100)}%</p>}
    </div>
  );
}
```

---

## Phase 3: Whisper API Integration

### What's New

- ✅ Higher accuracy transcription (especially for accents)
- ✅ Support for 99+ languages
- ✅ Better handling of background noise
- ✅ Fallback support if Web Speech fails

### File: `src/lib/whisper-api.ts`

**Supported Languages:**

```
English, Hindi, Telugu, Tamil, Kannada, Malayalam
+ 93 more languages supported
```

**Usage Example:**

```typescript
import {
  transcribeAudioWithWhisper,
  getWhisperConfig,
  isWhisperConfigured,
} from '@/lib/whisper-api';

// Check if Whisper is configured
if (isWhisperConfigured()) {
  const config = getWhisperConfig();

  // Transcribe from blob
  const result = await transcribeAudioWithWhisper(audioBlob, {
    ...config,
    language: 'hi', // Hindi
    prompt: 'Medical context...', // Optional context
  });

  if ('error' in result) {
    console.error('Transcription error:', result.error);
    if (result.retryable) {
      // Can retry
    }
  } else {
    console.log('Transcribed:', result.text);
  }
}
```

**Error Handling:**

```typescript
interface WhisperError {
  error: string;              // Error message
  details?: string;           // Additional details
  retryable: boolean;         // Can be retried?
}

// Retryable errors: network, rate limiting, server errors
// Non-retryable: invalid API key, invalid audio
```

---

## Phase 4: Enhanced Gemini API

### What's New

- ✅ Automatic exponential backoff retries
- ✅ Rate limiting handling (429 errors)
- ✅ Network error recovery
- ✅ Conversation history support
- ✅ Better error categorization

### File: `src/lib/gemini-api-enhanced.ts`

**Retry Configuration:**

```typescript
interface GeminiRetryConfig {
  maxRetries: 3,           // Total attempts
  initialDelayMs: 1000,    // First retry delay
  maxDelayMs: 10000,       // Max retry delay
  backoffMultiplier: 2,    // Exponential multiplier
}

// Example delays: 1s → 2s → 4s → 8s → 10s (max)
```

**Usage Example:**

```typescript
import {
  getGeminiClient,
  isGeminiConfigured,
} from '@/lib/gemini-api-enhanced';

if (isGeminiConfigured()) {
  const client = getGeminiClient({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    model: 'gemini-pro',
    temperature: 0.7,
    maxOutputTokens: 1024,
  });

  // Single message
  const response = await client.sendMessage('What is diabetes?', 'You are a medical assistant');
  if (response.error) {
    console.error('API error:', response.error);
  } else {
    console.log('Response:', response.text);
  }

  // Conversation with history
  const chatResponse = await client.chat('Tell me about treatment');
  console.log(chatResponse.text);

  // Clear history when done
  client.clearHistory();
}
```

**Retryable Errors (Auto-Retried):**
- Network errors
- Rate limiting (429)
- Server errors (5xx)
- Timeout errors

**Non-Retryable Errors (Fail Immediately):**
- Invalid API key (401)
- Authentication errors
- Invalid request format

---

## Phase 5: Unified Voice Service

### Combines All Three Components

**File:** `src/hooks/use-voice-service.ts`

**Features:**
- ✅ Intelligent fallback (Whisper → Web Speech)
- ✅ Automatic error recovery
- ✅ Text-to-speech output
- ✅ State management
- ✅ Multi-language support

**Usage Example:**

```typescript
import { useVoiceService } from '@/hooks/use-voice-service';

export function VoiceAssistant() {
  const voice = useVoiceService({
    language: 'en-IN',
    role: 'patient',
    useWhisper: true,           // Try Whisper first
    voiceOutputEnabled: true,   // Speak responses
  });

  return (
    <div>
      {/* Status Display */}
      <div>Status: {voice.status}</div>
      <div>Confidence: {Math.round(voice.state.confidence * 100)}%</div>

      {/* Transcript Display */}
      {voice.state.interimTranscript && (
        <p style={{ color: 'blue' }}>
          Listening: {voice.state.interimTranscript}
        </p>
      )}
      {voice.state.transcript && (
        <p style={{ color: 'green' }}>
          You said: {voice.state.transcript}
        </p>
      )}

      {/* Response Display */}
      {voice.state.response && (
        <div style={{ background: '#f0f0f0', padding: '10px' }}>
          <p>Assistant: {voice.state.response}</p>
        </div>
      )}

      {/* Error Display */}
      {voice.state.error && (
        <div style={{ color: 'red' }}>
          <p>Error: {voice.state.error}</p>
          <button onClick={voice.retry}>Retry</button>
        </div>
      )}

      {/* Controls */}
      <button
        onClick={voice.startListening}
        disabled={voice.state.isListening || voice.state.isProcessing}
      >
        🎤 Start
      </button>

      <button
        onClick={voice.stopListening}
        disabled={!voice.state.isListening}
      >
        ⏹️ Stop
      </button>

      {voice.state.isSpeaking && (
        <button onClick={voice.stopSpeaking}>
          🔊 Stop Speaking
        </button>
      )}

      {/* Status Indicators */}
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        {voice.state.isListening && '🎤 Listening...'}
        {voice.state.isProcessing && '⚙️ Processing...'}
        {voice.state.isSpeaking && '🔊 Speaking...'}
        {voice.status === 'idle' && 'Ready'}
        {voice.status === 'error' && '❌ Error'}
      </div>

      {/* Feature Availability */}
      <div style={{ marginTop: '20px', fontSize: '11px', color: '#666' }}>
        <p>Web Speech API: {voice.isSupported ? '✅' : '❌'}</p>
        <p>Whisper API: {voice.hasWhisper ? '✅' : '❌'}</p>
        <p>Gemini API: {voice.hasGemini ? '✅' : '❌'}</p>
      </div>
    </div>
  );
}
```

---

## Phase 6: Integration with Existing Components

### Update UnifiedAIAssistant Component

Replace the microphone button with the new service:

```typescript
import { useVoiceService } from '@/hooks/use-voice-service';

export function UnifiedAIAssistant() {
  const userRole = getUserRole(); // Your existing function
  const voice = useVoiceService({
    language: 'en-IN',
    role: userRole,
    useWhisper: true,
    voiceOutputEnabled: true,
  });

  const handleMicClick = () => {
    if (voice.state.isListening) {
      voice.stopListening();
    } else {
      voice.startListening();
    }
  };

  return (
    <div>
      {/* Existing UI */}

      {/* Replace old mic button with enhanced version */}
      <button
        onClick={handleMicClick}
        className={`mic-button ${
          voice.state.isListening ? 'active' : ''
        } ${voice.state.isProcessing ? 'processing' : ''}`}
      >
        🎤
      </button>

      {/* Display confidence */}
      {voice.state.confidence > 0 && (
        <div className="confidence">
          Confidence: {Math.round(voice.state.confidence * 100)}%
        </div>
      )}

      {/* Display transcript */}
      {voice.state.transcript && (
        <div className="transcript">{voice.state.transcript}</div>
      )}

      {/* Display response */}
      {voice.state.response && (
        <div className="response">{voice.state.response}</div>
      )}

      {/* Display errors */}
      {voice.state.error && (
        <div className="error">
          {voice.state.error}
          <button onClick={voice.retry}>Retry</button>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 7: Error Handling Best Practices

### Handling Different Error Types

```typescript
function handleVoiceError(error: string, context: string) {
  // Microphone permission
  if (error.includes('permission') || error.includes('not allowed')) {
    console.log('User denied microphone access');
    // Show: "Please enable microphone in settings"
  }

  // No speech detected
  if (error.includes('no speech')) {
    console.log('No speech detected, retrying...');
    // Will auto-retry, no need to show error
  }

  // Network error
  if (error.includes('Network') || error.includes('network')) {
    console.log('Network error, will retry');
    // Show: "Checking connection..." with spinner
  }

  // Service unavailable
  if (error.includes('unavailable') || error.includes('service')) {
    console.log('Service not available');
    // Show: "Service temporarily unavailable"
  }

  // Rate limiting
  if (error.includes('rate limit')) {
    console.log('Rate limited, wait before retry');
    // Show: "Too many requests, please wait a moment"
  }

  // Unknown error
  console.error('Unknown voice error:', error, 'Context:', context);
  // Show: "Something went wrong, please try again"
}
```

### Retry Strategy

```typescript
// Automatic retry for recoverable errors
const voice = useVoiceService({...});

// If error occurs:
// 1. Web Speech API errors → Auto-retry up to 3 times
// 2. Whisper errors → Fallback to Web Speech
// 3. Gemini errors → Retry with exponential backoff (1s → 2s → 4s)

// Manual retry
if (voice.state.error) {
  voice.retry(); // Clears error and restarts
}
```

---

## Phase 8: Performance Optimization

### Tips for Better Recognition

```typescript
// Use context for better accuracy
const context = `You are helping a ${role} with medical questions. 
Previous context: The patient mentioned back pain earlier.`;

const result = await geminiClient.sendMessage(userMessage, context);
```

### Language-Specific Settings

```typescript
// Hindi
useEnhancedSpeechRecognition({
  lang: 'hi-IN',
  temperature: 0.3, // Less random for precise terms
});

// English
useEnhancedSpeechRecognition({
  lang: 'en-IN',
  temperature: 0.7, // More natural
});

// Kannada
useEnhancedSpeechRecognition({
  lang: 'kn-IN',
  temperature: 0.5,
});
```

---

## Phase 9: Testing the Implementation

### Test Web Speech API

```bash
# Open browser console
console.log(!!window.SpeechRecognition || !!window.webkitSpeechRecognition);
// Should return: true
```

### Test Whisper API

```typescript
// Ensure environment variable is set
console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
// Should show your API key

// Test transcription
const audioBlob = /* your audio */;
const result = await transcribeAudioWithWhisper(audioBlob, config);
console.log(result);
```

### Test Gemini API

```typescript
// Check initialization
const client = getGeminiClient();

// Send test message
const response = await client.sendMessage('Hello, how are you?');
console.log(response);
```

### Test Complete Flow

```typescript
const voice = useVoiceService({
  language: 'en-IN',
  role: 'patient',
});

// 1. Start listening
voice.startListening();
// → State: listening

// 2. Say something
// → Web Speech API or Whisper captures audio

// 3. Stop listening
voice.stopListening();
// → State: processing

// 4. Gemini processes
// → State: speaking (if voiceOutputEnabled)

// 5. Response spoken
// → State: idle
```

---

## Phase 10: Troubleshooting

| Issue | Solution |
|-------|----------|
| "Microphone not working" | Check browser permissions, try Chrome/Edge |
| "No speech detected" | Speak louder, reduce background noise, try again |
| "API key not recognized" | Verify .env.local has correct key, restart dev server |
| "Whisper not transcribing" | Check OpenAI account has credits, verify API key |
| "Gemini returning errors" | Check rate limits, verify API key, check network |
| "Text-to-speech not working" | Browser doesn't support it, try Chrome/Edge/Firefox |

---

## Complete Component Example

```typescript
'use client';

import { useVoiceService } from '@/hooks/use-voice-service';
import { useState } from 'react';

export function CompleteVoiceExample() {
  const voice = useVoiceService({
    language: 'en-IN',
    role: 'patient',
    useWhisper: true,
    voiceOutputEnabled: true,
  });

  const [history, setHistory] = useState<Array<{ role: string; text: string }>>([]);

  const handleStart = () => {
    voice.startListening();
  };

  const handleStop = async () => {
    await voice.stopListening();
    if (voice.state.response) {
      setHistory((prev) => [
        ...prev,
        { role: 'user', text: voice.state.transcript },
        { role: 'assistant', text: voice.state.response },
      ]);
    }
  };

  return (
    <div className="voice-assistant">
      {/* Status */}
      <div className="status">
        {voice.status === 'idle' && '👂 Ready to listen'}
        {voice.status === 'listening' && '🎤 Listening...'}
        {voice.status === 'processing' && '⚙️ Processing...'}
        {voice.status === 'speaking' && '🔊 Speaking...'}
        {voice.status === 'error' && '❌ Error'}
      </div>

      {/* Confidence */}
      {voice.state.confidence > 0 && (
        <div className="confidence">
          {Math.round(voice.state.confidence * 100)}% confident
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <button onClick={handleStart} disabled={voice.state.isListening}>
          🎤 Start
        </button>
        <button onClick={handleStop} disabled={!voice.state.isListening}>
          ⏹️ Stop
        </button>
        {voice.state.error && (
          <button onClick={voice.retry}>🔄 Retry</button>
        )}
      </div>

      {/* Transcript */}
      {voice.state.transcript && (
        <div className="transcript">
          <strong>You said:</strong> {voice.state.transcript}
        </div>
      )}

      {/* Response */}
      {voice.state.response && (
        <div className="response">
          <strong>Assistant:</strong> {voice.state.response}
        </div>
      )}

      {/* Error */}
      {voice.state.error && (
        <div className="error">
          <strong>Error:</strong> {voice.state.error}
        </div>
      )}

      {/* History */}
      <div className="history">
        {history.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role}:</strong> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Summary

You now have:

✅ **Enhanced Web Speech API** - Better error handling, retries, confidence scores  
✅ **Whisper Integration** - High-accuracy transcription with fallback  
✅ **Enhanced Gemini API** - Exponential backoff, rate limiting, retry logic  
✅ **Unified Voice Service** - One hook to rule them all  
✅ **Complete Documentation** - Copy-paste examples  

**Next Steps:**
1. Add environment variables to .env.local
2. Copy the provided hook files to your src/lib and src/hooks
3. Update your components to use useVoiceService
4. Test in browser with microphone
5. Monitor error logs for any issues

