import Link from 'next/link';
import { Quiz } from '@/types';
import { Clock } from 'lucide-react';

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Link href={`/quiz/${quiz.slug}`}>
      <div className="card p-6 h-full flex flex-col hover:shadow-lg hover:shadow-white/20 transition cursor-pointer border border-gray-200/50 dark:border-white/20 rounded-lg bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl hover:bg-gray-100/70 dark:hover:bg-white/10">
        <div className="text-4xl mb-4">{quiz.emoji}</div>

        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{quiz.title}</h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">{quiz.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-white/20">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
            <Clock size={16} />
            <span>{quiz.timeMinutes} min</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-500">
            {quiz.type}
          </span>
        </div>
      </div>
    </Link>
  );
}
