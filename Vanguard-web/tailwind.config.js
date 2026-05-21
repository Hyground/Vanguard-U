/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0B0F19',
        card: '#111827',
        border: '#1F2937',
        main: '#F9FAFB',
        sec: '#9CA3AF',
        accent: '#6366F1',
        success: '#10B981',
        warning: '#F59E0B'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}