import { useProfile } from '../context/ProfileContext'
import { useMemo, useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { formatNPR } from '../utils/currency'
import { getCategoryByKey } from '../utils/categories'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts'

const TIMEFRAMES = ['3M', '6M', '1Y']
const CHART_COLORS = ['#1c3a1c','#4a7c4a','#7aaa7a','#a8cca8','#c8e0c8','#e0ece0']

const AD_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const BS_MONTHS_SHORT = ['Bai','Jes','Ash','Shr','Bha','Ash','Kar','Man','Pou','Mag','Fal','Cha']

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(key, isBS = false) {
  const [year, month] = key.split('-')
  const monthIdx = parseInt(month) - 1
  if (isBS) {
    const bsMonthIdx = (monthIdx + 9) % 12
    const bsYear = monthIdx >= 3 ? parseInt(year) + 57 : parseInt(year) + 56
    return `${BS_MONTHS_SHORT[bsMonthIdx]} ${String(bsYear).slice(2)}`
  }
  return `${AD_MONTHS[monthIdx]} ${year.slice(2)}`
}

function getLast(n) {
  const months = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(getMonthKey(d))
  }
  return months
}

// Custom tooltip style
const tooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 6,
  fontSize: 12,
  color: 'var(--text-primary)',
  fontFamily: 'IBM Plex Sans',
  padding: '8px 12px',
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyle}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--accent)' }}>
          {p.name}: {formatNPR(p.value)}
        </p>
      ))}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-heading)', fontSize: 20,
      fontWeight: 500, letterSpacing: '-0.02em',
      color: 'var(--text-primary)', marginBottom: 16,
    }}>
      {children}
    </h2>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 8, padding: '18px 20px',
    }}>
      <p style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.13em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, color: color || 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

function EmptyChart({ text }) {
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
      <svg width="48" height="40" viewBox="0 0 80 60" fill="none" style={{ opacity: 0.12 }}>
        <line x1="4" y1="56" x2="76" y2="56" stroke="#1c3a1c" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="4" y1="10" x2="4" y2="56" stroke="#1c3a1c" strokeWidth="1.2" strokeLinecap="round"/>
        <rect x="12" y="36" width="10" height="20" rx="1" stroke="#1c3a1c" strokeWidth="1" fill="none"/>
        <rect x="28" y="24" width="10" height="32" rx="1" stroke="#1c3a1c" strokeWidth="1" fill="none"/>
        <rect x="44" y="16" width="10" height="40" rx="1" stroke="#1c3a1c" strokeWidth="1" fill="none"/>
        <rect x="60" y="30" width="10" height="26" rx="1" stroke="#1c3a1c" strokeWidth="1" fill="none"/>
      </svg>
      <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{text}</p>
    </div>
  )
}

