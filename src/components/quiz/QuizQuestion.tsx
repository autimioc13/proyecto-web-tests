import { Quiz } from '@/types';
import { ChevronRight, X } from 'lucide-react';

interface QuizQuestionProps {
  quiz: Quiz;
  currentQuestionIndex: number;
  totalQuestions: number;
  onSelectOption: (optionId: string) => void;
  onNext: () => void;
  onAbandon: () => void;
  selectedOption?: string;
}

export default function QuizQuestion({
  quiz,
  currentQuestionIndex,
  totalQuestions,
  onSelectOption,
  onNext,
  onAbandon,
  selectedOption,
}: QuizQuestionProps) {
  const question = quiz.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onAbandon}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition backdrop-blur-sm"
          aria-label="Abandonar quiz"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </p>
        </div>
        <div className="w-10" />
      </div>

      <div className="w-full bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              className={`w-full p-4 text-left rounded-lg border-2 font-semibold transition-all duration-200 backdrop-blur-sm ${
                selectedOption === option.id
                  ? 'border-blue-500 bg-blue-500/20 text-blue-900 dark:text-blue-100 shadow-lg shadow-blue-500/20'
                  : 'border-white/20 bg-white/5 dark:bg-white/5 text-gray-900 dark:text-white hover:border-white/40 hover:bg-white/10'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!selectedOption}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold w-full mt-8 flex items-center justify-center gap-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none backdrop-blur-sm border border-white/20"
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Ver Resultado' : 'Siguiente'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
