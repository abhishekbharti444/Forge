// Session recovery: localStorage-based persistence that survives mobile tab eviction.
// sessionStorage dies when Safari/Chrome evict a background tab — localStorage doesn't.

const SESSION_KEY = 'forge_session'
const FOCUSED_KEY = 'forge_focused'
const TTL_MS = 4 * 60 * 60 * 1000 // 4 hours

interface AppSession {
  appState: string
  currentTask: any
  audioMode?: 'speak' | 'listen'
  savedAt: number
}

interface FocusedSession {
  taskId: string
  stepIndex: number
  reflection: string
  promptResponses: string[]
  savedAt: number
}

function safeParse<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw) as T & { savedAt: number }
    if (Date.now() - data.savedAt > TTL_MS) {
      localStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

// --- App-level session (which screen + which task) ---

export function saveSession(appState: string, currentTask: any, audioMode?: 'speak' | 'listen') {
  const data: AppSession = { appState, currentTask, audioMode, savedAt: Date.now() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

export function restoreSession(): AppSession | null {
  return safeParse<AppSession>(SESSION_KEY)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(FOCUSED_KEY)
}

// --- Focused-level state (step + text inputs) ---

export function saveFocusedState(taskId: string, stepIndex: number, reflection: string, promptResponses: string[]) {
  const data: FocusedSession = { taskId, stepIndex, reflection, promptResponses, savedAt: Date.now() }
  localStorage.setItem(FOCUSED_KEY, JSON.stringify(data))
}

export function restoreFocusedState(taskId: string): FocusedSession | null {
  const data = safeParse<FocusedSession>(FOCUSED_KEY)
  if (!data || data.taskId !== taskId) return null
  return data
}

export function clearFocusedState() {
  localStorage.removeItem(FOCUSED_KEY)
}

// --- Recent journeys LRU (most recently accessed pinned at top) ---

const RECENT_KEY = 'forge_recent'
const MAX_RECENT = 3

interface RecentEntry {
  category: string
  journeyKey: string
  timestamp: number
}

export function touchRecent(category: string, journeyKey: string) {
  const entries = getRecentEntries()
  const filtered = entries.filter(e => !(e.category === category && e.journeyKey === journeyKey))
  filtered.unshift({ category, journeyKey, timestamp: Date.now() })
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT * 5))) // keep across categories
}

export function getRecent(category: string): string[] {
  return getRecentEntries()
    .filter(e => e.category === category)
    .slice(0, MAX_RECENT)
    .map(e => e.journeyKey)
}

function getRecentEntries(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch { return [] }
}
