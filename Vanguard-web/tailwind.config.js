/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: 'var(--color-base)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        main: 'var(--color-main)',
        sec: 'var(--color-sec)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}