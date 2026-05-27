import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, Check } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEvents } from '../hooks/useEvents'
import { useProfile } from '../context/ProfileContext'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const BS_MONTHS = ['Baishakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra']
const AD_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const EVENT_TYPES = [
  { key: 'reminder',  label: 'Reminder',    color: '#7a5a18' },
  { key: 'payment',   label: 'Payment Due',  color: '#7a2020' },
  { key: 'income',    label: 'Income',       color: '#1c3a1c' },
  { key: 'other',     label: 'Other',        color: '#445040' },
]

function getTypeColor(type) {
  return EVENT_TYPES.find(t => t.key === type)?.color || '#445040'
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

// Approximate BS year/month from AD date
function getBSInfo(adYear, adMonth) {
  const bsYear = adMonth >= 3 ? adYear + 57 : adYear + 56
  // BS months are shifted ~9 months ahead of AD
  const bsMonthIdx = (adMonth + 9) % 12
  return { bsYear, bsMonthIdx }
}

export default function CalendarPage() {
  const today = new Date()
  const { profile } = useProfile()
  const isBS = profile.calendar === 'BS'

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addDate, setAddDate] = useState('')

  const { events, addEvent, toggleDone, deleteEvent } = useEvents()

  const todayStr = today.toISOString().split('T')[0]
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  // Display label for current view
  const monthLabel = isBS
    ? (() => {
        const { bsYear, bsMonthIdx } = getBSInfo(viewYear, viewMonth)
        return `${BS_MONTHS[bsMonthIdx]} ${bsYear}`
      })()
    : `${AD_MONTHS[viewMonth]} ${viewYear}`

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    })
    return map
  }, [events])

  const selectedDateStr = selectedDate
    ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    : null

  const selectedEvents = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : []

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  const upcomingEvents = useMemo(() => {
    return events
      .filter(ev => ev.date >= todayStr && !ev.done)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  }, [events, todayStr])

  return (
    <div style={{ padding: '36px 40px 60px', maxWidth: 1080, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>
          Financial Calendar · {isBS ? 'Bikram Samwat' : 'Anno Domini'}
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 38, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Plan & Track Events
        </h1>
        <div style={{ width: 36, height: 1.5, background: 'var(--accent)', marginTop: 12, opacity: 0.4 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 16 }}>

        {/* Calendar Grid */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '22px 24px' }}>

          {/* Month nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button onClick={prevMonth} style={{ color: 'var(--text-muted)', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', cursor: 'pointer' }}>
              <ChevronLeft size={14} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>
              {monthLabel}
            </h2>
            <button onClick={nextMonth} style={{ color: 'var(--text-muted)', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', cursor: 'pointer' }}>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 0', fontWeight: 500 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateStr === todayStr
              const isSelected = selectedDate === day
              const dayEvents = eventsByDate[dateStr] || []
              const hasEvents = dayEvents.length > 0

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => setSelectedDate(day)}
                  style={{
                    aspectRatio: '1',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-start',
                    padding: '6px 2px 4px',
                    borderRadius: 6,
                    background: isSelected ? 'var(--accent)' : isToday ? 'var(--accent-light)' : 'transparent',
                    border: isToday && !isSelected ? '1px solid var(--border-default)' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: isToday || isSelected ? 600 : 400, color: isSelected ? '#f0ece0' : isToday ? 'var(--accent)' : 'var(--text-primary)', lineHeight: 1 }}>
                    {day}
                  </span>
                  {hasEvents && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {dayEvents.slice(0, 3).map((ev, idx) => (
                        <div key={idx} style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? 'rgba(240,236,224,0.7)' : getTypeColor(ev.type), opacity: ev.done ? 0.4 : 1 }} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            {EVENT_TYPES.map(t => (
              <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.color }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Selected date panel */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '20px', flex: 1 }}>
            {selectedDate ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>
                      {isBS ? BS_MONTHS[getBSInfo(viewYear, viewMonth).bsMonthIdx] : AD_MONTHS[viewMonth]}
                    </p>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {selectedDate}
                    </h3>
                    {selectedDateStr === todayStr && (
                      <span style={{ fontSize: 9, background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 7px', borderRadius: 3, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4, display: 'inline-block' }}>
                        Today
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { setAddDate(selectedDateStr); setShowAddModal(true) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent)', color: '#f0ece0', fontSize: 11, fontWeight: 500, padding: '7px 12px', borderRadius: 4, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                  >
                    <Plus size={11} strokeWidth={2.5} /> Add
                  </button>
                </div>

                {selectedEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>No events this day</p>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Tap + Add to create one</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedEvents.map(ev => (
                      <EventCard key={ev.id} ev={ev} onToggle={toggleDone} onDelete={deleteEvent} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <svg width="40" height="40" viewBox="0 0 70 70" fill="none" style={{ opacity: 0.15, marginBottom: 10 }}>
                  <rect x="6" y="12" width="58" height="52" rx="3" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
                  <line x1="6" y1="24" x2="64" y2="24" stroke="#1c3a1c" strokeWidth="1"/>
                  <line x1="20" y1="6" x2="20" y2="18" stroke="#1c3a1c" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="50" y1="6" x2="50" y2="18" stroke="#1c3a1c" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Tap a date to view or add events</p>
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '18px 20px' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 500, marginBottom: 14 }}>Upcoming</h4>
            {upcomingEvents.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', padding: '8px 0' }}>No upcoming events</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingEvents.map(ev => {
                  const d = new Date(ev.date)
                  const isToday = ev.date === todayStr
                  return (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, flexShrink: 0, textAlign: 'center', background: isToday ? 'var(--accent)' : 'var(--bg-elevated)', borderRadius: 4, padding: '4px 0' }}>
                        <p style={{ fontSize: 8, color: isToday ? '#f0ece0' : 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: isToday ? '#f0ece0' : 'var(--text-primary)', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
                          {d.getDate()}
                        </p>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ev.title}
                        </p>
                        <p style={{ fontSize: 10, color: getTypeColor(ev.type), textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
                          {ev.type}
                        </p>
                      </div>
                      <button onClick={() => toggleDone(ev.id)} style={{ color: 'var(--text-faint)', flexShrink: 0, cursor: 'pointer' }}>
                        <Check size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddEventModal
            date={addDate}
            onClose={() => setShowAddModal(false)}
            onAdd={(data) => { addEvent(data); setShowAddModal(false) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function EventCard({ ev, onToggle, onDelete }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 6, background: 'var(--bg-elevated)', border: `1px solid ${ev.done ? 'var(--border-subtle)' : 'var(--border-default)'}`, opacity: ev.done ? 0.6 : 1 }}>
      <button
        onClick={() => onToggle(ev.id)}
        style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginTop: 1, border: `1.5px solid ${ev.done ? getTypeColor(ev.type) : 'var(--border-strong)'}`, background: ev.done ? getTypeColor(ev.type) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', cursor: 'pointer' }}
      >
        {ev.done && <Check size={9} color="#f0ece0" strokeWidth={3} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textDecoration: ev.done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ev.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: getTypeColor(ev.type) }}>{ev.type}</span>
          {ev.amount && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· Rs. {ev.amount}</span>}
        </div>
      </div>
      <button onClick={() => onDelete(ev.id)} style={{ color: 'var(--text-faint)', padding: 2, flexShrink: 0, cursor: 'pointer' }}>
        <X size={12} />
      </button>
    </div>
  )
}

function AddEventModal({ date, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('reminder')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [selectedDate, setSelectedDate] = useState(date)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) { setError('Please enter a title'); return }
    onAdd({ title, type, amount: amount ? Number(amount) : null, note, date: selectedDate })
  }

  const modalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(20,30,20,0.5)', backdropFilter: 'blur(3px)' }}
      />
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'relative',
          width: 'min(92vw, 420px)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          padding: '26px 26px 22px',
          zIndex: 1,
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Add Event</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer' }}><X size={16} /></button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Rent due, Salary received" autoFocus />
        </div>

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7 }}>
            {EVENT_TYPES.map(t => (
              <button key={t.key} onClick={() => setType(t.key)} style={{
                padding: '9px', borderRadius: 4, fontSize: 12,
                border: `1px solid ${type === t.key ? t.color : 'var(--border-subtle)'}`,
                background: type === t.key ? `${t.color}18` : 'var(--bg-elevated)',
                color: type === t.key ? t.color : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontWeight: type === t.key ? 500 : 400,
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Amount <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted)' }}>Rs.</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" style={{ paddingLeft: 42 }} />
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Note <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span></label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Any details..." />
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        <button onClick={handleSubmit} style={{
          width: '100%', padding: '12px',
          background: 'var(--accent)', color: '#f0ece0',
          fontWeight: 500, fontSize: 13, borderRadius: 4,
          fontFamily: 'var(--font-body)', letterSpacing: '0.02em', cursor: 'pointer',
        }}>
          Save Event
        </button>
      </motion.div>
    </div>,
    modalRoot
  )
}



const labelStyle = {
  fontSize: 10, color: 'var(--text-muted)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  display: 'block', marginBottom: 8, fontWeight: 500,
}