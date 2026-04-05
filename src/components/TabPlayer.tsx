import { useState, useRef, useCallback } from 'react'
import Soundfont from 'soundfont-player'

// --- Tab Parser ---

const STRING_MIDI: Record<string, number> = { 'E': 40, 'A': 45, 'D': 50, 'G': 55, 'B': 59, 'e': 64 }
const STRING_ORDER = ['e', 'B', 'G', 'D', 'A', 'E']
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function midiToNote(midi: number): string {
  return NOTE_NAMES[midi % 12] + (Math.floor(midi / 12) - 1)
}

interface NoteEvent {
  notes: string[]
  column: number
}

export function parseTab(text: string): NoteEvent[] {
  const lines = text.split('\n')

  // Find tab lines: starts with string label, then |
  const tabLines: { str: string; content: string }[] = []
  for (const line of lines) {
    const m = line.match(/^([eEBGDA])\|(.+)/)
    if (m) {
      // Normalize: uppercase E at position 0 vs lowercase e
      let str = m[1]
      // If 'E' appears and we already have an 'E' (low), this might be high e
      // Use position in the block: first E-like = high e if it's the first line
      if (str === 'E' && tabLines.length === 0) str = 'e' // first line = high e
      tabLines.push({ str, content: m[2] })
    }
  }

  if (tabLines.length === 0) return []

  // Parse each tab line into column → fret number
  const stringData: Map<string, Map<number, number>> = new Map()

  for (const { str, content } of tabLines) {
    const frets: Map<number, number> = new Map()
    let col = 0
    let i = 0
    while (i < content.length) {
      const ch = content[i]
      if (ch >= '0' && ch <= '9') {
        // Check for multi-digit fret
        let numStr = ch
        while (i + 1 < content.length && content[i + 1] >= '0' && content[i + 1] <= '9') {
          numStr += content[++i]
        }
        frets.set(col, parseInt(numStr))
      }
      // Skip non-numeric chars (dashes, pipes, h, p, b, etc.)
      col++
      i++
    }
    // Merge into existing string data (for multi-section tabs)
    const existing = stringData.get(str)
    if (existing) {
      const offset = Math.max(...existing.keys(), -1) + 2
      frets.forEach((fret, c) => existing.set(c + offset, fret))
    } else {
      stringData.set(str, frets)
    }
  }

  // Collect all columns that have at least one note
  const allCols = new Set<number>()
  stringData.forEach(frets => frets.forEach((_, col) => allCols.add(col)))
  const sortedCols = [...allCols].sort((a, b) => a - b)

  // Build note events
  const events: NoteEvent[] = []
  for (const col of sortedCols) {
    const notes: string[] = []
    for (const str of STRING_ORDER) {
      const frets = stringData.get(str)
      if (frets?.has(col)) {
        const fret = frets.get(col)!
        const midi = STRING_MIDI[str] + fret
        notes.push(midiToNote(midi))
      }
    }
    if (notes.length > 0) {
      events.push({ notes, column: col })
    }
  }

  return events
}

// --- TabPlayer Component ---

interface TabPlayerProps {
  tabText: string
  bpm?: number
}

export function TabPlayer({ tabText, bpm = 80 }: TabPlayerProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle')
  const [currentIdx, setCurrentIdx] = useState(-1)
  const playerRef = useRef<Soundfont.Player | null>(null)
  const acRef = useRef<AudioContext | null>(null)
  const stopRef = useRef(false)

  const play = useCallback(async () => {
    const events = parseTab(tabText)
    if (events.length === 0) return

    setState('loading')
    stopRef.current = false

    if (!acRef.current) acRef.current = new AudioContext()
    const ac = acRef.current
    if (ac.state === 'suspended') await ac.resume()

    if (!playerRef.current) {
      playerRef.current = await Soundfont.instrument(ac, 'acoustic_guitar_nylon')
    }
    const guitar = playerRef.current

    setState('playing')
    const beatDuration = 60 / bpm

    for (let i = 0; i < events.length; i++) {
      if (stopRef.current) break
      setCurrentIdx(i)
      for (const note of events[i].notes) {
        guitar.play(note, ac.currentTime, { duration: beatDuration * 0.9 })
      }
      await new Promise(r => setTimeout(r, beatDuration * 1000))
    }

    setCurrentIdx(-1)
    setState('idle')
  }, [tabText, bpm])

  const stop = useCallback(() => {
    stopRef.current = true
    playerRef.current?.stop()
    setCurrentIdx(-1)
    setState('idle')
  }, [])

  const events = parseTab(tabText)
  if (events.length === 0) return null

  return (
    <div className="flex items-center gap-3 mt-3">
      <button
        onClick={state === 'playing' ? stop : play}
        className={`px-4 py-2 rounded-xl text-sm font-semibold ${
          state === 'playing'
            ? 'bg-bg-surface border border-border text-text-secondary'
            : 'bg-accent-amber text-bg-primary'
        }`}
      >
        {state === 'loading' ? '⏳ Loading...' : state === 'playing' ? '⏹ Stop' : '▶ Hear it'}
      </button>
      {state === 'playing' && (
        <span className="text-text-secondary text-xs">{currentIdx + 1}/{events.length} notes</span>
      )}
      <span className="text-text-secondary/40 text-xs">{bpm} BPM</span>
    </div>
  )
}
