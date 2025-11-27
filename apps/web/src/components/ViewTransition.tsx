import { ReactNode, useEffect, useState } from 'react'

interface ViewTransitionProps {
  children: ReactNode
  view: string
}

export default function ViewTransition({ children, view }: ViewTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [view])

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {children}
    </div>
  )
}
