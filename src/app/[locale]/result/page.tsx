'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ConfettiAnimation from '@/components/ConfettiAnimation';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

function ResultPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '1');
  const slug = searchParams.get('slug') || 'quiz';

  const percentage = Math.round((score / total) * 100);

  const getMessageAndEmoji = () => {
    if (percentage === 100) {
      return { message: '¡PERFECCIÓN ABSOLUTA!', emoji: '🏆', titleKey: 'perfect' };
    } else if (percentage >= 80) {
      return { message: '¡EXCELENTE DESEMPEÑO!', emoji: '🌟', titleKey: 'excellent' };
    } else if (percentage >= 60) {
      return { message: '¡BUEN TRABAJO!', emoji: '👏', titleKey: 'good' };
    } else if (percentage >= 40) {
      return { message: '¡CASI LO TIENES!', emoji: '💪', titleKey: 'almost' };
    } else {
      return { message: '¡SIGUE INTENTANDO!', emoji: '🚀', titleKey: 'trying' };
    }
  };

  const getGradientClass = () => {
    if (percentage >= 80) {
      return 'from-green-400 to-green-600';
    } else if (percentage >= 60) {
      return 'from-blue-400 to-blue-600';
    } else if (percentage >= 40) {
      return 'from-amber-400 to-amber-600';
    } else {
      return 'from-orange-400 to-orange-600';
    }
  };

  const getAchievements = (): Achievement[] => {
    const achievements: Achievement[] = [
      {
        id: 'starter',
        title: 'Iniciador',
        description: 'Completaste tu primer quiz',
        icon: '🎬',
        unlocked: percentage > 0,
      },
      {
        id: 'half',
        title: 'A Mitad de Camino',
        description: 'Alcanzaste 50% o más',
        icon: '⚡',
        unlocked: percentage >= 50,
      },
      {
        id: 'proficient',
        title: 'Competente',
        description: 'Alcanzaste 70% o más',
        icon: '📚',
        unlocked: percentage >= 70,
      },
      {
        id: 'master',
        title: 'Maestro',
        description: 'Alcanzaste 90% o más',
        icon: '👑',
        unlocked: percentage >= 90,
      },
      {
        id: 'perfect',
        title: 'Perfección Absoluta',
        description: 'Obtuviste 100%',
        icon: '💎',
        unlocked: percentage === 100,
      },
    ];

    return achievements;
  };

  const achievements = getAchievements();
  const { message, emoji } = getMessageAndEmoji();

  const handleShare = async () => {
    const shareText = `¡Acabo de obtener ${percentage}% en el quiz "${slug}"! ${emoji}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Resultado del Quiz',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      // Fallback: copiar al portapapeles
      await navigator.clipboard.writeText(shareText);
      alert('Resultado copiado al portapapeles');
    }
  };

  const handleRetry = () => {
    router.push(`/quiz/${slug}`);
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getGradientClass()} flex flex-col items-center justify-center p-4`}>
      {percentage > 0 && <ConfettiAnimation />}

      <div className="max-w-2xl w-full space-y-8">
        {/* Emoji Animado */}
        <div className="text-8xl mb-8 text-center animate-bounce" style={{ animationDuration: '1s' }}>
          {emoji}
        </div>

        {/* Mensaje Principal */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">{message}</h1>
          <p className="text-xl text-white/90">
            Completaste el quiz con un resultado de <span className="font-bold">{percentage}%</span>
          </p>
        </div>

        {/* Score Display con Progress Circle SVG */}
        <div className="flex justify-center mb-12">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeDasharray={`${(percentage / 100) * (2 * Math.PI * 90)} ${2 * Math.PI * 90}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
              />
            </svg>

            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-white">{percentage}%</div>
              <div className="text-sm text-white/80 mt-1">
                {score} de {total}
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Logros Desbloqueados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg text-center transition-all duration-300 ${
                  achievement.unlocked
                    ? 'bg-white/20 border-2 border-white/50 shadow-lg scale-100'
                    : 'bg-white/5 border-2 border-white/20 opacity-50 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">{achievement.title}</h3>
                <p className="text-xs text-white/70">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 md:flex-row justify-center">
          <PrimaryButton
            variant="solid"
            size="lg"
            onClick={handleShare}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/50"
          >
            📤 Compartir Resultado
          </PrimaryButton>
          <PrimaryButton
            variant="gradient"
            size="lg"
            onClick={handleRetry}
          >
            🔄 Intentar de Nuevo
          </PrimaryButton>
          <PrimaryButton
            variant="solid"
            size="lg"
            onClick={handleHome}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/50"
          >
            🏠 Ir al Inicio
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function ResultPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-600 flex flex-col items-center justify-center p-4">
      <div className="text-4xl animate-spin">⏳</div>
      <p className="text-white mt-4">Cargando resultados...</p>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultPageFallback />}>
      <ResultPageContent />
    </Suspense>
  );
}
