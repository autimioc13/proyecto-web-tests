// Psychology color mapping for gradient backgrounds
export const GRADIENT_MAP = {
  personality: {
    from: '#a855f7', // purple-600
    to: '#ec4899', // pink-500
    text: '#ffffff',
  },
  intelligence: {
    from: '#3b82f6', // blue-500
    to: '#06b6d4', // cyan-500
    text: '#ffffff',
  },
  logic: {
    from: '#22c55e', // green-500
    to: '#10b981', // emerald-500
    text: '#ffffff',
  },
  knowledge: {
    from: '#f59e0b', // amber-500
    to: '#fbbf24', // yellow-400
    text: '#000000',
  },
  productivity: {
    from: '#f97316', // orange-500
    to: '#f43f5e', // rose-500
    text: '#ffffff',
  },
  curiosity: {
    from: '#ec4899', // pink-500
    to: '#f43f5e', // rose-500
    text: '#ffffff',
  },
} as const;

export type GradientCategory = keyof typeof GRADIENT_MAP;

export interface GradientStyle {
  from: string;
  to: string;
  text: string;
}

/**
 * Get gradient colors for a specific category
 */
export function getGradientForCategory(category: string): GradientStyle {
  const grad = GRADIENT_MAP[category as GradientCategory] || GRADIENT_MAP.personality;
  return grad;
}

/**
 * Get a random gradient from available options
 */
export function getRandomGradient(): GradientStyle {
  const categories = Object.keys(GRADIENT_MAP) as GradientCategory[];
  const random = categories[Math.floor(Math.random() * categories.length)];
  return GRADIENT_MAP[random];
}

