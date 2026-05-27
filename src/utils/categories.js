export const CATEGORIES = [
  { key: 'food',          label: 'Food & Dining',  emoji: '🍛', type: 'expense' },
  { key: 'transport',     label: 'Transport',       emoji: '🚌', type: 'expense' },
  { key: 'rent',          label: 'Rent',            emoji: '🏠', type: 'expense' },
  { key: 'entertainment', label: 'Entertainment',   emoji: '🎬', type: 'expense' },
  { key: 'health',        label: 'Health',          emoji: '💊', type: 'expense' },
  { key: 'education',     label: 'Education',       emoji: '📚', type: 'expense' },
  { key: 'shopping',      label: 'Shopping',        emoji: '🛍️', type: 'expense' },
  { key: 'utilities',     label: 'Utilities',       emoji: '⚡', type: 'expense' },
  { key: 'savings',       label: 'Savings',         emoji: '🏦', type: 'expense' },
  { key: 'salary',        label: 'Salary',          emoji: '💰', type: 'income'  },
  { key: 'freelance',     label: 'Freelance',       emoji: '💻', type: 'income'  },
  { key: 'other',         label: 'Other',           emoji: '📦', type: 'both'    },
]

export const getCategoryByKey = (key) =>
  CATEGORIES.find(c => c.key === key) ?? { key, label: key, emoji: '📦' }

export const NEPAL_DISTRICTS = [
  'Kathmandu','Lalitpur','Bhaktapur','Pokhara','Chitwan',
  'Biratnagar','Birgunj','Butwal','Dharan','Hetauda',
  'Janakpur','Dhangadhi','Itahari','Nepalgunj','Other'
]