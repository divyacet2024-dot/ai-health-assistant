/**
 * Dashboard Redirect Page - Redirects to AI Assistant
 * This is the single entry point for all logged-in users (redirected to AI Assistant)
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRole } from '@/lib/store';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();
    // All logged-in users go to AI Assistant as the single entry point
    if (role) {
      router.push('/ai-assistant');
    } else {
      router.push('/select-role');
    }
  }, [router]);

  return null;
}

// Legacy dashboard components kept for reference but redirected
// All dashboard functionality is now accessible through AI Assistant routing