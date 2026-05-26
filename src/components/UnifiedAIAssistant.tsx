'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic, Send, ChevronLeft, Heart, GraduationCap, Stethoscope, BookOpen,
  Users, AlertTriangle, Shield, ArrowRight, Phone, MapPin, Brain,
  ChevronDown, Settings, Volume2, VolumeX, Smile, Frown, Meh,
  Zap, Clock, CheckCircle, Star, Flame, Trophy, Target, Gift, Lightbulb,
  Baby, HeartPulse, Droplets, Moon, Apple, Dumbbell, Brain as BrainIcon,
  Sparkles, Bot, User, X, Plus, Minus, Info, Siren, MessageSquare, Calendar, Pill, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import { ROLES } from '@/lib/types';
import { LANGUAGES } from '@/lib/languages';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { useUserLocation } from '@/hooks/use-user-location';
import { useLanguageDetector, useUserLanguage } from '@/hooks/use-language-detector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { fadeUp, scaleIn, subtleSpring, motionTokens } from '@/lib/motion-variants';

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
  patient:
    "Hi — I’m here to help with symptoms, medicines in general terms, booking a visit, or quick questions. What’s going on today?",
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
}

export function UnifiedAIAssistant({ role }: UnifiedAIAssistantProps) {
  const [inputText, setInputText] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roleInfo = ROLES[role];
  
  const router = useRouter();
  
  // Initialize on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  
  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);

  // Language management
  const { preferredLanguage, setLanguage, isAuto: isAutoLanguage } = useUserLanguage();
  const { detectedLanguage } = useLanguageDetector(inputText);
  const { location: clientLocation, status: locStatus } = useUserLocation();


  // Compute the actual language used for response
  const effectiveLanguage = useMemo(() => {
    return isAutoLanguage ? detectedLanguage : preferredLanguage;
  }, [isAutoLanguage, detectedLanguage, preferredLanguage]);

  const voice = useVoiceAgent({
    role,
    preferredLanguage: effectiveLanguage,
    voiceOutputEnabled: voiceEnabled,
    clientLocation,
    router,
    onUserText: (text) => {
      const userMessage: Message = { text, isUser: true, timestamp: new Date() };
      setConversationHistory((prev) => [...prev, userMessage]);
    },
    onAssistantText: (text) => {
      const aiMessage: Message = { text, isUser: false, timestamp: new Date(), source: 'fallback' };
      setConversationHistory((prev) => [...prev, aiMessage]);
    },
  });

  const isListening = voice.listening && !voice.processing;
  const displayTranscript = voice.interimTranscript || voice.transcript;

  const startListening = useCallback(() => {
    setInputText('');
    void voice.startListening();
  }, [voice]);

  const stopListening = useCallback(() => {
    void voice.stopListening();
  }, [voice]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    void voice.submitText(inputText);
    setInputText('');
  };
  
  // Intentionally keep only routing logic here (no optional callbacks)
  const handleEmergencyAction = () => {
    console.log('Button clicked: Emergency');
    router.push('/dashboard/emergency');
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
        {/* Top row: role info + language + emergency */}
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/select-role')}
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

          <div className="flex items-center gap-2">
            {/* Compact Language Selector */}
            <LanguageSelector variant="dropdown" className="scale-90 origin-right" />

              <button
                onClick={() => {
                  console.log('Button clicked: Emergency');
                  handleEmergencyAction();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition"
              >

              <Siren className="w-4 h-4" />
              Emergency
            </button>
           </div>

          {/* Second row: voice status + language indicator */}
          <div className="px-4 py-2 flex items-center justify-center gap-4">
           <div className="flex items-center gap-2">
             <div className={cn(
               'w-2 h-2 rounded-full transition-all',
               voiceEnabled 
                 ? 'bg-green-500 shadow-[0_0_8px_theme(colors.green.500)] animate-pulse'
                 : 'bg-muted-foreground'
             )} />
             <span className="text-xs text-muted-foreground">
               {voiceEnabled ? 'Voice Assistant Active' : 'Voice Disabled'}
             </span>
           </div>

           {/* Voice Control Toggle */}
           <div className="flex items-center gap-2">
             <button
               onClick={() => setVoiceEnabled(prev => !prev)}
               className={cn(
                 'p-1.5 rounded-lg transition-all',
                 voiceEnabled 
                   ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                   : 'bg-muted text-muted-foreground hover:bg-muted/80'
               )}
             >
               {voiceEnabled ? (
                 <Volume2 className="w-3.5 h-3.5" />
               ) : (
                 <VolumeX className="w-3.5 h-3.5" />
               )}
             </button>
             <span className="text-xs text-muted-foreground">
               Voice Output
             </span>
           </div>

           {/* Speech Recognition Status */}
           <div className="flex items-center gap-2">
             <div className={cn(
               'w-2 h-2 rounded-full transition-all',
               isListening 
                 ? 'bg-red-500 shadow-[0_0_8px_theme(colors.red.500)] animate-pulse'
                 : voice.isSupported
                 ? 'bg-blue-500 shadow-[0_0_8px_theme(colors.blue.500)]'
                 : 'bg-muted-foreground'
             )} />
             <span className="text-xs text-muted-foreground">
               {isListening 
                 ? 'Listening...'
                 : voice.isSupported
                 ? 'Speech Ready'
                 : 'Speech Unavailable'}
             </span>
           </div>

           <div className="flex items-center gap-2">
             <div
               className={cn(
                 'w-2 h-2 rounded-full transition-all',
                 clientLocation
                   ? 'bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.500)]'
                   : locStatus === 'pending'
                     ? 'bg-amber-400 animate-pulse'
                     : 'bg-muted-foreground'
               )}
             />
             <span className="text-xs text-muted-foreground flex items-center gap-1">
               <MapPin className="w-3 h-3" />
               {clientLocation
                 ? 'Location on (NLP + local context)'
                 : locStatus === 'denied' || locStatus === 'unsupported'
                   ? 'Location off'
                   : 'Locating…'}
             </span>
           </div>
         </div>

          {/* Language Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {LANGUAGES[effectiveLanguage]?.flag || '🌐'} {LANGUAGES[effectiveLanguage]?.nativeName || 'English'}
            </span>
            {isAutoLanguage && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">AUTO</span>
            )}
          </div>
        </div>
      </header>

      {/* Language Quick-Switch Bar (shows when user manually selected a language) */}
      {!isAutoLanguage && (
        <div className="px-4 py-2 flex justify-center bg-background/90 backdrop-blur-xl border-b border-border">
          <button
            onClick={() => setLanguage('auto')}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Globe className="w-3 h-3" />
            Switch to Auto Detect
          </button>
        </div>
      )}

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />
        </div>

        {/* ========== CONVERSATION AREA ========== */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 pb-24 max-w-2xl mx-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          
          {/* Welcome Message */}
          {conversationHistory.length === 0 && (
            <motion.div
              variants={fadeUp}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="visible"
              transition={prefersReducedMotion ? { duration: 0 } : subtleSpring}
              className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
            >
              <motion.div
                variants={scaleIn}
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                transition={prefersReducedMotion ? { duration: 0 } : subtleSpring}
                className={cn(
                  'w-32 h-32 rounded-full flex items-center justify-center mb-6',
                  roleInfo.bgColor,
                  'shadow-2xl shadow-primary/10'
                )}
              >
                <Brain className="w-16 h-16 text-primary/90" />
              </motion.div>
              
              <motion.h1
                variants={fadeUp}
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                transition={prefersReducedMotion ? { duration: 0 } : { ...subtleSpring, delay: 0.08 }}
                className="text-2xl md:text-3xl font-display font-bold mb-3"
              >
                {getTimeGreeting()}, {roleInfo.label}
              </motion.h1>
              
              <motion.p
                variants={fadeUp}
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                transition={prefersReducedMotion ? { duration: 0 } : { ...subtleSpring, delay: 0.16 }}
                className="text-lg text-muted-foreground mb-8"
              >
                Your AI-powered healthcare assistant
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : motionTokens.duration.normal }}
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
                transition={{ delay: prefersReducedMotion ? 0 : 0.5, duration: prefersReducedMotion ? 0 : motionTokens.duration.fast }}
                className="text-sm text-muted-foreground mb-2"
              >
                {isListening
                  ? 'Speak, then pause — we send after a short pause. Or tap the mic to stop.'
                  : 'Tap the mic, speak, pause to send (or tap mic again to stop) — or type below.'}
                 </motion.p>
                
                {/* Live Transcript Display */}
                {isListening && displayTranscript && (
                  <motion.div
                    variants={fadeUp}
                    initial={prefersReducedMotion ? false : 'hidden'}
                    animate="visible"
                    transition={{ duration: prefersReducedMotion ? 0 : motionTokens.duration.normal }}
                    className="mt-4 max-w-lg mx-auto w-full"
                  >
                    <div className="bg-muted/50 border border-border rounded-xl p-3 sm:p-4 max-h-[40vh] overflow-y-auto">
                      <p className="text-sm text-muted-foreground text-center italic break-words leading-6">
                        {displayTranscript}
                      </p>
                    </div>
                  </motion.div>
                )}

              {voice.isSupported && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: prefersReducedMotion ? 0 : motionTokens.duration.fast }}
                  className="text-xs text-muted-foreground/70"
                >
                  {voiceEnabled ? 'Voice feedback enabled' : 'Click volume icon to enable voice'}
                </motion.p>
              )}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.7, duration: prefersReducedMotion ? 0 : motionTokens.duration.fast }}
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
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: prefersReducedMotion ? 0 : motionTokens.duration.fast }}
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
            {voice.processing && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : motionTokens.duration.fast }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 min-w-[210px]">
                  <div className="space-y-2">
                    <div className="h-2.5 rounded bg-primary/10 animate-pulse w-[85%]" />
                    <div className="h-2.5 rounded bg-primary/10 animate-pulse w-[70%]" />
                    <div className="flex items-center gap-2 pt-1">
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-2 text-xs text-muted-foreground">Generating response...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
          
          {/* No messages yet - show quick actions */}
          {conversationHistory.length === 0 && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.5, duration: prefersReducedMotion ? 0 : motionTokens.duration.normal }}
              className="mt-12 space-y-4"
            >
              <p className="text-center text-sm text-muted-foreground">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3 px-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log('Button clicked: Health Log');
                    router.push('/dashboard/health-log');
                  }}

                  className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition text-left"
                >
                  <Heart className="w-5 h-5 text-chart-1 mb-2" />
                  <p className="text-sm font-medium">Health Log</p>
                  <p className="text-xs text-muted-foreground">Track symptoms</p>
                </motion.button>
                  <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log('Button clicked: AI Chat');
                    router.push('/dashboard/chat');
                  }}

                  className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition text-left"
                >
                  <MessageSquare className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-medium">AI Chat</p>
                  <p className="text-xs text-muted-foreground">Ask questions</p>
                </motion.button>
                  <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log('Button clicked: Book Visit');
                    router.push('/dashboard/appointments');
                  }}

                  className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition text-left"
                >
                  <Calendar className="w-5 h-5 text-chart-3 mb-2" />
                  <p className="text-sm font-medium">Book Visit</p>
                  <p className="text-xs text-muted-foreground">Make appointment</p>
                </motion.button>
                  <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log('Button clicked: Medicines');
                    router.push('/dashboard/medicine');
                  }}

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
      <div className="sticky bottom-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border supports-[backdrop-filter]:bg-background/80 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {/* Emergency Alert Banner */}
        {/* Emergency banner now handled by actions + navigation */}
        
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
        <form onSubmit={handleTextSubmit} className="p-3 sm:p-4">
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!voice.isSupported}
              className={cn(
                'h-12 w-12 rounded-xl transition-all flex-shrink-0 inline-flex items-center justify-center active:scale-95',
                !voice.isSupported
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
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit(e as any);
                }
              }}
              placeholder={
                voice.isSupported
                  ? "Ask anything, or tap the mic — speak, pause, and I’ll answer…"
                  : "Type your question…"
              }
              className="flex-1 h-12 px-4 rounded-xl border border-border bg-background text-sm sm:text-base focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            />
            
            <button
              type="submit"
              disabled={!inputText.trim() || voice.processing}
              className="h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-40 flex-shrink-0 inline-flex items-center justify-center active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        {/* Status Bar */}
        <div className="px-4 pb-3 pt-1 flex items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="flex items-center gap-2">
            {voice.speaking && <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Speaking...</span>}
            {voice.processing && <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Processing...</span>}
          </div>
          <span className="hidden sm:inline">Voice & chat assistant • Not a substitute for in-person care</span>
        </div>
      </div>
    </div>
  );
}
