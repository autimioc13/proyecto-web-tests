'use client';

import { createClient } from '@/lib/supabase/client';
import { Mail, Code } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) console.error('Google login error:', error);
    setLoading(false);
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) console.error('GitHub login error:', error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-white mb-2">🧪 QuizLab</h1>
        <p className="text-slate-400 mb-8">Descubre quién eres realmente con nuestros tests</p>

        {error === 'auth_failed' && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
            Error en autenticación. Intenta de nuevo.
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-lg transition disabled:opacity-50"
          >
            <Mail size={20} />
            Continuar con Google
          </button>

          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            <Code size={20} />
            Continuar con GitHub
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-8">
          Al continuar, aceptas nuestros términos y privacidad
        </p>
      </div>
    </div>
  );
}
