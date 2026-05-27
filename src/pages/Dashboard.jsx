import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react'
import { useOutletContext, Link } from 'react-router-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useBudget } from '../hooks/useBudget'
import { useProfile } from '../context/ProfileContext'
import { useEvents } from '../hooks/useEvents'
import { useIsMobile } from '../hooks/useIsMobile'
import { formatNPR } from '../utils/currency'
import { formatDate } from '../utils/calendar'
import { getCategoryByKey } from '../utils/categories'
import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis } from 'recharts'

const BS_MONTHS = ['Baishakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra']
const AD_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getCurrentMonthInfo(calendar) {
  const now = new Date()
  if (calendar === 'AD') {
    const idx = now.getMonth()
    return { curr: AD_MONTHS[idx], year: now.getFullYear() }
  } else {
    const adMonth = now.getMonth()
    const bsIdx = (adMonth + 9) % 12
    return { curr: BS_MONTHS[bsIdx], year: now.getMonth() >= 3 ? now.getFullYear()+57 : now.getFullYear()+56 }
  }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ── Illustrations ── */
function CashNoteIllustration() {
  return (
    <svg width="110" height="60" viewBox="0 0 110 60" fill="none"
      style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.14, pointerEvents: 'none' }}>
      <rect x="6" y="12" width="98" height="38" rx="3" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <rect x="6" y="12" width="98" height="38" rx="3" stroke="#1c3a1c" strokeWidth="0.5" fill="none" strokeDasharray="3 3"/>
      <circle cx="55" cy="31" r="11" stroke="#1c3a1c" strokeWidth="1" fill="none"/>
      <circle cx="55" cy="31" r="7" stroke="#1c3a1c" strokeWidth="0.6" fill="none"/>
      <line x1="55" y1="24" x2="55" y2="38" stroke="#1c3a1c" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="48" y1="31" x2="62" y2="31" stroke="#1c3a1c" strokeWidth="0.8" strokeLinecap="round"/>
      <rect x="12" y="18" width="14" height="9" rx="2" stroke="#1c3a1c" strokeWidth="0.8" fill="none"/>
      <rect x="84" y="35" width="14" height="9" rx="2" stroke="#1c3a1c" strokeWidth="0.8" fill="none"/>
    </svg>
  )
}

function ReceiptIllustration() {
  return (
    <svg width="60" height="80" viewBox="0 0 60 80" fill="none"
      style={{ position: 'absolute', right: 8, bottom: 0, opacity: 0.14, pointerEvents: 'none' }}>
      <rect x="8" y="4" width="44" height="62" rx="2" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <line x1="16" y1="18" x2="44" y2="18" stroke="#1c3a1c" strokeWidth="0.8"/>
      <line x1="16" y1="26" x2="44" y2="26" stroke="#1c3a1c" strokeWidth="0.6"/>
      <line x1="16" y1="32" x2="38" y2="32" stroke="#1c3a1c" strokeWidth="0.6"/>
      <line x1="16" y1="38" x2="40" y2="38" stroke="#1c3a1c" strokeWidth="0.6"/>
      <line x1="16" y1="52" x2="44" y2="52" stroke="#1c3a1c" strokeWidth="1"/>
    </svg>
  )
}

function WalletIllustration() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none"
      style={{ position: 'absolute', right: 4, bottom: 4, opacity: 0.14, pointerEvents: 'none' }}>
      <rect x="4" y="16" width="68" height="38" rx="3" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <path d="M4 24 L72 24" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
      <rect x="46" y="30" width="22" height="14" rx="2" stroke="#1c3a1c" strokeWidth="1" fill="none"/>
      <circle cx="57" cy="37" r="3" stroke="#1c3a1c" strokeWidth="0.8" fill="none"/>
    </svg>
  )
}

function SavingsIllustration() {
  return (
    <svg width="70" height="60" viewBox="0 0 70 60" fill="none"
      style={{ position: 'absolute', right: 4, bottom: 4, opacity: 0.14, pointerEvents: 'none' }}>
      <ellipse cx="34" cy="36" rx="22" ry="18" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <ellipse cx="54" cy="38" rx="6" ry="5" stroke="#1c3a1c" strokeWidth="1" fill="none"/>
      <circle cx="42" cy="30" r="1.5" stroke="#1c3a1c" strokeWidth="0.8" fill="none"/>
      <line x1="30" y1="18" x2="38" y2="18" stroke="#1c3a1c" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="34" cy="13" rx="5" ry="3" stroke="#1c3a1c" strokeWidth="0.8" fill="none"/>
    </svg>
  )
}

