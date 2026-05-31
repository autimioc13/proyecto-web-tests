'use client';

import { useState, useCallback } from 'react';
import { Question, TestSession } from '@/lib/types/test';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { CategoryTheme, defaultTheme } from '@/lib/themes/categoryThemes';

interface TestPlayerProps {
  questions: Question[];
  onSubmit: (answers: Map<string, string>) => void;
  testId: string;
  sessionId: string;
  theme?: CategoryTheme;
}

export default function TestPlayer({
  questions,
  onSubmit,
  testId,
  sessionId,
  theme,
}: TestPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [timeSpent, setTimeSpent] = useState(0);

  const themeToUse = theme || defaultTheme;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSelectOption = useCallback((optionId: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, optionId);
    setAnswers(newAnswers);
  }, [answers, currentQuestion.id]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save session with final answers
      await fetch(`/api/tests/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.fromEntries(answers),
          timeSpent,
        }),
      });
      onSubmit(answers);
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  const isAnswered = answers.has(currentQuestion.id);
  const selectedOptionId = answers.get(currentQuestion.id);

  return (
    <div className="min-h-screen bg-slate-900 text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </span>
            <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`bg-gradient-to-r ${themeToUse.progressGradient} h-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800 rounded-lg p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">{currentQuestion.questionText}</h2>
            <p className="text-slate-400 text-sm">
              Dificultad: <span className={themeToUse.accentText}>{currentQuestion.difficulty}</span>
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedOptionId === option.id
                      ? `${themeToUse.accentBorder} ${themeToUse.softBg}`
                      : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${themeToUse.accentText}`}>{option.letter}</span>
                  <span>{option.text}</span>
                  {selectedOptionId === option.id && (
                    <CheckCircle className={`w-5 h-5 ml-auto ${themeToUse.accentText}`} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded transition"
          >
            <ArrowLeft size={18} />
            Anterior
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${themeToUse.accentBg} ${themeToUse.accentBgHover} rounded transition`}
            >
              Siguiente
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition font-bold"
            >
              ✅ Enviar Respuestas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
