'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';
import { seedDemoUsers } from '@/lib/auth';
import { useEffect } from 'react';

const EXTRA_FIELDS = [
  { name: 'department', label: 'Department', type: 'text', placeholder: 'e.g., Anatomy, Pharmacology', required: true },
  { name: 'employeeId', label: 'Employee ID', type: 'text', placeholder: 'e.g., PROF001', required: true },
];

function ProfessorAuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  useEffect(() => { seedDemoUsers(); }, []);

  return <AuthForm mode={mode} role="professor" roleLabel="Professor" extraFields={EXTRA_FIELDS} />;
}

export default function ProfessorAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProfessorAuthContent />
    </Suspense>
  );
}