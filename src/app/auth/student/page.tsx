'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { AuthForm } from '@/components/auth-form';
import { seedDemoUsers } from '@/lib/auth';

function StudentAuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  useEffect(() => { seedDemoUsers(); }, []);

  return (
    <AuthForm
      mode={mode}
      role="student"
      roleLabel="Medical Student"
      extraFields={mode === 'register' ? [
        { name: 'studentId', label: 'Student ID', type: 'text', placeholder: 'e.g., MBBS2024001', required: true },
        { name: 'year', label: 'Year', type: 'text', placeholder: 'e.g., 1st Year, 2nd Year', required: false,
          options: [
            { value: '1st Year', label: '1st Year' },
            { value: '2nd Year', label: '2nd Year' },
            { value: '3rd Year', label: '3rd Year' },
            { value: 'Internship', label: 'Internship' },
          ]
        },
      ] : []}
    />
  );
}

export default function StudentAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <StudentAuthContent />
    </Suspense>
  );
}
