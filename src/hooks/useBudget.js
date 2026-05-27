import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

const BUDGET_KEY = 'pt_budget'

export const useBudget = (monthKey, expensesByCategory = {}) => {
  const [allBudgets, setAllBudgets] = useLocalStorage(BUDGET_KEY, {})

  const currentBudgets = useMemo(() => {
    return allBudgets[monthKey] || {}
  }, [allBudgets, monthKey])

  const setBudgetForCategory = useCallback((category, amount, customLabel) => {
    setAllBudgets(prev => ({
      ...prev,
      [monthKey]: {
        ...(prev[monthKey] || {}),
        [category]: { amount: Number(amount), customLabel: customLabel || null },
      }
    }))
  }, [setAllBudgets, monthKey])

  const removeBudgetCategory = useCallback((category) => {
    setAllBudgets(prev => {
      const month = { ...(prev[monthKey] || {}) }
      delete month[category]
      return { ...prev, [monthKey]: month }
    })
  }, [setAllBudgets, monthKey])

  const copyFromLastMonth = useCallback(() => {
    const [year, month] = monthKey.split('-').map(Number)
    const lastMonth = month === 1
      ? `${year - 1}-12`
      : `${year}-${String(month - 1).padStart(2, '0')}`
    const lastData = allBudgets[lastMonth]
    if (lastData) {
      setAllBudgets(prev => ({
        ...prev,
        [monthKey]: { ...lastData }
      }))
      return true
    }
    return false
  }, [allBudgets, setAllBudgets, monthKey])

  const totalBudgeted = useMemo(() =>
    Object.values(currentBudgets).reduce((s, v) => s + (v?.amount || 0), 0),
    [currentBudgets]
  )

  const totalSpent = useMemo(() =>
    Object.values(expensesByCategory).reduce((s, v) => s + v, 0),
    [expensesByCategory]
  )

  return {
    budgets: currentBudgets,
    setBudgetForCategory,
    removeBudgetCategory,
    copyFromLastMonth,
    totalBudgeted,
    totalSpent,
  }
}