import { useState } from 'react'

interface Props {
  onComplete: (reflection?: string) => void
}

export function Completion({ onComplete }: Props) {
  const [reflection, setReflection] = useState('')

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-text-primary text-2xl font-semibold mb-2">Nice work.</p>
        <p className="text-text-secondary text-sm mb-8">What did you notice?</p>

        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Optional — jot a quick thought..."
          rows={3}
          className="w-full px-4 py-3.5 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-amber/50 transition-colors resize-none mb-4"
        />

        <button
          onClick={() => onComplete(reflection || undefined)}
          className="w-full py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl hover:bg-accent-amber-hover transition-colors"
        >
          {reflection.trim() ? 'Save & continue' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
