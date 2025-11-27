import { Link } from 'react-router-dom'
import { Calculator, FolderOpen, Users, TrendingUp, FileText, Shield, ArrowRight, Sparkles, Zap, Award } from 'lucide-react'
import { GlassCard, AnimatedNumber, ProgressRing } from '../design-system/components'

const features = [
  {
    icon: Calculator,
    title: 'Умный калькулятор',
    description: 'Автоматический расчет материалов и работ на основе ФЕР, ГЭСН, ТЕР',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: FileText,
    title: 'Документация',
    description: 'Формирование КС-2, КС-3, М-29 и других сметных документов',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FolderOpen,
    title: 'Управление проектами',
    description: 'Ведение проектов с историей изменений и версионированием',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'CRM система',
    description: 'Управление клиентами, контрактами и взаимоотношениями',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: TrendingUp,
    title: 'Аналитика',
    description: 'Отчеты и графики по проектам, расходам и прибыли',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Shield,
    title: 'Надежность',
    description: 'Облачное хранение данных с автоматическим резервированием',
    gradient: 'from-slate-500 to-zinc-600',
  },
]

const stats = [
  { value: 10000, suffix: '+', label: 'Позиций в базе' },
  { value: 2024, suffix: '', label: 'Актуальные ФЕР' },
  { value: 99.9, suffix: '%', label: 'Доступность' },
  { value: 24, suffix: '/7', label: 'Поддержка' },
]

export default function HomePage() {
  return (
    <div className="space-y-16 pb-8">
      {/* Hero Section */}
      <section className="relative text-center py-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 mb-6">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Новое поколение сметных систем
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary-900 dark:text-white mb-6 tracking-tight">
            Профессиональные{' '}
            <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-amber-500 bg-clip-text text-transparent">
              сметные расчеты
            </span>
          </h1>
          
          <p className="text-xl text-secondary-600 dark:text-secondary-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            SMETA PRO — современная система для строительных смет. 
            Быстро, точно, удобно. Создавайте сметы как профессионал.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/calculator" 
              className="group inline-flex items-center gap-2 btn btn-primary text-lg px-8 py-4"
            >
              <Zap className="w-5 h-5" />
              <span>Начать расчет</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/projects" 
              className="btn btn-secondary text-lg px-8 py-4"
            >
              Мои проекты
            </Link>
          </div>
        </div>

        {/* Floating elements */}
        <div className="hidden lg:block absolute top-20 left-10 animate-float">
          <ProgressRing value={85} size={80} strokeWidth={8} showLabel={false} />
        </div>
        <div className="hidden lg:block absolute bottom-10 right-10 animate-float" style={{ animationDelay: '1s' }}>
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-secondary-800 shadow-lg border border-secondary-100 dark:border-secondary-700">
            <div className="text-xs text-secondary-500 dark:text-secondary-400">Сегодня</div>
            <div className="text-lg font-bold text-secondary-900 dark:text-white">+12 смет</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Возможности
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">
            Всё необходимое в одном месте
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Мощные инструменты для профессиональной работы со сметами
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <GlassCard 
              key={index} 
              hoverable 
              className="p-6 stagger-item"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500 rounded-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        
        <div className="relative p-8 md:p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <div key={index} className="stagger-item">
                <div className="text-4xl md:text-5xl font-bold mb-2 flex items-baseline justify-center">
                  <AnimatedNumber 
                    value={stat.value} 
                    duration={1500} 
                    decimals={stat.suffix === '%' ? 1 : 0}
                  />
                  <span className="text-2xl ml-1">{stat.suffix}</span>
                </div>
                <div className="text-primary-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <GlassCard className="p-10 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white mb-4">
            Готовы начать работу?
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-8 max-w-xl mx-auto">
            Присоединяйтесь к тысячам профессионалов, которые уже используют SMETA PRO
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 btn btn-primary text-lg px-8 py-4"
          >
            Начать бесплатно
            <ArrowRight className="w-5 h-5" />
          </Link>
        </GlassCard>
      </section>
    </div>
  )
}
