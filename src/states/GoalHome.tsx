import { useState, useEffect } from 'react'
import { getWeeklyMomentum } from '../lib/momentum'
import { apiFetch } from '../lib/api'

interface GoalInfo { id: string; emoji: string; label: string; count: number }

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning.'
  if (h < 17) return 'Good afternoon.'
  return 'Good evening.'
}

interface Props {
  tasksCompletedToday: number
  onPractice: (category: string) => void
  onHistory: () => void
  onEditGoals: () => void
}

export function GoalHome({ tasksCompletedToday, onPractice, onHistory, onEditGoals }: Props) {
  const [allGoals, setAllGoals] = useState<GoalInfo[]>([])

  useEffect(() => {
    apiFetch<{ categories: GoalInfo[] }>('/categories')
      .then(d => setAllGoals(d.categories || []))
      .catch(() => {})
  }, [])

  const activeIds: string[] = JSON.parse(localStorage.getItem('activeGoals') || '[]')
  const active = allGoals.filter(g => activeIds.includes(g.id))
  const inactive = allGoals.filter(g => !activeIds.includes(g.id))
  const momentum = getWeeklyMomentum()
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  // Align to start from 6 days ago's day-of-week
  const startDay = new Date(Date.now() - 6 * 86400000).getDay()
  const orderedLabels = Array.from({ length: 7 }, (_, i) => dayLabels[(startDay + i) % 7])

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-10 max-w-md mx-auto overflow-y-auto">
      {/* Greeting */}
      <p className="text-text-primary text-2xl font-semibold mb-1">{greeting()}</p>
      <p className="text-text-secondary text-sm mb-6">
        {tasksCompletedToday === 0
          ? 'Ready for a quick session?'
          : `${tasksCompletedToday} task${tasksCompletedToday > 1 ? 's' : ''} done today. Keep going?`}
      </p>

      {/* Weekly momentum */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-3 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${momentum.activeDays >= 5 ? 'text-accent-green' : momentum.activeDays >= 3 ? 'text-accent-amber' : 'text-text-secondary'}`}>
            {momentum.level}
          </span>
          <span className="text-text-secondary/40 text-xs">{momentum.totalTasks} task{momentum.totalTasks !== 1 ? 's' : ''} this week</span>
        </div>
        <div className="flex items-center gap-2">
          {momentum.days.map((active, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-2 rounded-full ${active ? 'bg-accent-green' : 'bg-border'}`} />
              <span className="text-text-secondary/30 text-[10px]">{orderedLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active goals */}
      {active.length > 0 && (
        <>
          <p className="text-text-secondary/50 text-xs uppercase tracking-wide mb-3">Your goals</p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {active.map(g => (
              <button key={g.id} onClick={() => onPractice(g.id)}
                className="bg-bg-surface border border-border rounded-xl px-4 py-5 text-center hover:border-accent-amber/40 transition-colors">
                <span className="text-3xl block mb-2">{g.emoji}</span>
                <p className="text-text-primary text-sm font-medium">{g.label}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Explore more — not yet selected */}
      {inactive.length > 0 && (
        <>
          <p className="text-text-secondary/50 text-xs uppercase tracking-wide mb-3">Explore more</p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {inactive.map(g => (
              <button key={g.id} onClick={() => {
                localStorage.setItem('activeGoals', JSON.stringify([...activeIds, g.id]))
                onPractice(g.id)
              }}
                className="bg-bg-surface/50 border border-border/50 border-dashed rounded-xl px-4 py-5 text-center hover:border-text-secondary/30 transition-colors">
                <span className="text-3xl block mb-2 opacity-50">{g.emoji}</span>
                <p className="text-text-secondary text-sm">{g.label}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Footer links */}
      <div className="flex items-center justify-center gap-6 pb-6">
        <button onClick={onHistory} className="text-text-secondary/40 text-xs hover:text-text-secondary transition-colors">
          History
        </button>
        <button onClick={onEditGoals} className="text-text-secondary/40 text-xs hover:text-text-secondary transition-colors">
          Edit goals
        </button>
      </div>
    </div>
  )
}
