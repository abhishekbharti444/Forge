# Guitar Audio: Tone.js Integration Plan

> Created: April 12, 2026
> Status: Ready to start
> Context: TabPlayer can't handle melody rhythm. alphaTab has bundling issues. Tone.js is the right middle ground — runtime synthesis with full rhythm control, zero storage, lightweight.

---

## Problem

The "Hear it" feature for guitar songs needs:
1. Correct notes (string + fret → pitch)
2. Correct rhythm (variable note durations, rests between phrases)
3. Guitar-like sound
4. Simple, reliable playback

TabPlayer fails at #2 (fixed timing). alphaTab solves all 4 but has severe Vite bundling issues (workers, worklets, fonts). We need a simpler path.

## Solution: Tone.js

Tone.js is a Web Audio framework (~150KB) that handles synthesis, scheduling, and sequencing. It supports:
- `Tone.Sampler` — load guitar samples for realistic sound
- `Tone.Part` — schedule notes with exact timing and duration
- Transport control — play, pause, tempo, loop

### Note Data Format

Store notes as a JSON array in the task reference. Each note: `[string, fret, duration]`

```json
"notes": [
  ["e", 4, "8n"],
  ["e", 5, "8n"],
  ["e", 4, "8n"],
  ["e", 4, "4n"],
  ["e", 4, "8n"],
  [null, 0, "8n"],
  ["B", 7, "8n"],
  ["B", 5, "8n"],
  ["B", 4, "4n"]
]
```

- String: "e", "B", "G", "D", "A", "E" (or null for rest)
- Fret: 0-24
- Duration: Tone.js notation — "8n" (eighth), "4n" (quarter), "2n" (half), "16n" (sixteenth)

### String → MIDI mapping

Same as existing TabPlayer:
```
E2=40, A2=45, D3=50, G3=55, B3=59, e4=64
Note = base + fret
```

### Component: TonePlayer

Replaces TabPlayer for tasks with `notes` array in reference.

```
reference: {
  type: "text",
  mono: true,
  body: "... tab text for display ...",
  notes: [...],  // for Tone.js playback
  bpm: 103
}
```

- Tab text stays for visual display (monospace rendering)
- `notes` array drives audio playback
- Separation of display and playback — the root cause of all our parsing bugs

### Fallback

Tasks WITHOUT `notes` array keep using the existing TabPlayer (arpeggio patterns where fixed timing works fine). Only songs/melodies need the `notes` array.

## Implementation Steps

1. [ ] `npm install tone`
2. [ ] Create `TonePlayer.tsx` component
   - Load guitar samples (Tone.js has built-in or use Tonejs-Instruments)
   - Convert notes array to Tone.Part events
   - Play/pause with transport
   - Show note counter
3. [ ] Write Aadat melody in notes format (from the 5 screenshots)
4. [ ] Wire TonePlayer into Focused.tsx (render when `reference.notes` exists)
5. [ ] Test: does Aadat sound recognizable?
6. [ ] If yes → scale to more songs

## Cleanup Needed

Before starting, revert the alphaTab experiment:
- [ ] Remove `@coderline/alphatab` and `@coderline/alphatab-vite` from package.json
- [ ] Remove `AlphaTabPlayer.tsx`
- [ ] Remove alphaTab import from `Focused.tsx`
- [ ] Remove alphaTab plugin from `vite.config.ts`
- [ ] Remove `public/font/`, `public/soundfont/`, `public/alphaTab.worker.mjs`, `public/alphaTab.worklet.mjs`
- [ ] Revert TabPlayer column-spacing change (or keep if it helps arpeggios)

## Cost

$0. Tone.js is MIT licensed. Runs in browser. No server, no API, no storage.

## Future: FluidSynth Pre-gen as Backup

If Tone.js sound quality isn't sufficient, the same `notes` JSON format can drive a FluidSynth pipeline:
```
notes JSON → Python script → MIDI → FluidSynth + Guitar SoundFont → MP3
```
Same data, different rendering. Pre-generated MP3s stored in `public/audio/guitar/`.

---

*Created: April 12, 2026*
