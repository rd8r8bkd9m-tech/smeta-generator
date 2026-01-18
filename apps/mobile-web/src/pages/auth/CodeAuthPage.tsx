import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { PrimaryButton } from '../../components/PrimaryButton'
import { GhostButton } from '../../components/GhostButton'
import { GlassCard } from '../../components/GlassCard'

export const CodeAuthPage: React.FC = () => {
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Только одна цифра

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Автопереход к следующему input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }

    // Автопереход назад при удалении
    if (!value && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleResend = () => {
    setTimeLeft(30)
    setCanResend(false)
    // Здесь логика повторной отправки SMS
  }

  const handleVerify = () => {
    const fullCode = code.join('')
    if (fullCode.length === 6) {
      // Имитация успешной верификации
      navigate('/feed')
    }
  }

  const isComplete = code.every(digit => digit !== '')

  return (
    <div className="min-h-full flex flex-col px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <GhostButton
          onClick={() => navigate(-1)}
          className="mb-6 w-auto px-0"
        >
          <ArrowLeft size={20} />
        </GhostButton>

        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Подтверждение</h1>
          <p className="text-textSecondary">
            Мы отправили SMS с кодом на номер<br />
            <span className="text-accent font-medium">+7 (999) 123-45-67</span>
          </p>
        </div>
      </motion.div>

      {/* Code input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1"
      >
        <GlassCard className="mb-6">
          <div className="flex gap-3 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 bg-transparent border-2 border-stroke rounded-xl text-center text-xl font-bold outline-none focus:border-accent transition-colors"
                autoFocus={index === 0}
              />
            ))}
          </div>
        </GlassCard>

        <PrimaryButton
          onClick={handleVerify}
          disabled={!isComplete}
          fullWidth
          size="lg"
        >
          Подтвердить
        </PrimaryButton>
      </motion.div>

      {/* Resend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center"
      >
        {canResend ? (
          <GhostButton onClick={handleResend} className="text-accent">
            Отправить код повторно
          </GhostButton>
        ) : (
          <p className="text-textTertiary text-sm">
            Отправить код повторно через{' '}
            <span className="font-medium">
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </p>
        )}
      </motion.div>
    </div>
  )
}