'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { ChatUI } from '@/components/chat-ui';
import { UserRole } from '@/lib/types';
import { getRole } from '@/lib/store';

export default function ChatPage() {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRoleState(getRole());
  }, []);

  if (!mounted || !role) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <ChatUI role={role} />
      </div>
    </AppShell>
  );
}
