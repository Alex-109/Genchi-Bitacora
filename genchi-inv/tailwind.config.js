// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'app-gradient': 'linear-gradient(120deg,#f8fafc 0%,#eef2ff 50%,#f1f5f9 100%)',
        'app-gradient-dark': 'linear-gradient(180deg,#0f172a 0%,#071032 60%)',
        'app-texture': "url('/images/texture-soft.png')"
      },
      colors: {
        'page-ink': '#0f172a'
      }
    },
  },
  plugins: [],
}
