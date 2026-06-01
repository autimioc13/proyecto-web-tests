'use client';

import { Suspense } from 'react';
import LoginContent from './login-content';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <LoginContent />
    </Suspense>
  );
}
