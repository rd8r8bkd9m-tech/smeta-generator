import { Calculator, Home, FolderOpen, Users } from 'lucide-react'
import clsx from 'clsx'
import type { View } from '../App'

const menuItems = [
  { id: 'home' as const, label: 'Главная', icon: Home },
  { id: 'calculator' as const, label: 'Калькулятор', icon: Calculator },
  { id: 'projects' as const, label: 'Проекты', icon: FolderOpen },
  { id: 'clients' as const, label: 'Клиенты', icon: Users },
]

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-secondary-200 min-h-screen p-4 sticky top-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          SMETA PRO
        </h2>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
              currentView === item.id
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-secondary-700 hover:bg-secondary-100'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
