/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(245, 158, 11, 0.1)',
        '4xl': '0 50px 100px -20px rgba(245, 158, 11, 0.15)',
        '5xl': '0 65px 130px -30px rgba(245, 158, 11, 0.2)',
        '6xl': '0 80px 160px -40px rgba(245, 158, 11, 0.25)',
        '7xl': '0 100px 200px -50px rgba(245, 158, 11, 0.3)',
      },
      animation: {
        'gradient-flow': 'gradient-flow 5s linear infinite',
      },
      keyframes: {
        'gradient-flow': {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        }
      }
    },
  },
  plugins: [],
}
