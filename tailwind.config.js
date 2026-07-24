// File: tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f2',
          100: '#fbe5e5',
          200: '#f7c0c1',
          500: '#781215',
          600: '#640f12',
          700: '#500c0e',
          800: '#3c090b',
          900: '#280607',
        },
      },
    },
  },
  plugins: [],
};
