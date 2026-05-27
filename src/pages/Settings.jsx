import XLSXStyle from 'xlsx-js-style'
import { getCategoryByKey } from '../utils/categories'
import { useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import { useTransactions } from '../hooks/useTransactions'
import { storage } from '../utils/storage'
import { NEPAL_DISTRICTS } from '../utils/categories'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Database, Download, Upload, Trash2, Check } from 'lucide-react'

const SAMPLE_TRANSACTIONS = [
  { type: 'income',  amount: 65000, category: 'salary',        merchant: 'Monthly Salary',      description: 'Office salary', date: thisMonth(1)  },
  { type: 'expense', amount: 18000, category: 'rent',          merchant: 'Room Rent',            description: '',              date: thisMonth(1)  },
  { type: 'expense', amount: 3500,  category: 'food',          merchant: 'Bhatbhateni',          description: 'Grocery',       date: thisMonth(3)  },
  { type: 'expense', amount: 1200,  category: 'transport',     merchant: 'Pathao',               description: 'Rides',         date: thisMonth(5)  },
  { type: 'expense', amount: 2500,  category: 'food',          merchant: 'Sherpa Kitchen',       description: 'Dinner',        date: thisMonth(7)  },
  { type: 'expense', amount: 4000,  category: 'shopping',      merchant: 'Daraz',                description: 'Clothes',       date: thisMonth(8)  },
  { type: 'expense', amount: 800,   category: 'entertainment', merchant: 'Netflix',              description: '',              date: thisMonth(10) },
  { type: 'expense', amount: 1500,  category: 'health',        merchant: 'Medicare',             description: 'Checkup',       date: thisMonth(12) },
  { type: 'income',  amount: 15000, category: 'freelance',     merchant: 'Freelance Project',    description: 'Web design',    date: thisMonth(14) },
  { type: 'expense', amount: 2000,  category: 'utilities',     merchant: 'NEA Bill',             description: 'Electricity',   date: thisMonth(15) },
  { type: 'expense', amount: 1800,  category: 'food',          merchant: 'Bajeko Sekuwa',        description: 'Lunch',         date: thisMonth(18) },
  { type: 'expense', amount: 3000,  category: 'education',     merchant: 'Udemy',                description: 'Courses',       date: thisMonth(20) },
  { type: 'expense', amount: 900,   category: 'transport',     merchant: 'InDrive',              description: '',              date: thisMonth(22) },
  { type: 'expense', amount: 2200,  category: 'food',          merchant: 'Angan Restaurant',     description: 'Family dinner', date: thisMonth(24) },
  { type: 'expense', amount: 5000,  category: 'savings',       merchant: 'Bank Deposit',         description: 'Monthly save',  date: thisMonth(25) },
]

function thisMonth(day) {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function GearDoodle() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none"
      style={{ position: 'absolute', right: 20, bottom: 20, opacity: 0.05, pointerEvents: 'none' }}>
      <circle cx="45" cy="45" r="18" stroke="#1c3a1c" strokeWidth="1.2" fill="none"/>
      <circle cx="45" cy="45" r="8" stroke="#1c3a1c" strokeWidth="0.8" fill="none"/>
      {[0,45,90,135,180,225,270,315].map(angle => {
        const rad = (angle * Math.PI) / 180
        const x1 = 45 + 18 * Math.cos(rad)
        const y1 = 45 + 18 * Math.sin(rad)
        const x2 = 45 + 26 * Math.cos(rad)
        const y2 = 45 + 26 * Math.sin(rad)
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1c3a1c" strokeWidth="3" strokeLinecap="round"/>
      })}
    </svg>
  )
}

