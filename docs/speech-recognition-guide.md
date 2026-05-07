# Speech Recognition Hook - Implementation Guide

## Overview

The improved `useSpeechRecognition` hook provides a robust, production-ready solution for implementing voice input in web applications. It addresses common issues with browser SpeechRecognition API and provides a clean, type-safe interface.

## Key Improvements Over Legacy Code

### 1. **Proper TypeScript Support**
```typescript
export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;  // NEW: Real-time feedback
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  toggleListening: () => void;  // NEW: Convenience method
}
```

### 2. **Interim Results for Better UX**
- Real-time transcription feedback
- Users see their words as they're spoken
- Separate `onResult` (final) and `onInterimResult` callbacks

### 3. **Enhanced Error Handling**
```typescript
// Legacy: Basic error handling
recognition.onerror = (event: any) => {
  console.error("Speech recognition error:", event.error);
  // Limited retry logic
};

// Improved: Comprehensive error handling
recognition.onerror = (event: any) => {
  const errorType = event.error;
  
  // Distinguish fatal vs non-fatal errors
  const fatalErrors = ['not-allowed', 'service-not-allowed', 'aborted'];
  const isFatal = fatalErrors.includes(errorType);
  
  // Special handling for 'no-speech' (not an error)
  if (errorType === 'no-speech') {
    // Auto-retry with configurable limit
  }
  
  // Network error recovery
  if (errorType === 'network') {
    // Auto-retry with backoff
  }
  
  // Fatal errors stop auto-restart
  if (isFatal) {
    isFatalErrorRef.current = true;
  }
};
```

### 4. **No More Infinite Loop**
The legacy code had a critical issue:
```typescript
recognition.onend = () => {
  console.log("🔁 Restarting recognition...");
  recognition.start(); // AUTO RESTART - NO CONTROL!
};
```

This caused **uncontrolled recursion** because:
1. `onend` fires after stop or error
2. Calling `start()` triggers another `onend`
3. Infinite loop unless manually stopped

**Solution:**
```typescript
let isFatal = false;
let isStoppedManually = false;

recognition.onend = () => {
  if (!isStoppedManually && continuous && !isFatal) {
    // Only auto-restart under controlled conditions
    setTimeout(() => recognition.start(), 100);
  }
};

recognition.onerror = (event: any) => {
  if (['not-allowed', 'service-not-allowed', 'aborted'].includes(event.error)) {
    isFatal = true; // Prevent further restart attempts
  }
};
```

### 5. **Manual Stop Control**
```typescript
const stopListening = () => {
  isStoppedManuallyRef.current = true; // Signal to prevent auto-restart
  clearRestartTimeout();
  recognitionRef.current?.stop();
};
```

### 6. **Configurable Options**
```typescript
interface Options {
  lang?: string;                    // Language (BCP 47)
  continuous?: boolean;             // Keep listening
  interimResults?: boolean;          // Real-time feedback
  maxAlternatives?: number;          // Result alternatives
  retryDelayNoSpeech?: number;       // No-speech retry delay
  retryDelayNetwork?: number;        // Network retry delay
  maxNoSpeechRetries?: number;       // Max retry attempts
  autoRestartOnSilence?: boolean;    // Auto-restart toggle
  autoRestartDelay?: number;         // Restart delay
  onResult?: (text: string) => void; // Final result handler
  onInterimResult?: (text: string) => void; // Interim handler
  onError?: (error: string) => void; // Error handler
  onStart?: () => void;              // Start handler
  onStop?: () => void;               // Stop handler
}
```

### 7. **Memory Leak Prevention**
```typescript
useEffect(() => {
  // ... initialization ...
  
  return () => {
    clearRestartTimeout(); // Clear pending timeouts
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop(); // Stop recognition
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  };
}, [dependencies]);
```

### 8. **Stable Function References**
```typescript
// Prevents unnecessary re-renders
const startListening = useCallback(() => { ... }, [
  isSupported,
  clearRestartTimeout,
  resetRetryCount,
  onError,
]);

const stopListening = useCallback(() => { ... }, [
  clearRestartTimeout,
  resetRetryCount,
  onStop,
]);

// Memoized return value
return useMemo(() => ({
  isListening,
  transcript,
  interimTranscript,
  isSupported,
  error,
  startListening,
  stopListening,
  resetTranscript,
  toggleListening,
}), [dependencies]);
```

## Migration Guide

### Before (Legacy Code)
```typescript
const SpeechRecognition = window.SpeechRecognition || 
  (window as any).webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "kn-IN";
recognition.continuous = true;
recognition.interimResults = true;

recognition.onstart = () => {
  console.log("🎤 Listening started...");
};

recognition.onresult = (event: any) => {
  let transcript = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript;
  }
  handleUserMessage(transcript);
};

recognition.onend = () => {
  console.log("🔁 Restarting recognition...");
  recognition.start(); // 🚨 INFINITE LOOP!
};
```

