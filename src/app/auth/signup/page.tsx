'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Code, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup, signupWithGoogle, signupWithGithub, loading, error } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim()) {
      return 'Por favor ingresa tu nombre completo';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Por favor ingresa un email válido';
    }
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    if (!agreeTerms) {
      return 'Debes aceptar los términos y condiciones';
    }
    return null;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        firstName,
        lastName,
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      // Redirect to verify email or dashboard
      router.push('/auth/verify-email');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setFormError(null);
    try {
      await signupWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google signup failed';
      setFormError(message);
    }
  };

  const handleGithubSignup = async () => {
    setFormError(null);
    try {
      await signupWithGithub();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GitHub signup failed';
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Únete a QuizLab</h1>
          <p className="text-white/60">Crea tu cuenta gratuitamente</p>
        </div>

        {/* Signup Form Container */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
          {/* Error Message */}
          {(formError || error) && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{formError || error}</p>
            </div>
          )}

          {/* Email Signup Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            {/* Name Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isSubmitting || loading}
                  placeholder="Juan"
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
              <div>
                <label className="block text-sm font-medium text-white mb-2">Apellido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting || loading}
                  placeholder="Pérez"
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
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
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
              <label className="block text-sm font-medium text-white mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || loading}
                placeholder="Mínimo 8 caracteres"
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting || loading}
                placeholder="Repite tu contraseña"
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

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isSubmitting || loading}
                className="w-4 h-4 mt-1 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-white/70 cursor-pointer">
                Acepto los{' '}
                <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                  términos y condiciones
                </Link>
              </label>
            </div>

            {/* Signup Button */}
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
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-white/60 text-sm">O regístrate con</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignup}
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

            <button
              onClick={handleGithubSignup}
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

        {/* Login Link */}
        <div className="text-center">
          <p className="text-white/60">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/60 hover:text-white text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
