import React, { useEffect } from 'react'
import { motion, AnimatePresence, PanInfo, useDragControls } from 'framer-motion'
import { clsx } from 'clsx'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  height?: 'auto' | 'half' | 'full'
  showHandle?: boolean
  className?: string
}

const heightClasses = {
  auto: 'max-h-[80vh]',
  half: 'h-[50vh]',
  full: 'h-[90vh]',
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
  showHandle = true,
  className,
}) => {
  const dragControls = useDragControls()

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info

    // Закрываем если потянули вниз достаточно сильно
    if (offset.y > 100 || velocity.y > 500) {
      onClose()
    }
  }

  // Блокировка body scroll когда sheet открыт
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className={clsx(
              'fixed bottom-0 left-0 right-0 z-50',
              'glass rounded-t-2xl',
              'safe-area-inset',
              heightClasses[height],
              className
            )}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-white/30 rounded-full" />
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col h-full">
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}