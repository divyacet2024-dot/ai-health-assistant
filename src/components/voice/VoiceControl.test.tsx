import { renderHook } from '@testing-library/react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

// Mock the browser SpeechRecognition API
global.SpeechRecognition = global.SpeechRecognition || (global as any).webkitSpeechRecognition;

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    // Mock the SpeechRecognition constructor
    (global as any).SpeechRecognition = class MockSpeechRecognition {
      continuous: boolean = false;
      interimResults: boolean = false;
      lang: string = 'en-US';
      maxAlternatives: number = 1;
      
      onstart: (() => void) | null = null;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      
      start() {
        this.onstart?.();
      }
      
      stop() {
        this.onend?.();
      }
      
      simulateResult(transcript: string, isFinal: boolean = true) {
        this.onresult?.({
          resultIndex: 0,
          results: [[{ transcript, isFinal }]]
        });
      }
      
      simulateError(error: string) {
        this.onerror?.({ error });
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('should start and stop listening', async () => {
    const { result } = renderHook(() => useSpeechRecognition());
    
    result.current.startListening();
    expect(result.current.isListening).toBe(true);
    
    result.current.stopListening();
    expect(result.current.isListening).toBe(false);
  });

  it('should handle speech results', async () => {
    const onResult = jest.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onResult })
    );
    
    result.current.startListening();
    
    // Simulate a speech result
    (result.current as any).recognitionRef.current.simulateResult('Hello world', true);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(onResult).toHaveBeenCalledWith('Hello world');
    expect(result.current.transcript).toContain('Hello world');
  });

  it('should handle no-speech errors with retry', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ 
        onResult: jest.fn(),
        onError,
        maxNoSpeechRetries: 2 
      })
    );
    
    result.current.startListening();
    
    // Simulate no-speech error
    (result.current as any).recognitionRef.current.simulateError('no-speech');
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Should have retried
    expect(onError).not.toHaveBeenCalled();
  });
});