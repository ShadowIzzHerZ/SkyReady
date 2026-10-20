/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        defense: {
          950: '#070b14',
          900: '#0b1120',
          850: '#111a2e',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          accent: '#38bdf8',
          radar: '#06b6d4',
          amber: '#f59e0b',
          ready: '#10b981',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
