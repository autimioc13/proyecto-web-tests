'use client';

import { ScoreResult } from '@/lib/scoring/calculator';
import { getGradeColor, getGradeBgColor } from '@/lib/scoring/calculator';
import { CategoryTheme, getCategoryTheme, defaultTheme } from '@/lib/themes/categoryThemes';
import { Trophy, Target, TrendingUp } from 'lucide-react';

interface ResultsCardProps {
  scoreResult: ScoreResult;
  testTitle: string;
  timeSpent?: number; // seconds
  theme?: CategoryTheme; // Optional, defaults to defaultTheme
}

export default function ResultsCard({
  scoreResult,
  testTitle,
  timeSpent,
  theme,
}: ResultsCardProps) {
  const themeToUse = theme || defaultTheme;
  const gradeColor = getGradeColor(scoreResult.grade);
  const gradeBgColor = getGradeBgColor(scoreResult.grade);

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">¡Test Completado!</h1>
          <p className="text-slate-400"><span className="mr-2">{themeToUse.icon}</span>{testTitle}</p>
        </div>

        {/* Grade Display */}
        <div className={`${gradeBgColor} rounded-lg p-8 text-center border-2 border-slate-700`}>
          <div className={`text-7xl font-bold mb-4 ${gradeColor}`}>
            {scoreResult.grade}
          </div>
          <p className="text-lg mb-2">
            {scoreResult.passed ? '✅ Aprobado' : '❌ No Aprobado'}
          </p>
          <p className="text-slate-400 text-sm">
            {scoreResult.score === 100
              ? '¡Puntuación Perfecta!'
              : `Necesitabas 60 para pasar`}
          </p>
        </div>

        {/* Score Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Correct Answers */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold">Correctas</h3>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {scoreResult.correctAnswers}
            </div>
            <p className="text-sm text-slate-400">
              de {scoreResult.totalQuestions}
            </p>
          </div>

          {/* Score Percentage */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className={`w-6 h-6 ${themeToUse.accentText}`} />
              <h3 className="font-semibold">Puntuación</h3>
            </div>
            <div className={`text-3xl font-bold ${themeToUse.accentText} mb-1`}>
              {scoreResult.score}%
            </div>
            <p className="text-sm text-slate-400">
              {scoreResult.incorrectAnswers} incorrectas
            </p>
          </div>

          {/* Time Spent */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="font-semibold">Tiempo</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {timeSpent ? formatTime(timeSpent) : '--'}
            </div>
            <p className="text-sm text-slate-400">Total del test</p>
          </div>
        </div>

        {/* Answer Review Section */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-4">Resumen de Respuestas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span>Total de Preguntas</span>
              <span className="font-bold">{scoreResult.totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-green-400">Respuestas Correctas</span>
              <span className="font-bold text-green-400">{scoreResult.correctAnswers}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-red-400">Respuestas Incorrectas</span>
              <span className="font-bold text-red-400">{scoreResult.incorrectAnswers}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-sm text-slate-400 mb-3">Progreso en Test</p>
          <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
              style={{
                width: `${(scoreResult.correctAnswers / scoreResult.totalQuestions) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {Math.round((scoreResult.correctAnswers / scoreResult.totalQuestions) * 100)}% completado correctamente
          </p>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
