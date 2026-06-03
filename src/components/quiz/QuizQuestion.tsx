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
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          aria-label="Abandonar quiz"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </p>
        </div>
        <div className="w-10" />
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              className={`w-full p-4 text-left rounded-lg border-2 font-semibold transition ${
                selectedOption === option.id
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-blue-400'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!selectedOption}
          className="px-6 py-3 bg-blue-600 text-white font-semibold w-full mt-8 flex items-center justify-center gap-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Ver Resultado' : 'Siguiente'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
