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
    // Re-submit with the category name
    fetch('/api/goals/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: category }),
    }).then(() => onGoalSet())
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-white mb-2">What do you want to get better at?</h1>
        <p className="text-zinc-500 mb-8 text-sm">Type anything — we'll find the right tasks for you.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. creative writing, poetry, storytelling..."
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 mb-4"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full py-3 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? '...' : "Let's go"}
          </button>
        </form>

        {unsupported && (
          <div className="mt-6 text-left">
            <p className="text-zinc-400 text-sm mb-3">
              We don't support that yet — but we saved your interest. For now, pick one:
            </p>
            <div className="space-y-2">
              {available.map(cat => (
                <button
                  key={cat}
                  onClick={() => handlePickCategory(cat)}
                  className="w-full py-2 px-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-left hover:border-zinc-600 transition"
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
