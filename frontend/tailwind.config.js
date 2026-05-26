/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        quantum: { DEFAULT: '#a855f7', light: '#c084fc', dark: '#7e22ce' },
        gold: { DEFAULT: '#f59e0b', light: '#fcd34d' },
        classical: { DEFAULT: '#3b82f6', light: '#93c5fd' },
      },
    },
  },
  plugins: [],
}
