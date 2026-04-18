'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Trash2, Sparkles, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage, UserRole, ROLES } from '@/lib/types';
import { getChatHistory, saveChatHistory, clearChatHistory } from '@/lib/store';

const ROLE_GREETINGS: Record<UserRole, string> = {
  patient: "Hello! I'm your **AI Health Assistant** powered by Google Gemini. I can help you with health questions, medicine information, understanding lab reports, and more. How can I help you today?",
  student: "Hi there! I'm your **AI Medical Tutor** powered by Google Gemini. Ask me about any medical topic — anatomy, physiology, pharmacology, pathology, or clinical subjects. I'll explain concepts clearly with clinical correlations. What would you like to learn?",
  doctor: "Good day, Doctor. I'm your **AI Clinical Assistant** powered by Google Gemini. I can help with differential diagnosis suggestions, drug interaction checks, treatment guidelines, and clinical decision support. How can I assist?",
  professor: "Welcome, Professor. I'm your **AI Teaching Assistant** powered by Google Gemini. I can help create teaching materials, suggest assessment methods, answer complex medical queries, and organize resources. What do you need?",
};

export function ChatUI({ role }: { role: UserRole }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const history = getChatHistory(role);
    if (history.length === 0) {
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: ROLE_GREETINGS[role],
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    } else {
      setMessages(history);
    }
  }, [role]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function handleSend() {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Call real Gemini AI API
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          userRole: role,
          history: newMessages.filter((m) => m.id !== 'greeting').slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: json.data.content,
          timestamp: json.data.timestamp || new Date().toISOString(),
        };
        const updated = [...newMessages, aiMsg];
        setMessages(updated);
        saveChatHistory(role, updated);
        if (json.data.fallback) setAiEnabled(false);
        else setAiEnabled(true);
      } else {
        throw new Error(json.error || 'Failed to get AI response');
      }
    } catch (error) {
      // Fallback message if API completely fails
      const fallbackMsg: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service right now. Please check your internet connection and try again. If the issue persists, ensure the Gemini API key is correctly configured in the `.env` file.",
        timestamp: new Date().toISOString(),
      };
      const updated = [...newMessages, fallbackMsg];
      setMessages(updated);
      saveChatHistory(role, updated);
      setAiEnabled(false);
    }

    setIsTyping(false);
  }

  function handleClear() {
    clearChatHistory(role);
    const greeting: ChatMessage = {
      id: 'greeting',
      role: 'assistant',
      content: ROLE_GREETINGS[role],
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
    setAiEnabled(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!mounted) return null;

  const roleInfo = ROLES[role];
  const chatLabel = role === 'patient' ? 'AI Health Chat' : role === 'student' ? 'AI Study Tutor' : role === 'doctor' ? 'AI Clinical Assistant' : 'AI Teaching Assistant';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', roleInfo.bgColor)}>
            <Bot className={cn('w-4.5 h-4.5', roleInfo.color)} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm flex items-center gap-1.5">
              {chatLabel}
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              {aiEnabled ? (
                <>Powered by Google Gemini AI</>
              ) : (
                <><WifiOff className="w-3 h-3" /> Reconnecting...</>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                )}
              >
                <div
                  className="whitespace-pre-wrap break-words prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>h3]:font-semibold [&>h3]:mb-1"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                      .replace(/^- (.*$)/gm, '<li>$1</li>')
                      .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
                      .replace(/<\/ul>\s*<ul>/g, '')
                      .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
                      .replace(/`(.*?)`/g, '<code class="bg-background/50 px-1 py-0.5 rounded text-xs">$1</code>')
                      .replace(/\n\n/g, '</p><p>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] text-muted-foreground">Gemini is thinking...</span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask your ${chatLabel.toLowerCase()}...`}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-40"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          AI responses are for informational purposes only. Always consult a healthcare professional.
        </p>
      </div>
    </div>
  );
}
