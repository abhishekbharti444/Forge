import { useState } from 'react'

interface Props {
  onComplete: (reflection?: string) => void
}

export function Completion({ onComplete }: Props) {
  const [reflection, setReflection] = useState('')

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-white text-2xl font-semibold mb-2">Nice work.</p>
        <p className="text-zinc-500 text-sm mb-8">What did you notice?</p>

        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Optional — jot a quick thought..."
          rows={3}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 resize-none mb-4"
        />

        <button
          onClick={() => onComplete(reflection || undefined)}
          className="w-full py-3 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-200 transition mb-3"
        >
          {reflection.trim() ? 'Save & continue' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
