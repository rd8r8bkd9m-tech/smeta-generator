import { useState } from 'react'
import Navigation from './components/Navigation'
import ViewTransition from './components/ViewTransition'
import HomePage from './pages/HomePage'
import CalculatorPage from './pages/CalculatorPage'
import ProjectsPage from './pages/ProjectsPage'
import ClientsPage from './pages/ClientsPage'

export type View = 'home' | 'calculator' | 'projects' | 'clients'

function App() {
  const [currentView, setCurrentView] = useState<View>('home')

  const handleViewChange = (view: View) => {
    setCurrentView(view)
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleViewChange} />
      case 'calculator':
        return <CalculatorPage />
      case 'projects':
        return <ProjectsPage />
      case 'clients':
        return <ClientsPage />
      default:
        return <HomePage onNavigate={handleViewChange} />
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="container mx-auto px-4 py-6">
        <ViewTransition view={currentView}>
          {renderView()}
        </ViewTransition>
      </main>
      <footer className="bg-white border-t border-secondary-200 py-4">
        <div className="container mx-auto px-4 text-center text-secondary-500 text-sm">
          © 2024 SMETA PRO. Все права защищены.
        </div>
      </footer>
    </div>
  )
}

export default App