export default function Reports() {
  const { transactions } = useTransactions()
const { profile } = useProfile()
const isBS = profile.calendar === 'BS'
const [timeframe, setTimeframe] = useState('6M')

  const months = useMemo(() => {
    const n = timeframe === '3M' ? 3 : timeframe === '6M' ? 6 : 12
    return getLast(n)
  }, [timeframe])

  // Monthly income vs expense data
  const monthlyData = useMemo(() => {
    return months.map(key => {
  const txs = transactions.filter(tx => tx.date?.startsWith(key))
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { month: getMonthLabel(key, isBS), income, expense, net: income - expense }
})
  }, [transactions, months])

  // Category breakdown for selected period
  const categoryData = useMemo(() => {
    const map = {}
    transactions
      .filter(tx => tx.type === 'expense' && months.some(m => tx.date?.startsWith(m)))
      .forEach(tx => {
        map[tx.category] = (map[tx.category] || 0) + tx.amount
      })
    return Object.entries(map)
      .map(([key, value]) => {
        const cat = getCategoryByKey(key)
        return { name: cat.label, emoji: cat.emoji, value, key }
      })
      .sort((a, b) => b.value - a.value)
  }, [transactions, months])

  // Spending trend — daily avg per month
  const trendData = useMemo(() => {
    return months.map(key => {
      const txs = transactions.filter(tx => tx.type === 'expense' && tx.date?.startsWith(key))
      const total = txs.reduce((s, t) => s + t.amount, 0)
      const daysInMonth = new Date(parseInt(key.split('-')[0]), parseInt(key.split('-')[1]), 0).getDate()
      return { month: getMonthLabel(key, isBS), total, daily: Math.round(total / daysInMonth) }
    })
  }, [transactions, months])

  // Key stats
  const stats = useMemo(() => {
    const periodTxs = transactions.filter(tx => months.some(m => tx.date?.startsWith(m)))
    const expenses = periodTxs.filter(t => t.type === 'expense')
    const incomes = periodTxs.filter(t => t.type === 'income')

    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0)
    const avgMonthlyExpense = months.length > 0 ? Math.round(totalExpense / months.length) : 0
    const avgDailySpend = months.length > 0 ? Math.round(totalExpense / (months.length * 30)) : 0
    const biggest = expenses.length > 0 ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0]) : null
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0

    // Best savings month
    const bestMonth = monthlyData.length > 0
      ? monthlyData.reduce((best, m) => m.net > best.net ? m : best, monthlyData[0])
      : null

    return { totalExpense, totalIncome, avgMonthlyExpense, avgDailySpend, biggest, savingsRate, bestMonth }
  }, [transactions, months, monthlyData])

  const hasData = transactions.length > 0

  return (
    <div style={{ padding: '36px 40px 60px', maxWidth: 1080, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>
            Financial Overview
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 38, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Reports
          </h1>
          <div style={{ width: 36, height: 1.5, background: 'var(--accent)', marginTop: 12, opacity: 0.4 }} />
        </div>

        {/* Timeframe selector */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 6, padding: 3, border: '1px solid var(--border-subtle)' }}>
          {TIMEFRAMES.map(t => (
            <button key={t} onClick={() => setTimeframe(t)} style={{
              padding: '7px 18px', borderRadius: 4, fontSize: 12,
              background: timeframe === t ? 'var(--bg-card)' : 'transparent',
              color: timeframe === t ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: timeframe === t ? 600 : 400,
              border: timeframe === t ? '1px solid var(--border-default)' : '1px solid transparent',
              transition: 'all 0.15s', fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginBottom: 28, border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden', background: 'var(--border-default)' }}>
        <StatCard label="Total Income" value={formatNPR(stats.totalIncome)} color="var(--accent)" sub={`${timeframe} period`}/>
        <StatCard label="Total Expenses" value={formatNPR(stats.totalExpense)} color="var(--red)" sub={`${timeframe} period`}/>
        <StatCard label="Avg Daily Spend" value={formatNPR(stats.avgDailySpend)} sub="per day"/>
        <StatCard label="Savings Rate" value={`${Math.max(0, stats.savingsRate)}%`} color={stats.savingsRate >= 20 ? 'var(--accent)' : stats.savingsRate > 0 ? 'var(--yellow)' : 'var(--red)'} sub={stats.savingsRate >= 20 ? 'Healthy' : stats.savingsRate > 0 ? 'Could be better' : 'No savings'}/>
      </div>

      {/* Income vs Expense Bar Chart */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '22px 24px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionTitle>Income vs Expenses</SectionTitle>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ color: 'var(--accent)', label: 'Income' }, { color: 'var(--red)', label: 'Expenses' }].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        {!hasData ? <EmptyChart text="Add transactions to see income vs expense trends" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3"/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v/1000)}k`} width={36}/>
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="income" name="Income" fill="var(--accent)" radius={[3,3,0,0]} opacity={0.85}/>
              <Bar dataKey="expense" name="Expenses" fill="var(--red)" radius={[3,3,0,0]} opacity={0.75}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Spending Trend + Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Spending trend line */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '22px 24px' }}>
          <SectionTitle>Monthly Spending Trend</SectionTitle>
          {!hasData ? <EmptyChart text="No data yet" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3"/>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v/1000)}k`} width={36}/>
                <Tooltip content={<ChartTooltip />}/>
                <Line type="monotone" dataKey="total" name="Total Spent" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }}/>
                <Line type="monotone" dataKey="daily" name="Daily Avg" stroke="var(--yellow)" strokeWidth={1.5} strokeDasharray="4 3" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {[{ color: 'var(--accent)', label: 'Total spent' }, { color: 'var(--yellow)', label: 'Daily avg', dashed: true }].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 16, height: 2, background: item.color, borderRadius: 1, borderTop: item.dashed ? '2px dashed' : 'none', borderColor: item.color }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category donut */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '22px 24px' }}>
          <SectionTitle>Expense Breakdown</SectionTitle>
          {categoryData.length === 0 ? <EmptyChart text="No expenses yet" /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatNPR(v)} contentStyle={tooltipStyle}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {categoryData.slice(0, 5).map((d, i) => (
                  <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.emoji} {d.name}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {formatNPR(d.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top categories + biggest transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Top spending categories ranked */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '22px 24px' }}>
          <SectionTitle>Top Categories</SectionTitle>
          {categoryData.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', padding: '20px 0' }}>No expense data</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categoryData.slice(0, 6).map((cat, i) => {
                const maxVal = categoryData[0].value
                const pct = Math.round((cat.value / maxVal) * 100)
                return (
                  <div key={cat.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, width: 14 }}>{i + 1}</span>
                        <span style={{ fontSize: 13 }}>{cat.emoji}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat.name}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{formatNPR(cat.value)}</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden', marginLeft: 22 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: i === 0 ? 'var(--accent)' : 'var(--border-strong)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Key highlights */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '22px 24px' }}>
          <SectionTitle>Highlights</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Biggest transaction */}
            <HighlightRow
              label="Biggest Expense"
              value={stats.biggest ? formatNPR(stats.biggest.amount) : '—'}
              sub={stats.biggest ? stats.biggest.merchant : 'No expenses yet'}
              color="var(--red)"
            />

            {/* Avg monthly expense */}
            <HighlightRow
              label="Avg Monthly Expense"
              value={formatNPR(stats.avgMonthlyExpense)}
              sub="per month average"
            />

            {/* Best month */}
            <HighlightRow
              label="Best Savings Month"
              value={stats.bestMonth && stats.bestMonth.net > 0 ? stats.bestMonth.month : '—'}
              sub={stats.bestMonth && stats.bestMonth.net > 0 ? `Saved ${formatNPR(stats.bestMonth.net)}` : 'No positive months yet'}
              color="var(--accent)"
            />

            {/* Net for period */}
            <HighlightRow
              label={`Net (${timeframe})`}
              value={formatNPR(Math.abs(stats.totalIncome - stats.totalExpense))}
              sub={(stats.totalIncome - stats.totalExpense) >= 0 ? 'Surplus' : 'Deficit'}
              color={(stats.totalIncome - stats.totalExpense) >= 0 ? 'var(--accent)' : 'var(--red)'}
            />

            {/* Transaction count */}
            <HighlightRow
              label="Transactions"
              value={transactions.filter(tx => months.some(m => tx.date?.startsWith(m))).length}
              sub={`in last ${timeframe}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function HighlightRow({ label, value, sub, color }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div>
        <p style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 3 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: color || 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </p>
    </div>
  )
}