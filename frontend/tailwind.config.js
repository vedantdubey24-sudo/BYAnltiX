/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#101113',
          secondary: '#202226',
          deep: '#050506',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#D9DADD',
          muted: '#92969E',
        },
        silver: {
          light: '#E2E4E9',
          metallic: '#A6AAB3',
          dark: '#3A3D45',
        }
      },
      fontFamily: {
        space: ['"Space Grotesk"', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        bebas: ['"Bebas Neue"', '"Oswald"', 'sans-serif'],
        oswald: ['"Oswald"', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
