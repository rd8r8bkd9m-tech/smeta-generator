import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, RotateCcw, Check, Palette } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton'
import { GhostButton } from '../components/GhostButton'
import { textBackgrounds } from '../mock/data'

export const TextCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [selectedBackground, setSelectedBackground] = useState(0)
  const [showBackgrounds, setShowBackgrounds] = useState(false)

  const handlePublish = () => {
    if (text.trim()) {
      navigate('/success')
    }
  }

  const currentBackground = textBackgrounds[selectedBackground]

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6"
      >
        <GhostButton onClick={() => navigate(-1)} className="px-0">
          <X size={20} />
        </GhostButton>

        <div className="flex items-center gap-2">
          <GhostButton onClick={() => setText('')} className="px-3">
            <RotateCcw size={16} />
          </GhostButton>

          <PrimaryButton
            onClick={handlePublish}
            disabled={!text.trim()}
            size="sm"
          >
            <Check size={16} />
          </PrimaryButton>
        </div>
      </motion.div>

      {/* Background selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 mb-6"
      >
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {textBackgrounds.slice(0, 6).map((bg, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBackground(index)}
              className={`relative w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border-2 ${
                selectedBackground === index ? 'border-white' : 'border-white/20'
              }`}
              style={{ background: bg }}
            >
              {selectedBackground === index && (
                <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
              )}
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBackgrounds(!showBackgrounds)}
            className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center border-2 border-white/20"
          >
            <Palette size={16} className="text-textSecondary" />
          </motion.button>
        </div>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1 px-6"
      >
        <div
          className="w-full h-full rounded-2xl flex items-center justify-center p-8"
          style={{ background: currentBackground }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишите что-то..."
            className="w-full bg-transparent text-center text-2xl font-bold text-white placeholder-white/50 outline-none resize-none"
            style={{ minHeight: '200px' }}
            autoFocus
          />
        </div>
      </motion.div>

      {/* Full background selector */}
      {showBackgrounds && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-bg0/95 backdrop-blur-xl z-10"
          onClick={() => setShowBackgrounds(false)}
        >
          <div className="p-6 pt-20">
            <h3 className="text-lg font-semibold mb-6">Выберите фон</h3>
            <div className="grid grid-cols-4 gap-4">
              {textBackgrounds.map((bg, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedBackground(index)
                    setShowBackgrounds(false)
                  }}
                  className={`aspect-square rounded-xl overflow-hidden border-2 ${
                    selectedBackground === index ? 'border-white' : 'border-white/20'
                  }`}
                  style={{ background: bg }}
                >
                  {selectedBackground === index && (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <Check size={24} className="text-white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}