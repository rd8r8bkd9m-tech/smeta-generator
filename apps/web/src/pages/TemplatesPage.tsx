import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { GlassCard, Badge } from '../design-system/components'
import { FileText, Plus, Search, ChevronRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TemplateItem {
  id: string
  name: string
  unit: string
  price: number
  quantity?: number
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  items: TemplateItem[]
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/calculator/templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
              Шаблоны смет
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Используйте готовые шаблоны для быстрого старта новых проектов
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg shadow-orange-500/25">
            <Plus className="w-5 h-5" />
            <span>Создать шаблон</span>
          </button>
        </div>

        <GlassCard className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </GlassCard>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <GlassCard key={i} className="h-48 animate-pulse bg-zinc-100 dark:bg-zinc-800/50">
                <div />
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <GlassCard 
                key={template.id} 
                hoverable 
                className="p-6 flex flex-col justify-between group cursor-pointer"
                onClick={() => navigate(`/calculator?template=${template.id}`)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <Badge variant="default">{template.items.length} поз.</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mb-4">
                    {template.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      Premium
                    </span>
                  </div>
                  <div className="flex items-center text-orange-600 dark:text-orange-400 font-semibold text-sm">
                    Использовать
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
