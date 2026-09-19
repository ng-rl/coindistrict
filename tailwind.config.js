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
        'cd-mint-dim': 'rgba(61,255,154,0.15)',
        'cd-ad': '#E8C36A',
        'cd-ad-dim': 'rgba(232,195,106,0.18)',
        'cd-due': '#FF6B6B',
      },
    },
  },
  plugins: [],
}
