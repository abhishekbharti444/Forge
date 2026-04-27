import { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface Saved<T> { data: T; savedAt: number }

function load<T>(key: string, ttl: number): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, savedAt } = JSON.parse(raw) as Saved<T>
    if (Date.now() - savedAt > ttl) { localStorage.removeItem(key); return null }
    return data
  } catch { localStorage.removeItem(key); return null }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() } as Saved<T>))
}

/**
 * Persists state to localStorage, surviving mobile tab eviction and app close.
 * - Restores from localStorage on mount (if not expired)
 * - Saves on state change (debounced) and visibilitychange (immediate)
 * - Returns [state, setState, clear]
 */
export function useSessionRecovery<T>(
  key: string,
  initialState: T | (() => T),
  ttlMs = DEFAULT_TTL,
): [T, (update: T | ((prev: T) => T)) => void, () => void] {
  const [state, setStateRaw] = useState<T>(() => {
    const saved = load<T>(key, ttlMs)
    if (saved !== null) return saved
    return typeof initialState === 'function' ? (initialState as () => T)() : initialState
  })

  const ref = useRef(state)
  ref.current = state

  const flush = useCallback(() => save(key, ref.current), [key])

  // Debounced save on state change
  useEffect(() => {
    const t = setTimeout(flush, 500)
    return () => clearTimeout(t)
  }, [state, flush])

  // Immediate save on visibilitychange
  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [flush])

  const clear = useCallback(() => localStorage.removeItem(key), [key])

  return [state, setStateRaw, clear]
}