### After (Improved Hook)
```typescript
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

function VoiceInput() {
  const { 
    isListening, 
    transcript,
    interimTranscript, // Real-time preview
    isSupported,
    error,
    startListening, 
    stopListening,
    toggleListening 
  } = useSpeechRecognition({
    lang: 'kn-IN',
    continuous: true,
    interimResults: true,
    onResult: (text) => {
      handleUserMessage(text);
    },
    onError: (error) => {
      console.error('Speech error:', error);
    },
  });
  
  return (
    <div>
      <button 
        onClick={toggleListening}
        disabled={!isSupported}
      >
        {isListening ? 'Stop' : 'Start'}
      </button>
      
      {interimTranscript && (
        <p className="text-muted-foreground">
          {interimTranscript}
        </p>
      )}
      
      {transcript && (
        <p>{transcript}</p>
      )}
      
      {error && (
        <p className="text-red-500">{error}</p>
      )}
    </div>
  );
}
```

## Language Support

The hook works with any BCP 47 language code:

```typescript
// English (US)
useSpeechRecognition({ lang: 'en-US' });

// Kannada (India)
useSpeechRecognition({ lang: 'kn-IN' });

// Hindi (India)
useSpeechRecognition({ lang: 'hi-IN' });

// Telugu (India)
useSpeechRecognition({ lang: 'te-IN' });
```

## Error Handling Best Practices

### 1. Check Browser Support
```typescript
if (!isSupported) {
  return <div>Speech recognition not available in this browser</div>;
}
```

### 2. Handle Permission Denial
```typescript
const onError = (error: string) => {
  if (error === 'not-allowed') {
    // Show instruction to enable microphone
    setShowPermissionModal(true);
  }
};
```

### 3. Implement Retry Logic
```typescript
const retryDelayNoSpeech = 500; // 500ms between retries
const maxNoSpeechRetries = 5;    // Stop after 5 attempts
```

### 4. Provide User Feedback
```typescript
{isListening && (
  <div className="animate-pulse">
    <Mic className="w-6 h-6" />
    <span>Listening... {interimTranscript}</span>
  </div>
)}

{error && (
  <div className="text-red-500">
    {error}
  </div>
)}
```

## Common Pitfalls to Avoid

### ❌ Don't: Create new instance on every render
```typescript
function BadComponent() {
  const [recognition] = useState(() => new SpeechRecognition());
  // This can cause issues with cleanup
}
```

### ✅ Do: Use ref for persistent instance
```typescript
const recognitionRef = useRef<SpeechRecognition | null>(null);

useEffect(() => {
  recognitionRef.current = new SpeechRecognition();
}, []);
```

### ❌ Don't: Forget cleanup
```typescript
useEffect(() => {
  const recognition = new SpeechRecognition();
  // No cleanup - memory leak!
}, []);
```

### ✅ Do: Clean up on unmount
```typescript
useEffect(() => {
  const recognition = new SpeechRecognition();
  return () => {
    recognition.stop();
  };
}, []);
```

### ❌ Don't: Ignore fatal errors
```typescript
recognition.onerror = (event) => {
  // Always restarts, even on permission denial
  recognition.start();
};
```

### ✅ Do: Track error state
```typescript
let isFatal = false;

recognition.onerror = (event) => {
  if (['not-allowed', 'service-not-allowed'].includes(event.error)) {
    isFatal = true; // Stop auto-restart
  }
};

recognition.onend = () => {
  if (!isFatal) {
    recognition.start();
  }
};
```

## Performance Considerations

1. **Use `useCallback`** for stable function references
2. **Use `useMemo`** for the return value to prevent unnecessary re-renders
3. **Debounce rapid events** if processing results is expensive
4. **Limit history size** when storing transcripts
5. **Throttle interim results** if updating UI frequently

## Browser Compatibility

| Browser | Support | Prefix |
|---------|---------|--------|
| Chrome | ✅ | `webkitSpeechRecognition` |
| Edge | ✅ | `webkitSpeechRecognition` |
| Safari | ❌ | Not supported |
| Firefox | ❌ | Not supported |

**Note:** The hook handles the `webkit` prefix automatically.

## Testing

```bash
# Run tests
npm test -- use-speech-recognition

# Test in browser
# 1. Visit /test-speech
# 2. Allow microphone permission
# 3. Speak and observe results
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Speech recognition not supported" | Use Chrome or Edge browser |
| "Microphone permission denied" | Check browser settings, enable microphone |
| No results on `onend` | Ensure `continuous` is `true` |
| Infinite restart loop | Check `isFatalError` and `isStoppedManually` flags |
| Laggy transcription | Reduce `maxAlternatives`, disable `interimResults` |

## Complete Example

See `/web/src/components/UnifiedAIAssistant.tsx` for a full production implementation.
