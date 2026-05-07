'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/hooks';
import { cn } from '@/lib/utils';

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: Array<{ value: ThemeOption; label: string; icon: React.ReactNode }> = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const [open, setOpen] = React.useState(false);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Theme: loading" />
    );
  }

  const current: ThemeOption =
    theme === 'system'
      ? 'system'
      : theme === 'dark'
        ? 'dark'
        : 'light';

  // Close menu on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="relative inline-flex">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl"
      >
        {current === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : current === 'light' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Monitor className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 mt-2 w-40 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg z-[60] overflow-hidden"
        >
          {THEME_OPTIONS.map((opt) => {
            const isActive = opt.value === current;
            return (
              <button
                key={opt.value}
                role="menuitemradio"
                aria-checked={isActive}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition',
                  isActive && 'bg-muted'
                )}
              >
                <span className={cn('text-muted-foreground', isActive && 'text-foreground')}>{opt.icon}</span>
                <span className="flex-1 text-left">{opt.label}</span>
                {opt.value === 'system' && resolvedTheme && (
                  <span className="text-[10px] text-muted-foreground ml-auto">({resolvedTheme})</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