function TrendDoodle() {
  return (
    <svg width="80" height="44" viewBox="0 0 90 50" fill="none"
      style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.05, pointerEvents: 'none' }}>
      <path d="M4 38 Q16 20 28 28 Q40 36 52 14 Q64 4 76 18 Q82 24 88 12"
        stroke="#1c3a1c" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <line x1="2" y1="46" x2="88" y2="46" stroke="#1c3a1c" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="2" y1="6" x2="2" y2="46" stroke="#1c3a1c" strokeWidth="0.8" strokeLinecap="round"/>
    </svg>
  )
}

function PieDoodle() {
  return (
    <svg width="48" height="48" viewBox="0 0 52 52" fill="none"
      style={{ position: 'absolute', right: 14, bottom: 14, opacity: 0.05, pointerEvents: 'none' }}>
      <circle cx="26" cy="26" r="20" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <circle cx="26" cy="26" r="12" stroke="#1c3a1c" strokeWidth="0.7" fill="none"/>
      <line x1="26" y1="6" x2="26" y2="26" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
      <line x1="26" y1="26" x2="44" y2="34" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
      <line x1="26" y1="26" x2="10" y2="38" stroke="#1c3a1c" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

function LedgerIllustration() {
  return (
    <svg width="56" height="44" viewBox="0 0 56 44" fill="none" style={{ opacity: 0.16, marginBottom: 10 }}>
      <rect x="6" y="4" width="44" height="36" rx="2" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <line x1="6" y1="13" x2="50" y2="13" stroke="#1c3a1c" strokeWidth="1"/>
      <line x1="14" y1="20" x2="42" y2="20" stroke="#1c3a1c" strokeWidth="0.7"/>
      <line x1="14" y1="26" x2="38" y2="26" stroke="#1c3a1c" strokeWidth="0.7"/>
      <line x1="14" y1="32" x2="40" y2="32" stroke="#1c3a1c" strokeWidth="0.7"/>
      <line x1="3" y1="4" x2="3" y2="40" stroke="#1c3a1c" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function CalendarDoodle() {
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" fill="none"
      style={{ position: 'absolute', right: 8, bottom: 8, opacity: 0.05, pointerEvents: 'none' }}>
      <rect x="6" y="12" width="58" height="52" rx="3" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <line x1="6" y1="24" x2="64" y2="24" stroke="#1c3a1c" strokeWidth="1"/>
      <line x1="20" y1="6" x2="20" y2="18" stroke="#1c3a1c" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="50" y1="6" x2="50" y2="18" stroke="#1c3a1c" strokeWidth="1.5" strokeLinecap="round"/>
      {[32,42,52].map(y => [16,26,36,46,56].map(x => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" stroke="#1c3a1c" strokeWidth="0.8" fill="none"/>
      )))}
    </svg>
  )
}

function ReceiptWatermark() {
  return (
    <svg width="100" height="140" viewBox="0 0 110 150" fill="none"
      style={{ position: 'absolute', right: 16, top: 8, opacity: 0.035, pointerEvents: 'none' }}>
      <rect x="15" y="8" width="80" height="108" rx="2" stroke="#1c3a1c" strokeWidth="1.5" fill="none"/>
      <line x1="25" y1="28" x2="85" y2="28" stroke="#1c3a1c" strokeWidth="1"/>
      <line x1="25" y1="42" x2="85" y2="42" stroke="#1c3a1c" strokeWidth="0.6"/>
      <line x1="25" y1="52" x2="72" y2="52" stroke="#1c3a1c" strokeWidth="0.6"/>
      <line x1="25" y1="84" x2="85" y2="84" stroke="#1c3a1c" strokeWidth="1.1"/>
      <circle cx="55" cy="128" r="14" stroke="#1c3a1c" strokeWidth="1"/>
    </svg>
  )
}

export default function Dashboard() {
  const { openAddTransaction } = useOutletContext()
  const { profile } = useProfile()
  const { transactions, thisMonthTransactions, totalIncome, totalExpenses, balance, savingsRate, expensesByCategory } = useTransactions()
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const { budgets, utilizationPercent } = useBudget(currentMonthKey, expensesByCategory)
  const { upcomingEvents } = useEvents()
  const isMobile = useIsMobile()

  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions])
  const monthInfo = getCurrentMonthInfo(profile.calendar)

  const spendingTrend = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
      const total = transactions.filter(tx => tx.date === key && tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0)
      days.push({ label, total })
    }
    return days
  }, [transactions])

  const topBudgetCategories = useMemo(() =>
    Object.entries(budgets).map(([key, val]) => {
      const allocated = val?.amount || val || 0
      const cat = getCategoryByKey(key)
      return {
        key, allocated,
        spent: expensesByCategory[key] || 0,
        pct: allocated > 0 ? Math.min(Math.round(((expensesByCategory[key]||0)/allocated)*100),100) : 0,
        cat: { ...cat, label: val?.customLabel || cat.label },
      }
    }).sort((a,b) => b.pct - a.pct).slice(0,4),
    [budgets, expensesByCategory]
  )

  const topExpenseCategory = useMemo(() => {
    const entries = Object.entries(expensesByCategory)
    if (!entries.length) return null
    const [key, amount] = entries.sort((a,b) => b[1]-a[1])[0]
    return { ...getCategoryByKey(key), amount }
  }, [expensesByCategory])

  const padding = isMobile ? '20px 16px 80px' : '36px 40px 60px'
  const maxWidth = isMobile ? '100%' : 1080

  return (
    <div style={{ padding, maxWidth, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: isMobile ? 20 : 32 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>
          {monthInfo.curr} {monthInfo.year}
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? 28 : 40, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {getGreeting()}, {profile.name}
        </h1>
        <div style={{ width: 36, height: 1.5, background: 'var(--accent)', marginTop: 10, opacity: 0.4 }} />
      </div>

      {/* Stat Cards — vertical stack on mobile, grid on desktop */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <MobileStatRow
            items={[
              { label: 'Gross Income', value: formatNPR(totalIncome), color: 'var(--accent)', illustration: <CashNoteIllustration/> },
              { label: 'Net Expenses', value: formatNPR(totalExpenses), color: 'var(--red)', illustration: <ReceiptIllustration/> },
            ]}
          />
          <MobileStatRow
            items={[
              { label: 'Balance', value: formatNPR(Math.abs(balance)), color: balance>=0?'var(--accent)':'var(--red)', illustration: <WalletIllustration/> },
              { label: 'Savings Rate', value: `${savingsRate}%`, color: 'var(--text-primary)', illustration: <SavingsIllustration/> },
            ]}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 28, border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden', background: 'var(--border-default)', gap: 1, position: 'relative' }}>
          <ReceiptWatermark />
          <StatCard label="Gross Income"  value={formatNPR(totalIncome)}       illustration={<CashNoteIllustration/>}  icon={<ArrowUpRight size={13}/>}   valueColor="var(--accent)"      sub={`${thisMonthTransactions.filter(t=>t.type==='income').length} entries`}/>
          <StatCard label="Net Expenses"  value={formatNPR(totalExpenses)}     illustration={<ReceiptIllustration/>}   icon={<ArrowDownRight size={13}/>} valueColor="var(--red)"         sub={`${thisMonthTransactions.filter(t=>t.type==='expense').length} entries`}/>
          <StatCard label="Balance"       value={formatNPR(Math.abs(balance))} illustration={<WalletIllustration/>}    icon={<Minus size={13}/>}          valueColor={balance>=0?'var(--accent)':'var(--red)'} sub={balance>=0?'↑ Positive':'↓ Overspent'}/>
          <StatCard label="Savings Rate"  value={`${savingsRate}%`}            illustration={<SavingsIllustration/>}   icon={<TrendingUp size={13}/>}     valueColor="var(--text-primary)" sub={savingsRate>=20?'On track':savingsRate>0?'Keep going':'No data'}/>
        </div>
      )}

      {/* Middle Row */}
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 12 }}>

        {/* Spending Trend */}
        <div style={{ ...cardStyle, position: 'relative', overflow: 'hidden', marginBottom: isMobile ? 12 : 0 }}>
          <TrendDoodle />
          <div style={cardHeaderStyle}>
            <div>
              <h3 style={{ ...cardTitleStyle, fontSize: isMobile ? 15 : 18 }}>7-Day Spending</h3>
              {topExpenseCategory && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  Top: {topExpenseCategory.emoji} {topExpenseCategory.label} — {formatNPR(topExpenseCategory.amount)}
                </p>
              )}
            </div>
          </div>
          {spendingTrend.every(d => d.total === 0) ? (
            <EmptyState text="No spending recorded yet." />
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 100 : 110}>
              <LineChart data={spendingTrend}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} interval={0}/>
                <Tooltip formatter={(v) => [formatNPR(v), 'Spent']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)', fontFamily: 'IBM Plex Sans' }}
                  cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}/>
                <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={1.5}
                  dot={{ fill: 'var(--accent)', r: 2.5, strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: 'var(--accent)' }}/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Budget */}
        <div style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
          <PieDoodle />
          <div style={cardHeaderStyle}>
            <h3 style={{ ...cardTitleStyle, fontSize: isMobile ? 15 : 18 }}>Budget</h3>
            <span style={{ fontSize: 10, color: utilizationPercent > 80 ? 'var(--red)' : 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em' }}>
              {utilizationPercent}% USED
            </span>
          </div>
          {topBudgetCategories.length === 0 ? (
            <EmptyState text="Set budgets to track limits." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topBudgetCategories.map(({ key, cat, allocated, spent, pct }) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat.emoji} {cat.label}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatNPR(spent)} / {formatNPR(allocated)}</span>
                  </div>
                  <div style={{ height: 2, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                      style={{ height: '100%', borderRadius: 2, background: pct > 80 ? 'var(--red)' : pct > 60 ? 'var(--yellow)' : 'var(--accent)' }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={cardStyle}>
        <div style={{ ...cardHeaderStyle, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)', marginBottom: 0 }}>
          <h3 style={{ ...cardTitleStyle, fontSize: isMobile ? 15 : 18 }}>Recent Transactions</h3>
          <Link to="/transactions" style={{ fontSize: 10, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.1em' }}>VIEW ALL →</Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <LedgerIllustration />
            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Your ledger is empty. Add your first entry.</p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 90px 110px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                {['Description','Category','Date','Amount'].map(h => (
                  <span key={h} style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, textAlign: h==='Amount'?'right':'left' }}>{h}</span>
                ))}
              </div>
            )}

            {recentTransactions.map((tx, i) => {
              const cat = getCategoryByKey(tx.category)
              if (isMobile) {
                return (
                  <div key={tx.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < recentTransactions.length-1 ? '1px solid var(--border-subtle)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        {cat.emoji}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{tx.merchant}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.label} · {formatDate(tx.date, profile.calendar)}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: tx.type==='income'?'var(--accent)':'var(--red)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', flexShrink: 0 }}>
                      {tx.type==='income'?'+':'−'}{formatNPR(tx.amount)}
                    </span>
                  </div>
                )
              }
              return (
                <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 90px 110px', padding: '12px 0', borderBottom: i < recentTransactions.length-1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{tx.merchant}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.emoji} {cat.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(tx.date, profile.calendar)}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: tx.type==='income'?'var(--accent)':'var(--red)' }}>
                    {tx.type==='income'?'+':'−'}{formatNPR(tx.amount)}
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div style={{ ...cardStyle, marginTop: 12, position: 'relative', overflow: 'hidden' }}>
          <CalendarDoodle />
          <div style={{ ...cardHeaderStyle, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)', marginBottom: 0 }}>
            <h3 style={{ ...cardTitleStyle, fontSize: isMobile ? 15 : 18 }}>Upcoming Events</h3>
            <Link to="/calendar" style={{ fontSize: 10, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.1em' }}>VIEW CALENDAR →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcomingEvents.map((ev, i) => {
              const d = new Date(ev.date)
              const isToday = ev.date === new Date().toISOString().split('T')[0]
              const typeColor = { reminder: 'var(--yellow)', payment: 'var(--red)', income: 'var(--accent)', other: 'var(--text-muted)' }[ev.type] || 'var(--text-muted)'
              return (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: i < upcomingEvents.length-1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ width: 36, flexShrink: 0, textAlign: 'center', background: isToday ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '4px 0' }}>
                    <p style={{ fontSize: 8, color: isToday ? '#f0ece0' : 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {d.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: isToday ? '#f0ece0' : 'var(--text-primary)', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
                      {d.getDate()}
                    </p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{ev.title}</p>
                    <p style={{ fontSize: 10, color: typeColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2, fontWeight: 500 }}>
                      {ev.type}{ev.amount ? ` · Rs. ${ev.amount}` : ''}
                    </p>
                  </div>
                  {isToday && (
                    <span style={{ fontSize: 9, background: 'var(--accent-light)', color: 'var(--accent)', padding: '3px 7px', borderRadius: 3, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Today
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* Mobile stat row — 2 cards side by side */
function MobileStatRow({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {items.map(({ label, value, color, illustration }) => (
        <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '14px 14px 12px', position: 'relative', overflow: 'hidden' }}>
          {illustration}
          <p style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>{label}</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, color, letterSpacing: '-0.02em' }}>{value}</p>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, icon, valueColor, sub, illustration }) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '22px 22px 18px', position: 'relative', overflow: 'hidden' }}>
      {illustration}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.13em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'var(--text-faint)', opacity: 0.7 }}>{icon}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, color: valueColor, letterSpacing: '-0.03em', marginBottom: 6 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.04em' }}>{sub}</p>}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div style={{ padding: '24px 0', textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{text}</p>
    </div>
  )
}

const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '18px 16px' }
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }
const cardTitleStyle = { fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }