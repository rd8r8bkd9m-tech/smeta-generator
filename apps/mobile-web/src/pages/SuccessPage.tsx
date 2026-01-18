import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Share, Home } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton'
import { GhostButton } from '../components/GhostButton'
import { useToast } from '../hooks/useToast'

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Показываем toast при входе на страницу
    toast.success('Статус опубликован!', 'Он появится в ленте через несколько секунд')
  }, [toast])

  return (
    <div className="min-h-full flex flex-col px-6 py-12">
      {/* Success animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="flex-1 flex flex-col items-center justify-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-8"
        >
          <Check size={40} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-4"
        >
          Статус опубликован!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-textSecondary mb-8 max-w-sm"
        >
          Ваш статус теперь виден всем друзьям. Он исчезнет через 24 часа.
        </motion.p>

        {/* Share section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm mb-8"
        >
          <div className="bg-surface/50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <Share size={16} className="text-accent" />
              </div>
              <span className="font-medium">Поделиться ссылкой</span>
            </div>
            <div className="bg-bg1 rounded-lg p-3 font-mono text-sm text-textSecondary break-all">
              status.app/s/abc123def456
            </div>
          </div>

          <div className="flex gap-2">
            <PrimaryButton className="flex-1" size="sm">
              <Share size={16} />
              Поделиться
            </PrimaryButton>
            <GhostButton className="px-4">
              Копировать
            </GhostButton>
          </div>
        </motion.div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <PrimaryButton
          onClick={() => navigate('/feed')}
          fullWidth
          size="lg"
        >
          <div className="flex items-center gap-2">
            <Home size={20} />
            Вернуться к ленте
          </div>
        </PrimaryButton>

        <GhostButton
          onClick={() => navigate('/create')}
          fullWidth
        >
          Создать ещё один статус
        </GhostButton>
      </motion.div>
    </div>
  )
}