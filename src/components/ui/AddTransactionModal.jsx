import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { CATEGORIES } from '../../utils/categories'

const today = () => new Date().toISOString().split('T')[0]

export default function AddTransactionModal({ onClose, onAdd }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [merchant, setMerchant] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today())
  const [error, setError] = useState('')

  const filteredCategories = CATEGORIES.filter(c => c.type === type || c.type === 'both')

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Please enter a valid amount'); return }
    if (!category) { setError('Please select a category'); return }
    if (!merchant.trim()) { setError('Please enter a title'); return }
    onAdd({ type, amount: Number(amount), category, merchant, description, date })
  }

  const modalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(20,30,20,0.5)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'relative',
          width: 'min(92vw, 460px)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          padding: '28px 28px 24px',
          maxHeight: '88vh',
          overflowY: 'auto',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {type === 'income' ? 'Add Income' : 'Add Expense'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Type Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 6, padding: 3, marginBottom: 22, border: '1px solid var(--border-subtle)' }}>
          {['expense', 'income'].map(t => (
            <button key={t} onClick={() => { setType(t); setCategory('') }} style={{
              flex: 1, padding: '8px 0', borderRadius: 4,
              fontWeight: 500, fontSize: 13,
              background: type === t ? 'var(--bg-card)' : 'transparent',
              color: type === t ? (t === 'income' ? 'var(--accent)' : 'var(--red)') : 'var(--text-muted)',
              border: type === t ? '1px solid var(--border-default)' : '1px solid transparent',
              transition: 'all 0.18s', textTransform: 'capitalize',
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Amount</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)' }}>Rs.</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0" autoFocus
              style={{ paddingLeft: 46, fontSize: 22, fontFamily: 'var(--font-heading)', fontWeight: 600, color: type === 'income' ? 'var(--accent)' : 'var(--red)', letterSpacing: '-0.02em' }}
            />
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
            {filteredCategories.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)} style={{
                padding: '10px 4px', borderRadius: 6,
                border: `1px solid ${category === cat.key ? 'var(--accent)' : 'var(--border-subtle)'}`,
                background: category === cat.key ? 'var(--accent-light)' : 'var(--bg-elevated)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                <span style={{ fontSize: 9.5, color: category === cat.key ? 'var(--accent)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, fontWeight: category === cat.key ? 500 : 400 }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Title / Merchant</label>
          <input type="text" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="e.g. Bhatbhateni, Monthly Salary" />
        </div>

        {/* Date */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {/* Note */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Note <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span></label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Any extra details..." rows={2} style={{ resize: 'none' }} />
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 14 }}>{error}</p>}

        <motion.button
          whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
          onClick={handleSubmit}
          style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#f0ece0', fontWeight: 500, fontSize: 14, borderRadius: 4, fontFamily: 'var(--font-body)', letterSpacing: '0.02em' }}
        >
          Add {type === 'income' ? 'Income' : 'Expense'}
        </motion.button>
      </motion.div>
    </div>,
    modalRoot
  )
}

const labelStyle = { fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8, fontWeight: 500 }