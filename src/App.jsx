import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProfileProvider } from './context/ProfileContext'
import { TransactionsProvider } from './context/TransactionsContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pt_theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('pt_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <ProfileProvider>
      <TransactionsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout theme={theme} onToggleTheme={toggleTheme} />}>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="budget" element={<Budget />} />
              <Route path="reports" element={<Reports />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TransactionsProvider>
    </ProfileProvider>
  )
}