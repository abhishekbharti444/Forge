const API_BASE = '/api'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  }

  // Add auth token if available (not in local dev)
  if (import.meta.env.VITE_SKIP_AUTH !== 'true') {
    const { supabase } = await import('./supabase')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  suggest: () => apiFetch<any>('/suggest'),
  parseGoal: (text: string) => apiFetch<any>('/goals/parse', { method: 'POST', body: JSON.stringify({ text }) }),
  logEvent: (data: any) => apiFetch<any>('/events', { method: 'POST', body: JSON.stringify(data) }),
  momentum: () => apiFetch<any>('/momentum'),
  history: () => apiFetch<any>('/history'),
  status: () => apiFetch<any>('/status'),
}
