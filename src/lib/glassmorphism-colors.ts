/**
 * Glasmorphism Color Palette System
 * QuizLab v1.0
 *
 * Psychology-based color palette mapped to category silos with
 * glassmorphism-specific values (gradients, light/dark glass backgrounds).
 *
 * Six psychological silos:
 * 1. Inteligencia (Blue) - Confidence, concentration
 * 2. Personalidad (Purple) - Introspection, self-awareness
 * 3. Lógica (Green) - Balance, clarity
 * 4. Conocimiento (Amber) - Wisdom, illumination
 * 5. Productividad (Orange) - Energy, action
 * 6. Curiosidades (Pink) - Creativity, exploration
 */

export type SiloKey = 'inteligencia' | 'personalidad' | 'logica' | 'conocimiento' | 'productividad' | 'curiosidades';

/**
 * Glasmorphism color configuration for a single silo
 */
export interface GlassmorphismSilo {
  // Primary and secondary gradient colors
  gradient: string; // Tailwind gradient class (e.g., 'from-blue-500 to-cyan-500')
  gradientFrom: string; // Starting color class
  gradientTo: string; // Ending color class

  // Glasmorphic backgrounds - light mode (typically white/light base)
  light: {
    glass: string; // RGBA semi-transparent background
    glassBorder: string; // Border color for glass effect
    glassHover: string; // Hover state
  };

  // Glasmorphic backgrounds - dark mode
  dark: {
    glass: string; // RGBA semi-transparent background
    glassBorder: string; // Border color for glass effect
    glassHover: string; // Hover state
  };

  // Glow effect colors
  glow: {
    light: string; // Light glow RGBA
    medium: string; // Medium glow RGBA
    strong: string; // Strong glow RGBA
  };

  // Solid accent colors (for text, icons, buttons)
  accent: {
    primary: string; // Primary accent color
    secondary: string; // Secondary accent color
    text: string; // Text color for this theme
    textInverted: string; // Inverted text color
  };
}

/**
 * Main glasmorphism colors configuration
 */
