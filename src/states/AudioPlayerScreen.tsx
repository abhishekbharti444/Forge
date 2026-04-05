import { useState, useEffect, useRef } from 'react'
import { generateScript, type AudioMode } from '../lib/speechEngine'
import { SpeechPlayer } from '../lib/speechPlayer'

interface Props {
  task: {
    description: string; time_minutes: number; skill_area?: string
    action?: string; context?: string; constraint_note?: string; example?: string
    reference?: { type: string; [key: string]: any }
  }
  mode: AudioMode
  onDone: () => void
  onHome: () => void
}

export function AudioPlayerScreen({ task, mode, onDone, onHome }: Props) {
  const playerRef = useRef<SpeechPlayer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [currentText, setCurrentText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const script = generateScript(task, mode)
    const player = new SpeechPlayer()
    player.load(script)
    player.onProgress = (i, total) => {
      setProgress({ current: i, total })
      setCurrentText(script[i]?.text || '')
    }
    player.onComplete = () => { setDone(true); setPlaying(false) }
    playerRef.current = player
    return () => player.stop()
  }, [task, mode])

  function togglePlay() {
    const p = playerRef.current
    if (!p) return
    if (playing) { p.pause(); setPlaying(false) }
    else { p.play(); setPlaying(true) }
  }

  function next() { playerRef.current?.next() }

  const pct = progress.total > 0 ? ((progress.current + 1) / progress.total) * 100 : 0

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col px-6 py-8 max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => { playerRef.current?.stop(); onHome() }} className="text-text-secondary/40 text-xs hover:text-text-secondary transition-colors">← Home</button>
        <div className="text-text-secondary/40 text-xs flex gap-2">
          {task.skill_area && <span>{task.skill_area.replace('_', ' ')}</span>}
          <span>· {mode === 'speak' ? '🗣 Speak' : '🎧 Listen'}</span>
        </div>
      </div>

      {/* Task action */}
      <p className="text-text-primary text-lg leading-relaxed text-center mb-8">
        {task.action || task.description}
      </p>

      {/* Current utterance */}
      <div className="flex-1 flex items-center justify-center">
        {done ? (
          <div className="text-center">
            <p className="text-accent-green text-xl font-semibold mb-2">Done!</p>
            <p className="text-text-secondary text-sm">Session complete.</p>
          </div>
        ) : (
          <p className="text-text-secondary text-center text-sm leading-relaxed px-4 min-h-[3rem]">
            {currentText}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-bg-surface rounded-full overflow-hidden mb-6">
        <div className="h-full bg-accent-amber transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-accent-amber text-bg-primary flex items-center justify-center text-2xl font-bold hover:bg-accent-amber-hover transition-colors">
          {playing ? '⏸' : '▶'}
        </button>
        {!done && (
          <button onClick={next}
            className="w-12 h-12 rounded-full bg-bg-surface border border-border text-text-secondary flex items-center justify-center text-lg hover:border-text-secondary/30 transition-colors">
            ⏭
          </button>
        )}
      </div>

      {/* Done button */}
      {done && (
        <button onClick={onDone}
          className="w-full py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl hover:bg-accent-amber-hover transition-colors">
          Finish
        </button>
      )}
    </div>
  )
}
