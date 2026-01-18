import React from 'react'
import { motion } from 'framer-motion'
import { DeviceFrame } from '../components/DeviceFrame'

// Импорт всех экранов
import { PhoneAuthPage } from './auth/PhoneAuthPage'
import { CodeAuthPage } from './auth/CodeAuthPage'
import { FeedPage } from './FeedPage'
import { ViewerPage } from './ViewerPage'
import { TextViewerPage } from './TextViewerPage'
import { CreatePage } from './CreatePage'
import { TextCreatePage } from './TextCreatePage'
import { AudiencePage } from './AudiencePage'
import { ProfilePage } from './ProfilePage'
import { InboxPage } from './InboxPage'
import { SettingsPage } from './SettingsPage'
import { SuccessPage } from './SuccessPage'

const screens = [
  { component: PhoneAuthPage, title: '1. Ввод телефона' },
  { component: CodeAuthPage, title: '2. Код подтверждения' },
  { component: FeedPage, title: '3. Лента статусов' },
  { component: ViewerPage, title: '4. Viewer фото/видео' },
  { component: TextViewerPage, title: '5. Viewer текста' },
  { component: CreatePage, title: '6. Новый статус' },
  { component: TextCreatePage, title: '7. Редактор текста' },
  { component: AudiencePage, title: '8. Выбор аудитории' },
  { component: ProfilePage, title: '9. Профиль' },
  { component: InboxPage, title: '10. Входящие' },
  { component: SettingsPage, title: '11. Настройки' },
  { component: SuccessPage, title: '12. Успех публикации' },
]

export const UiKitPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Status App — UI Kit
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Витрина всех экранов мобильного приложения
          </motion.p>
        </div>

        {/* Grid of screens */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center"
        >
          {screens.map((screen, index) => {
            const ScreenComponent = screen.component
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.1 * index,
                  type: "spring",
                  stiffness: 100
                }}
                className="transform-gpu"
              >
                <DeviceFrame title={screen.title}>
                  <ScreenComponent />
                </DeviceFrame>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-16 text-gray-500"
        >
          <p>iPhone 15 Pro (393×852) • Status App UI Kit</p>
        </motion.div>
      </div>
    </div>
  )
}