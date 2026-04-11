import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

interface Task {
  id: string
  description: string
  action?: string
  skill_area?: string
  goal_category?: string
  time_minutes: number
  difficulty?: string
  context?: string
  constraint_note?: string
  example?: string
  reference?: { type: string; [key: string]: any }
  tools?: string[]
  completion?: string
  needs_guitar?: boolean
  bpm?: number
  chords?: string[]
}

interface Props {
  category: string
  categoryLabel: string
  lastCompletedId?: string
  lastSkillArea?: string
  onStartTask: (task: Task, mode: 'screen' | 'speak' | 'listen') => void
  onBrowseAll: () => void
  onHome: () => void
  completedIds?: Set<string>
}

function pickTask(tasks: Task[], skippedIds: Set<string>, lastCompletedId?: string, lastSkillArea?: string): Task | null {
  const available = tasks.filter(t => !skippedIds.has(t.id) && t.id !== lastCompletedId)
  if (!available.length) return tasks.length ? tasks[0] : null

  // Prefer different skill_area from last completed
  const different = lastSkillArea ? available.filter(t => t.skill_area !== lastSkillArea) : available
  const pool = different.length ? different : available

  // Weighted random — slight preference for easier tasks early
  return pool[Math.floor(Math.random() * pool.length)]
}

export function Coach({ category, categoryLabel, lastCompletedId, lastSkillArea, onStartTask, onBrowseAll, onHome, completedIds }: Props) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [current, setCurrent] = useState<Task | null>(null)
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set())
  const [showReasons, setShowReasons] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ tasks: Task[] }>(`/tasks?category=${category}`)
      .then(d => {
        const t = d.tasks || []
        setTasks(t)
        setCurrent(pickTask(t, new Set([...skippedIds, ...(completedIds || [])]), lastCompletedId, lastSkillArea))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  function skip(_reason: string) {
    if (!current) return
    const newSkipped = new Set(skippedIds).add(current.id)
    setSkippedIds(newSkipped)
    setShowReasons(false)
    setCurrent(pickTask(tasks, new Set([...newSkipped, ...(completedIds || [])]), lastCompletedId, current.skill_area))
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <p className="text-text-secondary text-sm">Finding a task...</p>
    </div>
  )

  if (!current) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-text-primary text-lg mb-2">You've seen everything!</p>
        <p className="text-text-secondary text-sm mb-6">No more tasks in {categoryLabel} right now.</p>
        <button onClick={onHome} className="text-accent-amber text-sm">← Back home</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col px-6 py-10 max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-12">
        <button onClick={onHome} className="text-text-secondary/40 text-xs hover:text-text-secondary transition-colors">← Home</button>
        <span className="text-text-secondary/40 text-xs">{categoryLabel}</span>
      </div>

      {/* Task card — clean, just the description */}
      <div className="flex-1 flex items-center">
        <div className="w-full">
          <p className="text-text-primary text-xl leading-relaxed mb-10">
            {current.action || current.description}
          </p>

          {/* Let's go */}
          <button onClick={() => onStartTask(current, 'screen')}
            className="w-full py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl mb-3 text-base">
            Let's go
          </button>

          {/* Not the right moment */}
          {showReasons ? (
            <div className="flex gap-2">
              {[{ r: 'too_long', l: 'Too long' }, { r: 'wrong_type', l: 'Not in the mood' }, { r: 'too_easy', l: 'Already know this' }].map(({ r, l }) => (
                <button key={r} onClick={() => skip(r)}
                  className="flex-1 py-2 text-xs bg-bg-surface border border-border text-text-secondary/60 rounded-lg hover:border-text-secondary/30 transition-colors">
                  {l}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setShowReasons(true)}
              className="w-full text-text-secondary/30 text-sm py-2 hover:text-text-secondary/50 transition-colors">
              Not the right moment
            </button>
          )}
        </div>
      </div>

      {/* Browse all */}
      <button onClick={onBrowseAll}
        className="text-text-secondary/30 text-xs py-4 hover:text-text-secondary/50 transition-colors text-center">
        Browse all tasks
      </button>
    </div>
  )
}
