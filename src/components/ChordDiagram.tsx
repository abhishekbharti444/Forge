// SVG chord diagram — no external dependencies
// Renders a 6-string, 5-fret grid with finger dots, muted/open string markers

interface ChordDiagramProps {
  name: string
  // Fret positions per string (6th to 1st): -1=muted, 0=open, 1-12=fret
  frets: number[]
  // Optional finger numbers per string (0=none, 1-4=finger)
  fingers?: number[]
  // Optional barre indicator
  barre?: { fret: number; from: number; to: number }
}

const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e']

export function ChordDiagramSVG({ name, frets, fingers, barre }: ChordDiagramProps) {
  const minFret = Math.min(...frets.filter(f => f > 0))
  const maxFret = Math.max(...frets.filter(f => f > 0))
  const startFret = maxFret <= 5 ? 1 : minFret
  const showNut = startFret === 1

  const W = 120, H = 150
  const padL = 20, padR = 10, padT = 24, padB = 16
  const gridW = W - padL - padR
  const gridH = H - padT - padB
  const stringGap = gridW / 5
  const fretGap = gridH / 5

  const sx = (s: number) => padL + s * stringGap
  const fy = (f: number) => padT + (f - startFret + 1) * fretGap

  return (
    <div className="flex flex-col items-center">
      <p className="text-text-primary text-sm font-semibold mb-1">{name}</p>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="text-text-primary">
        {/* Nut or fret number */}
        {showNut ? (
          <rect x={padL - 1} y={padT - 2} width={gridW + 2} height={3} rx={1} fill="currentColor" />
        ) : (
          <text x={padL - 14} y={padT + fretGap / 2 + 4} fontSize="9" fill="currentColor" textAnchor="middle" opacity={0.5}>{startFret}</text>
        )}

        {/* Fret lines */}
        {[0, 1, 2, 3, 4, 5].map(f => (
          <line key={f} x1={padL} y1={padT + f * fretGap} x2={padL + gridW} y2={padT + f * fretGap}
            stroke="currentColor" strokeWidth={f === 0 && !showNut ? 1 : 0.5} opacity={0.3} />
        ))}

        {/* Strings */}
        {[0, 1, 2, 3, 4, 5].map(s => (
          <line key={s} x1={sx(s)} y1={padT} x2={sx(s)} y2={padT + gridH}
            stroke="currentColor" strokeWidth={0.8} opacity={0.3} />
        ))}

        {/* Barre */}
        {barre && (
          <rect x={Math.min(sx(barre.from), sx(barre.to)) - 4} y={fy(barre.fret) - fretGap / 2 - 4}
            width={Math.abs(sx(barre.from) - sx(barre.to)) + 8} height={8} rx={4}
            fill="#d4a843" opacity={0.8} />
        )}

        {/* Finger dots */}
        {frets.map((f, s) => {
          if (f <= 0) return null
          return (
            <g key={s}>
              <circle cx={sx(s)} cy={fy(f) - fretGap / 2} r={6} fill="#d4a843" />
              {fingers?.[s] && (
                <text x={sx(s)} y={fy(f) - fretGap / 2 + 3.5} fontSize="8" fill="#1a1a1a"
                  textAnchor="middle" fontWeight="bold">{fingers[s]}</text>
              )}
            </g>
          )
        })}

        {/* Open / muted markers above nut */}
        {frets.map((f, s) => {
          if (f === 0) return <text key={s} x={sx(s)} y={padT - 7} fontSize="10" fill="currentColor" textAnchor="middle" opacity={0.5}>○</text>
          if (f === -1) return <text key={s} x={sx(s)} y={padT - 7} fontSize="10" fill="currentColor" textAnchor="middle" opacity={0.3}>✕</text>
          return null
        })}

        {/* String names at bottom */}
        {STRING_NAMES.map((n, s) => (
          <text key={s} x={sx(s)} y={H - 2} fontSize="8" fill="currentColor" textAnchor="middle" opacity={0.3}>{n}</text>
        ))}
      </svg>
    </div>
  )
}

// Parse "x32000" notation into frets array
export function parseChordNotation(notation: string): number[] {
  return notation.split('').map(c => c === 'x' || c === 'X' ? -1 : parseInt(c, 10))
}

// Common chord library — name → { frets, fingers }
const CHORD_DB: Record<string, { frets: number[]; fingers?: number[]; barre?: { fret: number; from: number; to: number } }> = {
  // Open chords
  'C':     { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'D':     { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'E':     { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'G':     { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'A':     { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Am':    { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'Em':    { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'Dm':    { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  // 7th chords
  'A7':    { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  'B7':    { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  'C7':    { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  'D7':    { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'E7':    { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'G7':    { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  // Major 7th
  'Cmaj7': { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'Amaj7': { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  'Dmaj7': { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
  'Emaj7': { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
  'Gmaj7': { frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },
  // Minor 7th
  'Am7':   { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  'Dm7':   { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  'Em7':   { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
  // Barre chords
  'F':     { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 0, to: 5 } },
  'Bm':    { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, from: 1, to: 5 } },
  // Sus chords
  'Asus2': { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
  'Asus4': { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Dsus2': { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
  'Dsus4': { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  'A7sus4':{ frets: [-1, 0, 2, 0, 3, 0], fingers: [0, 0, 1, 0, 3, 0] },
  // Add9 chords
  'Cadd9': { frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0] },
  'Gadd9': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  // Flat/sharp root chords
  'Ab':    { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 4, from: 0, to: 5 } },
  'Bb':    { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, from: 1, to: 5 } },
  'Db':    { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 3, 3, 3, 1], barre: { fret: 4, from: 1, to: 5 } },
  'Eb':    { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
  'B':     { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, from: 1, to: 5 } },
  // Minor barre/open
  'F#m':   { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 2, from: 0, to: 5 } },
  'Gm':    { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, from: 0, to: 5 } },
  'Cm':    { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, from: 1, to: 5 } },
  'C#m':   { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 4, from: 1, to: 5 } },
  'C#sus2':{ frets: [-1, 4, 6, 6, 4, 4], fingers: [0, 1, 3, 4, 1, 1], barre: { fret: 4, from: 1, to: 5 } },
  // Diminished / augmented
  'Bdim':  { frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0] },
  'F#dim': { frets: [-1, -1, 4, 5, 4, 2], fingers: [0, 0, 1, 3, 2, 1] },
  'Caug':  { frets: [-1, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
  // CAGED Am shapes (barre voicings)
  'Am_D':  { frets: [-1, -1, 7, 9, 10, 8], fingers: [0, 0, 1, 3, 4, 2] },
  'Am_C':  { frets: [-1, 12, 10, 12, 12, 12], fingers: [0, 3, 1, 4, 4, 4], barre: { fret: 12, from: 2, to: 5 } },
  'Am_A':  { frets: [-1, 12, 14, 14, 13, 12], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 12, from: 1, to: 5 } },
  'Am_G':  { frets: [2, 0, 2, 2, 1, 0], fingers: [2, 0, 3, 4, 1, 0] },
}

export function lookupChord(name: string) {
  return CHORD_DB[name] || null
}
