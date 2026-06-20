'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Mail, Code, Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { login, loginWithGoogle, loginWithGithub, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
      }

      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setFormError(message);
    }
  };

  const handleGithubLogin = async () => {
    setFormError(null);
    try {
      await loginWithGithub();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GitHub login failed';
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('loginTitle')}</h1>
          <p className="text-white/60">{t('loginSubtitle')}</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
          {/* Error Message */}
          {(formError || error) && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300 text-sm">
              {formError || error}
            </div>
          )}

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || loading}
                placeholder="tu@email.com"
                className="
                  w-full px-4 py-3
                  bg-white/10 border border-white/20
                  rounded-lg text-white placeholder-white/40
                  focus:outline-none focus:border-white/40
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || loading}
                placeholder="••••••••"
                className="
                  w-full px-4 py-3
                  bg-white/10 border border-white/20
                  rounded-lg text-white placeholder-white/40
                  focus:outline-none focus:border-white/40
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/auth/reset-password"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="
                w-full px-6 py-3
                bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50
                text-white font-bold
                rounded-lg
                transition-colors
                flex items-center justify-center gap-2
                disabled:cursor-not-allowed
              "
            >
              {isSubmitting || loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  {t('loginLoading')}
                </>
              ) : (
                t('loginButton')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-white/60 text-sm">{t('continueWith')}</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting || loading}
              className="
                w-full px-6 py-3
                bg-white/10 border border-white/20
                hover:bg-white/20 disabled:bg-white/10/50
                text-white font-semibold
                rounded-lg
                transition-colors
                flex items-center justify-center gap-2
                disabled:cursor-not-allowed
              "
            >
              <Mail size={20} />
              Google
            </button>

            {/* GitHub Button */}
            <button
              onClick={handleGithubLogin}
              disabled={isSubmitting || loading}
              className="
                w-full px-6 py-3
                bg-white/10 border border-white/20
                hover:bg-white/20 disabled:bg-white/10/50
                text-white font-semibold
                rounded-lg
                transition-colors
                flex items-center justify-center gap-2
                disabled:cursor-not-allowed
              "
            >
              <Code size={20} />
              GitHub
            </button>
          </div>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-white/60">
            {t('noAccount')}{' '}
            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
              {t('signupLink')}
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/60 hover:text-white text-sm">
            {tc('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
