'use client';

import { useState, useEffect } from 'react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  daysUntilBreak: number;
  compact?: boolean;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
  daysUntilBreak,
  compact = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation when streak changes
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentStreak]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        {/* Current Streak Compact */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30">
          <span className="text-lg">🔥</span>
          <span className={`font-bold text-orange-600 ${isAnimating ? 'scale-110' : 'scale-100'} transition-transform`}>
            {currentStreak}
          </span>
        </div>

        {/* Longest Streak Compact */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30">
          <span className="text-lg">👑</span>
          <span className="font-bold text-purple-600">{longestStreak}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Racha Actual
        </h3>
        <span className="text-3xl">🔥</span>
      </div>

      {/* Current Streak Display */}
      <div className="space-y-2">
        <div
          className={`relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg ${
            isAnimating ? 'scale-105' : 'scale-100'
          } transition-transform duration-300`}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_25%,rgba(255,255,255,.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.2)_75%,rgba(255,255,255,.2))] bg-[length:40px_40px] animate-pulse" />
          </div>

          <div className="relative flex items-baseline justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Días consecutivos</p>
              <p className="text-5xl font-black">{currentStreak}</p>
            </div>
            <div className="text-right">
              {daysUntilBreak > 0 ? (
                <p className="text-sm opacity-90">
                  <span className="font-bold">{daysUntilBreak}</span> día{daysUntilBreak !== 1 ? 's' : ''} para salvar
                </p>
              ) : (
                <p className="text-sm opacity-90 text-yellow-100">¡Actívate hoy para mantener!</p>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Progreso</span>
            <span>{Math.min(currentStreak * 10, 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${Math.min(currentStreak * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Longest Streak Section */}
      <div className="pt-2 border-t border-slate-300 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Racha más larga
              </p>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {longestStreak} días
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 p-3">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
          💡 Completa un quiz cada día para mantener tu racha y desbloquear logros.
        </p>
      </div>
    </div>
  );
};
