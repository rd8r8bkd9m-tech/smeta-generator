import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CalculatorPage from './pages/CalculatorPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import ClientsPage from './pages/ClientsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/calculator" element={<Layout><CalculatorPage /></Layout>} />
      <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
      <Route path="/projects/:id" element={<Layout><ProjectDetailsPage /></Layout>} />
      <Route path="/clients" element={<Layout><ClientsPage /></Layout>} />
    </Routes>
  )
}

export default App
