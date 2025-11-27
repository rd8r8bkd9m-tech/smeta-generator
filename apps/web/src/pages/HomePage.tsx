import { Calculator, FolderOpen, Users, TrendingUp, FileText, Shield } from 'lucide-react'
import type { View } from '../App'

const features = [
  {
    icon: Calculator,
    title: 'Умный калькулятор',
    description: 'Автоматический расчет материалов и работ на основе ФЕР, ГЭСН, ТЕР',
  },
  {
    icon: FileText,
    title: 'Документация',
    description: 'Формирование КС-2, КС-3, М-29 и других сметных документов',
  },
  {
    icon: FolderOpen,
    title: 'Управление проектами',
    description: 'Ведение проектов с историей изменений и версионированием',
  },
  {
    icon: Users,
    title: 'CRM система',
    description: 'Управление клиентами, контрактами и взаимоотношениями',
  },
  {
    icon: TrendingUp,
    title: 'Аналитика',
    description: 'Отчеты и графики по проектам, расходам и прибыли',
  },
  {
    icon: Shield,
    title: 'Надежность',
    description: 'Облачное хранение данных с автоматическим резервированием',
  },
]

interface HomePageProps {
  onNavigate: (view: View) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
          Профессиональные сметные расчеты
        </h1>
        <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
          SMETA PRO — современная система для строительных смет. 
          Быстро, точно, удобно.
        </p>
        <div className="flex justify-center space-x-4">
          <button onClick={() => onNavigate('calculator')} className="btn btn-primary text-lg px-8 py-3">
            Начать расчет
          </button>
          <button onClick={() => onNavigate('projects')} className="btn btn-secondary text-lg px-8 py-3">
            Мои проекты
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">
          Возможности системы
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-secondary-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-600 rounded-2xl p-8 text-white">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">10,000+</div>
            <div className="text-primary-200">Позиций в базе</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">ФЕР 2024</div>
            <div className="text-primary-200">Актуальные нормативы</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">PWA</div>
            <div className="text-primary-200">Работает оффлайн</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-primary-200">Доступность</div>
          </div>
        </div>
      </section>
    </div>
  )
}
