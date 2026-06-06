import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        atoms: {
          dark: '#0f0f0f',
          card: '#1a1a1a',
          border: '#2a2a2a',
          accent: '#3b82f6',
          accentHover: '#2563eb',
          text: '#e5e5e5',
          textMuted: '#a3a3a3',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        agent: {
          mike: '#8b5cf6',
          emma: '#ec4899',
          bob: '#3b82f6',
          alex: '#10b981',
          david: '#f59e0b',
          iris: '#06b6d4',
          sarah: '#84cc16',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'typing': 'typing 1.5s infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}
export default config
