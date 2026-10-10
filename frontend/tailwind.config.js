/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1.05rem' }],
        'xs': ['0.875rem', { lineHeight: '1.25rem' }],     // Bumped from 12px to 14px
        'sm': ['0.975rem', { lineHeight: '1.45rem' }],     // Bumped from 14px to 15.6px
        'base': ['1.0625rem', { lineHeight: '1.65rem' }],  // Bumped from 16px to 17px
        'lg': ['1.2rem', { lineHeight: '1.75rem' }],
        'xl': ['1.375rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.675rem', { lineHeight: '2.15rem' }],
        '3xl': ['2.125rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.625rem', { lineHeight: '3rem' }],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}
