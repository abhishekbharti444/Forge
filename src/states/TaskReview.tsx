import { useState, useEffect } from 'react'

interface Task {
  id: string
  goal_category: string
  skill_area: string
  type: string
  difficulty: string
  time_minutes: number
  description: string
  action?: string
  context?: string
  constraint_note?: string
  example?: string
}

export function TaskReview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [category, setCategory] = useState('creative_writing')
  const [skillFilter, setSkillFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10

  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/tasks?category=${category}`)
      .then(r => r.json())
      .then(d => setTasks(d.tasks))
  }, [category])

  const skillAreas = ['all', ...new Set(tasks.map(t => t.skill_area))]
  const filtered = skillFilter === 'all' ? tasks : tasks.filter(t => t.skill_area === skillFilter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function changeFilter(s: string) { setSkillFilter(s); setPage(0) }

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-text-primary mb-2">Task Review</h1>
      <p className="text-text-secondary text-sm mb-6">
        Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} tasks
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'creative_writing', label: 'Creative Writing' },
          { id: 'learn_kannada', label: 'Learn Kannada' },
          { id: 'public_speaking', label: 'Public Speaking' },
        ].map(c => (
          <button key={c.id} onClick={() => { setCategory(c.id); setSkillFilter('all'); setPage(0) }}
            className={`px-3 py-1.5 rounded-lg text-sm ${category === c.id ? 'bg-accent-amber text-bg-primary' : 'bg-bg-surface text-text-secondary'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {skillAreas.map(s => (
          <button key={s} onClick={() => changeFilter(s)}
            className={`px-2.5 py-1 rounded-lg text-xs ${skillFilter === s ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30' : 'bg-bg-surface text-text-secondary border border-border'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {paged.map(t => {
          const isOpen = expanded === t.id
          return (
          <div key={t.id} onClick={() => setExpanded(isOpen ? null : t.id)}
            className={`bg-bg-surface border rounded-xl p-4 cursor-pointer transition-colors ${isOpen ? 'border-accent-amber/40' : 'border-border hover:border-text-secondary/20'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-accent-amber">{t.skill_area}</span>
              <span className="text-xs text-text-secondary">{t.type} · {t.difficulty} · {t.time_minutes}min</span>
              <span className="text-xs text-text-secondary/40 ml-auto">{t.id}</span>
            </div>

            <p className={`text-text-primary leading-relaxed ${isOpen ? 'text-base font-medium mb-4' : 'text-sm'}`}>
              {t.action || t.description}
            </p>

            {isOpen && (
              <div className="space-y-4 mt-2 pt-4 border-t border-border">
                {t.constraint_note && (
                  <div>
                    <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">Constraint</p>
                    <p className="text-text-primary text-sm leading-relaxed">{t.constraint_note}</p>
                  </div>
                )}
                {t.context && (
                  <div>
                    <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">Why this matters</p>
                    <p className="text-text-secondary text-sm leading-relaxed">{t.context}</p>
                  </div>
                )}
                {t.example && (
                  <div>
                    <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">Example</p>
                    <div className="bg-bg-primary rounded-lg px-4 py-3">
                      <p className="text-text-primary text-sm leading-relaxed">{t.example}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">Original description</p>
                  <p className="text-text-secondary/60 text-xs leading-relaxed">{t.description}</p>
                </div>
              </div>
            )}
          </div>
        )})}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 mb-4">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-sm bg-bg-surface text-text-secondary disabled:opacity-30">
            ← Prev
          </button>
          <span className="text-text-secondary text-sm">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-bg-surface text-text-secondary disabled:opacity-30">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
