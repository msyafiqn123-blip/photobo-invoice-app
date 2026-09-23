/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        photobo: {
          dark: '#160C10',       // Dark black used in header & table header
          cream: '#EFE7DA',      // Warm sand / cream background of invoice card
          card: '#F4EFE6',       // Secondary cream tone
          taupe: '#C1B6A4',      // Taupe/khaki outer border & lines
          line: '#000000',       // Crisp black separator lines
          red: '#D91B24',        // Official stamp red
        }
      },
      fontFamily: {
        mulish: ['Mulish', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        bodoni: ['"Bodoni Moda"', '"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
