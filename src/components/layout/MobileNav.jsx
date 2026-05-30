import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Target, BarChart2, Settings, Plus } from 'lucide-react'

const LEFT_ITEMS = [
  { to: '/',             label: 'Home', icon: LayoutDashboard },
  { to: '/transactions', label: 'Txns', icon: ArrowLeftRight  },
]

const RIGHT_ITEMS = [
  { to: '/budget',   label: 'Budget',   icon: Target    },
  { to: '/reports',  label: 'Reports',  icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings  },
]

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink to={to} end={to === '/'} style={{ textDecoration: 'none', width: '20%' }}>
      {({ isActive }) => (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 3, padding: '8px 0',
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          transition: 'color 0.15s ease',
        }}>
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
          <span style={{ fontSize: 9, fontWeight: isActive ? 600 : 400 }}>{label}</span>
        </div>
      )}
    </NavLink>
  )
}

export default function MobileNav({ onAddTransaction }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 'var(--mobile-nav-height)',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 100,
      padding: '0 4px',
    }}>
      {/* Left 2 items */}
      {LEFT_ITEMS.map(item => <NavItem key={item.to} {...item} />)}

      {/* Center Add button — exact 20% width to match others */}
      <div style={{ width: '20%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          onClick={onAddTransaction}
          style={{
            width: 46, height: 46,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#f0ece0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(28,58,28,0.3)',
            border: '3px solid var(--bg-surface)',
            cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Right 3 items */}
      {RIGHT_ITEMS.map(item => <NavItem key={item.to} {...item} />)}
    </nav>
  )
}