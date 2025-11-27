import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Calculator, Sparkles, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { GlassCard } from '../design-system/components'
import clsx from 'clsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setUser, setToken, addNotification, theme } = useStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const passwordStrength = (() => {
    const password = formData.password
    if (password.length === 0) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации')
      }

      setUser(data.user)
      setToken(data.token)
      addNotification('success', 'Регистрация успешна!')
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    'Неограниченное количество смет',
    'Актуальные нормативы ФЕР/ГЭСН',
    'Экспорт в PDF и Excel',
    'Облачное хранение данных',
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-dark-bg dark:via-dark-bg-secondary dark:to-dark-bg-tertiary py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md w-full space-y-8 animate-fade-in-up">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-105">
                  <Calculator className="w-7 h-7 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-secondary-900 dark:text-white">
              Регистрация в{' '}
              <span className="bg-gradient-to-r from-primary-600 to-amber-500 bg-clip-text text-transparent">
                SMETA PRO
              </span>
            </h2>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                Войдите
              </Link>
            </p>
          </div>

          <GlassCard className="p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl text-sm animate-fade-in-scale">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Ваше имя
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="input"
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="input pr-12"
                      placeholder="Минимум 8 символов"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  {formData.password.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={clsx(
                            'h-1 flex-1 rounded-full transition-colors',
                            level <= passwordStrength
                              ? passwordStrength <= 2 ? 'bg-rose-500' : passwordStrength <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                              : 'bg-secondary-200 dark:bg-secondary-700'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Подтвердите пароль
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={clsx(
                      'input',
                      formData.confirmPassword && formData.password !== formData.confirmPassword && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                    )}
                    placeholder="Повторите пароль"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              {/* Features list */}
              <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-4">
                <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-3">
                  Что вы получите:
                </p>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'w-full flex justify-center items-center gap-2 btn btn-primary py-3',
                  loading && 'opacity-70 cursor-not-allowed'
                )}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Регистрация...</span>
                  </>
                ) : (
                  <>
                    <span>Зарегистрироваться</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </GlassCard>

          <p className="text-center text-xs text-secondary-500 dark:text-secondary-400">
            Продолжая, вы соглашаетесь с условиями использования
          </p>
        </div>
      </div>
    </div>
  )
}
