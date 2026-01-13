/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e0e7ff',
          500: '#4f46e5',
          600: '#4338ca',
          900: '#312e81',
        },
      },
    },
  },
  plugins: [],
};
