import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FolderOpen, Calendar, TrendingUp, Sparkles, Filter, ArrowUpRight, X, Loader2 } from 'lucide-react'
import { GlassCard, Badge, AnimatedNumber, FAB } from '../design-system/components'
import clsx from 'clsx'
import { useStore } from '../store/useStore'

interface Client {
  id: string
  name: string
}

interface Estimate {
  id: string
  name: string
  total: number
}

interface Project {
  id: string
  name: string
  description?: string
  client?: Client
  clientId?: string
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'
  totalAmount: number
  estimates?: Estimate[]
  createdAt: string
  updatedAt: string
}

const API_URL = '/api'

const statusConfig = {
  DRAFT: { 
    label: 'Черновик', 
    variant: 'default' as const,
    gradient: 'from-slate-400 to-slate-500'
  },
  IN_PROGRESS: { 
    label: 'В работе', 
    variant: 'info' as const,
    gradient: 'from-blue-400 to-blue-500'
  },
  COMPLETED: { 
    label: 'Завершен', 
    variant: 'success' as const,
    gradient: 'from-emerald-400 to-emerald-500'
  },
  ARCHIVED: { 
    label: 'Архив', 
    variant: 'warning' as const,
    gradient: 'from-amber-400 to-amber-500'
  },
}

export default function ProjectsPage() {
  const { user } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'DRAFT' as Project['status'],
  })

  // Fetch projects and clients
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/projects${user?.id ? `?userId=${user.id}` : ''}`),
        fetch(`${API_URL}/clients${user?.id ? `?userId=${user.id}` : ''}`),
      ])

      if (!projectsRes.ok) throw new Error('Failed to fetch projects')
      if (!clientsRes.ok) throw new Error('Failed to fetch clients')

      const projectsData = await projectsRes.json()
      const clientsData = await clientsRes.json()

      setProjects(projectsData)
      setClients(clientsData)
    } catch (err) {
      setError('Не удалось загрузить данные')
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name,
        description: project.description || '',
        clientId: project.clientId || '',
        status: project.status,
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: '',
        description: '',
        clientId: '',
        status: 'DRAFT',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingProject 
        ? `${API_URL}/projects/${editingProject.id}`
        : `${API_URL}/projects`
      
      const method = editingProject ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        clientId: formData.clientId || undefined,
        ...(user?.id ? { userId: user.id } : {}),
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save project')
      }

      await fetchData()
      handleCloseModal()
    } catch (err) {
      console.error('Error saving project:', err)
      alert(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Удалить проект? Все сметы проекта также будут удалены.')) return

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete project')
      
      await fetchData()
    } catch (err) {
      console.error('Error deleting project:', err)
      alert('Ошибка удаления проекта')
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
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

  const totalAmount = projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

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
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Новый проект</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

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
                {totalAmount > 1000000 
                  ? <AnimatedNumber value={totalAmount / 1000000} suffix=" млн ₽" decimals={1} />
                  : formatCurrency(totalAmount)
                }
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
                <AnimatedNumber value={projects.filter(p => p.status === 'IN_PROGRESS').length} />
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
            <div
              key={project.id}
              onClick={() => handleOpenModal(project)}
              className={clsx(
                'group relative block p-5 rounded-xl cursor-pointer',
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
                      {project.client?.name || 'Клиент не указан'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusConfig[project.status].variant}>
                        {statusConfig[project.status].label}
                      </Badge>
                      <span className="flex items-center text-xs text-secondary-500 dark:text-secondary-400">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {formatDate(project.updatedAt)}
                      </span>
                      {project.estimates && project.estimates.length > 0 && (
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                          {project.estimates.length} смет(ы)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-secondary-900 dark:text-white">
                      {formatCurrency(project.totalAmount || 0)}
                    </div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400">
                      Общая сумма
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-secondary-300 dark:text-secondary-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-secondary-400 dark:text-secondary-500" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
              {projects.length === 0 ? 'Нет проектов' : 'Проекты не найдены'}
            </h3>
            <p className="text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto mb-4">
              {projects.length === 0 
                ? 'Создайте первый проект для начала работы'
                : 'Попробуйте изменить параметры поиска'}
            </p>
            {projects.length === 0 && (
              <button 
                onClick={() => handleOpenModal()}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать проект
              </button>
            )}
          </div>
        )}
      </GlassCard>

      {/* FAB for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <FAB 
          icon={Plus} 
          onClick={() => handleOpenModal()}
        />
      </div>

      {/* Modal for creating/editing project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-secondary-100 dark:border-secondary-800">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                {editingProject ? 'Редактировать проект' : 'Новый проект'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Название проекта *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="input w-full"
                  placeholder="Ремонт офиса, Строительство дома..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="input w-full"
                  rows={3}
                  placeholder="Краткое описание проекта..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Клиент
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData(f => ({ ...f, clientId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">-- Выберите клиента --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-sm text-secondary-500 mt-1">
                    <Link to="/clients" className="text-primary-600 hover:underline">
                      Добавьте клиента
                    </Link> для привязки к проекту
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(f => ({ ...f, status: e.target.value as Project['status'] }))}
                  className="input w-full"
                >
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {editingProject && editingProject.estimates && editingProject.estimates.length > 0 && (
                <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-xl">
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Сметы проекта
                  </h4>
                  <div className="space-y-2">
                    {editingProject.estimates.map(estimate => (
                      <div key={estimate.id} className="flex justify-between text-sm">
                        <span>{estimate.name}</span>
                        <span className="font-medium">{formatCurrency(estimate.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {editingProject && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingProject.id)
                      handleCloseModal()
                    }}
                    className="btn bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                  >
                    Удалить
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    editingProject ? 'Сохранить' : 'Создать'
                  )}
                </button>
              </div>

              {editingProject && (
                <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800">
                  <Link 
                    to={`/calculator?projectId=${editingProject.id}`}
                    className="btn btn-primary w-full justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить смету
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
