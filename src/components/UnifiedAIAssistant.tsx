'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  Mic, Send, ChevronLeft, Heart, GraduationCap, Stethoscope, BookOpen,
  Users, AlertTriangle, Shield, ArrowRight, Phone, MapPin, Brain,
  ChevronDown, Settings, Volume2, VolumeX, Smile, Frown, Meh,
  Zap, Clock, CheckCircle, Star, Flame, Trophy, Target, Gift, Lightbulb,
  Baby, HeartPulse, Droplets, Moon, Apple, Dumbbell, Brain as BrainIcon,
  Sparkles, Bot, User, X, Plus, Minus, Info, Siren, MessageSquare, Calendar, Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import { ROLES } from '@/lib/types';

// ========== INTENT DETECTION ==========

interface DetectedIntent {
  type: 'emergency' | 'patient_symptom' | 'appointment' | 'medicine' | 
        'student_query' | 'doctor_consult' | 'professor_request' | 
        'general' | 'greeting' | 'thanks';
  confidence: number;
  keywords: string[];
  extractedInfo: any;
}

const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'cardiac arrest', 'can\'t breathe', 'breathing problem',
  'help', 'emergency', 'urgent', 'critical', 'unconscious', 'fainted', 'collapsed',
  'severe pain', 'bleeding', 'heavy bleeding', 'blood', 'ambulance', '911', '999', '108',
  'stroke', 'seizure', 'allergic reaction', 'anaphylaxis', 'choking', 'drowning',
  'poisoning', 'overdose', 'suicide', 'kill myself', 'hurt myself', 'self harm'
];

const PATIENT_SYMPTOM_KEYWORDS = [
  'headache', 'fever', 'cold', 'cough', 'flu', 'sore throat', 'stomach',
  'nausea', 'vomit', 'diarrhea', 'constipation', 'abdominal pain', 'cramp',
  'pain', 'ache', 'rash', 'itch', 'allergy', 'acidity', 'gas', 'bloating',
  'diabetes', 'sugar', 'blood pressure', 'bp', 'hypertension', 'sleep',
  'insomnia', 'anxiety', 'stress', 'depression', 'weight', 'obesity',
  'diet', 'exercise', 'fatigue', 'weakness', 'dizzy', 'vertigo'
];

const MEDICINE_KEYWORDS = [
  'medicine', 'medication', 'drug', 'tablet', 'pill', 'capsule', 'syrup',
  'dosage', 'prescription', 'paracetamol', 'ibuprofen', 'antibiotic',
  'side effect', 'interaction', 'how to take', 'when to take'
];

const APPOINTMENT_KEYWORDS = [
  'appointment', 'book', 'schedule', 'visit', 'consult', 'doctor',
  'meeting', 'slot', 'token', 'time', 'date', 'hospital', 'checkup'
];

const GREETING_KEYWORDS = [
  'hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon',
  'namaste', 'hola', 'bonjour', 'hi there', 'hello there'
];

const THANKS_KEYWORDS = [
  'thank', 'thanks', 'appreciate', 'helpful', 'great', 'awesome', 'nice'
];

