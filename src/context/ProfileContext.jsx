import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { KEYS } from '../utils/storage'

const DEFAULT_PROFILE = {
  name: 'Friend',
  location: 'Kathmandu',
  calendar: 'BS',
  currency: 'NPR',
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useLocalStorage(KEYS.PROFILE, DEFAULT_PROFILE)
  const updateProfile = (updates) => setProfile(prev => ({ ...prev, ...updates }))
  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)