/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      colors: {
        gray: {
          750: '#374151',
          850: '#1f2937',
          950: '#0f172a',
        }
      },
      spacing: {
        '18': '4.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}