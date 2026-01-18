import React from 'react'
import { motion } from 'framer-motion'

interface DeviceFrameProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  title,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative ${className}`}
    >
      {/* iPhone 15 Pro frame */}
      <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
        {/* Screen bezels */}
        <div className="bg-black rounded-[2.5rem] p-1">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />

          {/* Screen */}
          <div className="relative bg-bg0 rounded-[2rem] overflow-hidden" style={{ width: 393, height: 852 }}>
            {/* Status bar simulation */}
            <div className="absolute top-0 left-0 right-0 h-11 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 text-white text-xs z-20">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-white rounded-sm" />
                <div className="w-4 h-2 bg-white rounded-sm" />
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            {/* Content */}
            <div className="pt-11 h-full">
              {children}
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Title */}
      {title && (
        <div className="text-center mt-4">
          <h3 className="text-textSecondary text-sm font-medium">{title}</h3>
        </div>
      )}
    </motion.div>
  )
}