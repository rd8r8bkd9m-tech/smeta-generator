import { ReactNode } from 'react'
import Navigation from './Navigation'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-white border-t border-secondary-200 py-4">
        <div className="container mx-auto px-4 text-center text-secondary-500 text-sm">
          © 2024 SMETA PRO. Все права защищены.
        </div>
      </footer>
    </div>
  )
}
