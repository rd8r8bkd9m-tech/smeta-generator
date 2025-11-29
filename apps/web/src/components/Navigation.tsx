import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calculator, Home, FolderOpen, Users, Moon, Sun, Menu, X, Zap } from 'lucide-react'
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
    <nav className="sticky top-0 z-50">
      {/* Premium glass background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl backdrop-saturate-180 border-b border-zinc-200/50 dark:border-zinc-800/50" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Premium Design */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* Glow effect on hover */}
              <div className="absolute -inset-2 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Logo container */}
              <div className="relative w-11 h-11 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-xl group-hover:shadow-orange-500/40 transition-all duration-300 group-hover:scale-105">
                {/* Inner shine */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent" />
                <Calculator className="w-5 h-5 text-white relative z-10" />
              </div>
              
              {/* Sparkle indicator */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent">
                ДениДом
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 -mt-0.5 tracking-[0.2em] font-medium uppercase">
                Professional
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation - Premium Pills */}
          <div className="hidden md:flex items-center gap-1 p-1.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={clsx(
                    'relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
                    isActive
                      ? 'text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  )}
                >
                  {/* Active background */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/30" />
                  )}
                  
                  <Icon className={clsx('w-4 h-4 relative z-10', isActive && 'text-white')} />
                  <span className="font-medium text-sm relative z-10">{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle - Premium */}
            <button
              onClick={toggleTheme}
              className={clsx(
                'relative p-2.5 rounded-xl transition-all duration-300',
                'text-zinc-500 dark:text-zinc-400',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                'hover:text-zinc-900 dark:hover:text-zinc-100',
                'hover:scale-105 active:scale-95'
              )}
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
              className={clsx(
                'md:hidden p-2.5 rounded-xl transition-all duration-300',
                'text-zinc-600 dark:text-zinc-400',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                mobileMenuOpen && 'bg-zinc-100 dark:bg-zinc-800'
              )}
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

        {/* Mobile Menu - Premium Slide Down */}
        <div 
          className={clsx(
            'md:hidden overflow-hidden transition-all duration-300 ease-out',
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="py-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex flex-col gap-2">
              {navItems.map(({ path, label, icon: Icon }, index) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      'stagger-item',
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
