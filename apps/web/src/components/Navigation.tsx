import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calculator, Home, FolderOpen, Users, Moon, Sun, Menu, X, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '../store/useStore'

const navItems = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/calculator', label: 'Калькулятор', icon: Calculator },
  { path: '/projects', label: 'Проекты', icon: FolderOpen },
  { path: '/clients', label: 'Клиенты', icon: Users },
]

export default function Navigation() {
  const location = useLocation()
  const { theme, setTheme } = useStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-dark-bg/70 backdrop-blur-xl border-b border-secondary-200/50 dark:border-secondary-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-105">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-amber-500 bg-clip-text text-transparent">
                ДениДом
              </span>
              <span className="text-[10px] text-secondary-400 -mt-1 tracking-wider">
                PROFESSIONAL
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={clsx(
                    'relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100/80 dark:hover:bg-secondary-800/80'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-amber-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-secondary-500 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200 hover:scale-105"
              aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200"
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200/50 dark:border-secondary-800/50 animate-fade-in-down">
            <div className="flex flex-col space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
