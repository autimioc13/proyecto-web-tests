import { Quiz } from '@/types';
import { Clock, Zap } from 'lucide-react';

interface QuizIntroProps {
  quiz: Quiz;
  onStart: () => void;
}

export default function QuizIntro({ quiz, onStart }: QuizIntroProps) {
  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8 sm:p-12 text-center max-w-2xl mx-auto">
      <div className="text-8xl mb-6 animate-bounce">{quiz.emoji}</div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{quiz.title}</h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">{quiz.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-8 bg-white/10 dark:bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/20">
        <div>
          <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-semibold mb-1">
            <Clock size={20} />
            Duración
          </div>
          <p className="text-gray-600 dark:text-gray-400">{quiz.timeMinutes} minutos</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-semibold mb-1">
            <Zap size={20} />
            Preguntas
          </div>
          <p className="text-gray-600 dark:text-gray-400">{quiz.questions.length} preguntas</p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all w-full sm:w-auto border border-white/20 backdrop-blur-sm"
      >
        ¡Comenzar Ahora! 🚀
      </button>

      <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
        Este test es solo por diversión. Los resultados no son diagnósticos científicos.
      </p>
    </div>
  );
}
