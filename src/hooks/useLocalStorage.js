import { useState, useEffect } from 'react'
import { storage } from '../utils/storage'

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    const stored = storage.get(key)
    return stored !== null ? stored : defaultValue
  })

  useEffect(() => {
    storage.set(key, value)
  }, [key, value])

  return [value, setValue]
}