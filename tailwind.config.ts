import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Glasmorphism backdrop blur levels
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      // Glasmorphism semi-transparent backgrounds
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.1)',
        'glass-light-hover': 'rgba(255, 255, 255, 0.15)',
        'glass-dark': 'rgba(0, 0, 0, 0.1)',
        'glass-dark-hover': 'rgba(0, 0, 0, 0.15)',
      },
      // Glasmorphism border colors
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.2)',
        'glass-light': 'rgba(255, 255, 255, 0.25)',
      },
      // Glasmorphism shadows
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px rgba(31, 38, 135, 0.25)',
        'glass-xl': '0 16px 48px rgba(31, 38, 135, 0.45)',
      },
      // Glow effects for glasmorphism
      textShadow: {
        'glow': '0 0 10px rgba(255, 255, 255, 0.5)',
        'glow-md': '0 0 20px rgba(255, 255, 255, 0.6)',
        'glow-lg': '0 0 30px rgba(255, 255, 255, 0.7)',
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern:
        /(from|to|bg|text|border|ring)-(blue|cyan|purple|violet|green|emerald|amber|yellow|orange|pink|fuchsia)-(400|500|600|700)/,
      variants: ['hover', 'group-hover'],
    },
    {
      pattern:
        /bg-(blue|purple|green|amber|orange|pink)-900\/30/,
    },
  ],
} as any;

export default config;
