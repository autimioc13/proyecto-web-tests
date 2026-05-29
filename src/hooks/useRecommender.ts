'use client';

import { useCallback, useEffect, useState } from 'react';
import { Quiz } from '@/types';
import {
  getRecommendations,
  getSessionBehavior,
  saveSessionBehavior,
  RecommendationWithQuiz,
} from '@/lib/recommender';
import { getAllQuizzes } from '@/data/helpers';

export const useRecommender = (currentQuizSlug: string) => {
  const [recommendations, setRecommendations] = useState<RecommendationWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      const allQuizzes = await getAllQuizzes();
      const behavior = getSessionBehavior();

      if (!behavior.viewedQuizzes.includes(currentQuizSlug)) {
        behavior.viewedQuizzes.push(currentQuizSlug);
      }
      saveSessionBehavior(behavior);

      const recs = getRecommendations(
        allQuizzes,
        currentQuizSlug,
        behavior,
        4
      );
      setRecommendations(recs);
      setLoading(false);
    };

    loadRecommendations();
  }, [currentQuizSlug]);

  const markAsCompleted = useCallback((quizSlug: string) => {
    const behavior = getSessionBehavior();
    if (!behavior.completedQuizzes.includes(quizSlug)) {
      behavior.completedQuizzes.push(quizSlug);
    }
    saveSessionBehavior(behavior);
  }, []);

  return { recommendations, loading, markAsCompleted };
};
