import { useMemo, useState, useEffect } from 'react'
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
  ArrowDownRight,
  Rocket
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
  projectId?: string
}

interface StatCard {
  title: string
  value: number
  change: number
  changeLabel: string
  icon: typeof Calculator
  gradient: string
  iconGradient: string
  suffix?: string
}

interface ProjectSummary {
  id: string
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'
  createdAt: string
}

interface ClientSummary {
  id: string
  createdAt: string
}

interface EstimateSummary {
  id: string
  name: string
  total: number
  createdAt: string
  updatedAt: string
  type: 'FER' | 'COMMERCIAL' | 'MIXED'
  project?: ProjectSummary | null
  projectId?: string | null
}

const API_URL = '/api'
const RECENT_DAYS = 30

const quickActions = [
  { label: 'Новая смета', icon: Calculator, path: '/calculator', gradient: 'from-orange-500 via-orange-500 to-amber-500', iconBg: 'bg-white/20' },
  { label: 'AI генератор', icon: Sparkles, path: '/calculator?mode=ai', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', iconBg: 'bg-white/20' },
  { label: 'Проекты', icon: FolderOpen, path: '/projects', gradient: 'from-blue-500 via-blue-500 to-cyan-500', iconBg: 'bg-white/20' },
  { label: 'Клиенты', icon: Users, path: '/clients', gradient: 'from-rose-500 via-pink-500 to-fuchsia-500', iconBg: 'bg-white/20' },
]

export default function Dashboard() {
  // Memoize current time to prevent unnecessary re-renders
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [estimates, setEstimates] = useState<EstimateSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    let isMounted = true
    
    const loadDashboard = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [projectsRes, clientsRes, estimatesRes] = await Promise.all([
          fetch(`${API_URL}/projects`),
          fetch(`${API_URL}/clients`),
          fetch(`${API_URL}/calculator/estimates`),
        ])

        if (!projectsRes.ok || !clientsRes.ok || !estimatesRes.ok) {
          throw new Error('Не удалось загрузить данные')
        }

        const [projectsData, clientsData, estimatesData] = await Promise.all([
          projectsRes.json(),
          clientsRes.json(),
          estimatesRes.json(),
        ])

        if (!isMounted) return
        setProjects(projectsData)
        setClients(clientsData)
        setEstimates(estimatesData)
        } catch (err) {
          if (!isMounted) return
          setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
    }

    loadDashboard()
    return () => {
      isMounted = false
    }
  }, [])

  const recentEstimates = useMemo(() => {
    const sorted = [...estimates].sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt).getTime()
      const bDate = new Date(b.updatedAt || b.createdAt).getTime()
      return bDate - aDate
    })

    return sorted.slice(0, 4).map((estimate) => {
      const projectStatus = estimate.project?.status
      const status: RecentEstimate['status'] =
        projectStatus === 'IN_PROGRESS'
          ? 'in_progress'
          : projectStatus === 'COMPLETED'
            ? 'completed'
            : estimate.total > 0
              ? 'completed'
              : 'draft'

      return {
        id: estimate.id,
        name: estimate.name,
        total: estimate.total || 0,
        date: estimate.updatedAt || estimate.createdAt,
        status,
        type: estimate.type || 'COMMERCIAL',
        projectId: estimate.projectId || estimate.project?.id || undefined,
      }
    })
  }, [estimates])

  const stats: StatCard[] = useMemo(() => {
    const since = new Date()
    since.setDate(since.getDate() - RECENT_DAYS)

    const totalEstimates = estimates.length
    const totalProjects = projects.length
    const totalClients = clients.length

    const recentEstimatesCount = estimates.filter(e => new Date(e.createdAt) >= since).length
    const recentProjectsCount = projects.filter(p => new Date(p.createdAt) >= since).length
    const recentClientsCount = clients.filter(c => new Date(c.createdAt) >= since).length

    const totalAmount = estimates.reduce((sum, e) => sum + (e.total || 0), 0)
    const recentAmount = estimates
      .filter(e => new Date(e.createdAt) >= since)
      .reduce((sum, e) => sum + (e.total || 0), 0)

    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length

    const estimateChange = totalEstimates ? Math.round((recentEstimatesCount / totalEstimates) * 100) : 0
    const amountChange = totalAmount ? Math.round((recentAmount / totalAmount) * 100) : 0
    const projectChange = totalProjects ? Math.round((recentProjectsCount / totalProjects) * 100) : 0
    const clientChange = totalClients ? Math.round((recentClientsCount / totalClients) * 100) : 0

    return [
      {
        title: 'Всего смет',
        value: totalEstimates,
        change: estimateChange,
        changeLabel: 'за месяц',
        icon: FileText,
        gradient: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
        iconGradient: 'from-orange-500 to-amber-500',
      },
      {
        title: 'Общая сумма',
        value: totalAmount,
        change: amountChange,
        changeLabel: 'за месяц',
        icon: TrendingUp,
        gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
        iconGradient: 'from-emerald-500 to-teal-500',
        suffix: ' ₽',
      },
      {
        title: 'Активные проекты',
        value: activeProjects,
        change: projectChange,
        changeLabel: 'за месяц',
        icon: FolderOpen,
        gradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
        iconGradient: 'from-blue-500 to-cyan-500',
      },
      {
        title: 'Клиентов',
        value: totalClients,
        change: clientChange,
        changeLabel: 'за месяц',
        icon: Users,
        gradient: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
        iconGradient: 'from-violet-500 to-purple-500',
      },
    ]
  }, [estimates, projects, clients])

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
      {/* Welcome Section - Premium Hero */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 dark:from-orange-500/5 dark:to-purple-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
          <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
            <Badge variant="gradient" size="sm">Активный пользователь</Badge>
            {isLoading && (
              <Badge variant="default" size="sm">Синхронизация...</Badge>
            )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">
                Добро пожаловать в{' '}
                <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent">
                  ДениДом
                </span>
                {' '}👋
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg">
                Обзор вашей активности, быстрые действия и аналитика проектов
              </p>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700">
                <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </div>
              <div className="text-sm">
                <div className="text-zinc-500 dark:text-zinc-400">Обновлено</div>
                <div className="font-semibold text-zinc-900 dark:text-white">
                  {currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <GlassCard className="p-4 border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300">
          {error}
        </GlassCard>
      )}

      {/* Stats Grid - Premium Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <GlassCard 
            key={index} 
            hoverable 
            variant="solid"
            className="p-6 stagger-item relative overflow-hidden"
          >
            {/* Background accent */}
            <div className={clsx(
              'absolute inset-0 opacity-50 bg-gradient-to-br',
              stat.gradient
            )} />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                {/* Icon container with premium gradient */}
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  'bg-gradient-to-br shadow-lg',
                  stat.iconGradient
                )}>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                  <stat.icon className="w-6 h-6 text-white relative z-10" />
                </div>
                
                {/* Change indicator */}
                <div className={clsx(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
                  stat.change >= 0 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                )}>
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">
                {stat.suffix ? (
                  formatCurrency(stat.value)
                ) : (
                  <AnimatedNumber value={stat.value} duration={1000} />
                )}
              </div>
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.title}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Quick Actions - Premium Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className={clsx(
              'group relative p-6 rounded-2xl overflow-hidden',
              'bg-gradient-to-br', action.gradient,
              'shadow-xl transition-all duration-500',
              'hover:scale-[1.02] hover:shadow-2xl',
              'stagger-item'
            )}
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Inner shine */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
            
            <div className="relative z-10">
              <div className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                action.iconBg,
                'shadow-lg backdrop-blur-sm'
              )}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-white font-semibold text-lg">{action.label}</div>
            </div>
            
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </Link>
        ))}
      </div>

      {/* Main Content Grid - Bento Style */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Estimates - Premium Table */}
        <GlassCard variant="solid" className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Последние сметы
            </h2>
            <Link 
              to="/projects" 
              className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              Все сметы
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentEstimates.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                Пока нет смет. Создайте первую смету в калькуляторе.
              </div>
            ) : (
              recentEstimates.map((estimate, index) => {
                const statusConfig = getStatusBadge(estimate.status)
                const typeConfig = getTypeBadge(estimate.type)
                const estimateLink = `/calculator?estimateId=${estimate.id}${estimate.projectId ? `&projectId=${estimate.projectId}` : ''}`
                return (
                  <Link
                    key={estimate.id}
                    to={estimateLink}
                    className={clsx(
                      'group flex items-center justify-between p-5',
                      'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                      'transition-all duration-200 stagger-item'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-zinc-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {estimate.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant={typeConfig.variant} size="sm">
                            {typeConfig.label}
                          </Badge>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {formatDate(estimate.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(estimate.total)}
                        </div>
                        <Badge variant={statusConfig.variant} size="sm" className="mt-1">
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </GlassCard>

        {/* Activity Chart - Premium */}
        <GlassCard variant="solid" className="p-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
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
                <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">Сметы</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">75% цели</div>
              </div>
              <div className="text-center">
                <ProgressRing 
                  value={60} 
                  size={80} 
                  strokeWidth={8}
                  gradientColors={['#10B981', '#059669']}
                />
                <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">Проекты</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">60% цели</div>
              </div>
            </div>

            {/* Weekly stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">На этой неделе</span>
                <span className="font-bold text-zinc-900 dark:text-white">+5 смет</span>
              </div>
              <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 shadow-sm shadow-orange-500/50"
                  style={{ width: '65%' }}
                />
              </div>
            </div>

            {/* AI Usage - Premium Card */}
            <div className="relative p-5 rounded-2xl overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-400/20 to-transparent rounded-full blur-2xl" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-white">AI генерации</span>
                </div>
                <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">12</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">смет создано с AI за неделю</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
