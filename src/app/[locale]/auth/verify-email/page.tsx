import { Link } from '@/i18n/navigation';
import { Mail } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verifica tu correo | QuizLab',
  description: 'Confirma tu dirección de correo para activar tu cuenta de QuizLab.',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const t = await getTranslations('auth');
  const tc = await getTranslations('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center">
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-600/20 border border-purple-500/40 p-4 rounded-full">
              <Mail className="text-purple-300" size={32} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">{t('verifyEmailTitle')}</h1>

          <p className="text-white/70 mb-2">
            {email ? (
              <>
                {t('verifyEmailLeadTo')}{' '}
                <span className="font-semibold text-white">{email}</span>.
              </>
            ) : (
              t('verifyEmailLeadGeneric')
            )}
          </p>
          <p className="text-white/60 text-sm mb-6">
            {t('verifyEmailSpam')}
          </p>

          <Link
            href="/auth/login"
            className="inline-block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
          >
            {t('goToLogin')}
          </Link>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-white/60 hover:text-white text-sm">
            {tc('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
