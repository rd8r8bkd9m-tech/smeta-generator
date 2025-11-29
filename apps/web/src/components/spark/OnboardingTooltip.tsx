/**
 * Spark-style Onboarding Tooltip
 * Contextual tips and feature discovery
 */

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react'
import clsx from 'clsx'

interface TooltipStep {
  id: string
  title: string
  description: string
  icon?: typeof Sparkles
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  highlight?: boolean
}

interface OnboardingTooltipProps {
  steps: TooltipStep[]
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
  storageKey?: string
}

export default function OnboardingTooltip({
  steps,
  isOpen,
  onClose,
  onComplete,
  storageKey = 'onboarding-complete',
}: OnboardingTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  // Position tooltip relative to target element
  useEffect(() => {
    if (!isOpen || !step.targetSelector) {
      // Center on screen if no target
      setPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 200,
      })
      return
    }

    const target = document.querySelector(step.targetSelector)
    if (!target) return

    const rect = target.getBoundingClientRect()
    const tooltip = tooltipRef.current
    const tooltipRect = tooltip?.getBoundingClientRect() || { width: 400, height: 200 }

    let top = rect.bottom + 12
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2

    // Adjust based on position preference
    switch (step.position) {
      case 'top':
        top = rect.top - tooltipRect.height - 12
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2
        left = rect.left - tooltipRect.width - 12
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2
        left = rect.right + 12
        break
    }

    // Keep within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16))
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16))

    setPosition({ top, left })

    // Highlight target element
    if (step.highlight && target) {
      target.classList.add('ring-2', 'ring-violet-500', 'ring-offset-2', 'z-50', 'relative')
    }

    // Cleanup function to remove highlight
    return () => {
      if (step.highlight && target) {
        target.classList.remove('ring-2', 'ring-violet-500', 'ring-offset-2', 'z-50', 'relative')
      }
    }
  }, [isOpen, currentStep, step])

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem(storageKey, 'true')
      onComplete?.()
      onClose()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(0, s - 1))
  }

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true')
    onClose()
  }

  if (!isOpen) return null

  const Icon = step.icon || Lightbulb

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with spotlight effect */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{ top: position.top, left: position.left }}
        className="absolute w-[400px] max-w-[calc(100vw-32px)] animate-fade-in-scale"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-6 mb-4">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={clsx(
                    'w-2 h-2 rounded-full transition-all',
                    idx === currentStep
                      ? 'w-6 bg-violet-500'
                      : idx < currentStep
                      ? 'bg-violet-300 dark:bg-violet-700'
                      : 'bg-zinc-200 dark:bg-zinc-700'
                  )}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Пропустить
              </button>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Назад
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Готово
                    </>
                  ) : (
                    <>
                      Далее
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow pointer */}
        {step.targetSelector && (
          <div
            className={clsx(
              'absolute w-3 h-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rotate-45',
              step.position === 'bottom' && '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l',
              step.position === 'top' && '-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r',
              step.position === 'left' && 'top-1/2 -right-1.5 -translate-y-1/2 border-t border-r',
              step.position === 'right' && 'top-1/2 -left-1.5 -translate-y-1/2 border-b border-l',
              !step.position && '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l'
            )}
          />
        )}
      </div>
    </div>,
    document.body
  )
}

// Predefined onboarding steps for the app
export const defaultOnboardingSteps: TooltipStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в ДениДом! 🎉',
    description: 'Это современная система для создания профессиональных строительных смет с AI-помощником. Давайте познакомимся с основными функциями.',
    icon: Sparkles,
  },
  {
    id: 'ai-generator',
    title: 'AI-генератор смет',
    description: 'Опишите работы голосом или текстом — AI подберёт позиции из базы ФЕР и рассчитает стоимость. Просто скажите "Ремонт квартиры 60м²".',
    targetSelector: '[data-onboarding="ai-generator"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'quick-actions',
    title: 'Быстрые действия (⌘K)',
    description: 'Нажмите ⌘K (или Ctrl+K) для вызова панели быстрых действий. Там вы найдёте все AI-функции, навигацию и команды.',
    targetSelector: '[data-onboarding="quick-actions"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'ml-insights',
    title: 'ML-аналитика',
    description: 'Система машинного обучения анализирует сметы, находит аномалии цен и предлагает оптимизации для экономии бюджета.',
    targetSelector: '[data-onboarding="ml-insights"]',
    position: 'left',
    highlight: true,
  },
  {
    id: 'complete',
    title: 'Вы готовы начать! 🚀',
    description: 'Теперь вы знаете основы. Создавайте сметы быстро и точно с помощью AI. Удачи!',
    icon: CheckCircle2,
  },
]
