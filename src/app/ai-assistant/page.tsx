'use client';

import { useEffect, useState } from 'react';
import { UnifiedAIAssistant } from '@/components/UnifiedAIAssistant';
import { UserRole } from '@/lib/types';
import { getRole } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function AIAssistantPage() {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const r = getRole();
    if (!r) {
      // No role selected, go back to select role
      router.push('/select-role');
      return;
    }
    setRoleState(r);
  }, [router]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (!mounted || !role) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedAIAssistant role={role} onNavigate={handleNavigate} />
    </div>
  );
}
