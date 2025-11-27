import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  client?: {
    id: string
    name: string
  }
  estimates: Array<{
    id: string
    name: string
    total: number
    createdAt: string
  }>
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Черновик',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершен',
  ARCHIVED: 'Архив',
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`)
        if (!response.ok) {
          throw new Error('Проект не найден')
        }
        const data = await response.json()
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-red-600">{error || 'Проект не найден'}</h2>
        <Link to="/projects" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Вернуться к списку проектов
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link to="/projects" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
            ← Все проекты
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Общая сумма</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.totalAmount)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Количество смет</p>
          <p className="text-2xl font-bold text-gray-900">{project.estimates.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Клиент</p>
          <p className="text-lg font-medium text-gray-900">
            {project.client ? (
              <Link to={`/clients/${project.client.id}`} className="text-blue-600 hover:underline">
                {project.client.name}
              </Link>
            ) : (
              'Не указан'
            )}
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Создан:</span>{' '}
            <span className="font-medium">{formatDate(project.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-500">Обновлен:</span>{' '}
            <span className="font-medium">{formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Estimates */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Сметы проекта</h2>
          <Link
            to={`/calculator?projectId=${project.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            + Новая смета
          </Link>
        </div>
        {project.estimates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>У проекта пока нет смет</p>
            <Link
              to={`/calculator?projectId=${project.id}`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Создать первую смету
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {project.estimates.map((estimate) => (
              <div key={estimate.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{estimate.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(estimate.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(estimate.total)}</p>
                  <Link
                    to={`/estimates/${estimate.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Открыть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
