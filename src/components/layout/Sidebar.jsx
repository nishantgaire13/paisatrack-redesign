import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, ArrowLeftRight, Target, BarChart2, Settings, Plus, CalendarDays, Sun, Moon } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { to: '/budget',       label: 'Budget',       icon: Target          },
  { to: '/reports',      label: 'Reports',      icon: BarChart2       },
  { to: '/calendar',     label: 'Calendar',     icon: CalendarDays    },
  { to: '/settings',     label: 'Settings',     icon: Settings        },
]

function WalletMark() {
  return (
    <svg width="20" height="17" viewBox="0 0 22 18" fill="none">
      <rect x="1" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M1 7h20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <rect x="13" y="9.5" width="6" height="4.5" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/>
      <line x1="6" y1="4" x2="6" y2="1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="9" y1="4" x2="9" y2="1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="12" y1="4" x2="12" y2="1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )
}

export default function Sidebar({ onAddTransaction, theme, onToggleTheme }) {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed',
      left: 0, top: 0, zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{ padding: '28px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: 'var(--text-primary)' }}>
          <WalletMark />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 21, letterSpacing: '-0.05em', lineHeight: 1 }}>
            PaisaTrack
          </span>
        </div>
        <div style={{ width: '100%', height: 1, background: 'var(--border-strong)', margin: '8px 0 6px', opacity: 0.5 }} />
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Personal Ledger
        </span>
      </div>

      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 24px 4px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 4,
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#f0ece0' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: isActive ? 500 : 400,
                transition: 'all 0.15s ease', cursor: 'pointer',
              }}>
                <Icon size={13} strokeWidth={isActive ? 2 : 1.6} />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 24px' }} />

      {/* Bottom */}
      <div style={{ padding: '14px 12px 20px' }}>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '8px 0', marginBottom: 10,
            borderRadius: 4,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            fontSize: 12, fontFamily: 'var(--font-body)',
            fontWeight: 400, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {theme === 'light'
            ? <><Moon size={13} strokeWidth={1.6} /> Dark mode</>
            : <><Sun size={13} strokeWidth={1.6} /> Light mode</>
          }
        </button>

        {/* Add Transaction */}
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={onAddTransaction}
          style={{
            width: '100%', background: 'var(--accent)', color: '#f0ece0',
            fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12,
            padding: '11px 14px', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <Plus size={12} strokeWidth={2.5} />
          Add Transaction
        </motion.button>
      </div>
    </aside>
  )
}