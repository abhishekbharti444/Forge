import { useState } from 'react'

const CATEGORIES = [
  { id: 'learn_kannada', label: 'Learn Kannada', emoji: '🇮🇳', desc: 'Script, vocabulary, phrases, grammar' },
  { id: 'guitar_practice', label: 'Guitar Practice', emoji: '🎸', desc: 'Chords, scales, rhythm, songs' },
  { id: 'public_speaking', label: 'Public Speaking', emoji: '🗣', desc: 'Clarity, storytelling, presence, persuasion' },
  { id: 'philosophy', label: 'Philosophy', emoji: '📖', desc: 'Ethics, logic, thought experiments, wisdom' },
  { id: 'distributed_systems', label: 'Distributed Systems', emoji: '📡', desc: 'Consensus, replication, fault tolerance' },
]

interface Props {
  onGoalSet: () => void
}

export function IntentCapture({ onGoalSet }: Props) {
  const existing = JSON.parse(localStorage.getItem('activeGoals') || '[]')
  const [selected, setSelected] = useState<string[]>(existing.length ? existing : [])

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  function save() {
    localStorage.setItem('activeGoals', JSON.stringify(selected))
    onGoalSet()
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-text-primary mb-2 leading-snug">
          What do you want to get better at?
        </h1>
        <p className="text-text-secondary text-sm mb-10">
          Pick one or more — you can change these anytime.
        </p>

        <div className="space-y-3 mb-8">
          {CATEGORIES.map(cat => {
            const active = selected.includes(cat.id)
            return (
              <button key={cat.id} onClick={() => toggle(cat.id)}
                className={`w-full py-4 px-5 bg-bg-surface border rounded-xl text-left transition-colors ${active ? 'border-accent-amber bg-accent-amber/5' : 'border-border'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <div className="flex-1">
                    <p className="text-text-primary font-medium">{cat.label}</p>
                    <p className="text-text-secondary text-xs mt-0.5">{cat.desc}</p>
                  </div>
                  {active && <span className="text-accent-amber text-sm">✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        <button onClick={save} disabled={selected.length === 0}
          className="w-full py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl disabled:opacity-30 transition-colors">
          {selected.length === 0 ? 'Pick at least one' : `Start with ${selected.length} goal${selected.length > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}
