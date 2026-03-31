interface Props {
  task: { description: string; time_minutes: number }
  onDone: () => void
}

export function Focused({ task, onDone }: Props) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-between px-6 py-8">
      {/* Time hint - top */}
      <p className="text-text-secondary/40 text-xs tracking-wide">
        This usually takes about {task.time_minutes} minutes
      </p>

      {/* Task - center */}
      <div className="w-full max-w-md flex-1 flex items-center">
        <p className="text-text-primary text-lg leading-[1.7] text-center">
          {task.description}
        </p>
      </div>

      {/* Done button - bottom */}
      <div className="w-full max-w-md">
        <button
          onClick={onDone}
          className="w-full py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl hover:bg-accent-amber-hover transition-colors"
        >
          I'm done
        </button>
      </div>
    </div>
  )
}
