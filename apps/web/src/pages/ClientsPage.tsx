import { useState } from 'react'
import { Plus, Search, Users, Phone, Mail, Building, ArrowUpRight, Briefcase, TrendingUp } from 'lucide-react'
import { GlassCard, Badge, AnimatedNumber, FAB } from '../design-system/components'
import clsx from 'clsx'

interface Client {
  id: string
  name: string
  type: 'company' | 'individual'
  contact: string
  phone: string
  email: string
  projectsCount: number
  totalAmount: number
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'ООО "Технологии Будущего"',
    type: 'company',
    contact: 'Иванов Иван Иванович',
    phone: '+7 (495) 123-45-67',
    email: 'info@techfuture.ru',
    projectsCount: 3,
    totalAmount: 4500000,
  },
  {
    id: '2',
    name: 'ИП Петров А.С.',
    type: 'individual',
    contact: 'Петров Алексей Сергеевич',
    phone: '+7 (916) 987-65-43',
    email: 'petrov.as@mail.ru',
    projectsCount: 1,
    totalAmount: 3500000,
  },
  {
    id: '3',
    name: 'Администрация г. Москвы',
    type: 'company',
    contact: 'Отдел капитального строительства',
    phone: '+7 (495) 777-77-77',
    email: 'stroy@mos.ru',
    projectsCount: 5,
    totalAmount: 25000000,
  },
]

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [clients] = useState<Client[]>(mockClients)
  const [filterType, setFilterType] = useState<'all' | 'company' | 'individual'>('all')

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || client.type === filterType
    return matchesSearch && matchesType
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const totalClients = clients.length
  const totalAmount = clients.reduce((sum, c) => sum + c.totalAmount, 0)
  const totalProjects = clients.reduce((sum, c) => sum + c.projectsCount, 0)

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
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Добавить клиента</span>
        </button>
      </div>

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
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Общий объем</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                <AnimatedNumber value={totalAmount / 1000000} suffix=" млн ₽" decimals={1} />
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
              { key: 'company', label: 'Компании', icon: Building },
              { key: 'individual', label: 'ИП', icon: Users },
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
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    'w-14 h-14 rounded-xl flex items-center justify-center',
                    'group-hover:scale-110 transition-transform duration-300',
                    client.type === 'company'
                      ? 'bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-900/10'
                      : 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10'
                  )}>
                    {client.type === 'company' ? (
                      <Building className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                    ) : (
                      <Users className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {client.name}
                    </h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                      {client.contact}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <a 
                        href={`tel:${client.phone}`}
                        className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </a>
                      <a 
                        href={`mailto:${client.email}`}
                        className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-secondary-900 dark:text-white">
                      {client.projectsCount} проект(ов)
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">
                      {formatCurrency(client.totalAmount)}
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-secondary-300 dark:text-secondary-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-secondary-400 dark:text-secondary-500" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
              Клиенты не найдены
            </h3>
            <p className="text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
              Попробуйте изменить параметры поиска или добавьте нового клиента
            </p>
          </div>
        )}
      </GlassCard>

      {/* FAB for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <FAB icon={Plus} />
      </div>
    </div>
  )
}
