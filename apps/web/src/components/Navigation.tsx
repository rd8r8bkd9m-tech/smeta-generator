import { Link, useLocation } from 'react-router-dom'
import { Calculator, Home, FolderOpen, Users } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/calculator', label: 'Калькулятор', icon: Calculator },
  { path: '/projects', label: 'Проекты', icon: FolderOpen },
  { path: '/clients', label: 'Клиенты', icon: Users },
]

export default function Navigation() {
  const location = useLocation()

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-secondary-900">SMETA PRO</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                  location.pathname === path
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          
          <div className="md:hidden">
            <button className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
