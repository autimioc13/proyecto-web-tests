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

/**
 * Generate inline CSS for gradient background
 */
export function generateGradientStyle(
  fromColor: string,
  toColor: string,
  animated: boolean = false
): string {
  const base = `
    background: linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%);
    background-size: 200% 200%;
  `;

  if (animated) {
    return `${base}animation: gradientShift 8s ease infinite;`;
  }

  return base;
}

/**
 * Keyframe animations for gradients
 */
export const GRADIENT_ANIMATIONS = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;
