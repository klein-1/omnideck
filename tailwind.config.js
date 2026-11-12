/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        retro: ['"Pixelify Sans"', 'monospace'],
        mono: ['"Space Mono"', '"JetBrains Mono"', 'monospace'],
        display: ['"Silkscreen"', 'cursive'],
      },
      colors: {
        deck: {
          bg: '#0a0d12',
          surface: '#12171f',
          surfaceHover: '#18202b',
          border: '#2b3544',
          borderLight: '#3e4c60',
          dark: '#06080b',
        },
        arcade: {
          emerald: '#00ff88',
          green: '#10b981',
          amber: '#ffb703',
          coral: '#ff4757',
          cyan: '#00f0ff',
          blue: '#3b82f6',
          violet: '#a78bfa',
          paper: '#f8fafc',
          muted: '#8b9bb4',
        }
      },
      boxShadow: {
        'pixel': '3px 3px 0px 0px #000000',
        'pixel-sm': '2px 2px 0px 0px #000000',
        'pixel-lg': '5px 5px 0px 0px #000000',
        'pixel-emerald': '3px 3px 0px 0px #00ff88',
        'pixel-amber': '3px 3px 0px 0px #ffb703',
        'pixel-coral': '3px 3px 0px 0px #ff4757',
        'pixel-cyan': '3px 3px 0px 0px #00f0ff',
        'pixel-white': '3px 3px 0px 0px #f8fafc',
      }
    },
  },
  plugins: [],
}

