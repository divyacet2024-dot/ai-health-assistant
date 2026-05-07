'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserLanguage, LanguageCode } from '@/hooks';
import { LANGUAGES, INDIAN_LANGUAGES } from '@/lib/languages';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons' | 'flags';
  showIndianOnly?: boolean;
  className?: string;
}

export function LanguageSelector({ 
  variant = 'dropdown', 
  showIndianOnly = false,
  className 
}: LanguageSelectorProps) {
  const { preferredLanguage, effectiveLanguage, setLanguage, isAuto } = useUserLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = showIndianOnly ? INDIAN_LANGUAGES : Object.values(LANGUAGES);
  
  const currentLang = LANGUAGES[effectiveLanguage] || LANGUAGES.en;

  if (variant === 'buttons') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <button
          onClick={() => setLanguage('auto')}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm transition-all border",
            isAuto
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/50 border-border hover:bg-muted"
          )}
        >
          <Globe className="w-3 h-3 inline mr-1" />
          Auto
        </button>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as LanguageCode)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm transition-all border flex items-center gap-1",
              effectiveLanguage === lang.code
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 border-border hover:bg-muted"
            )}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'flags') {
    return (
      <div className={cn("flex gap-2", className)}>
        {languages.slice(0, 6).map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as LanguageCode)}
            className={cn(
              "text-2xl transition-transform hover:scale-110",
              effectiveLanguage === lang.code && "ring-2 ring-primary rounded-full scale-110"
            )}
            title={lang.name}
          >
            {lang.code === 'auto' ? '🌐' : lang.flag}
          </button>
        ))}
      </div>
    );
  }

  // Default: Dropdown
  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border hover:bg-muted transition"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">
          {isAuto ? '🌐 Auto' : `${currentLang.flag} ${currentLang.nativeName}`}
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Translation Language
              </div>
              
              <button
                onClick={() => { setLanguage('auto'); setIsOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isAuto ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                )}
              >
                <span className="text-lg">🌐</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">Auto Detect</div>
                  <div className="text-xs text-muted-foreground"> automatically identify</div>
                </div>
                {isAuto && <Check className="w-4 h-4 text-primary" />}
              </button>

              <div className="my-1 border-t border-border" />

              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code as LanguageCode); setIsOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    effectiveLanguage === lang.code && !isAuto
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
                  </div>
                  {effectiveLanguage === lang.code && !isAuto && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
