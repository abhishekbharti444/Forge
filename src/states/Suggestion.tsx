import { useState } from 'react'

interface Props {
  task: { task_id: string; description: string }
  onLetsGo: () => void
  onSkip: (reason: string) => void
  tasksCompletedToday: number
}

const MOMENTUM_LABELS: Record<number, string> = {
  0: '',
  1: '1 task today',
  2: '2 tasks today',
}

export function Suggestion({ task, onLetsGo, onSkip, tasksCompletedToday }: Props) {
  const [showReasons, setShowReasons] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      {tasksCompletedToday > 0 && (
        <p className="text-zinc-600 text-sm mb-8">🔥 {MOMENTUM_LABELS[tasksCompletedToday] ?? `${tasksCompletedToday} tasks today`}</p>
      )}

      <div className="w-full max-w-md">
        <p className="text-white text-lg leading-relaxed mb-10">{task.description}</p>

        <button
          onClick={onLetsGo}
          className="w-full py-3 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-200 transition mb-4"
        >
          Let's go
        </button>

        {!showReasons ? (
          <button
            onClick={() => setShowReasons(true)}
            className="w-full text-zinc-600 text-sm hover:text-zinc-400 transition"
          >
            Not the right moment
          </button>
        ) : (
          <div className="space-y-2 mt-2">
            <button onClick={() => onSkip('too_long')} className="w-full py-2 px-4 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-sm hover:border-zinc-600 transition">
              Too long right now
            </button>
            <button onClick={() => onSkip('wrong_type')} className="w-full py-2 px-4 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-sm hover:border-zinc-600 transition">
              Not in the mood for this type
            </button>
            <button onClick={() => onSkip('too_easy')} className="w-full py-2 px-4 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-sm hover:border-zinc-600 transition">
              Already know this
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
