// Bikram Samwat ↔ AD conversion
// Simplified lookup table for recent years

const BS_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
  'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
  'Poush', 'Magh', 'Falgun', 'Chaitra'
]

// BS year start dates in AD (approximate)
const BS_YEAR_START = {
  2079: '2022-04-14',
  2080: '2023-04-14',
  2081: '2024-04-13',
  2082: '2025-04-14',
  2083: '2026-04-14',
}

/**
 * Get current BS year (approximate)
 */
export const getCurrentBSYear = () => {
  const now = new Date()
  const year = now.getFullYear()
  // Nepali new year is around April 14
  const bsYear = now.getMonth() >= 3 ? year + 57 : year + 56
  return bsYear
}

/**
 * Get BS month name from JS Date
 */
export const getBSMonth = (date = new Date()) => {
  const adMonth = date.getMonth() // 0-indexed
  // Approximate: BS months are shifted ~1 month ahead
  const bsMonthIndex = (adMonth + 9) % 12
  return BS_MONTHS[bsMonthIndex]
}

/**
 * Format date in BS (approximate display)
 * e.g. "Baishakh 2083"
 */
export const formatDateBS = (date = new Date()) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${getBSMonth(d)} ${getCurrentBSYear()}`
}

/**
 * Format date in AD
 * e.g. "April 2026"
 */
export const formatDateAD = (date = new Date()) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Format a short date: "14 Apr"
 */
export const formatShortDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

// Calendar-aware version — pass calendar from profile
export const formatDate = (dateStr, calendar = 'AD') => {
  const d = new Date(dateStr)
  if (calendar === 'BS') {
    const bsMonths = ['Bai','Jes','Ash','Shr','Bha','Ash','Kar','Man','Pou','Mag','Fal','Cha']
    const bsIdx = (d.getMonth() + 9) % 12
    return `${d.getDate()} ${bsMonths[bsIdx]}`
  }
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

/**
 * Get YYYY-MM string for current month
 */
export const getCurrentMonthKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export { BS_MONTHS }