import { useState } from 'react'
import { Calculator, Home, FolderOpen, Users, Menu, X } from 'lucide-react'
import clsx from 'clsx'
import type { View } from '../App'

const navItems = [
  { id: 'home' as const, label: 'Главная', icon: Home },
  { id: 'calculator' as const, label: 'Калькулятор', icon: Calculator },
  { id: 'projects' as const, label: 'Проекты', icon: FolderOpen },
  { id: 'clients' as const, label: 'Клиенты', icon: Users },
]

interface NavigationProps {
  currentView: View
  onViewChange: (view: View) => void
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleViewChange = (view: View) => {
    onViewChange(view)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleViewChange('home')}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-secondary-900">SMETA PRO</span>
          </button>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleViewChange(id)}
                className={clsx(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                  currentView === id
                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                    : 'text-secondary-600 hover:bg-secondary-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleViewChange(id)}
                className={clsx(
                  'w-full flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200',
                  currentView === id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-secondary-600 hover:bg-secondary-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
