// SVG scale diagram — same visual style as ChordDiagram
// Vertical: strings left-right, frets top-down
// Gold filled = root, gold outline = scale note

interface FretDot {
  string: number  // 1-6 (1=high e, 6=low E)
  fret: number
  label?: string
  color?: 'root' | 'chord' | 'scale' | 'accent'
}

interface ScaleShape {
  dots: FretDot[]
  startFret: number
  endFret: number
  title: string
}

// Pentatonic box patterns: [string, fretOffset, isRoot][]
// Verified against Am pentatonic (A,C,D,E,G) from first principles
// Offset is relative to BOX_OFFSETS[box] for the given root note
const PENTA_BOXES: Record<string, [number, number, boolean][]> = {
  '1': [
    [6,0,true],[6,3,false],[5,0,false],[5,2,false],[4,0,false],[4,2,true],
    [3,0,false],[3,2,false],[2,0,false],[2,3,false],[1,0,true],[1,3,false],
  ],
  '2': [
    [6,1,false],[6,3,false],[5,0,false],[5,3,false],[4,0,true],[4,3,false],
    [3,0,false],[3,2,false],[2,1,false],[2,3,true],[1,1,false],[1,3,false],
  ],
  '3': [
    [6,1,false],[6,3,false],[5,1,false],[5,3,true],[4,1,false],[4,3,false],
    [3,0,false],[3,3,false],[2,1,true],[2,4,false],[1,1,false],[1,3,false],
  ],
  '4': [
    [6,0,false],[6,3,false],[5,0,true],[5,3,false],[4,0,false],[4,2,false],
    [3,0,false],[3,2,true],[2,1,false],[2,3,false],[1,0,false],[1,3,false],
  ],
  '5': [
    [6,1,false],[6,3,true],[5,1,false],[5,3,false],[4,0,false],[4,3,false],
    [3,0,true],[3,3,false],[2,1,false],[2,3,false],[1,1,false],[1,3,true],
  ],
}

const NOTE_FRETS: Record<string, number> = {
  'E': 0, 'F': 1, 'F#': 2, 'Gb': 2, 'G': 3, 'G#': 4, 'Ab': 4,
  'A': 5, 'A#': 6, 'Bb': 6, 'B': 7, 'C': 8, 'C#': 9, 'Db': 9,
  'D': 10, 'D#': 11, 'Eb': 11,
}

const BOX_OFFSETS: Record<string, number> = { '1': 0, '2': 2, '3': 4, '4': 7, '5': -3 }

