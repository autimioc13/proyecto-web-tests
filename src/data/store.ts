import { Quiz } from '@/types';
import storeData from '../../public/data/quizzes-store.json';

let cachedStore: { quizzes: Quiz[] } | null = null;

export const loadStore = async (): Promise<Quiz[]> => {
  if (cachedStore) return cachedStore.quizzes;

  try {
    const data = Array.isArray(storeData)
      ? storeData
      : ((storeData as any).quizzes || []);
    const quizzes = data as Quiz[];
    cachedStore = { quizzes };
    return quizzes;
  } catch {
    console.error('Failed to load quizzes-store.json');
    return [];
  }
};

export const mergeQuizzes = (seed: Quiz[], store: Quiz[]): Quiz[] => {
  const seedMap = new Map(seed.map((q) => [q.slug, q]));
  const storeMap = new Map(store.map((q) => [q.slug, q]));

  const merged = new Map(seedMap);
  storeMap.forEach((quiz, slug) => merged.set(slug, quiz));

  return Array.from(merged.values());
};
