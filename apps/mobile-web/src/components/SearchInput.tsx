import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { clsx } from 'clsx'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Поиск...',
  className,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div
      className={clsx(
        'relative flex items-center glass-card px-4 transition-all duration-200',
        isFocused && 'ring-2 ring-accent/50',
        className
      )}
      animate={{
        scale: isFocused ? 1.02 : 1,
      }}
    >
      <Search
        size={20}
        className={clsx(
          'text-textTertiary transition-colors',
          isFocused && 'text-accent'
        )}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent border-none outline-none px-3 py-3 text-base placeholder-textTertiary focus:placeholder-textSecondary"
        aria-label="Поиск"
        role="searchbox"
      />

      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onChange('')}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Очистить поиск"
          >
            <X size={16} className="text-textTertiary" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}