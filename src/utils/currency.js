/**
 * Format number as Nepali Rupees
 * Uses Indian number format: 1,23,456
 */
export const formatNPR = (amount) => {
  if (amount === null || amount === undefined) return 'Rs. 0'
  const num = Math.abs(Number(amount))
  const str = num.toFixed(0)
  
  let result = ''
  if (str.length <= 3) {
    result = str
  } else {
    const last3 = str.slice(-3)
    const remaining = str.slice(0, -3)
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
    result = formatted + ',' + last3
  }
  
  return `Rs. ${result}`
}

/**
 * Format with sign: + for income, - for expense
 */
export const formatNPRSigned = (amount, type) => {
  const formatted = formatNPR(amount)
  return type === 'income' ? `+${formatted}` : `-${formatted}`
}

/**
 * Parse a string like "Rs. 1,23,456" back to number
 */
export const parseNPR = (str) => {
  return Number(String(str).replace(/[Rs.\s,]/g, ''))
}