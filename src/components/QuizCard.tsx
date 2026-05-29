import Link from 'next/link';
import { Quiz } from '@/types';
import { Clock } from 'lucide-react';

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Link href={`/quiz/${quiz.slug}`}>
      <div className="card p-6 h-full flex flex-col hover:shadow-lg transition cursor-pointer border border-gray-200 rounded-lg bg-white">
        <div className="text-4xl mb-4">{quiz.emoji}</div>

        <h3 className="font-bold text-lg mb-2 text-gray-900">{quiz.title}</h3>

        <p className="text-gray-600 text-sm mb-4 flex-grow">{quiz.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Clock size={16} />
            <span>{quiz.timeMinutes} min</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {quiz.type}
          </span>
        </div>
      </div>
    </Link>
  );
}
