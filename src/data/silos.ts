import { SiloInfo } from '@/types';

export const SILOS: Record<string, SiloInfo> = {
  personalidad: {
    slug: 'personalidad',
    label: 'Personalidad',
    color: 'from-pink-500 to-rose-600',
    emoji: '😊',
    description: 'Descubre quién eres realmente',
  },
  trivia: {
    slug: 'trivia',
    label: 'Trivia',
    color: 'from-blue-500 to-cyan-600',
    emoji: '🧠',
    description: 'Pon a prueba tu conocimiento',
  },
  curiosidades: {
    slug: 'curiosidades',
    label: 'Curiosidades',
    color: 'from-purple-500 to-indigo-600',
    emoji: '🤔',
    description: 'Hechos sorprendentes del mundo',
  },
  util: {
    slug: 'util',
    label: 'Tests Útiles',
    color: 'from-green-500 to-emerald-600',
    emoji: '💡',
    description: 'Toma mejores decisiones',
  },
};

export const getSiloInfo = (slug: string): SiloInfo | undefined => {
  return SILOS[slug];
};

export const getAllSilos = (): SiloInfo[] => {
  return Object.values(SILOS);
};
