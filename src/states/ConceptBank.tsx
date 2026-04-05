import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

interface ConceptGroup {
  skill_area: string
  concepts: string[]
}

interface Props {
  onBack: () => void
}

export function ConceptBank({ onBack }: Props) {
  const [groups, setGroups] = useState<ConceptGroup[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ groups: ConceptGroup[]; total: number }>('/concepts')
      .then(d => { setGroups(d.groups); setTotal(d.total); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading concepts...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold text-text-primary">Concept Bank</h1>
        <button onClick={onBack} className="text-text-secondary text-sm">← Back</button>
      </div>
      <p className="text-text-secondary/50 text-xs mb-8">
        {total > 0 ? `${total} concepts encountered` : 'Complete tasks to discover concepts'}
      </p>

      {total === 0 ? (
        <div className="text-center mt-20">
          <p className="text-text-primary text-lg mb-2">No concepts yet</p>
          <p className="text-text-secondary text-sm">Complete philosophy tasks and the concepts you encounter will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(g => (
            <div key={g.skill_area}>
              <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-3">
                {g.skill_area.replace(/_/g, ' ')}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.concepts.map(c => (
                  <span key={c} className="px-2.5 py-1 bg-bg-surface border border-border rounded-lg text-text-primary text-xs">
                    {c.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
