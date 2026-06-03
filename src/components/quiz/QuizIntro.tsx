import { Quiz } from '@/types';
import { Clock, Zap } from 'lucide-react';

interface QuizIntroProps {
  quiz: Quiz;
  onStart: () => void;
}

export default function QuizIntro({ quiz, onStart }: QuizIntroProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center max-w-2xl mx-auto">
      <div className="text-8xl mb-6 animate-bounce">{quiz.emoji}</div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">{quiz.title}</h1>
      <p className="text-gray-600 text-lg mb-8">{quiz.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-6 rounded-lg">
        <div>
          <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold mb-1">
            <Clock size={20} />
            Duración
          </div>
          <p className="text-gray-600">{quiz.timeMinutes} minutos</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold mb-1">
            <Zap size={20} />
            Preguntas
          </div>
          <p className="text-gray-600">{quiz.questions.length} preguntas</p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto shadow-md hover:shadow-lg"
      >
        ¡Comenzar Ahora! 🚀
      </button>

      <p className="text-gray-500 text-sm mt-6">
        Este test es solo por diversión. Los resultados no son diagnósticos científicos.
      </p>
    </div>
  );
}
