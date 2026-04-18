'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';
import { seedDemoUsers } from '@/lib/auth';
import { useEffect } from 'react';

function AdminAuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  useEffect(() => { seedDemoUsers(); }, []);

  return <AuthForm mode={mode} role="admin" roleLabel="Administrator" />;
}

export default function AdminAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AdminAuthContent />
    </Suspense>
  );
}