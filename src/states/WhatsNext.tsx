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
  reference?: { type: string; [key: string]: any }
  tools?: string[]
  needs_guitar?: boolean
  bpm?: number
  chords?: string[]
  context?: string
  constraint_note?: string
  example?: string
  completion?: string
}

interface Props {
  completedSkillArea?: string
  category: string
  categoryLabel: string
  tasksCompletedToday: number
  onStartTask: (task: Task, mode: 'screen' | 'speak' | 'listen') => void
  onDoneForNow: () => void
}

export function WhatsNext({ completedSkillArea, category, categoryLabel, tasksCompletedToday, onStartTask, onDoneForNow }: Props) {
  const [nextTask, setNextTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ tasks: Task[] }>(`/tasks?category=${category}`)
      .then(d => {
        const tasks = d.tasks || []
        // Pick a random task (simple for now)
        if (tasks.length) setNextTask(tasks[Math.floor(Math.random() * tasks.length)])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Congrats */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: tasksCompletedToday }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-accent-green" />
            ))}
          </div>
          <p className="text-text-primary text-xl font-semibold mb-1">Nice work.</p>
          <p className="text-text-secondary text-sm">
            {completedSkillArea
              ? `You just practiced ${completedSkillArea.replace(/_/g, ' ')}.`
              : `That's ${tasksCompletedToday} today.`}
          </p>
        </div>

        {/* Next task suggestion */}
        {loading ? (
          <p className="text-text-secondary/50 text-sm text-center">Finding next task...</p>
        ) : nextTask ? (
          <div className="bg-bg-surface border border-border rounded-xl p-5 mb-6">
            <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">
              Keep going — {categoryLabel}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-text-secondary/50 text-xs">{nextTask.skill_area?.replace(/_/g, ' ')}</span>
              <span className="text-text-secondary/30 text-xs">· {nextTask.time_minutes}min</span>
            </div>
            <p className="text-text-primary text-sm leading-relaxed mb-4">{nextTask.action || nextTask.description}</p>

            <div className="flex gap-2">
              <button onClick={() => onStartTask(nextTask, 'screen')}
                className="flex-1 py-2.5 bg-accent-amber text-bg-primary font-semibold rounded-xl text-sm">
                Let's do it
              </button>
              <button onClick={() => onStartTask(nextTask, 'speak')}
                className="py-2.5 px-3 bg-bg-primary border border-accent-amber/40 text-accent-amber rounded-xl text-sm">
                🗣
              </button>
              <button onClick={() => onStartTask(nextTask, 'listen')}
                className="py-2.5 px-3 bg-bg-primary border border-border text-text-secondary rounded-xl text-sm">
                🎧
              </button>
            </div>
          </div>
        ) : null}

        {/* Done for now */}
        <button onClick={onDoneForNow}
          className="w-full text-text-secondary/50 text-sm hover:text-text-secondary transition-colors text-center py-2">
          I'm done for now
        </button>
      </div>
    </div>
  )
}
