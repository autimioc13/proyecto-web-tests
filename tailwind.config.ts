import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
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
