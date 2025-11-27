import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FolderOpen, Calendar, TrendingUp, Sparkles, Filter, ArrowUpRight } from 'lucide-react'
import { GlassCard, Badge, AnimatedNumber, FAB } from '../design-system/components'
import clsx from 'clsx'

interface Project {
  id: string
  name: string
  client: string
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  totalAmount: number
  createdAt: string
  updatedAt: string
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Ремонт офиса "Технопарк"',
    client: 'ООО "Технологии Будущего"',
    status: 'in_progress',
    totalAmount: 1250000,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    name: 'Строительство склада',
    client: 'ИП Петров А.С.',
    status: 'draft',
    totalAmount: 3500000,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
  },
  {
    id: '3',
    name: 'Капитальный ремонт школы №5',
    client: 'Администрация г. Москвы',
    status: 'completed',
    totalAmount: 8750000,
    createdAt: '2023-09-01',
    updatedAt: '2024-01-10',
  },
]

const statusConfig = {
  draft: { 
    label: 'Черновик', 
    variant: 'default' as const,
    gradient: 'from-slate-400 to-slate-500'
  },
  in_progress: { 
    label: 'В работе', 
    variant: 'info' as const,
    gradient: 'from-blue-400 to-blue-500'
  },
  completed: { 
    label: 'Завершен', 
    variant: 'success' as const,
    gradient: 'from-emerald-400 to-emerald-500'
  },
  archived: { 
    label: 'Архив', 
    variant: 'warning' as const,
    gradient: 'from-amber-400 to-amber-500'
  },
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [projects] = useState<Project[]>(mockProjects)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !selectedStatus || project.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const totalAmount = projects.reduce((sum, p) => sum + p.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Проекты
            </h1>
            <Badge variant="gradient" size="sm">
              {projects.length}
            </Badge>
          </div>
          <p className="text-secondary-600 dark:text-secondary-400">
            Управление сметными проектами
          </p>
        </div>
        <Link to="/calculator" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Новый проект</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Всего проектов</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                <AnimatedNumber value={projects.length} />
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Общая сумма</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                <AnimatedNumber value={totalAmount / 1000000} suffix=" млн ₽" decimals={1} />
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">В работе</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                <AnimatedNumber value={projects.filter(p => p.status === 'in_progress').length} />
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Поиск проектов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-11"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedStatus(null)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                !selectedStatus
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
              )}
            >
              <Filter className="w-4 h-4" />
              Все
            </button>
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
                className={clsx(
                  'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  selectedStatus === key
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-4">
          {filteredProjects.map((project, index) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className={clsx(
                'group relative block p-5 rounded-xl',
                'bg-white dark:bg-secondary-800/50',
                'border border-secondary-100 dark:border-secondary-700/50',
                'hover:border-primary-200 dark:hover:border-primary-700/50',
                'hover:shadow-lg hover:shadow-primary-500/5',
                'transition-all duration-300',
                'stagger-item'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status gradient indicator */}
              <div className={clsx(
                'absolute left-0 top-4 bottom-4 w-1 rounded-r-full',
                `bg-gradient-to-b ${statusConfig[project.status].gradient}`
              )} />

              <div className="flex items-start justify-between pl-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FolderOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                      {project.client}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusConfig[project.status].variant}>
                        {statusConfig[project.status].label}
                      </Badge>
                      <span className="flex items-center text-xs text-secondary-500 dark:text-secondary-400">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-secondary-900 dark:text-white">
                      {formatCurrency(project.totalAmount)}
                    </div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400">
                      Общая сумма
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-secondary-300 dark:text-secondary-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-secondary-400 dark:text-secondary-500" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
              Проекты не найдены
            </h3>
            <p className="text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
              Попробуйте изменить параметры поиска или создайте новый проект
            </p>
          </div>
        )}
      </GlassCard>

      {/* FAB for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <FAB 
          icon={Plus} 
          onClick={() => window.location.href = '/calculator'}
        />
      </div>
    </div>
  )
}
