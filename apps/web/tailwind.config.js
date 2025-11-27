/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        dark: {
          bg: '#0A0E27',
          'bg-secondary': '#151A30',
          'bg-tertiary': '#1F2638',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'glow': '0 0 32px rgba(255, 107, 53, 0.4)',
        'glow-success': '0 0 32px rgba(56, 239, 125, 0.4)',
        'glow-accent': '0 0 32px rgba(102, 126, 234, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-in-up': 'fadeInUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-scale': 'fadeInScale 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slideInRight 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'count-up': 'countUp 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: 0, transform: 'translateY(-16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInScale: {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: 0, transform: 'translateX(24px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: 0, transform: 'translateX(-24px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.6)' },
        },
        countUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDB833 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF385C 0%, #E61E4D 50%, #D70466 100%)',
        'gradient-accent': 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)',
        'gradient-success': 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',
        'gradient-analytics': 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
