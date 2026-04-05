import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface HistoryTask {
  description: string
  skill_area: string
  reflection: string | null
  completed_at: string
  duration_seconds: number | null
}

interface Props {
  onBack: () => void
}

export function History({ onBack }: Props) {
  const [tasks, setTasks] = useState<HistoryTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.history()
      .then(d => { setTasks(d.tasks); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  // Group by date
  const grouped = tasks.reduce<Record<string, HistoryTask[]>>((acc, t) => {
    const date = new Date(t.completed_at).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
    ;(acc[date] ||= []).push(t)
    return acc
  }, {})

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading history...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-text-primary text-lg mb-2">Something went wrong</p>
        <button onClick={() => window.location.reload()} className="text-accent-amber text-sm">Try again</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-text-primary">History</h1>
        <button onClick={onBack} className="text-text-secondary text-sm">← Back</button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-text-primary text-lg mb-2">No tasks completed yet</p>
          <p className="text-text-secondary text-sm">Complete your first task and it'll show up here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="text-text-secondary/50 text-xs uppercase tracking-wide mb-3">{date}</p>
              <div className="space-y-3">
                {items.map((t, i) => (
                  <div key={i} className="bg-bg-surface border border-border rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-accent-amber text-xs">{t.skill_area?.replace('_', ' ')}</span>
                      {t.duration_seconds && (
                        <span className="text-text-secondary/40 text-xs">{Math.round(t.duration_seconds / 60)} min</span>
                      )}
                    </div>
                    <p className="text-text-primary text-sm leading-relaxed">{t.description}</p>
                    {t.reflection && (
                      <p className="text-text-secondary text-xs leading-relaxed mt-2 italic">"{t.reflection}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
