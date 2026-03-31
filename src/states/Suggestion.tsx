import { useState } from 'react'

interface Props {
  task: { task_id: string; description: string }
  onLetsGo: () => void
  onSkip: (reason: string) => void
  tasksCompletedToday: number
}

export function Suggestion({ task, onLetsGo, onSkip, tasksCompletedToday }: Props) {
  const [showReasons, setShowReasons] = useState(false)

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-between px-6 py-8">
      {/* Momentum - top */}
      <div className="h-6">
        {tasksCompletedToday > 0 && (
          <p className="text-text-secondary/50 text-xs tracking-wide">
            🔥 {tasksCompletedToday} task{tasksCompletedToday !== 1 ? 's' : ''} today
          </p>
        )}
      </div>

      {/* Task - center */}
      <div className="w-full max-w-md flex-1 flex items-center">
        <p className="text-text-primary text-lg leading-[1.7] text-center">
          {task.description}
        </p>
      </div>

      {/* Actions - bottom */}
      <div className="w-full max-w-md">
        <button
          onClick={onLetsGo}
          className="w-full py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl hover:bg-accent-amber-hover transition-colors mb-4"
        >
          Let's go
        </button>

        {!showReasons ? (
          <button
            onClick={() => setShowReasons(true)}
            className="w-full text-text-secondary/60 text-sm hover:text-text-secondary transition-colors py-2"
          >
            Not the right moment
          </button>
        ) : (
          <div className="space-y-2 animate-in fade-in">
            {[
              { reason: 'too_long', label: 'Too long right now' },
              { reason: 'wrong_type', label: 'Not in the mood for this type' },
              { reason: 'too_easy', label: 'Already know this' },
            ].map(({ reason, label }) => (
              <button
                key={reason}
                onClick={() => { setShowReasons(false); onSkip(reason) }}
                className="w-full py-2.5 px-4 bg-bg-surface border border-border rounded-xl text-text-secondary text-sm hover:border-text-secondary/30 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