function detectIntent(text: string, role: UserRole): DetectedIntent {
  const lower = text.toLowerCase().trim();
  
  // Check greetings first
  for (const kw of GREETING_KEYWORDS) {
    if (lower.includes(kw)) {
      return { type: 'greeting', confidence: 0.9, keywords: [kw], extractedInfo: {} };
    }
  }
  
  // Check emergency - HIGHEST PRIORITY
  for (const kw of EMERGENCY_KEYWORDS) {
    if (lower.includes(kw)) {
      return { type: 'emergency', confidence: 0.95, keywords: [kw], extractedInfo: { severity: 'high' } };
    }
  }
  
  // Check patient symptoms
  if (role === 'patient' || role === 'student' || role === 'doctor' || role === 'professor') {
    for (const kw of PATIENT_SYMPTOM_KEYWORDS) {
      if (lower.includes(kw)) {
        return { type: 'patient_symptom', confidence: 0.7, keywords: [kw], extractedInfo: { symptom: kw } };
      }
    }
  }
  
  // Role-specific intents
  if (role === 'patient') {
    for (const kw of APPOINTMENT_KEYWORDS) {
      if (lower.includes(kw)) {
        return { type: 'appointment', confidence: 0.75, keywords: [kw], extractedInfo: { action: 'book' } };
      }
    }
    for (const kw of MEDICINE_KEYWORDS) {
      if (lower.includes(kw)) {
        return { type: 'medicine', confidence: 0.7, keywords: [kw], extractedInfo: { action: 'info' } };
      }
    }
  }
  
  if (role === 'doctor') {
    if (lower.includes('patient') || lower.includes('case') || lower.includes('diagnosis')) {
      return { type: 'doctor_consult', confidence: 0.65, keywords: ['patient', 'diagnosis'], extractedInfo: {} };
    }
  }
  
  if (role === 'student') {
    if (lower.includes('study') || lower.includes('learn') || lower.includes('explain') || lower.includes('teach')) {
      return { type: 'student_query', confidence: 0.65, keywords: ['study', 'learn'], extractedInfo: {} };
    }
    for (const cat of ['anatomy', 'physiology', 'pharmacology', 'pathology', 'microbiology']) {
      if (lower.includes(cat)) {
        return { type: 'student_query', confidence: 0.8, keywords: [cat], extractedInfo: { subject: cat } };
      }
    }
  }
  
  if (role === 'professor') {
    if (lower.includes('teach') || lower.includes('lecture') || lower.includes('student') || lower.includes('material')) {
      return { type: 'professor_request', confidence: 0.7, keywords: ['teach', 'lecture'], extractedInfo: {} };
    }
  }
  
  // Check thanks
  for (const kw of THANKS_KEYWORDS) {
    if (lower.includes(kw)) {
      return { type: 'thanks', confidence: 0.8, keywords: [kw], extractedInfo: {} };
    }
  }
  
  return { type: 'general', confidence: 0.5, keywords: [], extractedInfo: {} };
}

// ========== SYSTEM PROMPTS ==========

const SYSTEM_PROMPTS: Record<UserRole, string> = {
  patient: 'You are AI Health Assist, a friendly and empathetic health assistant for patients. Provide helpful, accurate information about health concerns, symptoms, medications, and wellness. Encourage healthy habits and always remind users to consult healthcare professionals for serious concerns. Be supportive, clear, and use simple language. Never diagnose conditions or prescribe treatments.',
  student: 'You are AI Health Assist Study Tutor, an expert medical education AI. Explain medical concepts clearly with clinical correlations, helpful mnemonics, and practical tips. Cover anatomy, physiology, pharmacology, pathology, microbiology, medicine, and surgery. Help students understand complex concepts and prepare for exams. Encourage active learning and clinical thinking.',
  doctor: 'You are AI Health Assist Clinical Assistant, a professional AI for doctors. Provide differential diagnosis suggestions, evidence-based treatment guidelines, drug interaction warnings, and clinical scoring systems. Note this is for informational purposes and recommend clinical judgment. Be concise, clinically focused, and cite relevant guidelines when possible.',
  professor: 'You are AI Health Assist Teaching Assistant, an AI for medical professors. Help create teaching materials, suggest engaging assessment methods, answer complex medical queries, and organize educational content. Support curriculum design and student engagement strategies. Be scholarly and pedagogical in your approach.'
};

const ROLE_GREETINGS: Record<UserRole, string> = {
  patient: "Hello! I'm your AI Health Assistant. I can help you with health questions, medicine information, understanding lab reports, and more. How can I help you today?",
  student: "Hi there! I'm your AI Medical Tutor. Ask me about any medical topic — anatomy, physiology, pharmacology, pathology, or clinical subjects. I'll explain concepts clearly with clinical correlations. What would you like to learn?",
  doctor: "Good day, Doctor. I'm your AI Clinical Assistant. I can help with differential diagnosis suggestions, drug interaction checks, treatment guidelines, and clinical decision support. How can I assist?",
  professor: "Welcome, Professor. I'm your AI Teaching Assistant. I can help create teaching materials, suggest assessment methods, answer complex medical queries, and organize resources. What do you need?",
};

interface Message {
  id?: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  source?: 'gemini' | 'fallback';
}

interface UnifiedAIAssistantProps {
  role: UserRole;
  onNavigate?: (path: string) => void;
}

