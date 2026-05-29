import { Quiz, SiloSlug } from '@/types';
import { QUIZZES_SEED } from './quizzes-seed';
import { loadStore, mergeQuizzes } from './store';

let cachedMergedQuizzes: Quiz[] | null = null;

const getMergedQuizzes = async (): Promise<Quiz[]> => {
  if (cachedMergedQuizzes) return cachedMergedQuizzes;

  const storeQuizzes = await loadStore();
  cachedMergedQuizzes = mergeQuizzes(QUIZZES_SEED, storeQuizzes);
  return cachedMergedQuizzes;
};

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  return getMergedQuizzes();
};

export const getQuizBySlug = async (slug: string): Promise<Quiz | undefined> => {
  const all = await getMergedQuizzes();
  return all.find((q) => q.slug === slug);
};

export const getQuizzesBySilo = async (silo: SiloSlug): Promise<Quiz[]> => {
  const all = await getMergedQuizzes();
  return all.filter((q) => q.silo === silo);
};

export const getTrendingQuizzes = async (limit: number = 5): Promise<Quiz[]> => {
  const all = await getMergedQuizzes();
  return all.slice(0, limit);
};

export const searchQuizzes = async (query: string): Promise<Quiz[]> => {
  const all = await getMergedQuizzes();
  const q = query.toLowerCase();
  return all.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(q) ||
      quiz.description.toLowerCase().includes(q) ||
      (quiz.tags && quiz.tags.some((tag) => tag.toLowerCase().includes(q)))
  );
};
