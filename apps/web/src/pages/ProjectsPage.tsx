import { useState } from 'react'
import { Plus, Search, FolderOpen, MoreVertical, Calendar, DollarSign } from 'lucide-react'

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

const statusLabels = {
  draft: { label: 'Черновик', color: 'bg-secondary-100 text-secondary-700' },
  in_progress: { label: 'В работе', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Завершен', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Архив', color: 'bg-secondary-200 text-secondary-600' },
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [projects] = useState<Project[]>(mockProjects)

  const filteredProjects = projects.filter(
    project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Проекты</h1>
          <p className="text-secondary-600">Управление сметными проектами</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Новый проект</span>
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Поиск проектов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">{project.name}</h3>
                    <p className="text-sm text-secondary-600">{project.client}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[project.status].color}`}>
                        {statusLabels[project.status].label}
                      </span>
                      <span className="flex items-center text-xs text-secondary-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center text-lg font-semibold text-secondary-900">
                      <DollarSign className="w-4 h-4 text-secondary-400" />
                      {formatCurrency(project.totalAmount)}
                    </div>
                    <div className="text-xs text-secondary-500">Общая сумма</div>
                  </div>
                  <button className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Проекты не найдены</p>
          </div>
        )}
      </div>
    </div>
  )
}
