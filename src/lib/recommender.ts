import { Quiz, SiloSlug, RecommendationScore } from '@/types';

interface SessionBehavior {
  viewedQuizzes: string[];
  completedQuizzes: string[];
  timeSpent: Record<string, number>;
}

export interface RecommendationWithQuiz extends RecommendationScore {
  quiz: Quiz;
}

export const getRecommendations = (
  allQuizzes: Quiz[],
  currentQuizSlug: string,
  sessionBehavior: SessionBehavior,
  limit: number = 4
): RecommendationWithQuiz[] => {
  const recommendations: RecommendationWithQuiz[] = [];

  allQuizzes.forEach((quiz) => {
    if (
      quiz.slug === currentQuizSlug ||
      sessionBehavior.completedQuizzes.includes(quiz.slug)
    ) {
      return;
    }

    let score = 0;
    let reason = '';

    if (sessionBehavior.viewedQuizzes.length > 0) {
      const viewedSilo = sessionBehavior.viewedQuizzes[0].split('-')[0];
      if (quiz.slug.startsWith(viewedSilo)) {
        score += 40;
        reason = 'Similar a lo que viste';
      }
    }

    const currentQuiz = allQuizzes.find((q) => q.slug === currentQuizSlug);
    if (currentQuiz && currentQuiz.tags && quiz.tags) {
      const commonTags = currentQuiz.tags.filter((tag) =>
        quiz.tags!.includes(tag)
      ).length;
      const similarity = (commonTags / Math.max(currentQuiz.tags.length, quiz.tags.length)) * 35;
      score += similarity;
      if (commonTags > 0) {
        reason = `Comparte tema de ${currentQuiz.tags[0]}`;
      }
    }

    const popularityBoost = Math.random() * 25;
    score += popularityBoost;

    recommendations.push({ quiz, score, reason });
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
};

export const saveSessionBehavior = (behavior: SessionBehavior) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sessionBehavior', JSON.stringify(behavior));
};

export const getSessionBehavior = (): SessionBehavior => {
  if (typeof window === 'undefined') {
    return { viewedQuizzes: [], completedQuizzes: [], timeSpent: {} };
  }
  const saved = localStorage.getItem('sessionBehavior');
  return saved ? JSON.parse(saved) : { viewedQuizzes: [], completedQuizzes: [], timeSpent: {} };
};
