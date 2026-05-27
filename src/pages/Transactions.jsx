import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Pencil, Trash2, Check } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useProfile } from '../context/ProfileContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { formatNPR } from '../utils/currency'
import { formatDate } from '../utils/calendar'
import { getCategoryByKey, CATEGORIES } from '../utils/categories'

function LedgerDoodle() {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" fill="none"
      style={{ position: 'absolute', right: 24, bottom: 16, opacity: 0.06, pointerEvents: 'none' }}>
      <rect x="8" y="4" width="64" height="82" rx="3" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <line x1="8" y1="18" x2="72" y2="18" stroke="#1c3a1c" strokeWidth="1"/>
      <line x1="4" y1="4" x2="4" y2="86" stroke="#1c3a1c" strokeWidth="3" strokeLinecap="round"/>
      {[28,38,48,58,68].map(y => (
        <g key={y}>
          <line x1="18" y1={y} x2="52" y2={y} stroke="#1c3a1c" strokeWidth="0.7"/>
          <line x1="56" y1={y} x2="68" y2={y} stroke="#1c3a1c" strokeWidth="0.7"/>
        </g>
      ))}
    </svg>
  )
}

export default function Transactions() {
  const { transactions, deleteTransaction, editTransaction } = useTransactions()
  const { profile } = useProfile()
  const isMobile = useIsMobile()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [editingTx, setEditingTx] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = !search ||
        tx.merchant?.toLowerCase().includes(search.toLowerCase()) ||
        tx.description?.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'all' || tx.type === filterType
      const matchCat = filterCategory === 'all' || tx.category === filterCategory
      return matchSearch && matchType && matchCat
    })
  }, [transactions, search, filterType, filterCategory])

  const totalFiltered = useMemo(() => ({
    income: filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  }), [filtered])

  const handleDelete = (id) => {
    deleteTransaction(id)
    setDeletingId(null)
  }

  const padding = isMobile ? '20px 16px 80px' : '36px 40px 60px'

  return (
    <div style={{ padding, maxWidth: isMobile ? '100%' : 1080, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: isMobile ? 20 : 32 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>
          All Entries
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? 28 : 38, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Transactions
        </h1>
        <div style={{ width: 36, height: 1.5, background: 'var(--accent)', marginTop: 10, opacity: 0.4 }} />
      </div>

      {/* Summary row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
        gap: 1, marginBottom: 20,
        border: '1px solid var(--border-default)',
        borderRadius: 8, overflow: 'hidden',
        background: 'var(--border-default)',
      }}>
        {[
          { label: 'Showing',  value: `${filtered.length}`,           color: 'var(--text-primary)', sub: 'entries' },
          { label: 'Income',   value: formatNPR(totalFiltered.income), color: 'var(--accent)'       },
          { label: 'Expenses', value: formatNPR(totalFiltered.expense),color: 'var(--red)'          },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{ background: 'var(--bg-card)', padding: isMobile ? '12px 10px' : '16px 20px' }}>
            <p style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? 15 : 20, fontWeight: 600, color, letterSpacing: '-0.02em' }}>{value}</p>
            {sub && <p style={{ fontSize: 9, color: 'var(--text-faint)' }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 140 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 30, fontSize: 13 }}/>
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 4, padding: 3, border: '1px solid var(--border-subtle)' }}>
          {['all','income','expense'].map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{
              padding: isMobile ? '5px 10px' : '6px 14px', borderRadius: 3, fontSize: 11,
              background: filterType === t ? 'var(--bg-card)' : 'transparent',
              color: filterType === t ? t === 'income' ? 'var(--accent)' : t === 'expense' ? 'var(--red)' : 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: filterType === t ? 500 : 400,
              border: filterType === t ? '1px solid var(--border-default)' : '1px solid transparent',
              transition: 'all 0.15s', textTransform: 'capitalize',
              fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>

        {!isMobile && (
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            style={{ width: 'auto', minWidth: 140, fontSize: 12, padding: '7px 12px' }}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
          </select>
        )}

        {(search || filterType !== 'all' || filterCategory !== 'all') && (
          <button onClick={() => { setSearch(''); setFilterType('all'); setFilterCategory('all') }}
            style={{ fontSize: 11, color: 'var(--text-muted)', padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
            Reset
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
        <LedgerDoodle />

        {filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <svg width="56" height="44" viewBox="0 0 56 44" fill="none" style={{ opacity: 0.15, marginBottom: 12 }}>
              <rect x="6" y="4" width="44" height="36" rx="2" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
              <line x1="6" y1="13" x2="50" y2="13" stroke="#1c3a1c" strokeWidth="1"/>
              <line x1="3" y1="4" x2="3" y2="40" stroke="#1c3a1c" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: 14, color: 'var(--text-faint)' }}>
              {transactions.length === 0 ? 'No transactions yet.' : 'No results match your filters.'}
            </p>
          </div>
        ) : isMobile ? (
          /* Mobile card list */
          <div>
            {filtered.map((tx, i) => {
              const cat = getCategoryByKey(tx.category)
              const isDeleting = deletingId === tx.id
              return (
                <div key={tx.id} style={{
                  padding: '14px 16px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: isDeleting ? 'var(--red-muted)' : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {cat.emoji}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tx.merchant}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {cat.label} · {formatDate(tx.date, profile.calendar)}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: tx.type === 'income' ? 'var(--accent)' : 'var(--red)', letterSpacing: '-0.02em' }}>
                        {tx.type === 'income' ? '+' : '−'}{formatNPR(tx.amount)}
                      </span>
                      {isDeleting ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleDelete(tx.id)}
                            style={{ color: 'var(--red)', padding: '3px 8px', borderRadius: 3, border: '1px solid var(--red)', fontSize: 10, fontFamily: 'var(--font-body)', background: 'transparent', cursor: 'pointer' }}>
                            <Check size={11} />
                          </button>
                          <button onClick={() => setDeletingId(null)}
                            style={{ color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 3, border: '1px solid var(--border-default)', fontSize: 10, background: 'transparent', cursor: 'pointer' }}>
                            <X size={11} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setEditingTx(tx)} style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeletingId(tx.id)} style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {tx.description && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, marginLeft: 50 }}>{tx.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* Desktop table */
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 130px 100px 120px 80px', padding: '10px 20px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
              {['Date','Description','Category','Type','Amount',''].map(h => (
                <span key={h} style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>
            {filtered.map((tx, i) => {
              const cat = getCategoryByKey(tx.category)
              const isDeleting = deletingId === tx.id
              return (
                <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 130px 100px 120px 80px', padding: '13px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'center', background: isDeleting ? 'var(--red-muted)' : 'transparent', transition: 'background 0.2s' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(tx.date, profile.calendar)}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{tx.merchant}</p>
                    {tx.description && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{tx.description}</p>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.emoji} {cat.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: tx.type === 'income' ? 'var(--accent)' : 'var(--red)' }}>{tx.type}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-heading)', color: tx.type === 'income' ? 'var(--accent)' : 'var(--red)', letterSpacing: '-0.02em' }}>
                    {tx.type === 'income' ? '+' : '−'}{formatNPR(tx.amount)}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    {isDeleting ? (
                      <>
                        <button onClick={() => handleDelete(tx.id)} style={{ color: 'var(--red)', padding: 4, borderRadius: 3, border: '1px solid var(--red)', background: 'transparent', cursor: 'pointer' }}><Check size={12} /></button>
                        <button onClick={() => setDeletingId(null)} style={{ color: 'var(--text-muted)', padding: 4, borderRadius: 3, border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}><X size={12} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingTx(tx)} style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer' }}><Pencil size={13} /></button>
                        <button onClick={() => setDeletingId(tx.id)} style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer' }}><Trash2 size={13} /></button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      <AnimatePresence>
        {editingTx && (
          <EditModal tx={editingTx} onClose={() => setEditingTx(null)}
            onSave={(data) => { editTransaction(editingTx.id, data); setEditingTx(null) }}/>
        )}
      </AnimatePresence>
    </div>
  )
}

function EditModal({ tx, onClose, onSave }) {
  const [type, setType] = useState(tx.type)
  const [amount, setAmount] = useState(String(tx.amount))
  const [category, setCategory] = useState(tx.category)
  const [merchant, setMerchant] = useState(tx.merchant)
  const [description, setDescription] = useState(tx.description || '')
  const [date, setDate] = useState(tx.date)
  const [error, setError] = useState('')

  const filteredCategories = CATEGORIES.filter(c => c.type === type || c.type === 'both')

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    if (!category) { setError('Select a category'); return }
    if (!merchant.trim()) { setError('Enter a title'); return }
    onSave({ type, amount: Number(amount), category, merchant, description, date })
  }

  const modalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,30,20,0.5)', backdropFilter: 'blur(3px)' }}/>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: 'relative', width: 'min(92vw, 460px)', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '28px 28px 24px', maxHeight: '88vh', overflowY: 'auto', zIndex: 1 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Edit Transaction</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 6, padding: 3, marginBottom: 20, border: '1px solid var(--border-subtle)' }}>
          {['expense','income'].map(t => (
            <button key={t} onClick={() => { setType(t); setCategory('') }} style={{ flex: 1, padding: '8px 0', borderRadius: 4, fontWeight: 500, fontSize: 13, background: type === t ? 'var(--bg-card)' : 'transparent', color: type === t ? (t === 'income' ? 'var(--accent)' : 'var(--red)') : 'var(--text-muted)', border: type === t ? '1px solid var(--border-default)' : '1px solid transparent', transition: 'all 0.18s', textTransform: 'capitalize', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Amount</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)' }}>Rs.</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ paddingLeft: 46, fontSize: 20, fontFamily: 'var(--font-heading)', fontWeight: 600, color: type === 'income' ? 'var(--accent)' : 'var(--red)', letterSpacing: '-0.02em' }}/>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
            {filteredCategories.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)} style={{ padding: '10px 4px', borderRadius: 6, border: `1px solid ${category === cat.key ? 'var(--accent)' : 'var(--border-subtle)'}`, background: category === cat.key ? 'var(--accent-light)' : 'var(--bg-elevated)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.15s', cursor: 'pointer' }}>
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                <span style={{ fontSize: 9.5, color: category === cat.key ? 'var(--accent)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, fontWeight: category === cat.key ? 500 : 400 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Title / Merchant</label>
          <input type="text" value={merchant} onChange={e => setMerchant(e.target.value)} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Note <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span></label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ resize: 'none' }} />
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

const labelStyle = { fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8, fontWeight: 500 }