import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calculator, 
  FolderOpen, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Sparkles,
  BarChart3,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { GlassCard, AnimatedNumber, ProgressRing, Badge } from '../design-system/components'
import clsx from 'clsx'

interface RecentEstimate {
  id: string
  name: string
  total: number
  date: string
  status: 'draft' | 'completed' | 'in_progress'
  type: 'FER' | 'COMMERCIAL' | 'MIXED'
}

interface StatCard {
  title: string
  value: number
  change: number
  changeLabel: string
  icon: typeof Calculator
  gradient: string
  suffix?: string
}

// Demo data - in real app this would come from API
const recentEstimates: RecentEstimate[] = [
  { id: '1', name: 'Ремонт квартиры 60м²', total: 485000, date: '2024-01-15', status: 'completed', type: 'COMMERCIAL' },
  { id: '2', name: 'Отделка офиса 150м²', total: 1250000, date: '2024-01-14', status: 'in_progress', type: 'FER' },
  { id: '3', name: 'Косметический ремонт', total: 120000, date: '2024-01-13', status: 'draft', type: 'MIXED' },
  { id: '4', name: 'Капремонт ванной', total: 350000, date: '2024-01-12', status: 'completed', type: 'COMMERCIAL' },
]

const quickActions = [
  { label: 'Новая смета', icon: Calculator, path: '/calculator', gradient: 'from-primary-500 to-amber-500' },
  { label: 'AI генератор', icon: Sparkles, path: '/calculator?mode=ai', gradient: 'from-violet-500 to-purple-500' },
  { label: 'Проекты', icon: FolderOpen, path: '/projects', gradient: 'from-blue-500 to-cyan-500' },
  { label: 'Клиенты', icon: Users, path: '/clients', gradient: 'from-pink-500 to-rose-500' },
]

export default function Dashboard() {
  const stats: StatCard[] = useMemo(() => [
    {
      title: 'Всего смет',
      value: 24,
      change: 12,
      changeLabel: 'за месяц',
      icon: FileText,
      gradient: 'from-primary-500 to-amber-500',
    },
    {
      title: 'Общая сумма',
      value: 4850000,
      change: 8,
      changeLabel: 'рост',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
      suffix: ' ₽',
    },
    {
      title: 'Активные проекты',
      value: 7,
      change: -2,
      changeLabel: 'изменение',
      icon: FolderOpen,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Клиентов',
      value: 15,
      change: 3,
      changeLabel: 'новых',
      icon: Users,
      gradient: 'from-pink-500 to-rose-500',
    },
  ], [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getStatusBadge = (status: RecentEstimate['status']) => {
    const statusConfig = {
      draft: { label: 'Черновик', variant: 'default' as const },
      in_progress: { label: 'В работе', variant: 'warning' as const },
      completed: { label: 'Завершена', variant: 'success' as const },
    }
    return statusConfig[status]
  }

  const getTypeBadge = (type: RecentEstimate['type']) => {
    const typeConfig = {
      FER: { label: 'ФЕР', variant: 'info' as const },
      COMMERCIAL: { label: 'Комм.', variant: 'gradient' as const },
      MIXED: { label: 'Смеш.', variant: 'default' as const },
    }
    return typeConfig[type]
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white mb-2">
            Добро пожаловать в SMETA PRO 👋
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Обзор вашей активности и быстрые действия
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
          <Clock className="w-4 h-4" />
          <span>Последнее обновление: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <GlassCard 
            key={index} 
            hoverable 
            className="p-5 stagger-item"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                `bg-gradient-to-br ${stat.gradient}`
              )}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={clsx(
                'flex items-center gap-1 text-sm font-medium',
                stat.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}>
                {stat.change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(stat.change)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">
              {stat.suffix ? (
                formatCurrency(stat.value)
              ) : (
                <AnimatedNumber value={stat.value} duration={1000} />
              )}
            </div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              {stat.title}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className={clsx(
              'group relative p-6 rounded-2xl overflow-hidden',
              'bg-gradient-to-br', action.gradient,
              'shadow-lg hover:shadow-xl transition-all duration-300',
              'hover:scale-[1.02] stagger-item'
            )}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <action.icon className="w-8 h-8 text-white mb-3" />
              <div className="text-white font-semibold">{action.label}</div>
            </div>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Estimates */}
        <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-6 border-b border-secondary-100 dark:border-secondary-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              Последние сметы
            </h2>
            <Link 
              to="/projects" 
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              Все сметы
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-secondary-100 dark:divide-secondary-700/50">
            {recentEstimates.map((estimate, index) => {
              const statusConfig = getStatusBadge(estimate.status)
              const typeConfig = getTypeBadge(estimate.type)
              return (
                <Link
                  key={estimate.id}
                  to={`/projects/${estimate.id}`}
                  className={clsx(
                    'flex items-center justify-between p-4',
                    'hover:bg-secondary-50 dark:hover:bg-secondary-800/50',
                    'transition-colors duration-200 stagger-item'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-secondary-900 dark:text-white truncate">
                        {estimate.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={typeConfig.variant} size="sm">
                          {typeConfig.label}
                        </Badge>
                        <span className="text-xs text-secondary-400">
                          {formatDate(estimate.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-secondary-900 dark:text-white">
                        {formatCurrency(estimate.total)}
                      </div>
                      <Badge variant={statusConfig.variant} size="sm" className="mt-1">
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <ChevronRight className="w-5 h-5 text-secondary-400" />
                  </div>
                </Link>
              )
            })}
          </div>
        </GlassCard>

        {/* Activity Chart */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            Активность
          </h2>
          
          <div className="space-y-6">
            {/* Progress circles */}
            <div className="flex justify-around">
              <div className="text-center">
                <ProgressRing 
                  value={75} 
                  size={80} 
                  strokeWidth={8}
                />
                <div className="mt-2 text-sm font-medium text-secondary-900 dark:text-white">Сметы</div>
                <div className="text-xs text-secondary-500">75% цели</div>
              </div>
              <div className="text-center">
                <ProgressRing 
                  value={60} 
                  size={80} 
                  strokeWidth={8}
                  gradientColors={['#10B981', '#059669']}
                />
                <div className="mt-2 text-sm font-medium text-secondary-900 dark:text-white">Проекты</div>
                <div className="text-xs text-secondary-500">60% цели</div>
              </div>
            </div>

            {/* Weekly stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">На этой неделе</span>
                <span className="font-semibold text-secondary-900 dark:text-white">+5 смет</span>
              </div>
              <div className="h-2 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: '65%' }}
                />
              </div>
            </div>

            {/* AI Usage */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <span className="font-medium text-secondary-900 dark:text-white">AI генерации</span>
              </div>
              <div className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">12</div>
              <div className="text-xs text-secondary-500">смет создано с AI за неделю</div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
