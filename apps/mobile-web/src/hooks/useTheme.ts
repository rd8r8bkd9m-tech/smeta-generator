import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark', // dark по умолчанию

      setTheme: (theme) => {
        set({ theme })
        updateThemeClass(theme)
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      },
    }),
    {
      name: 'status-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateThemeClass(state.theme)
        }
      },
    }
  )
)

// Функция для обновления CSS класса на html элементе
const updateThemeClass = (theme: Theme) => {
  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.remove('light-theme')
    root.classList.add('dark-theme')
  } else {
    root.classList.remove('dark-theme')
    root.classList.add('light-theme')
  }
}

// Hook для использования в компонентах
export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore()

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}