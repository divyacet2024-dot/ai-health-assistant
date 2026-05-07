/**
 * Enhanced Voice Assistant Component
 * Demonstrates full integration of voice AI features
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useVoiceService } from '@/hooks/use-voice-service';
import type { UserRole } from '@/lib/types';

interface VoiceAssistantComponentProps {
  userRole: UserRole;
  language?: string;
  onTranscript?: (text: string) => void;
  onResponse?: (response: string) => void;
}

export function EnhancedVoiceAssistant({
  userRole,
  language = 'en-IN',
  onTranscript,
  onResponse,
}: VoiceAssistantComponentProps) {
  const voice = useVoiceService({
    language,
    role: userRole,
    useWhisper: true,
    voiceOutputEnabled: true,
  });

  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; timestamp: Date }>
  >([]);

  const [showApiStatus, setShowApiStatus] = useState(false);

  // Track transcript changes
  useEffect(() => {
    if (voice.state.transcript) {
      onTranscript?.(voice.state.transcript);
    }
  }, [voice.state.transcript, onTranscript]);

  // Track response changes
  useEffect(() => {
    if (voice.state.response) {
      onResponse?.(voice.state.response);
      // Add to history
      setConversationHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: voice.state.response,
          timestamp: new Date(),
        },
      ]);
    }
  }, [voice.state.response, onResponse]);

  // Add user message to history when transcript is added
  useEffect(() => {
    if (
      voice.state.transcript &&
      conversationHistory.length === 0 &&
      voice.state.response
    ) {
      setConversationHistory((prev) => [
        {
          role: 'user',
          text: voice.state.transcript,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    }
  }, [voice.state.transcript, voice.state.response, conversationHistory.length]);

  const handleStartListening = () => {
    setConversationHistory([]);
    voice.startListening();
  };

  const handleStopListening = async () => {
    await voice.stopListening();
  };

  const handleRetry = () => {
    voice.retry();
  };

  const handleClearHistory = () => {
    setConversationHistory([]);
  };

  const getStatusColor = () => {
    switch (voice.status) {
      case 'listening':
        return '#4CAF50'; // Green
      case 'processing':
        return '#2196F3'; // Blue
      case 'speaking':
        return '#FF9800'; // Orange
      case 'error':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const getStatusIcon = () => {
    switch (voice.status) {
      case 'listening':
        return '🎤';
      case 'processing':
        return '⚙️';
      case 'speaking':
        return '🔊';
      case 'error':
        return '❌';
      default:
        return '👂';
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🤖 Voice AI Assistant</h2>
        <button
          onClick={() => setShowApiStatus(!showApiStatus)}
          style={styles.statusButton}
        >
          ℹ️ APIs
        </button>
      </div>

      {/* API Status */}
      {showApiStatus && (
        <div style={styles.apiStatus}>
          <p>
            <strong>Web Speech:</strong>{' '}
            {voice.isSupported ? '✅ Available' : '❌ Not available'}
          </p>
          <p>
            <strong>Whisper:</strong>{' '}
            {voice.hasWhisper ? '✅ Configured' : '❌ Not configured'}
          </p>
          <p>
            <strong>Gemini:</strong>{' '}
            {voice.hasGemini ? '✅ Configured' : '❌ Not configured'}
          </p>
          <p>
            <strong>Language:</strong> {language}
          </p>
          <p>
            <strong>Role:</strong> {userRole}
          </p>
        </div>
      )}

      {/* Status Indicator */}
      <div
        style={{
          ...styles.statusIndicator,
          backgroundColor: getStatusColor(),
        }}
      >
        <span style={styles.statusIcon}>{getStatusIcon()}</span>
        <span style={styles.statusText}>
          {voice.status === 'idle' && 'Ready to listen'}
          {voice.status === 'listening' && 'Listening...'}
          {voice.status === 'processing' && 'Processing...'}
          {voice.status === 'speaking' && 'Speaking...'}
          {voice.status === 'error' && 'Error occurred'}
        </span>
      </div>

      {/* Confidence Score */}
      {voice.state.confidence > 0 && voice.status === 'listening' && (
        <div style={styles.confidenceBar}>
          <div style={styles.confidenceLabel}>
            Confidence: {Math.round(voice.state.confidence * 100)}%
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${voice.state.confidence * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Interim Transcript (Real-time) */}
      {voice.state.interimTranscript && (
        <div style={styles.interimTranscript}>
          <p style={styles.label}>Listening...</p>
          <p style={styles.interimText}>{voice.state.interimTranscript}</p>
        </div>
      )}

      {/* Final Transcript */}
      {voice.state.transcript && !voice.state.interimTranscript && (
        <div style={styles.transcript}>
          <p style={styles.label}>You said:</p>
          <p style={styles.transcriptText}>{voice.state.transcript}</p>
        </div>
      )}

      {/* Response */}
      {voice.state.response && (
        <div style={styles.response}>
          <p style={styles.label}>Assistant:</p>
          <p style={styles.responseText}>{voice.state.response}</p>
        </div>
      )}

      {/* Error Message */}
      {voice.state.error && (
        <div style={styles.error}>
          <p style={styles.errorLabel}>⚠️ Error</p>
          <p style={styles.errorText}>{voice.state.error}</p>
          <button onClick={handleRetry} style={styles.retryButton}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Controls */}
      <div style={styles.controls}>
        <button
          onClick={handleStartListening}
          disabled={voice.state.isListening || voice.state.isProcessing}
          style={{
            ...styles.button,
            ...styles.startButton,
            opacity:
              voice.state.isListening || voice.state.isProcessing ? 0.5 : 1,
            cursor:
              voice.state.isListening || voice.state.isProcessing
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          🎤 Start Listening
        </button>

        <button
          onClick={handleStopListening}
          disabled={!voice.state.isListening}
          style={{
            ...styles.button,
            ...styles.stopButton,
            opacity: !voice.state.isListening ? 0.5 : 1,
            cursor: !voice.state.isListening ? 'not-allowed' : 'pointer',
          }}
        >
          ⏹️ Stop
        </button>

        {voice.state.isSpeaking && (
          <button
            onClick={voice.stopSpeaking}
            style={{
              ...styles.button,
              ...styles.stopButton,
            }}
          >
            🔊 Stop Speaking
          </button>
        )}
      </div>

      {/* Secondary Controls */}
      <div style={styles.secondaryControls}>
        {voice.state.error && (
          <button onClick={handleRetry} style={styles.secondaryButton}>
            🔄 Retry
          </button>
        )}

        {conversationHistory.length > 0 && (
          <button onClick={handleClearHistory} style={styles.secondaryButton}>
            🗑️ Clear History
          </button>
        )}
      </div>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div style={styles.history}>
          <h3 style={styles.historyTitle}>Conversation History</h3>
          <div style={styles.historyList}>
            {conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.historyMessage,
                  backgroundColor:
                    msg.role === 'user' ? '#E3F2FD' : '#F1F8E9',
                  borderLeft:
                    msg.role === 'user'
                      ? '4px solid #2196F3'
                      : '4px solid #4CAF50',
                }}
              >
                <div style={styles.messageRole}>
                  {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
                </div>
                <p style={styles.messageText}>{msg.text}</p>
                <div style={styles.messageTime}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Indicator */}
      <div style={styles.features}>
        <p style={styles.featuresTitle}>✨ Features Enabled</p>
        <div style={styles.featuresList}>
          <span style={styles.feature}>
            {voice.isSupported ? '✅' : '⚠️'} Web Speech
          </span>
          <span style={styles.feature}>
            {voice.hasWhisper ? '✅' : '⚠️'} Whisper
          </span>
          <span style={styles.feature}>
            {voice.hasGemini ? '✅' : '⚠️'} Gemini
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  } as React.CSSProperties,

  title: {
    margin: 0,
    fontSize: '24px',
    color: '#333',
  } as React.CSSProperties,

  statusButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,

  apiStatus: {
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  } as React.CSSProperties,

  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    borderRadius: '8px',
    color: 'white',
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  statusIcon: {
    marginRight: '8px',
    fontSize: '24px',
  } as React.CSSProperties,

  statusText: {
    fontSize: '16px',
  } as React.CSSProperties,

  confidenceBar: {
    marginBottom: '16px',
  } as React.CSSProperties,

  confidenceLabel: {
    fontSize: '14px',
    marginBottom: '8px',
    color: '#666',
  } as React.CSSProperties,

  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  } as React.CSSProperties,

  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.3s ease',
  } as React.CSSProperties,

  interimTranscript: {
    padding: '12px',
    backgroundColor: '#E3F2FD',
    border: '1px solid #90CAF9',
    borderRadius: '4px',
    marginBottom: '16px',
  } as React.CSSProperties,

  transcript: {
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '16px',
  } as React.CSSProperties,

  response: {
    padding: '12px',
    backgroundColor: '#F1F8E9',
    border: '1px solid #C5E1A5',
    borderRadius: '4px',
    marginBottom: '16px',
  } as React.CSSProperties,

  error: {
    padding: '12px',
    backgroundColor: '#FFEBEE',
    border: '1px solid #EF9A9A',
    borderRadius: '4px',
    marginBottom: '16px',
  } as React.CSSProperties,

  label: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
  } as React.CSSProperties,

  interimText: {
    margin: 0,
    fontSize: '14px',
    color: '#1976D2',
    fontStyle: 'italic',
  } as React.CSSProperties,

  transcriptText: {
    margin: 0,
    fontSize: '14px',
    color: '#333',
  } as React.CSSProperties,

  responseText: {
    margin: 0,
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.5',
  } as React.CSSProperties,

  errorLabel: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#D32F2F',
  } as React.CSSProperties,

  errorText: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#C62828',
  } as React.CSSProperties,

  controls: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  } as React.CSSProperties,

  button: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  startButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  } as React.CSSProperties,

  stopButton: {
    backgroundColor: '#F44336',
    color: 'white',
  } as React.CSSProperties,

  retryButton: {
    padding: '6px 12px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '8px',
  } as React.CSSProperties,

  secondaryControls: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  } as React.CSSProperties,

  secondaryButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  } as React.CSSProperties,

  history: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #ddd',
  } as React.CSSProperties,

  historyTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  } as React.CSSProperties,

  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,

  historyMessage: {
    padding: '12px',
    borderRadius: '4px',
  } as React.CSSProperties,

  messageRole: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '4px',
  } as React.CSSProperties,

  messageText: {
    margin: '0',
    fontSize: '13px',
    color: '#333',
  } as React.CSSProperties,

  messageTime: {
    fontSize: '11px',
    color: '#999',
    marginTop: '4px',
  } as React.CSSProperties,

  features: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
  } as React.CSSProperties,

  featuresTitle: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
  } as React.CSSProperties,

  featuresList: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  } as React.CSSProperties,

  feature: {
    fontSize: '12px',
    color: '#333',
  } as React.CSSProperties,
};
