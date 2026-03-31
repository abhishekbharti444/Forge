interface Props {
  count: number
  onOneMore: () => void
}

export function DoneForToday({ count, onOneMore }: Props) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-text-primary text-2xl font-semibold mb-2">
          You've done {count} task{count !== 1 ? 's' : ''} today.
        </p>
        <p className="text-text-secondary mb-8">
          That's real progress. Come back tomorrow.
        </p>

        {/* Sage green completion dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-accent-green" />
          ))}
        </div>

        <button
          onClick={onOneMore}
          className="text-text-secondary/50 text-sm hover:text-text-secondary transition-colors"
        >
          One more
        </button>
      </div>
    </div>
  )
}
