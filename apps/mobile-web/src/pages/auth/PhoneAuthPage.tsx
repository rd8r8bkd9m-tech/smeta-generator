import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, ArrowRight } from 'lucide-react'
import { PrimaryButton } from '../../components/PrimaryButton'
import { GlassCard } from '../../components/GlassCard'

export const PhoneAuthPage: React.FC = () => {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [isValid, setIsValid] = useState(false)

  const handlePhoneChange = (value: string) => {
    // Удаляем все нецифровые символы
    const cleanValue = value.replace(/\D/g, '')

    // Форматируем номер телефона
    let formatted = '+7 '
    if (cleanValue.length > 1) {
      formatted += `(${cleanValue.slice(1, 4)}`
    }
    if (cleanValue.length > 4) {
      formatted += `) ${cleanValue.slice(4, 7)}`
    }
    if (cleanValue.length > 7) {
      formatted += `-${cleanValue.slice(7, 9)}`
    }
    if (cleanValue.length > 9) {
      formatted += `-${cleanValue.slice(9, 11)}`
    }

    setPhone(formatted)

    // Валидация: +7 (XXX) XXX-XX-XX
    setIsValid(cleanValue.length === 11 && cleanValue.startsWith('7'))
  }

  const handleContinue = () => {
    if (isValid) {
      navigate('/auth/code')
    }
  }

  return (
    <div className="min-h-full flex flex-col px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Phone size={32} className="text-accent" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Вход в Status</h1>
        <p className="text-textSecondary">
          Введите номер телефона для получения SMS с кодом
        </p>
      </motion.div>

      {/* Phone input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1"
      >
        <GlassCard className="mb-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-textSecondary">
              Номер телефона
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              className="w-full bg-transparent border-none outline-none text-lg placeholder-textTertiary"
              autoFocus
            />
            <div className="h-px bg-stroke" />
          </div>
        </GlassCard>

        <PrimaryButton
          onClick={handleContinue}
          disabled={!isValid}
          fullWidth
          size="lg"
        >
          <div className="flex items-center gap-2">
            Продолжить
            <ArrowRight size={20} />
          </div>
        </PrimaryButton>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center text-xs text-textTertiary mt-8"
      >
        <p>
          Нажимая "Продолжить", вы соглашаетесь с{' '}
          <span className="text-accent underline">условиями использования</span>
        </p>
      </motion.div>
    </div>
  )
}