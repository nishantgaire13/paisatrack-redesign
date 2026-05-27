import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Pencil } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useBudget } from '../hooks/useBudget'
import { useProfile } from '../context/ProfileContext'
import { formatNPR } from '../utils/currency'
import { CATEGORIES, getCategoryByKey } from '../utils/categories'

const BS_MONTHS_FULL = ['Baishakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra']

function getMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function getMonthLabel(year, month, isBS = false) {
  if (isBS) {
    const bsIdx = (month + 9) % 12
    const bsYear = month >= 3 ? year + 57 : year + 56
    return `${BS_MONTHS_FULL[bsIdx]} ${bsYear}`
  }
  return new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function PieDoodle() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none"
      style={{ position: 'absolute', right: 16, bottom: 16, opacity: 0.06, pointerEvents: 'none' }}>
      <circle cx="40" cy="40" r="32" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <circle cx="40" cy="40" r="18" stroke="#1c3a1c" strokeWidth="0.7" fill="none"/>
      <line x1="40" y1="8" x2="40" y2="40" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="66" y2="54" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="12" y2="58" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="10" y2="26" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

export default function Budget() {
  const today = new Date()
  const { profile } = useProfile()
  const isBS = profile.calendar === 'BS'

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [copyMsg, setCopyMsg] = useState('')

  const monthKey = getMonthKey(viewYear, viewMonth)
  const { transactions } = useTransactions()

  const expensesByCategory = useMemo(() => {
    const map = {}
    transactions
      .filter(tx => tx.type === 'expense' && tx.date?.startsWith(monthKey))
      .forEach(tx => { map[tx.category] = (map[tx.category] || 0) + tx.amount })
    return map
  }, [transactions, monthKey])

  const {
    budgets, setBudgetForCategory, removeBudgetCategory,
    copyFromLastMonth, totalBudgeted, totalSpent,
  } = useBudget(monthKey, expensesByCategory)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const handleCopyLastMonth = () => {
    const success = copyFromLastMonth()
    setCopyMsg(success ? 'Copied from last month!' : 'No budget found for last month.')
    setTimeout(() => setCopyMsg(''), 3000)
  }

  const budgetCategories = useMemo(() =>
    Object.entries(budgets).map(([key, val]) => {
      const allocated = val?.amount || 0
      const customLabel = val?.customLabel || null
      const baseCat = getCategoryByKey(key)
      return {
        key, allocated, customLabel,
        spent: expensesByCategory[key] || 0,
        pct: allocated > 0 ? Math.min(Math.round(((expensesByCategory[key] || 0) / allocated) * 100), 100) : 0,
        cat: { ...baseCat, label: customLabel || baseCat.label },
      }
    }).sort((a, b) => b.pct - a.pct),
    [budgets, expensesByCategory]
  )

  const remaining = totalBudgeted - totalSpent
  const overallPct = totalBudgeted > 0 ? Math.min(Math.round((totalSpent / totalBudgeted) * 100), 100) : 0

  return (
    <div style={{ padding: '36px 40px 60px', maxWidth: 1080, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>
          Monthly Limits
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 38, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Budget
        </h1>
        <div style={{ width: 36, height: 1.5, background: 'var(--accent)', marginTop: 12, opacity: 0.4 }} />
      </div>

      {/* Month selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={prevMonth} style={{ color: 'var(--text-muted)', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--border-default)', background: 'var(--bg-card)', cursor: 'pointer' }}>
            <ChevronLeft size={14} />
          </button>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', minWidth: 200, textAlign: 'center' }}>
            {getMonthLabel(viewYear, viewMonth, isBS)}
          </h2>
          <button onClick={nextMonth} style={{ color: 'var(--text-muted)', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--border-default)', background: 'var(--bg-card)', cursor: 'pointer' }}>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {copyMsg && (
            <span style={{ fontSize: 11, color: copyMsg.startsWith('No') ? 'var(--red)' : 'var(--accent)', fontWeight: 500 }}>
              {copyMsg}
            </span>
          )}
          <button onClick={handleCopyLastMonth} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 14px', borderRadius: 4, border: '1px solid var(--border-default)', background: 'var(--bg-card)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
            Copy last month
          </button>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#f0ece0', padding: '8px 14px', borderRadius: 4, background: 'var(--accent)', fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer' }}>
            <Plus size={12} strokeWidth={2.5} /> Add Category
          </button>
        </div>
      </div>

      {/* How budgets work hint */}
      <div style={{ marginBottom: 20, padding: '10px 16px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>How budgets work:</strong> Each month is independent. Navigate to any month and set limits. Use <em>Copy last month</em> to bring previous categories and amounts into the current view.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginBottom: 24, border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden', background: 'var(--border-default)' }}>
        {[
          { label: 'Total Budgeted', value: formatNPR(totalBudgeted), color: 'var(--text-primary)' },
          { label: 'Total Spent',    value: formatNPR(totalSpent),    color: totalSpent > totalBudgeted && totalBudgeted > 0 ? 'var(--red)' : 'var(--text-primary)' },
          { label: 'Remaining',      value: formatNPR(Math.abs(remaining)), color: remaining >= 0 ? 'var(--accent)' : 'var(--red)', sub: remaining >= 0 ? 'left to spend' : 'over budget' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{ background: 'var(--bg-card)', padding: '18px 22px' }}>
            <p style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, color, letterSpacing: '-0.02em' }}>{value}</p>
            {sub && <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Overall progress */}
      {totalBudgeted > 0 && (
        <div style={{ marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '18px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Overall utilization</span>
            <span style={{ fontSize: 12, color: overallPct > 80 ? 'var(--red)' : 'var(--accent)', fontWeight: 600 }}>{overallPct}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ height: '100%', borderRadius: 4, background: overallPct > 80 ? 'var(--red)' : overallPct > 60 ? 'var(--yellow)' : 'var(--accent)' }}
            />
          </div>
        </div>
      )}

      {/* Budget categories */}
      {budgetCategories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ opacity: 0.15, marginBottom: 14 }}>
            <circle cx="28" cy="28" r="22" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
            <circle cx="28" cy="28" r="12" stroke="#1c3a1c" strokeWidth="0.7" fill="none"/>
            <line x1="28" y1="6" x2="28" y2="28" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
            <line x1="28" y1="28" x2="46" y2="38" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
            <line x1="28" y1="28" x2="8" y2="40" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <p style={{ fontSize: 14, color: 'var(--text-faint)', marginBottom: 6 }}>
            No budget set for {getMonthLabel(viewYear, viewMonth, isBS)}.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Click "Add Category" or "Copy last month" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {budgetCategories.map(({ key, cat, allocated, spent, pct, customLabel }) => (
            <div key={key} style={{
              background: 'var(--bg-card)',
              border: `1px solid ${pct > 80 ? 'rgba(122,32,32,0.2)' : 'var(--border-default)'}`,
              borderRadius: 8, padding: '20px 22px',
              position: 'relative', overflow: 'hidden',
            }}>
              <PieDoodle />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{cat.label}</p>
                    <p style={{ fontSize: 10, color: pct > 80 ? 'var(--red)' : pct > 60 ? 'var(--yellow)' : 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
                      {pct}% used
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setEditingCategory({ key, allocated, customLabel: customLabel || '' })}
                    style={{ color: 'var(--text-faint)', padding: 4, cursor: 'pointer', borderRadius: 3 }} title="Edit">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => removeBudgetCategory(key)}
                    style={{ color: 'var(--text-faint)', padding: 4, cursor: 'pointer', borderRadius: 3 }} title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Spent</p>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: pct > 80 ? 'var(--red)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {formatNPR(spent)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Budget</p>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {formatNPR(allocated)}
                  </p>
                </div>
              </div>

              <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ height: '100%', borderRadius: 4, background: pct > 80 ? 'var(--red)' : pct > 60 ? 'var(--yellow)' : 'var(--accent)' }}
                />
              </div>

              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                {allocated - spent >= 0
                  ? `${formatNPR(allocated - spent)} remaining`
                  : `${formatNPR(Math.abs(allocated - spent))} over budget`
                }
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddCategoryModal
            existingKeys={Object.keys(budgets)}
            onClose={() => setShowAddModal(false)}
            onAdd={(key, amount, customLabel) => {
              setBudgetForCategory(key, amount, customLabel)
              setShowAddModal(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <EditCategoryModal
            categoryKey={editingCategory.key}
            currentAmount={editingCategory.allocated}
            currentLabel={editingCategory.customLabel}
            onClose={() => setEditingCategory(null)}
            onSave={(amount, customLabel) => {
              setBudgetForCategory(editingCategory.key, amount, customLabel)
              setEditingCategory(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AddCategoryModal({ existingKeys, onClose, onAdd }) {
  const [selectedKey, setSelectedKey] = useState('')
  const [amount, setAmount] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [error, setError] = useState('')

  const available = CATEGORIES.filter(c => !existingKeys.includes(c.key))

  const handleAdd = () => {
    if (!selectedKey) { setError('Select a category'); return }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    onAdd(selectedKey, Number(amount), selectedKey === 'other' ? customLabel : null)
  }

  const modalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,30,20,0.5)', backdropFilter: 'blur(3px)' }}/>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: 'relative', width: 'min(92vw, 440px)', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '26px 26px 22px', zIndex: 1, maxHeight: '88vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Add Budget</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Category</label>
          {available.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>All categories already have budgets.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
              {available.map(cat => (
                <button key={cat.key} onClick={() => { setSelectedKey(cat.key); if (cat.key !== 'other') setCustomLabel('') }} style={{
                  padding: '10px 6px', borderRadius: 6,
                  border: `1px solid ${selectedKey === cat.key ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  background: selectedKey === cat.key ? 'var(--accent-light)' : 'var(--bg-elevated)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  transition: 'all 0.15s', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 10, color: selectedKey === cat.key ? 'var(--accent)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, fontWeight: selectedKey === cat.key ? 500 : 400 }}>{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedKey === 'other' && (
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Custom Name <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span></label>
            <input type="text" value={customLabel} onChange={e => setCustomLabel(e.target.value)} placeholder="e.g. Grooming, Pet care, Travel..." autoFocus/>
          </div>
        )}

        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Monthly Limit</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)' }}>Rs.</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              style={{ paddingLeft: 46, fontSize: 20, fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.02em' }}/>
          </div>
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 14 }}>{error}</p>}

        <button onClick={handleAdd} style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#f0ece0', fontWeight: 500, fontSize: 14, borderRadius: 4, fontFamily: 'var(--font-body)', letterSpacing: '0.02em', cursor: 'pointer' }}>
          Set Budget
        </button>
      </motion.div>
    </div>,
    modalRoot
  )
}

function EditCategoryModal({ categoryKey, currentAmount, currentLabel, onClose, onSave }) {
  const cat = getCategoryByKey(categoryKey)
  const [amount, setAmount] = useState(String(currentAmount))
  const [customLabel, setCustomLabel] = useState(currentLabel || '')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    onSave(Number(amount), categoryKey === 'other' ? customLabel : null)
  }

  const modalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,30,20,0.5)', backdropFilter: 'blur(3px)' }}/>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: 'relative', width: 'min(92vw, 380px)', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '26px 26px 22px', zIndex: 1 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{cat.emoji}</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Edit Budget</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {categoryKey === 'other' && (
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Custom Name <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span></label>
            <input type="text" value={customLabel} onChange={e => setCustomLabel(e.target.value)} placeholder="e.g. Grooming, Pet care, Travel..."/>
          </div>
        )}

        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Monthly Limit</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)' }}>Rs.</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} autoFocus
              style={{ paddingLeft: 46, fontSize: 20, fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.02em' }}/>
          </div>
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 14 }}>{error}</p>}

        <button onClick={handleSave} style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#f0ece0', fontWeight: 500, fontSize: 14, borderRadius: 4, fontFamily: 'var(--font-body)', letterSpacing: '0.02em', cursor: 'pointer' }}>
          Save Changes
        </button>
      </motion.div>
    </div>,
    modalRoot
  )
}

const labelStyle = {
  fontSize: 10, color: 'var(--text-muted)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  display: 'block', marginBottom: 10, fontWeight: 500,
}