export function UnifiedAIAssistant({ role, onNavigate }: UnifiedAIAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentIntent, setCurrentIntent] = useState<DetectedIntent | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const roleInfo = ROLES[role];
  
  // Detect browser support
  useEffect(() => {
    setMounted(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
    speechSynthesisRef.current = window.speechSynthesis;
  }, []);
  
  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);
  
  // ========== VOICE RECOGNITION ==========
  
  const startListening = useCallback(() => {
    if (!voiceSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setIsProcessing(false);
    };
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setRecognizedText(transcript);
      setIsListening(false);
      
      const userMessage: Message = { text: transcript, isUser: true, timestamp: new Date() };
      setConversationHistory(prev => [...prev, userMessage]);
      
      processMessage(transcript);
    };
    
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsProcessing(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.start();
  }, [voiceSupported]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);
  
  // ========== TEXT-TO-SPEECH ==========
  
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !speechSynthesisRef.current) return;
    
    setIsSpeaking(true);
    speechSynthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };
    
    speechSynthesisRef.current.speak(utterance);
  }, [voiceEnabled]);
  
  const stopSpeaking = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);
  
  // ========== AGENT REASONING & DECISION ENGINE ==========
  
  const createAgentReasoning = (text: string, intent: DetectedIntent, role: UserRole) => {
    const analysis = `Analyzing user query: "${text.slice(0, 100)}". Detected intent: ${intent.type} with confidence ${intent.confidence}. User role: ${role}. Context: ${intent.extractedInfo && Object.keys(intent.extractedInfo).length > 0 ? JSON.stringify(intent.extractedInfo) : 'No specific context extracted.'}`;
    
    let decision = '';
    if (intent.type === 'emergency') {
      decision = 'CRITICAL: Emergency detected. Override LLM with safety protocol. Provide immediate guidance and redirect to emergency services.';
    } else if (intent.type === 'greeting') {
      decision = 'User greeted. Respond with role-appropriate greeting and offer assistance.';
    } else if (intent.type === 'thanks') {
      decision = 'User expressed thanks. Acknowledge politely and offer further help.';
    } else {
      decision = `Query requires contextual response. Use LLM with ${role}-specific system prompt for personalized assistance.`;
    }
    
    return { analysis, decision };
  };
  
  // ========== ACTION/TOOL SYSTEM ==========
  
  const executeAction = (intent: DetectedIntent) => {
    if (!onNavigate) return;
    
    switch (intent.type) {
      case 'emergency':
        setTimeout(() => onNavigate('/dashboard/emergency'), 1500);
        break;
      case 'appointment':
        setTimeout(() => onNavigate('/dashboard/appointments'), 1000);
        break;
      case 'medicine':
        setTimeout(() => onNavigate('/dashboard/medicine'), 1000);
        break;
    }
  };
  
  // ========== MESSAGE PROCESSING ==========
  
  const processMessage = async (message: string) => {
    setIsProcessing(true);
    
    // Detect intent (emergency detection overrides everything)
    const intent = detectIntent(message, role);
    setCurrentIntent(intent);
    
    // EMERGENCY DETECTION - Takes priority over LLM
    if (intent.type === 'emergency') {
      const emergencyResponse = 'dYs" **EMERGENCY DETECTED!** dYs"\n\nIf this is a real emergency, **call 108 immediately** or go to the nearest hospital.\n\nI\'m activating emergency protocols. Would you like me to show you the emergency response procedures?';
      
      const aiMessage: Message = { 
        text: emergencyResponse, 
        isUser: false, 
        timestamp: new Date(),
        source: 'fallback'
      };
      setConversationHistory(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      
      if (voiceEnabled) speak(emergencyResponse);
      executeAction(intent);
      return;
    }
    
    // Quick responses for greetings and thanks (bypass LLM for speed)
    const isGreeting = GREETING_KEYWORDS.some(kw => message.toLowerCase().includes(kw));
    const isThanks = THANKS_KEYWORDS.some(kw => message.toLowerCase().includes(kw));
    
    if (isThanks) {
      const thanksResponse = "You're welcome! I'm glad I could help. Is there anything else you need assistance with today?";
      const aiMessage: Message = { 
        text: thanksResponse, 
        isUser: false, 
        timestamp: new Date(),
        source: 'fallback'
      };
      setConversationHistory(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      if (voiceEnabled) speak(thanksResponse);
      return;
    }
    
    if (isGreeting) {
      const greetingResponse = ROLE_GREETINGS[role];
      const aiMessage: Message = { 
        id: 'greeting',
        text: greetingResponse, 
        isUser: false, 
        timestamp: new Date(),
        source: 'fallback'
      };
      setConversationHistory(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      if (voiceEnabled) speak(greetingResponse);
      return;
    }
    
    // Use Gemini API via Next.js route handler for LLM-powered responses
    // Include conversation history for context preservation
    const chatHistory = conversationHistory
      .filter(m => m.id !== 'greeting')
      .slice(-10) // Last 10 messages for context window
      .map(m => ({
        role: m.isUser ? 'user' : 'assistant' as const,
        content: m.text,
      }));
    
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userRole: role,
          history: chatHistory,
        }),
      });
      
      const json = await res.json();
      
      if (json.success && json.data) {
        const aiMessage: Message = {
          text: json.data.content,
          isUser: false,
          timestamp: new Date(),
          source: json.data.source || 'gemini',
        };
        setConversationHistory(prev => [...prev, aiMessage]);
        setIsProcessing(false);
        
        if (voiceEnabled) {
          speak(json.data.content);
        }
      } else {
        throw new Error(json.error || 'Failed to get AI response');
      }
    } catch (error: any) {
      console.error('AI chat error:', error);
      
      // Fallback responses
      const fallbacks = {
        patient: 'Connection issue. For health concerns, stay hydrated and rest. Monitor symptoms. Need immediate help? Call 108.',
        student: 'Connection issue. Focus on understanding mechanisms, not just memorization. Create diagrams and use mnemonics!',
        doctor: 'Service unavailable. Rely on current clinical guidelines and institutional protocols for decision-making.',
        professor: 'Service unavailable. Try interactive case-based discussions or peer-teaching strategies.'
      };
      
      const fb = fallbacks[role];
      const aiMessage: Message = { 
        text: fb, 
        isUser: false, 
        timestamp: new Date(),
        source: 'fallback'
      };
      setConversationHistory(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      if (voiceEnabled) speak(fb);
    }
  };
  
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recognizedText.trim()) return;
    
    const userMessage: Message = { 
      text: recognizedText, 
      isUser: true, 
      timestamp: new Date() 
    };
    setConversationHistory(prev => [...prev, userMessage]);
    
    processMessage(recognizedText);
    setRecognizedText('');
  };
  
  const handleEmergencyAction = () => {
    if (onNavigate) {
      onNavigate('/dashboard/emergency');
    }
  };
  
  const handleIntentAction = () => {
    if (!currentIntent || !onNavigate) return;
    
    switch (currentIntent.type) {
      case 'patient_symptom':
        onNavigate('/dashboard/chat');
        break;
      case 'appointment':
        onNavigate('/dashboard/appointments');
        break;
      case 'medicine':
        onNavigate('/dashboard/medicine');
        break;
      case 'student_query':
        onNavigate('/dashboard/chat');
        break;
    }
  };
  
  if (!mounted) return null;
  
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('/select-role')}
              className="p-2 rounded-xl hover:bg-muted transition"
              aria-label="Switch profile"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', roleInfo.bgColor)}>
                <span className="text-lg">{roleInfo.icon}</span>
              </div>
              <div>
                <p className="text-sm font-semibold">{roleInfo.label}</p>
                <p className="text-xs text-muted-foreground">{getTimeGreeting()}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleEmergencyAction}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition"
          >
            <Siren className="w-4 h-4" />
            Emergency
          </button>
        </div>
        
        <div className="px-4 py-2 flex items-center justify-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full transition-all',
            voiceEnabled 
              ? 'bg-green-500 shadow-[0_0_8px_theme(colors.green.500)] animate-pulse'
              : 'bg-muted-foreground'
          )} />
          <span className="text-xs text-muted-foreground">
            {voiceEnabled ? 'Voice Assistant Active' : 'Voice Disabled'}
          </span>
          {voiceSupported && (
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="ml-2 p-1 rounded-lg hover:bg-muted transition"
              aria-label={voiceEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4 text-primary" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />
        </div>

        {/* ========== CONVERSATION AREA ========== */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 max-w-2xl mx-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          
          {/* Welcome Message */}
          {conversationHistory.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className={cn(
                  'w-32 h-32 rounded-full flex items-center justify-center mb-6',
                  roleInfo.bgColor,
                  'shadow-2xl shadow-primary/10'
                )}
              >
                <Brain className="w-16 h-16 text-primary/90" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-display font-bold mb-3"
              >
                {getTimeGreeting()}, {roleInfo.label}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground mb-8"
              >
                Your AI-powered healthcare assistant
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  'w-24 h-24 rounded-full flex items-center justify-center mb-8 cursor-pointer transition-all hover:scale-105',
                  isListening 
                    ? 'bg-red-100 border-2 border-red-300 animate-pulse' 
                    : 'bg-primary/10 border-2 border-primary/30 hover:border-primary/50'
                )}
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? (
                  <div className="relative">
                    <Mic className="w-8 h-8 text-red-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  </div>
                ) : (
                  <Mic className="w-8 h-8 text-primary" />
                )}
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground mb-2"
              >
                {isListening ? 'Listening...' : 'Tap to speak or use text input'}
              </motion.p>
              
              {voiceSupported && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-muted-foreground/70"
                >
                  {voiceEnabled ? 'Voice feedback enabled' : 'Click volume icon to enable voice'}
                </motion.p>
              )}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 max-w-xs"
              >
                <div className="bg-muted/50 border border-border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                    This is not a medical diagnosis system. Always consult healthcare professionals.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Messages List */}
          <AnimatePresence initial={false}>
            {conversationHistory.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  'flex gap-3 mb-4',
                  msg.isUser ? 'justify-end' : 'justify-start'
                )}
              >
                {!msg.isUser && (
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1',
                    roleInfo.bgColor
                  )}>
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.isUser
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  )}
                >
                  {msg.text}
                </div>
                {msg.isUser && (
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Processing Indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-2 text-xs text-muted-foreground">AI is thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
          
          {/* No messages yet - show quick actions */}
          {conversationHistory.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 space-y-4"
            >
              <p className="text-center text-sm text-muted-foreground">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3 px-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate?.('/dashboard/health-log')}
                  className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition text-left"
                >
                  <Heart className="w-5 h-5 text-chart-1 mb-2" />
                  <p className="text-sm font-medium">Health Log</p>
                  <p className="text-xs text-muted-foreground">Track symptoms</p>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate?.('/dashboard/chat')}
                  className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition text-left"
                >
                  <MessageSquare className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-medium">AI Chat</p>
                  <p className="text-xs text-muted-foreground">Ask questions</p>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate?.('/dashboard/appointments')}
                  className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition text-left"
                >
                  <Calendar className="w-5 h-5 text-chart-3 mb-2" />
                  <p className="text-sm font-medium">Book Visit</p>
                  <p className="text-xs text-muted-foreground">Make appointment</p>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate?.('/dashboard/medicine')}
                  className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition text-left"
                >
                  <Pill className="w-5 h-5 text-chart-2 mb-2" />
                  <p className="text-sm font-medium">Medicines</p>
                  <p className="text-xs text-muted-foreground">Drug info</p>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* ========== INPUT AREA ========== */}
      <div className="sticky bottom-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border">
        {/* Emergency Alert Banner */}
        {currentIntent?.type === 'emergency' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border-b border-destructive/20 px-4 py-2"
          >
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Emergency Detected - Call 108 for real emergencies</span>
            </div>
          </motion.div>
        )}
        
        {/* Disclaimer Banner */}
        {conversationHistory.length === 0 && (
          <div className="bg-muted/50 border-b border-border px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">
              <Info className="w-3 h-3 inline mr-1 mb-0.5" />
              AI assistant for informational purposes only. Not a substitute for professional medical care.
            </p>
          </div>
        )}
        
        {/* Text Input */}
        <form onSubmit={handleTextSubmit} className="p-4">
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!voiceSupported}
              className={cn(
                'p-3 rounded-xl transition-all flex-shrink-0',
                !voiceSupported
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : isListening
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isListening ? (
                <div className="relative">
                  <Mic className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            
            <input
              type="text"
              value={recognizedText}
              onChange={(e) => setRecognizedText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit(e as any);
                }
              }}
              placeholder={
                voiceSupported
                  ? "Type message or tap mic to speak..."
                  : "Type your message..."
              }
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            />
            
            <button
              type="submit"
              disabled={!recognizedText.trim() || isProcessing}
              className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-40 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        {/* Status Bar */}
        <div className="px-4 pb-3 pt-1 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {isSpeaking && <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Speaking...</span>}
            {isProcessing && <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Processing...</span>}
          </div>
          <span>AI assistant • Always verify with healthcare professionals</span>
        </div>
      </div>
    </div>
  );
}
