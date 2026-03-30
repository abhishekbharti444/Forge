const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await (await import('./supabase')).supabase.auth.getSession()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  suggest: () => request<{ task_id: string; description: string; time_minutes: number } | { done_for_today: true; tasks_completed: number }>('/suggest'),
  parseGoal: (text: string) => request<{ category: string | null; supported: boolean; available?: string[] }>('/goals/parse', { method: 'POST', body: JSON.stringify({ text }) }),
  logEvent: (data: { task_id: string; event: string; skip_reason?: string; reflection_text?: string; duration_seconds?: number }) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  momentum: () => request<{ level: string; days_active: number; tasks_completed: number }>('/momentum'),
  history: () => request<{ tasks: Array<{ description: string; reflection: string | null; completed_at: string }> }>('/history'),
  status: () => request<{ done_for_today: boolean; tasks_completed_today: number; has_active_goal: boolean }>('/status'),
}
