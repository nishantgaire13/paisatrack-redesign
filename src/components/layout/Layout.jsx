import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import AddTransactionModal from '../ui/AddTransactionModal'
import { useTransactions } from '../../hooks/useTransactions'

export default function Layout({ theme, onToggleTheme }) {
  const [showModal, setShowModal] = useState(false)
  const { addTransaction } = useTransactions()
  const isMobile = window.innerWidth < 768

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isMobile && (
        <Sidebar
          onAddTransaction={() => setShowModal(true)}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      )}

      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 'var(--sidebar-width)',
        paddingBottom: isMobile ? 'var(--mobile-nav-height)' : 0,
        minHeight: '100vh',
      }}>
        <Outlet context={{ openAddTransaction: () => setShowModal(true) }} />
      </main>

      {isMobile && <MobileNav onAddTransaction={() => setShowModal(true)} />}

      <AnimatePresence>
        {showModal && (
          <AddTransactionModal
            onClose={() => setShowModal(false)}
            onAdd={(data) => { addTransaction(data); setShowModal(false) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}