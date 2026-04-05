import { useState, useEffect, useCallback, useRef } from 'react'

interface TimerProps {
  seconds: number
  onEnd?: () => void
}

export function Timer({ seconds, onEnd }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running || remaining <= 0) return
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(id); onEnd?.(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, remaining, onEnd])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const progress = 1 - remaining / seconds

  return (
    <div className="flex flex-col items-center gap-3">
      <p className={`text-4xl font-mono ${remaining === 0 ? 'text-accent-green' : 'text-text-primary'}`}>
        {mins}:{secs.toString().padStart(2, '0')}
      </p>
      <div className="w-full h-1 bg-bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-accent-amber transition-all duration-1000" style={{ width: `${progress * 100}%` }} />
      </div>
      {!running && remaining > 0 && (
        <button onClick={() => setRunning(true)} className="text-accent-amber text-sm">Start timer</button>
      )}
      {running && remaining > 0 && (
        <button onClick={() => setRunning(false)} className="text-text-secondary text-sm">Pause</button>
      )}
      {remaining === 0 && <p className="text-accent-green text-sm">Time's up!</p>}
    </div>
  )
}

interface TextInputProps {
  placeholder?: string
  onSubmit?: (text: string) => void
}

export function TextInput({ placeholder, onSubmit }: TextInputProps) {
  const [text, setText] = useState('')
  return (
    <div className="w-full">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder || 'Write here...'}
        rows={4}
        className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-amber/50 transition-colors resize-none text-sm"
      />
      {onSubmit && text.trim() && (
        <button onClick={() => onSubmit(text)} className="mt-2 text-accent-amber text-sm">Submit</button>
      )}
    </div>
  )
}

interface ChecklistProps {
  items: string[]
  onAllChecked?: () => void
}

export function Checklist({ items, onAllChecked }: ChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false))

  const toggle = useCallback((i: number) => {
    setChecked(prev => {
      const next = [...prev]
      next[i] = !next[i]
      if (next.every(Boolean)) onAllChecked?.()
      return next
    })
  }, [onAllChecked])

  return (
    <div className="w-full space-y-2">
      {items.map((item, i) => (
        <button key={i} onClick={() => toggle(i)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${checked[i] ? 'bg-accent-green/10 border border-accent-green/20' : 'bg-bg-surface border border-border'}`}>
          <span className={`w-5 h-5 rounded flex items-center justify-center text-xs ${checked[i] ? 'bg-accent-green text-bg-primary' : 'border border-text-secondary/30'}`}>
            {checked[i] ? '✓' : ''}
          </span>
          <span className={`text-sm ${checked[i] ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{item}</span>
        </button>
      ))}
    </div>
  )
}

interface MetronomeProps {
  bpm: number
}

export function Metronome({ bpm: initialBpm }: MetronomeProps) {
  const [bpm, setBpm] = useState(initialBpm)
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(false)
  const [speedTrainer, setSpeedTrainer] = useState(false)
  const [increments, setIncrements] = useState(0)
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number>(0)
  const nextNoteRef = useRef(0)
  const trainerRef = useRef<number>(0)

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    return ctxRef.current
  }

  function playClick(time: number) {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.setValueAtTime(0.3, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
    osc.start(time)
    osc.stop(time + 0.05)
  }

  function schedule() {
    const ctx = getCtx()
    while (nextNoteRef.current < ctx.currentTime + 0.1) {
      playClick(nextNoteRef.current)
      nextNoteRef.current += 60 / bpm
    }
    timerRef.current = window.setTimeout(schedule, 25)
  }

  function start() {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    nextNoteRef.current = ctx.currentTime
    setRunning(true)
    setIncrements(0)
    schedule()
    if (speedTrainer) startTrainer()
  }

  function stop() {
    clearTimeout(timerRef.current)
    clearInterval(trainerRef.current)
    setRunning(false)
  }

  function startTrainer() {
    clearInterval(trainerRef.current)
    trainerRef.current = window.setInterval(() => {
      setBpm(b => Math.min(b + 5, 220))
      setIncrements(i => i + 1)
    }, 30000)
  }

  // Visual pulse
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => { setBeat(true); setTimeout(() => setBeat(false), 80) }, 60000 / bpm)
    return () => clearInterval(id)
  }, [running, bpm])

  // Cleanup
  useEffect(() => () => { clearTimeout(timerRef.current); clearInterval(trainerRef.current); ctxRef.current?.close() }, [])

  // Restart scheduler when bpm changes while running
  useEffect(() => {
    if (!running) return
    clearTimeout(timerRef.current)
    const ctx = getCtx()
    nextNoteRef.current = ctx.currentTime
    schedule()
  }, [bpm])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-4 h-4 rounded-full transition-all duration-75 ${beat ? 'bg-accent-amber scale-125' : 'bg-border'}`} />
      <p className="text-3xl font-mono text-text-primary">{bpm} <span className="text-sm text-text-secondary">BPM</span></p>
      {speedTrainer && running && increments > 0 && (
        <p className="text-accent-green text-xs">+{increments * 5} BPM ({increments} increments)</p>
      )}
      <input type="range" min={40} max={220} value={bpm} onChange={e => setBpm(+e.target.value)}
        className="w-full accent-accent-amber" />
      <div className="flex gap-2">
        <button onClick={running ? stop : start}
          className={`px-6 py-2 rounded-xl text-sm font-semibold ${running ? 'bg-bg-surface border border-border text-text-secondary' : 'bg-accent-amber text-bg-primary'}`}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button onClick={() => { setSpeedTrainer(!speedTrainer); if (running && !speedTrainer) startTrainer(); if (running && speedTrainer) clearInterval(trainerRef.current) }}
          className={`px-4 py-2 rounded-xl text-xs ${speedTrainer ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'bg-bg-surface text-text-secondary border border-border'}`}>
          🏋 Speed +5
        </button>
      </div>
      {speedTrainer && !running && (
        <p className="text-text-secondary/50 text-xs">+5 BPM every 30 seconds</p>
      )}
    </div>
  )
}
