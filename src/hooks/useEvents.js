import { useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useLocalStorage } from './useLocalStorage'

const EVENTS_KEY = 'pt_events'

export const useEvents = () => {
  const [events, setEvents] = useLocalStorage(EVENTS_KEY, [])

  const addEvent = useCallback((data) => {
    const ev = { id: nanoid(), ...data, done: false, createdAt: Date.now() }
    setEvents(prev => [...prev, ev])
    return ev
  }, [setEvents])

  const toggleDone = useCallback((id) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, done: !ev.done } : ev))
  }, [setEvents])

  const deleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(ev => ev.id !== id))
  }, [setEvents])

  const editEvent = useCallback((id, data) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, ...data } : ev))
  }, [setEvents])

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return events
      .filter(ev => ev.date >= today && !ev.done)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  }, [events])

  const todayEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return events.filter(ev => ev.date === today)
  }, [events])

  return { events, addEvent, toggleDone, deleteEvent, editEvent, upcomingEvents, todayEvents }
}