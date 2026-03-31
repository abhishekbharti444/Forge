import { useState } from 'react'

interface Props {
  token: string
  onGoalSet: () => void
}

export function IntentCapture({ token, onGoalSet }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const [available, setAvailable] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setUnsupported(false)

    const res = await fetch('/api/goals/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.supported) {
      onGoalSet()
    } else {
      setAvailable(data.available ?? [])
      setUnsupported(true)
    }
  }

  function handlePickCategory(category: string) {
    setText(category.replace('_', ' '))
    setUnsupported(false)
    fetch('/api/goals/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: category }),
    }).then(() => onGoalSet())
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-text-primary mb-2 leading-snug">
          What do you want to get better at?
        </h1>
        <p className="text-text-secondary text-sm mb-10">
          Type anything — we'll find the right tasks for you.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. creative writing, poetry, storytelling..."
            className="w-full px-4 py-3.5 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-amber/50 transition-colors mb-4"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl hover:bg-accent-amber-hover transition-colors disabled:opacity-40"
          >
            {loading ? '...' : "Let's go"}
          </button>
        </form>

        {unsupported && (
          <div className="mt-8 text-left">
            <p className="text-text-secondary text-sm mb-3">
              We don't support that yet — but we saved your interest. For now, pick one:
            </p>
            <div className="space-y-2">
              {available.map(cat => (
                <button
                  key={cat}
                  onClick={() => handlePickCategory(cat)}
                  className="w-full py-3 px-4 bg-bg-surface border border-border rounded-xl text-text-primary text-left hover:border-text-secondary/30 transition-colors capitalize"
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
