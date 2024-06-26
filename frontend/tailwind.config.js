/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', ...(defaultTheme.fontFamily.serif ?? [])],
        serif: ['Noto Serif', ...(defaultTheme.fontFamily.serif ?? [])],
        mono: ['IBM Plex Mono', ...(defaultTheme.fontFamily.mono ?? [])],
      },
    },
  },
  plugins: [],
};
