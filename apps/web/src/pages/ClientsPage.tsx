import { useState, useEffect } from 'react'
import { Plus, Search, Users, Phone, Mail, Building, ArrowUpRight, Briefcase, TrendingUp, X, Loader2 } from 'lucide-react'
import { GlassCard, Badge, AnimatedNumber, FAB } from '../design-system/components'
import clsx from 'clsx'
import { useStore } from '../store/useStore'

interface Client {
  id: string
  name: string
  type: 'COMPANY' | 'INDIVIDUAL'
  contact?: string
  phone?: string
  email?: string
  address?: string
  inn?: string
  kpp?: string
  notes?: string
  projects?: { id: string }[]
  createdAt: string
  updatedAt: string
}

const API_URL = '/api'

export default function ClientsPage() {
  const { user } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [filterType, setFilterType] = useState<'all' | 'COMPANY' | 'INDIVIDUAL'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'COMPANY' as 'COMPANY' | 'INDIVIDUAL',
    contact: '',
    phone: '',
    email: '',
    address: '',
    inn: '',
    kpp: '',
    notes: '',
  })

  // Fetch clients from API
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${API_URL}/clients${user?.id ? `?userId=${user.id}` : ''}`
      )
      if (!response.ok) throw new Error('Failed to fetch clients')
      const data = await response.json()
      setClients(data)
    } catch (err) {
      setError('Не удалось загрузить клиентов')
      console.error('Error fetching clients:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        type: client.type,
        contact: client.contact || '',
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        inn: client.inn || '',
        kpp: client.kpp || '',
        notes: client.notes || '',
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        type: 'COMPANY',
        contact: '',
        phone: '',
        email: '',
        address: '',
        inn: '',
        kpp: '',
        notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingClient 
        ? `${API_URL}/clients/${editingClient.id}`
        : `${API_URL}/clients`
      
      const method = editingClient ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        ...(user?.id ? { userId: user.id } : {}),
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save client')
      }

      await fetchClients()
      handleCloseModal()
    } catch (err) {
      console.error('Error saving client:', err)
      alert(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm('Удалить клиента?')) return

    try {
      const response = await fetch(`${API_URL}/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete client')
      
      await fetchClients()
    } catch (err) {
      console.error('Error deleting client:', err)
      alert('Ошибка удаления клиента')
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.contact?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesType = filterType === 'all' || client.type === filterType
    return matchesSearch && matchesType
  })

  const totalClients = clients.length
  const totalProjects = clients.reduce((sum, c) => sum + (c.projects?.length || 0), 0)

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
              Клиенты
            </h1>
            <Badge variant="gradient" size="sm">
              {clients.length}
            </Badge>
          </div>
          <p className="text-secondary-600 dark:text-secondary-400">
            База клиентов и заказчиков
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить клиента</span>
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Всего клиентов</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                <AnimatedNumber value={totalClients} />
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
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Компании</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                <AnimatedNumber value={clients.filter(c => c.type === 'COMPANY').length} />
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Всего проектов</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                <AnimatedNumber value={totalProjects} />
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
              placeholder="Поиск клиентов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-11"
            />
          </div>
          
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Все', icon: Users },
              { key: 'COMPANY', label: 'Компании', icon: Building },
              { key: 'INDIVIDUAL', label: 'ИП', icon: Users },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilterType(key as typeof filterType)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  filterType === key
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid gap-4">
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              className={clsx(
                'group relative p-5 rounded-xl',
                'bg-white dark:bg-secondary-800/50',
                'border border-secondary-100 dark:border-secondary-700/50',
                'hover:border-primary-200 dark:hover:border-primary-700/50',
                'hover:shadow-lg hover:shadow-primary-500/5',
                'transition-all duration-300 cursor-pointer',
                'stagger-item'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleOpenModal(client)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    'w-14 h-14 rounded-xl flex items-center justify-center',
                    'group-hover:scale-110 transition-transform duration-300',
                    client.type === 'COMPANY'
                      ? 'bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-900/10'
                      : 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10'
                  )}>
                    {client.type === 'COMPANY' ? (
                      <Building className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                    ) : (
                      <Users className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {client.name}
                    </h3>
                    {client.contact && (
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                        {client.contact}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4">
                      {client.phone && (
                        <span className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-secondary-900 dark:text-white">
                      {client.projects?.length || 0} проект(ов)
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-secondary-300 dark:text-secondary-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-secondary-400 dark:text-secondary-500" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
              {clients.length === 0 ? 'Нет клиентов' : 'Клиенты не найдены'}
            </h3>
            <p className="text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto mb-4">
              {clients.length === 0 
                ? 'Добавьте первого клиента для начала работы'
                : 'Попробуйте изменить параметры поиска'}
            </p>
            {clients.length === 0 && (
              <button 
                onClick={() => handleOpenModal()}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить клиента
              </button>
            )}
          </div>
        )}
      </GlassCard>

      {/* FAB for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <FAB icon={Plus} onClick={() => handleOpenModal()} />
      </div>

      {/* Modal for creating/editing client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-secondary-100 dark:border-secondary-800">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                {editingClient ? 'Редактировать клиента' : 'Новый клиент'}
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
                  Наименование *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="input w-full"
                  placeholder="ООО «Компания» или ИП Иванов И.И."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Тип
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(f => ({ ...f, type: e.target.value as 'COMPANY' | 'INDIVIDUAL' }))}
                  className="input w-full"
                >
                  <option value="COMPANY">Юридическое лицо</option>
                  <option value="INDIVIDUAL">Индивидуальный предприниматель</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Контактное лицо
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData(f => ({ ...f, contact: e.target.value }))}
                  className="input w-full"
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                    className="input w-full"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                    className="input w-full"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Адрес
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
                  className="input w-full"
                  placeholder="г. Москва, ул. Примерная, д. 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    ИНН
                  </label>
                  <input
                    type="text"
                    value={formData.inn}
                    onChange={(e) => setFormData(f => ({ ...f, inn: e.target.value }))}
                    className="input w-full"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    КПП
                  </label>
                  <input
                    type="text"
                    value={formData.kpp}
                    onChange={(e) => setFormData(f => ({ ...f, kpp: e.target.value }))}
                    className="input w-full"
                    placeholder="123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Примечания
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                  className="input w-full"
                  rows={3}
                  placeholder="Дополнительная информация..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                {editingClient && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingClient.id)
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
                    editingClient ? 'Сохранить' : 'Создать'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
