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
          light: '#ffffff',
          dark: '#1a202c',
        },
        secondary: {
          light: '#f7fafc',
          dark: '#2d3748',
        },
        text: {
          light: '#2d3748',
          dark: '#f7fafc',
        }
      }
    },
  },
  plugins: [],
}
