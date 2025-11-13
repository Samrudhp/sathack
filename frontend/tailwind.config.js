/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: '#f5f0e6',
        forest: '#2f5233',
        olive: '#afc3a2',
        hazard: '#b73939',
      },
    },
  },
  plugins: [],
}
