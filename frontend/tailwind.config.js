/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#003d7a',
          dark:    '#002554',
          light:   '#1a5fa8',
          50:      '#e6f0ff',
        },
        gold: {
          DEFAULT: '#F0A500',
          dark:    '#cc8c00',
          light:   '#f5c842',
        },
        surface: '#f4f6f9',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,61,122,0.08)',
        lift: '0 8px 32px rgba(0,61,122,0.14)',
        hero: '0 20px 60px rgba(0,61,122,0.18)',
      },
    },
  },
  plugins: [],
}
