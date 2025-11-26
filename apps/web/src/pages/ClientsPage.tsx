import { useState } from 'react'
import { Plus, Search, Users, Phone, Mail, Building, MoreVertical } from 'lucide-react'

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

  const filteredClients = clients.filter(
    client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Клиенты</h1>
          <p className="text-secondary-600">База клиентов и заказчиков</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Добавить клиента</span>
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Поиск клиентов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    {client.type === 'company' ? (
                      <Building className="w-6 h-6 text-primary-600" />
                    ) : (
                      <Users className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">{client.name}</h3>
                    <p className="text-sm text-secondary-600">{client.contact}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center text-sm text-secondary-500">
                        <Phone className="w-4 h-4 mr-1" />
                        {client.phone}
                      </span>
                      <span className="flex items-center text-sm text-secondary-500">
                        <Mail className="w-4 h-4 mr-1" />
                        {client.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-secondary-900">
                      {client.projectsCount} проект(ов)
                    </div>
                    <div className="text-sm text-secondary-500">
                      Сумма: {formatCurrency(client.totalAmount)}
                    </div>
                  </div>
                  <button className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Клиенты не найдены</p>
          </div>
        )}
      </div>
    </div>
  )
}
