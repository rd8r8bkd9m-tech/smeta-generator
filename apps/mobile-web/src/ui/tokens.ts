// Дизайн-токены Status App
// Цвета подобраны для премиального dark-first дизайна

export const colors = {
  // Фоновые цвета (dark theme по умолчанию)
  bg0: '#000000', // почти черный с синеватым оттенком
  bg1: '#0a0a0f', // глубокий navy
  bg2: '#111118', // для карточек

  // Поверхности
  surface: 'rgba(255, 255, 255, 0.08)', // стеклянные карточки
  surfaceHover: 'rgba(255, 255, 255, 0.12)',

  // Разделители
  stroke: 'rgba(255, 255, 255, 0.12)', // тонкие разделители

  // Текст
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',

  // Акцент
  accent: '#3b82f6', // холодный голубой/циан
  accentHover: '#2563eb',
  accentLight: 'rgba(59, 130, 246, 0.2)',

  // Статусы
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',

  // Light theme (опциональный)
  light: {
    bg0: '#ffffff',
    bg1: '#f8fafc',
    bg2: '#ffffff',
    surface: 'rgba(0, 0, 0, 0.05)',
    surfaceHover: 'rgba(0, 0, 0, 0.08)',
    stroke: 'rgba(0, 0, 0, 0.12)',
    textPrimary: '#000000',
    textSecondary: 'rgba(0, 0, 0, 0.7)',
    textTertiary: 'rgba(0, 0, 0, 0.5)',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    accentLight: 'rgba(59, 130, 246, 0.1)',
  },
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
} as const

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const

export const typography = {
  // Заголовки
  h1: {
    fontSize: '28px',
    lineHeight: '32px',
    fontWeight: '600',
  },
  h2: {
    fontSize: '22px',
    lineHeight: '26px',
    fontWeight: '600',
  },
  h3: {
    fontSize: '18px',
    lineHeight: '22px',
    fontWeight: '600',
  },

  // Текст
  body: {
    fontSize: '15px',
    lineHeight: '20px',
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: '15px',
    lineHeight: '20px',
    fontWeight: '500',
  },

  // Малый текст
  caption: {
    fontSize: '13px',
    lineHeight: '16px',
    fontWeight: '400',
  },
  captionMedium: {
    fontSize: '13px',
    lineHeight: '16px',
    fontWeight: '500',
  },

  // Кнопки
  button: {
    fontSize: '15px',
    lineHeight: '20px',
    fontWeight: '500',
  },
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 20px rgba(59, 130, 246, 0.3)',
} as const

export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// Типы для TypeScript
export type ColorScheme = 'dark' | 'light'
export type Colors = typeof colors
export type Spacing = typeof spacing
export type Radius = typeof radius
export type Typography = typeof typography
export type Shadows = typeof shadows
export type Animations = typeof animations