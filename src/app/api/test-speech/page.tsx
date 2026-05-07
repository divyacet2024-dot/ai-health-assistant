'use client';

import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

export default function TestSpeechPage() {
  const [mounted, setMounted] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (msg: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    toggleListening,
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    retryDelayNoSpeech: 500,
    retryDelayNetwork: 2000,
    maxNoSpeechRetries: 5,
    autoRestartOnSilence: true,
    autoRestartDelay: 100,
    onResult: (text) => {
      addResult(`Final result: "${text}"`);
    },
    onInterimResult: (text) => {
      console.log('Interim:', text);
    },
    onError: (err) => {
      addResult(`Error: ${err}`);
    },
    onStart: () => {
      addResult('Listening started');
    },
    onStop: () => {
      addResult('Listening stopped');
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Speech Recognition Hook Test</h1>
        
        <div className="bg-card rounded-xl p-6 mb-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Hook State</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-muted-foreground">isSupported</label>
              <div className="font-mono text-lg">{isSupported.toString()}</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">isListening</label>
              <div className="font-mono text-lg">{isListening.toString()}</div>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm text-muted-foreground">Final Transcript</label>
            <div className="font-mono bg-muted p-3 rounded-lg min-h-[60px]">
              {transcript || <span className="text-muted-foreground">(empty)</span>}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm text-muted-foreground">Interim Transcript (Live)</label>
            <div className="font-mono bg-muted p-3 rounded-lg min-h-[40px] text-blue-500">
              {interimTranscript || <span className="text-muted-foreground">(no interim results)</span>}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Error</label>
            <div className="font-mono bg-red-500/10 p-3 rounded-lg min-h-[40px] text-red-500">
              {error || <span className="text-muted-foreground">(none)</span>}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 mb-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={startListening}
              disabled={!isSupported || isListening}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Start Listening
            </button>
            <button
              onClick={stopListening}
              disabled={!isListening}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Stop Listening
            </button>
            <button
              onClick={toggleListening}
              disabled={!isSupported}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Toggle
            </button>
            <button
              onClick={() => {
                resetTranscript();
                setTestResults([]);
              }}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition"
            >
              Reset All
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Event Log</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No events yet. Start listening to test the hook.</p>
            ) : (
              testResults.map((result, i) => (
                <div key={i} className="font-mono text-sm bg-muted p-3 rounded-lg">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
