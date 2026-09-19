/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cd-bg': '#0B0B0C',
        'cd-surface': '#141416',
        'cd-line': '#222226',
        'cd-text': '#F4F4F5',
        'cd-muted': '#8B8B93',
        'cd-mint': '#3DFF9A',
        'cd-ad': '#E8C36A',
        'cd-due': '#FF6B6B',
      },
    },
  },
  plugins: [],
}
