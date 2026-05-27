import { createContext, useContext, useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { KEYS } from '../utils/storage'
import { getCurrentMonthKey } from '../utils/calendar'

const TransactionsContext = createContext(null)

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useLocalStorage(KEYS.TRANSACTIONS, [])

  const addTransaction = useCallback((data) => {
    const tx = { id: nanoid(), ...data, createdAt: Date.now() }
    setTransactions(prev => [tx, ...prev])
    return tx
  }, [setTransactions])

  const editTransaction = useCallback((id, data) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...data } : tx))
  }, [setTransactions])

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id))
  }, [setTransactions])

  const currentMonthKey = getCurrentMonthKey()

  const thisMonthTransactions = useMemo(() =>
    transactions.filter(tx => tx.date?.startsWith(currentMonthKey)),
    [transactions, currentMonthKey]
  )

  const totalIncome = useMemo(() =>
    thisMonthTransactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0),
    [thisMonthTransactions]
  )

  const totalExpenses = useMemo(() =>
    thisMonthTransactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0),
    [thisMonthTransactions]
  )

  const balance = totalIncome - totalExpenses

  const savingsRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
    : 0

  const expensesByCategory = useMemo(() => {
    const map = {}
    thisMonthTransactions.filter(tx => tx.type === 'expense').forEach(tx => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount
    })
    return map
  }, [thisMonthTransactions])

  return (
    <TransactionsContext.Provider value={{
      transactions, thisMonthTransactions,
      addTransaction, editTransaction, deleteTransaction,
      totalIncome, totalExpenses, balance, savingsRate, expensesByCategory,
    }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export const useTransactions = () => useContext(TransactionsContext)