import { colors, spacing, radius, shadows } from './src/ui/tokens'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Фоновые цвета
        bg0: colors.bg0,
        bg1: colors.bg1,
        bg2: colors.bg2,

        // Поверхности
        surface: colors.surface,
        'surface-hover': colors.surfaceHover,

        // Разделители
        stroke: colors.stroke,

        // Текст
        textPrimary: colors.textPrimary,
        textSecondary: colors.textSecondary,
        textTertiary: colors.textTertiary,

        // Акцент
        accent: colors.accent,
        accentHover: colors.accentHover,
        accentLight: colors.accentLight,

        // Статусы
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        ...spacing,
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      borderRadius: radius,
      boxShadow: shadows,
      screens: {
        'xs': '375px',
        'iphone': '393px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}