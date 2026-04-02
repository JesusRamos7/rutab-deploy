/** @type {import('tailwindcss').Config} */
module.exports = {
  // Asegúrate de incluir todas las rutas donde usarás clases de Tailwind
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#123a5d', // Celeste Negro
          light: '#1e5382',
          dark: '#0a2239',
        },
        dark: {
          DEFAULT: '#000000', 
          soft: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
};
