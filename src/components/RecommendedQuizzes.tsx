'use client';

import { useEffect, useState } from 'react';
import { Quiz } from '@/types';
import { getAllQuizzes } from '@/data/helpers';
import QuizCard from './QuizCard';

interface RecommendedQuizzesProps {
  currentQuizSlug: string;
  limit?: number;
}

export default function RecommendedQuizzes({
  currentQuizSlug,
  limit = 4,
}: RecommendedQuizzesProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const loadQuizzes = async () => {
      const all = await getAllQuizzes();
      const filtered = all
        .filter((q) => q.slug !== currentQuizSlug)
        .slice(0, limit);
      setQuizzes(filtered);
    };

    loadQuizzes();
  }, [currentQuizSlug, limit]);

  if (quizzes.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Te Might Also Like 🔥</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.slug} quiz={quiz} />
        ))}
      </div>
    </div>
  );
}
