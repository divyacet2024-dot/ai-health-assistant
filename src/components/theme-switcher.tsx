'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: Array<{ value: ThemeOption; label: string; icon: React.ReactNode }> = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Theme" className="rounded-xl">
          {current === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : current === 'light' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        {THEME_OPTIONS.map((opt) => {
          const isActive = opt.value === current;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className="flex items-center gap-2 text-sm"
            >
              <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{opt.icon}</span>
              <span className="flex-1">{opt.label}</span>
              {opt.value === 'system' && resolvedTheme && (
                <span className="text-[10px] text-muted-foreground">({resolvedTheme})</span>
              )}
              {isActive && <span className="text-xs text-primary">Active</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

