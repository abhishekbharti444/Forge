import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { organizeJourneys, type Journey, type JourneyTask } from '../lib/journeys'
import { getCompletedIds } from '../lib/progress'

interface Props {
  category: string
  categoryLabel: string
  onStartTask: (task: any, mode: 'screen' | 'speak' | 'listen') => void
  onHome: () => void
}

const JOURNEY_EMOJI: Record<string, string> = {
  technique: '🎯', chords: '🎸', scales_fretboard: '🎵', rhythm: '🥁',
  fingerpicking: '👆', ear_training: '👂', fundamentals: '📡', replication: '🔄',
  partitioning: '📊', transactions: '💳', consensus: '🤝', fault_tolerance: '🛡',
  estimation: '📏', vocabulary: '📝', grammar: '📐', script: '✏️',
  phrases: '💬', pronunciation: '🗣', culture: '🏛', philosophical_literacy: '📚',
  ethics: '⚖️', argumentation: '🧩', critical_thinking: '🔍', applied_philosophy: '🌍',
  vocal_delivery: '🎤', clarity: '💡', impromptu: '⚡', presence: '🧘',
  storytelling: '📖', persuasion: '🎯',
}

export function Journeys({ category, categoryLabel, onStartTask, onHome }: Props) {
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const completedIds = getCompletedIds()

  useEffect(() => {
    apiFetch<{ tasks: any[] }>(`/tasks?category=${category}`)
      .then(d => {
        const tasks: JourneyTask[] = (d.tasks || []).map((t: any) => ({
          ...t,
          id: t.id || t.task_id,
          sequence: t.sequence || t.reference?.sequence,
        }))
        setJourneys(organizeJourneys(tasks, completedIds))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  function continueJourney(j: Journey) {
    const next = j.tasks.find(t => !completedIds.has(t.id))
    if (next) onStartTask(next, 'screen')
    else onStartTask(j.tasks[0], 'screen') // all done — restart from first
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading journeys...</p>
    </div>
  )

  const totalCompleted = journeys.reduce((s, j) => s + j.completed, 0)
  const totalTasks = journeys.reduce((s, j) => s + j.total, 0)

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-1">
        <button onClick={onHome} className="text-text-secondary/40 text-xs hover:text-text-secondary">← Home</button>
      </div>
      <h1 className="text-xl font-semibold text-text-primary mb-1">{categoryLabel}</h1>
      <p className="text-text-secondary/50 text-xs mb-6">
        {totalCompleted}/{totalTasks} tasks completed · {journeys.length} journeys
      </p>

      <div className="space-y-3">
        {journeys.map(j => {
          const isOpen = expanded === j.key
          const pct = j.total > 0 ? (j.completed / j.total) * 100 : 0
          const emoji = JOURNEY_EMOJI[j.key] || '📋'
          const allDone = j.completed === j.total

          return (
            <div key={j.key} className="bg-bg-surface border border-border rounded-xl overflow-hidden">
              {/* Journey header */}
              <button
                onClick={() => setExpanded(isOpen ? null : j.key)}
                className="w-full px-4 py-4 text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{emoji}</span>
                    <span className="text-text-primary text-sm font-medium capitalize truncate">{j.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs ${allDone ? 'text-green-500' : 'text-text-secondary/50'}`}>
                      {j.completed}/{j.total}
                    </span>
                    <span className="text-text-secondary/30 text-xs">{isOpen ? '▾' : '▸'}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${allDone ? 'bg-green-500' : 'bg-accent-amber'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>

              {/* Expanded: task list + continue button */}
              {isOpen && (
                <div className="border-t border-border">
                  {/* Continue button */}
                  {!allDone && (
                    <button
                      onClick={() => continueJourney(j)}
                      className="w-full px-4 py-3 bg-accent-amber/10 text-accent-amber text-sm font-semibold text-left hover:bg-accent-amber/20 transition-colors"
                    >
                      ▶ Continue
                    </button>
                  )}

                  {/* Task list */}
                  <div className="max-h-80 overflow-y-auto">
                    {j.tasks.map((t, i) => {
                      const done = completedIds.has(t.id)
                      const isNext = !done && !j.tasks.slice(0, i).some(prev => !completedIds.has(prev.id))
                      return (
                        <button
                          key={t.id}
                          onClick={() => onStartTask(t, 'screen')}
                          className={`w-full px-4 py-2.5 text-left flex items-center gap-3 border-b border-border/50 last:border-b-0 hover:bg-bg-primary/50 transition-colors ${done ? 'opacity-50' : ''}`}
                        >
                          <span className="text-xs shrink-0 w-5 text-center">
                            {done ? '✅' : isNext ? '●' : '○'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm leading-relaxed truncate ${done ? 'text-text-secondary line-through' : isNext ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                              {t.action || t.description}
                            </p>
                          </div>
                          <span className="text-text-secondary/30 text-xs shrink-0">{t.time_minutes}m</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
