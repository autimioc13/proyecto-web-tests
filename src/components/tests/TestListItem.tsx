'use client';

import Link from 'next/link';
import { Test } from '@/lib/api/tests';
import { Clock, BookOpen } from 'lucide-react';

interface TestListItemProps {
  test: Test;
}

export default function TestListItem({ test }: TestListItemProps) {
  // Determine difficulty color
  const getDifficultyColor = () => {
    switch (test.difficulty) {
      case 'easy':
        return 'bg-green-400 text-white';
      case 'medium':
        return 'bg-yellow-400 text-slate-900';
      case 'hard':
        return 'bg-red-400 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  // Get difficulty label
  const getDifficultyLabel = () => {
    switch (test.difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Medio';
      case 'hard':
        return 'Difícil';
      default:
        return test.difficulty;
    }
  };

  return (
    <Link href={`/tests/${test.id}`}>
      <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-purple-500 dark:hover:border-purple-400">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 mb-2">
              {test.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
              {test.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-6 text-sm">
              {/* Question Count */}
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <BookOpen size={16} className="text-slate-500 dark:text-slate-400" />
                <span>{test.questionCount} preguntas</span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock size={16} className="text-slate-500 dark:text-slate-400" />
                <span>{test.timeMinutes} min</span>
              </div>
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getDifficultyColor()}`}>
            {getDifficultyLabel()}
          </div>
        </div>

        {/* Hover Arrow */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-5 h-5 text-purple-600 dark:text-purple-400 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
