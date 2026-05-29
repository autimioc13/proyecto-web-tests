import { Quiz } from '@/types';

let cachedStore: { quizzes: Quiz[] } | null = null;

export const loadStore = async (): Promise<Quiz[]> => {
  if (cachedStore) return cachedStore.quizzes;

  try {
    const res = await fetch('/data/quizzes-store.json');
    const data = await res.json();
    cachedStore = data;
    return data.quizzes || [];
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