export default function Settings() {
  const { profile, updateProfile } = useProfile()
  const { transactions, addTransaction } = useTransactions()
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(profile.name)
  const [location, setLocation] = useState(profile.location)
  const [confirmClear, setConfirmClear] = useState(false)
  const [sampleLoaded, setSampleLoaded] = useState(false)

  const handleSaveProfile = () => {
    updateProfile({ name: name.trim() || 'Friend', location })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

 const handleExportCSV = () => {
    if (transactions.length === 0) return alert('No transactions to export.')

    const wb = XLSXStyle.utils.book_new()

    // ── Colors ──
    const GREEN_DARK  = '1c3a1c'
    const GREEN_MID   = '4a7c4a'
    const GREEN_LIGHT = 'e8f0e8'
    const CREAM       = 'f4f0e4'
    const CREAM_DARK  = 'e4dfd0'
    const RED         = '7a2020'
    const RED_LIGHT   = 'fdf0f0'
    const WHITE       = 'ffffff'
    const BORDER_COL  = 'c8d8c8'

    const thin = { style: 'thin', color: { rgb: BORDER_COL } }
    const border = { top: thin, bottom: thin, left: thin, right: thin }

    const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance      = totalIncome - totalExpense
    const savingsRate  = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0
    const exportDate   = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))

    const byMonth = {}
    sorted.forEach(tx => {
      const key = tx.date.slice(0, 7)
      if (!byMonth[key]) byMonth[key] = []
      byMonth[key].push(tx)
    })

    // ── Helper styles ──
    const headerStyle = {
      font: { bold: true, color: { rgb: WHITE }, sz: 13, name: 'Georgia' },
      fill: { fgColor: { rgb: GREEN_DARK } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border,
    }

    const subHeaderStyle = {
      font: { bold: true, color: { rgb: WHITE }, sz: 11 },
      fill: { fgColor: { rgb: GREEN_MID } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border,
    }

    const colHeaderStyle = {
      font: { bold: true, color: { rgb: GREEN_DARK }, sz: 10 },
      fill: { fgColor: { rgb: GREEN_LIGHT } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border,
    }

    const labelStyle = {
      font: { bold: true, color: { rgb: GREEN_DARK }, sz: 10 },
      fill: { fgColor: { rgb: CREAM_DARK } },
      alignment: { horizontal: 'left' },
      border,
    }

    const valueStyle = {
      font: { color: { rgb: '333333' }, sz: 10 },
      fill: { fgColor: { rgb: CREAM } },
      alignment: { horizontal: 'right' },
      border,
    }

    const incomeRowStyle = {
      font: { color: { rgb: GREEN_DARK }, sz: 10 },
      fill: { fgColor: { rgb: 'f0f7f0' } },
      alignment: { horizontal: 'left' },
      border,
    }

    const incomeAmtStyle = {
      font: { bold: true, color: { rgb: GREEN_DARK }, sz: 10 },
      fill: { fgColor: { rgb: 'f0f7f0' } },
      alignment: { horizontal: 'right' },
      border,
    }

    const expenseRowStyle = {
      font: { color: { rgb: RED }, sz: 10 },
      fill: { fgColor: { rgb: RED_LIGHT } },
      alignment: { horizontal: 'left' },
      border,
    }

    const expenseAmtStyle = {
      font: { bold: true, color: { rgb: RED }, sz: 10 },
      fill: { fgColor: { rgb: RED_LIGHT } },
      alignment: { horizontal: 'right' },
      border,
    }

    const emptyStyle = {
      fill: { fgColor: { rgb: WHITE } },
      border,
    }

    const totalRowStyle = {
      font: { bold: true, color: { rgb: WHITE }, sz: 10 },
      fill: { fgColor: { rgb: GREEN_DARK } },
      alignment: { horizontal: 'right' },
      border,
    }

    // ── Build worksheet data ──
    const wsData = []
    const merges = []

    let row = 0

    // Title
    wsData.push([
      { v: 'PAISATRACK — Personal Finance Report', s: { ...headerStyle, font: { ...headerStyle.font, sz: 16 } } },
      { v: '', s: headerStyle }, { v: '', s: headerStyle },
      { v: '', s: headerStyle }, { v: '', s: headerStyle },
      { v: '', s: headerStyle },
    ])
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } })
    row++

    // Subtitle
    wsData.push([
      { v: `${profile.name}  ·  ${profile.location}  ·  Exported: ${exportDate}`, s: { ...subHeaderStyle, font: { ...subHeaderStyle.font, sz: 10 }, alignment: { horizontal: 'center' } } },
      { v: '', s: subHeaderStyle }, { v: '', s: subHeaderStyle },
      { v: '', s: subHeaderStyle }, { v: '', s: subHeaderStyle },
      { v: '', s: subHeaderStyle },
    ])
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } })
    row++

    // Empty row
    wsData.push([{ v: '', s: { fill: { fgColor: { rgb: WHITE } } } }])
    row++

    // Summary header
    wsData.push([
      { v: 'SUMMARY', s: subHeaderStyle },
      { v: '', s: subHeaderStyle }, { v: '', s: subHeaderStyle },
      { v: '', s: subHeaderStyle }, { v: '', s: subHeaderStyle },
      { v: '', s: subHeaderStyle },
    ])
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } })
    row++

    // Summary rows
    const summaryRows = [
      ['Total Transactions', sorted.length, '', 'Period', `${Object.keys(byMonth).length} months`],
      ['Total Income', `Rs. ${totalIncome.toLocaleString('en-IN')}`, '', 'Avg Monthly Income', `Rs. ${Math.round(totalIncome / Math.max(Object.keys(byMonth).length, 1)).toLocaleString('en-IN')}`],
      ['Total Expenses', `Rs. ${totalExpense.toLocaleString('en-IN')}`, '', 'Avg Monthly Expense', `Rs. ${Math.round(totalExpense / Math.max(Object.keys(byMonth).length, 1)).toLocaleString('en-IN')}`],
      ['Net Balance', `Rs. ${balance.toLocaleString('en-IN')}`, '', 'Savings Rate', `${savingsRate}%`],
    ]

    summaryRows.forEach(([l1, v1, , l2, v2]) => {
      wsData.push([
        { v: l1, s: labelStyle },
        { v: v1, s: { ...valueStyle, font: { ...valueStyle.font, bold: true, color: { rgb: l1 === 'Total Income' ? GREEN_DARK : l1 === 'Total Expenses' ? RED : '333333' } } } },
        { v: '', s: emptyStyle },
        { v: l2 || '', s: labelStyle },
        { v: v2 || '', s: valueStyle },
        { v: '', s: emptyStyle },
      ])
      row++
    })

    wsData.push([{ v: '', s: { fill: { fgColor: { rgb: WHITE } } } }])
    row++

    // Transactions by month
    Object.entries(byMonth)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .forEach(([monthKey, txs]) => {
        const [year, month] = monthKey.split('-')
        const monthName = new Date(year, parseInt(month) - 1)
          .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        const mIncome  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        const mExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

        // Month header
        wsData.push([
          { v: monthName.toUpperCase(), s: subHeaderStyle },
          { v: '', s: subHeaderStyle },
          { v: '', s: subHeaderStyle },
          { v: `Income: Rs. ${mIncome.toLocaleString('en-IN')}`, s: { ...subHeaderStyle, alignment: { horizontal: 'right' } } },
          { v: `Expenses: Rs. ${mExpense.toLocaleString('en-IN')}`, s: { ...subHeaderStyle, alignment: { horizontal: 'right' } } },
          { v: `Net: Rs. ${(mIncome - mExpense).toLocaleString('en-IN')}`, s: { ...subHeaderStyle, alignment: { horizontal: 'right' } } },
        ])
        row++

        // Column headers
        wsData.push([
          { v: 'Date',             s: colHeaderStyle },
          { v: 'Type',             s: colHeaderStyle },
          { v: 'Category',         s: colHeaderStyle },
          { v: 'Merchant / Title', s: colHeaderStyle },
          { v: 'Amount (Rs.)',     s: colHeaderStyle },
          { v: 'Note',             s: colHeaderStyle },
        ])
        row++

        // Transaction rows
        txs.forEach(tx => {
          const isIncome = tx.type === 'income'
          const rowS = isIncome ? incomeRowStyle : expenseRowStyle
          const amtS = isIncome ? incomeAmtStyle : expenseAmtStyle
          wsData.push([
            { v: tx.date,                                                        s: rowS },
            { v: tx.type.toUpperCase(),                                          s: rowS },
            { v: getCategoryByKey(tx.category)?.label || tx.category,           s: rowS },
            { v: tx.merchant || '',                                              s: rowS },
            { v: `${isIncome ? '+' : '-'}${tx.amount.toLocaleString('en-IN')}`, s: amtS },
            { v: tx.description || '',                                           s: rowS },
          ])
          row++
        })

        // Month total row
        wsData.push([
          { v: 'MONTH TOTAL', s: totalRowStyle },
          { v: '', s: totalRowStyle },
          { v: '', s: totalRowStyle },
          { v: '', s: totalRowStyle },
          { v: `Rs. ${(mIncome - mExpense).toLocaleString('en-IN')}`, s: { ...totalRowStyle, font: { ...totalRowStyle.font, color: { rgb: mIncome >= mExpense ? 'a8f0a8' : 'f0a8a8' } } } },
          { v: '', s: totalRowStyle },
        ])
        row++

        wsData.push([{ v: '', s: { fill: { fgColor: { rgb: WHITE } } } }])
        row++
      })

    // Footer
    wsData.push([
      { v: 'PaisaTrack — Your money, your ledger, your rules.', s: { ...subHeaderStyle, font: { ...subHeaderStyle.font, sz: 9, italic: true }, alignment: { horizontal: 'center' } } },
      { v: '', s: subHeaderStyle }, { v: '', s: subHeaderStyle },
      { v: '', s: subHeaderStyle }, { v: '', s: subHeaderStyle },
      { v: '', s: subHeaderStyle },
    ])
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } })

    // ── Create worksheet ──
    const ws = XLSXStyle.utils.aoa_to_sheet(wsData)
    ws['!merges'] = merges
    ws['!cols'] = [
      { wch: 14 }, // Date
      { wch: 10 }, // Type
      { wch: 16 }, // Category
      { wch: 28 }, // Merchant
      { wch: 16 }, // Amount
      { wch: 24 }, // Note
    ]

    // Row heights
    ws['!rows'] = wsData.map((_, i) => ({ hpt: i === 0 ? 32 : i === 1 ? 18 : 16 }))

    XLSXStyle.utils.book_append_sheet(wb, ws, 'PaisaTrack Report')

    const fileName = `paisatrack-${profile.name.toLowerCase().replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSXStyle.writeFile(wb, fileName)
  }

 const handleLoadSample = () => {
    SAMPLE_TRANSACTIONS.forEach(tx => {
      addTransaction(tx)
    })
    setSampleLoaded(true)
    setTimeout(() => setSampleLoaded(false), 3000)
  }

  const handleClearData = () => {
    storage.clear()
    window.location.reload()
  }

  return (
    <div style={{ padding: '36px 40px 60px', maxWidth: 1080, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>
          Preferences
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 38, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Settings
        </h1>
        <div style={{ width: 36, height: 1.5, background: 'var(--accent)', marginTop: 12, opacity: 0.4 }} />
      </div>

      {/* Profile Section */}
      <Section icon={<User size={15} />} title="Profile">
        <GearDoodle />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Aarav, Priya"
            />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)}>
              {NEPAL_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Calendar System</label>
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 6, padding: 3, border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
            {['BS', 'AD'].map(cal => (
              <button key={cal} onClick={() => updateProfile({ calendar: cal })} style={{
                padding: '7px 24px', borderRadius: 4, fontSize: 13,
                background: profile.calendar === cal ? 'var(--bg-card)' : 'transparent',
                color: profile.calendar === cal ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: profile.calendar === cal ? 600 : 400,
                border: profile.calendar === cal ? '1px solid var(--border-default)' : '1px solid transparent',
                transition: 'all 0.15s', fontFamily: 'var(--font-body)', cursor: 'pointer',
              }}>
                {cal === 'BS' ? 'Bikram Samwat (BS)' : 'Anno Domini (AD)'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            {profile.calendar === 'BS' ? 'Dates shown in Nepali calendar (e.g. Jestha 2083)' : 'Dates shown in English calendar (e.g. May 2026)'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleSaveProfile}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--accent)', color: '#f0ece0',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13,
              padding: '10px 20px', borderRadius: 4, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {saved ? <Check size={14} /> : null}
            {saved ? 'Saved!' : 'Save Profile'}
          </button>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
              Profile updated ✓
            </span>
          )}
        </div>
      </Section>

      {/* Data Management */}
      <Section icon={<Database size={15} />} title="Data Management">
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          All your data is stored locally on this device. Nothing is sent to any server.
          You have <strong style={{ color: 'var(--text-primary)' }}>{transactions.length} transactions</strong> recorded.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Export */}
          <DataAction
            icon={<Download size={14} />}
           title="Export as Excel"
description="Download all transactions as a formatted .xlsx spreadsheet"
            buttonLabel="Export Excel"
            buttonStyle="secondary"
            onClick={handleExportCSV}
          />

          {/* Load sample */}
          <DataAction
            icon={<Upload size={14} />}
            title="Load Sample Data"
            description="Populate with realistic Nepali transactions to explore the app"
            buttonLabel={sampleLoaded ? 'Loaded!' : 'Load Sample'}
            buttonStyle="secondary"
            onClick={handleLoadSample}
          />

          {/* Clear data */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 18px',
            background: 'var(--red-muted)',
            border: '1px solid rgba(122,32,32,0.15)',
            borderRadius: 6,
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--red)', marginBottom: 2 }}>
                Clear All Data
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Permanently delete all transactions, budgets and events
              </p>
            </div>
            {confirmClear ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleClearData}
                  style={{ fontSize: 12, color: '#f0ece0', background: 'var(--red)', padding: '7px 14px', borderRadius: 4, fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer' }}
                >
                  Yes, clear all
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '7px 14px', borderRadius: 4, border: '1px solid var(--border-default)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--red)', background: 'transparent', padding: '7px 14px', borderRadius: 4, border: '1px solid rgba(122,32,32,0.3)', fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer' }}
              >
                <Trash2 size={13} /> Clear Data
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* About */}
      <div style={{
        marginTop: 32, padding: '20px 22px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 500, marginBottom: 2 }}>PaisaTrack</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Personal Ledger</p>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>Made by Nishant Gaire</p>
      </div>
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 8, padding: '24px 26px',
      marginBottom: 16, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function DataAction({ icon, title, description, buttonLabel, buttonStyle, onClick }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 18px',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ color: 'var(--text-muted)', marginTop: 1 }}>{icon}</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        style={{
          fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500,
          padding: '7px 14px', borderRadius: 4, cursor: 'pointer',
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-default)',
          flexShrink: 0, marginLeft: 16,
          transition: 'all 0.15s',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

const labelStyle = {
  fontSize: 10, color: 'var(--text-muted)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  display: 'block', marginBottom: 8, fontWeight: 500,
}