'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { AuthForm } from '@/components/auth-form';
import { seedDemoUsers } from '@/lib/auth';

function DoctorAuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  useEffect(() => { seedDemoUsers(); }, []);

  return (
    <AuthForm
      mode={mode}
      role="doctor"
      roleLabel="Doctor"
      extraFields={mode === 'register' ? [
        { name: 'employeeId', label: 'Employee / License ID', type: 'text', placeholder: 'e.g., DOC001', required: true },
        { name: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g., Internal Medicine', required: true },
        { name: 'department', label: 'Department', type: 'text', placeholder: 'Select department', required: true,
          options: [
            { value: 'General Medicine', label: 'General Medicine' },
            { value: 'Cardiology', label: 'Cardiology' },
            { value: 'Orthopedics', label: 'Orthopedics' },
            { value: 'Dermatology', label: 'Dermatology' },
            { value: 'Endocrinology', label: 'Endocrinology' },
            { value: 'Neurology', label: 'Neurology' },
            { value: 'Pediatrics', label: 'Pediatrics' },
            { value: 'Gynecology', label: 'Gynecology' },
            { value: 'ENT', label: 'ENT' },
            { value: 'Psychiatry', label: 'Psychiatry' },
            { value: 'Surgery', label: 'Surgery' },
          ]
        },
      ] : []}
    />
  );
}

export default function DoctorAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DoctorAuthContent />
    </Suspense>
  );
}