export const GLASSMORPHISM_COLORS: Record<SiloKey, GlassmorphismSilo> = {
  // Inteligencia - Blue: Confidence, Trust, Concentration
  inteligencia: {
    gradient: 'from-blue-500 to-cyan-500',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    light: {
      glass: 'rgba(59, 130, 246, 0.1)', // blue-500 @ 10%
      glassBorder: 'rgba(59, 130, 246, 0.2)',
      glassHover: 'rgba(59, 130, 246, 0.15)',
    },
    dark: {
      glass: 'rgba(59, 130, 246, 0.05)',
      glassBorder: 'rgba(59, 130, 246, 0.1)',
      glassHover: 'rgba(59, 130, 246, 0.08)',
    },
    glow: {
      light: 'rgba(59, 130, 246, 0.3)',
      medium: 'rgba(59, 130, 246, 0.5)',
      strong: 'rgba(59, 130, 246, 0.7)',
    },
    accent: {
      primary: 'rgb(59, 130, 246)', // blue-500
      secondary: 'rgb(34, 211, 238)', // cyan-500
      text: 'rgb(191, 219, 254)', // blue-200
      textInverted: 'rgb(30, 58, 138)', // blue-900
    },
  },

  // Personalidad - Purple: Introspection, Self-Awareness, Reflection
  personalidad: {
    gradient: 'from-purple-500 to-pink-500',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
    light: {
      glass: 'rgba(168, 85, 247, 0.1)', // purple-500 @ 10%
      glassBorder: 'rgba(168, 85, 247, 0.2)',
      glassHover: 'rgba(168, 85, 247, 0.15)',
    },
    dark: {
      glass: 'rgba(168, 85, 247, 0.05)',
      glassBorder: 'rgba(168, 85, 247, 0.1)',
      glassHover: 'rgba(168, 85, 247, 0.08)',
    },
    glow: {
      light: 'rgba(168, 85, 247, 0.3)',
      medium: 'rgba(168, 85, 247, 0.5)',
      strong: 'rgba(168, 85, 247, 0.7)',
    },
    accent: {
      primary: 'rgb(168, 85, 247)', // purple-500
      secondary: 'rgb(236, 72, 153)', // pink-500
      text: 'rgb(221, 214, 254)', // purple-200
      textInverted: 'rgb(88, 28, 135)', // purple-900
    },
  },

  // Lógica - Green/Emerald: Balance, Clarity, Growth
  logica: {
    gradient: 'from-green-500 to-emerald-500',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
    light: {
      glass: 'rgba(34, 197, 94, 0.1)', // green-500 @ 10%
      glassBorder: 'rgba(34, 197, 94, 0.2)',
      glassHover: 'rgba(34, 197, 94, 0.15)',
    },
    dark: {
      glass: 'rgba(34, 197, 94, 0.05)',
      glassBorder: 'rgba(34, 197, 94, 0.1)',
      glassHover: 'rgba(34, 197, 94, 0.08)',
    },
    glow: {
      light: 'rgba(34, 197, 94, 0.3)',
      medium: 'rgba(34, 197, 94, 0.5)',
      strong: 'rgba(34, 197, 94, 0.7)',
    },
    accent: {
      primary: 'rgb(34, 197, 94)', // green-500
      secondary: 'rgb(16, 185, 129)', // emerald-500
      text: 'rgb(187, 247, 208)', // green-200
      textInverted: 'rgb(20, 83, 45)', // green-900
    },
  },

  // Conocimiento - Amber: Wisdom, Illumination, Learning
  conocimiento: {
    gradient: 'from-amber-500 to-yellow-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-yellow-500',
    light: {
      glass: 'rgba(245, 158, 11, 0.1)', // amber-500 @ 10%
      glassBorder: 'rgba(245, 158, 11, 0.2)',
      glassHover: 'rgba(245, 158, 11, 0.15)',
    },
    dark: {
      glass: 'rgba(245, 158, 11, 0.05)',
      glassBorder: 'rgba(245, 158, 11, 0.1)',
      glassHover: 'rgba(245, 158, 11, 0.08)',
    },
    glow: {
      light: 'rgba(245, 158, 11, 0.3)',
      medium: 'rgba(245, 158, 11, 0.5)',
      strong: 'rgba(245, 158, 11, 0.7)',
    },
    accent: {
      primary: 'rgb(245, 158, 11)', // amber-500
      secondary: 'rgb(234, 179, 8)', // yellow-500
      text: 'rgb(254, 243, 199)', // amber-100
      textInverted: 'rgb(120, 53, 15)', // amber-900
    },
  },

  // Productividad - Orange: Energy, Action, Drive
  productividad: {
    gradient: 'from-orange-500 to-amber-500',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-amber-500',
    light: {
      glass: 'rgba(249, 115, 22, 0.1)', // orange-500 @ 10%
      glassBorder: 'rgba(249, 115, 22, 0.2)',
      glassHover: 'rgba(249, 115, 22, 0.15)',
    },
    dark: {
      glass: 'rgba(249, 115, 22, 0.05)',
      glassBorder: 'rgba(249, 115, 22, 0.1)',
      glassHover: 'rgba(249, 115, 22, 0.08)',
    },
    glow: {
      light: 'rgba(249, 115, 22, 0.3)',
      medium: 'rgba(249, 115, 22, 0.5)',
      strong: 'rgba(249, 115, 22, 0.7)',
    },
    accent: {
      primary: 'rgb(249, 115, 22)', // orange-500
      secondary: 'rgb(245, 158, 11)', // amber-500
      text: 'rgb(254, 230, 200)', // orange-100
      textInverted: 'rgb(124, 45, 18)', // orange-900
    },
  },

  // Curiosidades - Pink/Fuchsia: Creativity, Exploration, Wonder
  curiosidades: {
    gradient: 'from-pink-500 to-fuchsia-500',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-fuchsia-500',
    light: {
      glass: 'rgba(236, 72, 153, 0.1)', // pink-500 @ 10%
      glassBorder: 'rgba(236, 72, 153, 0.2)',
      glassHover: 'rgba(236, 72, 153, 0.15)',
    },
    dark: {
      glass: 'rgba(236, 72, 153, 0.05)',
      glassBorder: 'rgba(236, 72, 153, 0.1)',
      glassHover: 'rgba(236, 72, 153, 0.08)',
    },
    glow: {
      light: 'rgba(236, 72, 153, 0.3)',
      medium: 'rgba(236, 72, 153, 0.5)',
      strong: 'rgba(236, 72, 153, 0.7)',
    },
    accent: {
      primary: 'rgb(236, 72, 153)', // pink-500
      secondary: 'rgb(217, 70, 239)', // fuchsia-500
      text: 'rgb(249, 208, 232)', // pink-200
      textInverted: 'rgb(131, 24, 67)', // pink-900
    },
  },
};

/**
 * Helper function to get glasmorphism colors for a specific silo
 */
export function getGlassmorphismSilo(siloKey: SiloKey | string | null | undefined): GlassmorphismSilo {
  if (!siloKey || !(siloKey in GLASSMORPHISM_COLORS)) {
    return GLASSMORPHISM_COLORS.personalidad; // Default to personalidad
  }
  return GLASSMORPHISM_COLORS[siloKey as SiloKey];
}

/**
 * Generate inline glass background style based on mode
 * Useful for dynamic styling where Tailwind classes aren't available
 */
export function getGlassStyle(
  siloKey: SiloKey,
  isDark: boolean = false,
  intensity: 'light' | 'medium' | 'strong' = 'light'
): React.CSSProperties {
  const silo = GLASSMORPHISM_COLORS[siloKey];
  const colors = isDark ? silo.dark : silo.light;

  return {
    backgroundColor: colors.glass,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.glassBorder}`,
  };
}

/**
 * Get glow shadow style for premium effect
 */
export function getGlassShadowStyle(siloKey: SiloKey, intensity: 'light' | 'medium' | 'strong' = 'medium'): React.CSSProperties {
  const silo = GLASSMORPHISM_COLORS[siloKey];
  const glow = silo.glow[intensity];

  return {
    boxShadow: `0 8px 32px ${glow}`,
  };
}

/**
 * Combine glass and shadow styles
 */
export function getGlassmorphismStyle(
  siloKey: SiloKey,
  isDark: boolean = false,
  includeGlow: boolean = true
): React.CSSProperties {
  return {
    ...getGlassStyle(siloKey, isDark),
    ...(includeGlow && getGlassShadowStyle(siloKey, 'medium')),
  };
}

/**
 * Export default silo for convenience
 */
export const defaultGlassmorphismSilo = GLASSMORPHISM_COLORS.personalidad;
