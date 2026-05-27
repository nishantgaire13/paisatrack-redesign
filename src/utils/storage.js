const KEYS = {
  TRANSACTIONS: 'pt_transactions',
  BUDGET:       'pt_budget',
  PROFILE:      'pt_profile',
}

export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },

  clear() {
    try {
      Object.values(KEYS).forEach(k => localStorage.removeItem(k))
      return true
    } catch {
      return false
    }
  }
}

export { KEYS }