export function lookupScale(name: string): ScaleShape | null {
  const m = name.match(/^([A-G][#b]?)m?\s*pentatonic\s*(\d)$/i)
  if (!m) return null
  const [, note, box] = m
  const pattern = PENTA_BOXES[box]
  if (!pattern) return null
  const rootFret = NOTE_FRETS[note]
  if (rootFret === undefined) return null

  const offset = rootFret + (BOX_OFFSETS[box] ?? 0)
  const dots: FretDot[] = pattern.map(([s, f, isRoot]) => ({
    string: s, fret: offset + f, color: isRoot ? 'root' as const : 'scale' as const,
  }))
  const frets = dots.map(d => d.fret)
  return {
    dots,
    startFret: Math.max(0, Math.min(...frets) - 1),
    endFret: Math.max(...frets) + 1,
    title: `${note}m Pentatonic — Box ${box}`,
  }
}

const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e']

interface FretboardDiagramProps {
  dots?: FretDot[]
  startFret?: number
  endFret?: number
  title?: string
  scale?: string
  scales?: string[]  // multiple scales overlaid — shared notes highlighted
}

function mergeScales(scaleNames: string[]): ScaleShape | null {
  const shapes = scaleNames.map(lookupScale).filter(Boolean) as ScaleShape[]
  if (shapes.length < 2) return shapes[0] ?? null

  // Build a map of string+fret → which shapes contain it
  const dotMap = new Map<string, { dot: FretDot; count: number }>()
  for (const shape of shapes) {
    for (const d of shape.dots) {
      const key = `${d.string}-${d.fret}`
      const existing = dotMap.get(key)
      if (existing) {
        existing.count++
        if (d.color === 'root') existing.dot.color = 'root'
      } else {
        dotMap.set(key, { dot: { ...d }, count: 1 })
      }
    }
  }

  // Shared notes = accent (gold filled), single-shape notes = scale (hollow)
  const dots: FretDot[] = []
  for (const { dot, count } of dotMap.values()) {
    if (dot.color === 'root') {
      dots.push(dot) // roots stay root
    } else if (count > 1) {
      dots.push({ ...dot, color: 'accent' }) // shared = accent
    } else {
      dots.push(dot) // single-shape = scale (hollow)
    }
  }

  const frets = dots.map(d => d.fret)
  return {
    dots,
    startFret: Math.max(0, Math.min(...frets) - 1),
    endFret: Math.max(...frets) + 1,
    title: shapes.map(s => s.title).join(' + '),
  }
}

export function FretboardDiagram({ dots: dotsProp, startFret, endFret, title, scale, scales }: FretboardDiagramProps) {
  const looked = scales?.length ? mergeScales(scales) : scale ? lookupScale(scale) : null
  const dots = dotsProp ?? looked?.dots ?? []
  const titleFinal = title ?? looked?.title
  if (!dots.length) return null

  const fretNums = dots.map(d => d.fret).filter(f => f > 0)
  const sf = startFret ?? looked?.startFret ?? Math.max(0, Math.min(...fretNums) - 1)
  const ef = endFret ?? looked?.endFret ?? Math.max(...fretNums) + 1
  const numFrets = ef - sf
  const showNut = sf === 0

  // Dynamic width: fixed spacing per fret, scrollable when wide
  const padL = 34, padR = 8, padT = 28, padB = 6
  const stringGap = 18
  const gridW = 5 * stringGap
  const fretGap = 28
  const gridH = numFrets * fretGap
  const W = padL + gridW + padR
  const H = padT + gridH + padB

  // String x: index 0=low E (left) to 5=high e (right)
  const sx = (s: number) => padL + (6 - s) * stringGap
  // Fret y: dot sits in middle of fret space
  const fy = (f: number) => padT + (f - sf - 0.5) * fretGap

  return (
    <div className="flex flex-col items-center my-3">
      {titleFinal && <p className="text-text-secondary text-xs mb-1">{titleFinal}</p>}
      <div className="overflow-x-auto w-full flex justify-center">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="text-text-primary" style={{ minWidth: W }}>
        {/* Nut or fret number */}
        {showNut && (
          <rect x={padL - 1} y={padT - 2} width={gridW + 2} height={3} rx={1} fill="currentColor" />
        )}

        {/* Fret numbers — on the fret line, skip 0 (nut is obvious) */}
        {Array.from({ length: numFrets + 1 }, (_, i) => sf + i).filter(f => f > 0).map(f => (
          <text key={`fn${f}`} x={padL - 8} y={padT + (f - sf) * fretGap + 3} fontSize="8" fill="currentColor"
            textAnchor="end" opacity={0.4}>{f}</text>
        ))}

        {/* Fret lines (horizontal) */}
        {Array.from({ length: numFrets + 1 }, (_, i) => i).map(i => (
          <line key={`f${i}`} x1={padL} y1={padT + i * fretGap} x2={padL + gridW} y2={padT + i * fretGap}
            stroke="currentColor" strokeWidth={i === 0 && !showNut ? 1 : 0.5} opacity={0.3} />
        ))}

        {/* Strings (vertical) */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line key={`s${i}`} x1={padL + i * stringGap} y1={padT} x2={padL + i * stringGap} y2={padT + gridH}
            stroke="currentColor" strokeWidth={0.8} opacity={0.3} />
        ))}

        {/* Open string markers above nut */}
        {showNut && dots.filter(d => d.fret === 0).map((d, i) => {
          const isRoot = d.color === 'root'
          const cx = sx(d.string)
          return isRoot
            ? <circle key={`o${i}`} cx={cx} cy={padT - 8} r={5} fill="#d4a843" />
            : <circle key={`o${i}`} cx={cx} cy={padT - 8} r={5} fill="none" stroke="#d4a843" strokeWidth={1.5} />
        })}

        {/* Fretted dots */}
        {dots.filter(d => d.fret > sf).map((d, i) => {
          const cx = sx(d.string)
          const cy = fy(d.fret)
          const isRoot = d.color === 'root'
          const isChord = d.color === 'chord'
          const isAccent = d.color === 'accent'

          return (
            <g key={`d${i}`}>
              {isRoot ? (
                <circle cx={cx} cy={cy} r={6} fill="#d4a843" />
              ) : isAccent ? (
                <circle cx={cx} cy={cy} r={6} fill="#d4a843" opacity={0.6} />
              ) : isChord ? (
                <circle cx={cx} cy={cy} r={6} fill="#d4a843" opacity={0.5} />
              ) : (
                <circle cx={cx} cy={cy} r={6} fill="none" stroke="#d4a843" strokeWidth={1.5} />
              )}
              {d.label && (
                <text x={cx} y={cy + 3} fontSize="7" fill={isRoot ? '#1a1a1a' : '#d4a843'}
                  textAnchor="middle" fontWeight="bold">{d.label}</text>
              )}
            </g>
          )
        })}

        {/* String names at top */}
        {STRING_NAMES.map((n, i) => (
          <text key={`sn${i}`} x={padL + i * stringGap} y={padT - 18} fontSize="8" fill="currentColor"
            textAnchor="middle" opacity={0.4}>{n}</text>
        ))}
      </svg>
      </div>
    </div>
  )
}
