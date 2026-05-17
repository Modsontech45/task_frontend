/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        school:   '#2563eb',
        gym:      '#f97316',
        skill:    '#22c55e',
        bilingual:'#a855f7',
        reading:  '#eab308',
        personal: '#ef4444',
        travel:   '#6b7280',
      },
    },
  },
  plugins: [],
};
