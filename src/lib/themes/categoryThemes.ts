// src/lib/themes/categoryThemes.ts

/**
 * Sistema de Psicología de Colores por Categoría — QuizLab
 *
 * IMPORTANTE: Todas las clases son strings literales completos para que
 * Tailwind no las purgue. NUNCA construir clases por interpolación
 * (ej. `bg-${color}-500`). Si se añade una clase nueva aquí, añadirla
 * también al safelist en tailwind.config.ts.
 */

export type CategoryId =
  | 'inteligencia'
  | 'personalidad'
  | 'logica'
  | 'conocimiento'
  | 'productividad'
  | 'curiosidades';

export interface CategoryTheme {
  id: CategoryId;
  name: string;
  icon: string;
  psychology: string;

  // --- Gradientes (TestCard, headers) ---
  gradient: string;
  gradientFrom: string;
  gradientTo: string;

  // --- Acentos sólidos (botones, iconos, texto destacado) ---
  accentBg: string;
  accentBgHover: string;
  accentText: string;
  accentBorder: string;
  accentRing: string;

  // --- Superficies tenues sobre dark (slate-900) ---
  softBg: string;
  softBorder: string;

  // --- Barra de progreso ---
  progressGradient: string;
}

export const categoryThemes: Record<CategoryId, CategoryTheme> = {
  inteligencia: {
    id: 'inteligencia',
    name: 'Inteligencia',
    icon: '🧠',
    psychology: 'Azul — confianza, concentración',
    gradient: 'from-blue-500 to-cyan-500',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    accentBg: 'bg-blue-600',
    accentBgHover: 'hover:bg-blue-700',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-500',
    accentRing: 'ring-blue-500',
    softBg: 'bg-blue-900/30',
    softBorder: 'border-blue-700',
    progressGradient: 'from-blue-500 to-blue-600',
  },
  personalidad: {
    id: 'personalidad',
    name: 'Personalidad',
    icon: '👤',
    psychology: 'Púrpura — introspección, autoconocimiento',
    gradient: 'from-purple-500 to-violet-500',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-violet-500',
    accentBg: 'bg-purple-600',
    accentBgHover: 'hover:bg-purple-700',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-500',
    accentRing: 'ring-purple-500',
    softBg: 'bg-purple-900/30',
    softBorder: 'border-purple-700',
    progressGradient: 'from-purple-500 to-purple-600',
  },
  logica: {
    id: 'logica',
    name: 'Lógica',
    icon: '🎯',
    psychology: 'Verde — equilibrio, claridad',
    gradient: 'from-green-500 to-emerald-500',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
    accentBg: 'bg-green-600',
    accentBgHover: 'hover:bg-green-700',
    accentText: 'text-green-400',
    accentBorder: 'border-green-500',
    accentRing: 'ring-green-500',
    softBg: 'bg-green-900/30',
    softBorder: 'border-green-700',
    progressGradient: 'from-green-500 to-green-600',
  },
  conocimiento: {
    id: 'conocimiento',
    name: 'Conocimiento',
    icon: '📚',
    psychology: 'Ámbar — sabiduría, iluminación',
    gradient: 'from-amber-500 to-yellow-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-yellow-500',
    accentBg: 'bg-amber-600',
    accentBgHover: 'hover:bg-amber-700',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500',
    accentRing: 'ring-amber-500',
    softBg: 'bg-amber-900/30',
    softBorder: 'border-amber-700',
    progressGradient: 'from-amber-500 to-amber-600',
  },
  productividad: {
    id: 'productividad',
    name: 'Productividad',
    icon: '⚡',
    psychology: 'Naranja — energía, acción',
    gradient: 'from-orange-500 to-amber-500',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-amber-500',
    accentBg: 'bg-orange-600',
    accentBgHover: 'hover:bg-orange-700',
    accentText: 'text-orange-400',
    accentBorder: 'border-orange-500',
    accentRing: 'ring-orange-500',
    softBg: 'bg-orange-900/30',
    softBorder: 'border-orange-700',
    progressGradient: 'from-orange-500 to-orange-600',
  },
  curiosidades: {
    id: 'curiosidades',
    name: 'Curiosidades',
    icon: '✨',
    psychology: 'Rosa/Magenta — creatividad, exploración',
    gradient: 'from-pink-500 to-fuchsia-500',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-fuchsia-500',
    accentBg: 'bg-pink-600',
    accentBgHover: 'hover:bg-pink-700',
    accentText: 'text-pink-400',
    accentBorder: 'border-pink-500',
    accentRing: 'ring-pink-500',
    softBg: 'bg-pink-900/30',
    softBorder: 'border-pink-700',
    progressGradient: 'from-pink-500 to-pink-600',
  },
};

export const defaultTheme: CategoryTheme = categoryThemes.personalidad;

export function getCategoryTheme(categoryId?: string | null): CategoryTheme {
  if (!categoryId) return defaultTheme;
  return categoryThemes[categoryId as CategoryId] ?? defaultTheme;
}
