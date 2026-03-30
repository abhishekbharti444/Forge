interface Props {
  task: { description: string; time_minutes: number }
  onDone: () => void
}

export function Focused({ task, onDone }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="text-zinc-600 text-sm mb-6">This usually takes about {task.time_minutes} minutes</p>
        <p className="text-white text-lg leading-relaxed mb-12">{task.description}</p>

        <button
          onClick={onDone}
          className="w-full py-3 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-200 transition"
        >
          I'm done
        </button>
      </div>
    </div>
  )
}
