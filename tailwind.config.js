// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#0D1B14',
        surface: '#122019',
        border:  '#1E3328',
        gold:    '#C9A84C',
        muted:   '#8A9E8F',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono:  ['DM Mono', 'Courier New', 'monospace'],
        sans:  ['IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
