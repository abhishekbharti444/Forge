interface Props {
  count: number
  onOneMore: () => void
}

export function DoneForToday({ count, onOneMore }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-white text-2xl font-semibold mb-2">
          You've done {count} task{count !== 1 ? 's' : ''} today.
        </p>
        <p className="text-zinc-400 mb-10">That's real progress. Come back tomorrow.</p>

        <button
          onClick={onOneMore}
          className="text-zinc-600 text-sm hover:text-zinc-400 transition"
        >
          One more
        </button>
      </div>
    </div>
  )
}
