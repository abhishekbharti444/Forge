# Guitar Task Bank — Fix Plan

> Created: April 11, 2026
> Last updated: April 12, 2026
> Status: ✅ COMPLETE — All 5 workstreams shipped and verified end-to-end.
> Context: Full analysis of guitar tasks against Forge's core ideology. 219 → 235 tasks.

## Completion Summary (April 12, 2026)

All 5 workstreams complete:
1. **Fingerpicking Audio** — TabPlayer `subdivision` prop for correct timing, expanded 5 tabs to full progressions, wired through ReferenceRenderer → TextReference → TabPlayer. Also fixed `buildSteps()` not rendering text references for metronome tasks.
2. **Strumming Songs** — Already solved: `CHORD_DB` has all 13 chords, songs have `chords` array, `ChordReference` + `lookupChord()` renders diagrams.
3. **Level Sequencing** — All 235 tasks assigned levels (L1=83/38%, L2=93/42%, L3=43/20%). Engine gating verified.
4. **Retrieval Tasks** — 16 new tasks (6 scales_fretboard, 5 chords, 5 ear_training). All `needs_guitar: false`, `type: retrieval`, `structured_list` + `reveal_hide`.
5. **Reference Enrichment** — Tab added to 5 scale tasks, 26 missing context fields filled. Zero tasks missing context.

Files modified: `TabPlayer.tsx`, `ReferenceRenderer.tsx`, `Focused.tsx`, `TaskReview.tsx`, `guitar_practice.json`

---

## Summary

The guitar task bank is Forge's strongest dataset (per UX Audit) — 219 tasks, 6 skill areas, good action text, BPM metadata on 147 tasks, `needs_guitar` flag. But it's not leveraging Forge's composable task format or progression infrastructure. Five workstreams to fix it.

---

## Analysis Findings

### What's good
- 6 well-distributed skill areas (chords 50, scales 48, technique 36, fingerpicking 32, rhythm 28, ear training 25)
- Balanced difficulty (77 easy, 80 medium, 62 stretch)
- Every task has an `action` field — clear, specific instructions
- BPM range 40–122 across 147 tasks
- 21 away-from-guitar tasks (`needs_guitar: false`)
- Sprint 1 already shipped metadata-driven `buildSteps()`, quiz-first default, structured reflect prompts

### What's broken or missing
| Issue | Impact | Scope |
|---|---|---|
| TabPlayer timing is 6x too slow for fingerpicking | 5 songs play wrong | Code fix |
| Fingerpicking songs don't trigger TabPlayer | "Hear it" button never appears | Code + data fix |
| Fingerpicking tabs are 1 measure (3-5 seconds) | Too short to practice with | Data fix |
| Strumming songs have no chord diagrams | Beginners can't see finger positions | Data fix |
| No `level` field on any task | Beginners get stretch tasks (cold start risk) | Data fix |
| Zero retrieval tasks | Missing "practice ground" for guitar theory | New content |
| 115 tasks have no reference data | Selective enrichment needed for chord/scale tasks | Data fix |
| 26 tasks missing `context` field | No "why this matters" for those tasks | Data fix |

### Key ideology alignment
- **Guitar is "guided external"** — the app is the coach, not the practice ground. Exception: guitar theory (fretboard notes, chord ID, intervals) IS fully in-app.
- **Strumming audio synthesis is a trap** — high effort, mediocre result, violates "does it try to replace a tool that already exists better elsewhere?" Text coaching + metronome + chord diagrams is the right approach.
- **Fingerpicking audio via TabPlayer is viable** — arpeggio patterns sound good on Soundfont. The component works, just needs timing fix and data wiring.
- **Progressive BPM tracking** is the UX Audit's #1 guitar gap but requires infrastructure (server-side progress). Not in this plan — separate workstream.

---

## Workstream 1: Fingerpicking Audio (5 songs)

**Goal:** The 5 fingerpicking songs (gp-song-009, 013, 014, 020, 022) play correct-sounding arpeggios via TabPlayer.

### Task 1.1 — Analyze TabPlayer timing

Read `TabPlayer.tsx` → `parseTab()`. Document:
- How columns map to note events (each column with a digit = one event)
- Current timing: one event per `60/bpm` seconds (one note per beat)
- Actual timing needed per song:

| Song | BPM | Pattern | Notes/beat | Current spacing | Correct spacing |
|---|---|---|---|---|---|
| gp-song-009 (Phir Le Aya Dil) | 75 | p-i-m-a | ~5.5 events | 0.80s | ~0.15s |
| gp-song-013 (Someone Like You) | 68 | p-i-m-i | ~5.5 events | 0.88s | ~0.16s |
| gp-song-014 (Let Her Go) | 75 | arpeggio | ~10 events | 0.80s | ~0.08s |
| gp-song-020 (Nothing Else Matters) | 69 | p-i-m-a-m-i | 6 events | 0.87s | 0.145s |
| gp-song-022 (Hotel California) | 75 | p-i-m-a-m-i | ~4 events | 0.80s | ~0.20s |

### Task 1.2 — Design timing fix

Three options evaluated:

**Option A: Parse bar lines** — Count columns between `|` markers, derive measure duration from BPM + time signature, calculate proportional note spacing.
- Pro: No data changes needed, works automatically
- Con: Assumes consistent column spacing = consistent time, fragile with irregular tab formatting

**Option B: Add `notes_per_beat` to reference** — Each fingerpicking song specifies subdivision.
- Pro: Explicit, no parsing ambiguity
- Con: Extra data field, author must calculate it

**Option C: Add `beats` field** — Reference says "this tab covers N beats total." Spacing = `(beats * 60/bpm) / num_events`.
- Pro: Simple, intuitive ("this pattern is 2 beats long")
- Con: Extra data field

**Recommendation:** Option A as primary (parse bar lines), with Option C as fallback for tabs without bar lines. Bar-line parsing is the most robust because the tab notation already encodes rhythm through column positions.

### Task 1.3 — Implement timing fix

In `parseTab()`:
1. Detect `|` characters in tab lines
2. Count columns between first and second `|` = columns per measure
3. `measure_duration = time_signature_beats * (60 / bpm)` (default 4/4)
4. `note_spacing = measure_duration / columns_per_measure`
5. Each note event's timing = its column position × `note_spacing`

If no bar lines found, fall back to current behavior (1 note/beat) or use `beats` field if present.

Test: Nothing Else Matters at 69 BPM should produce a flowing p-i-m-a-m-i arpeggio (~0.145s between notes), not disconnected plonks 0.87s apart.

### Task 1.4 — Decide reference structure

Current: all songs use `reference.type = "text"` with `mono: true`. TabPlayer is never triggered.

**Decision needed:** How does the renderer know to show TabPlayer?

**Option A: New `tab` reference type**
```json
{ "type": "tab", "body": "e|---0---|...", "bpm": 69 }
```
- Clean dispatch in ReferenceRenderer
- But loses the text body (chord progression, strumming pattern) — would need two references

**Option B: Keep `type: "text"`, add `tab` field**
```json
{
  "type": "text",
  "body": "Progression:\n| Em | D | C | Em |\n...",
  "mono": true,
  "tab": "e|------0----|...\nB|----0---0--|..."
}
```
- ReferenceRenderer checks for `tab` field, renders TabPlayer below the text
- Text body still shows progression + pattern
- Minimal code change

**Option C: Composite reference**
```json
{
  "type": "composite",
  "sections": [
    { "type": "text", "body": "Progression:..." },
    { "type": "tab", "body": "e|---..." }
  ]
}
```
- Most flexible but requires new renderer infrastructure

**Recommendation:** Option B. Least disruption. The text reference already works. Adding a `tab` field is one `if` check in ReferenceRenderer.

### Task 1.5 — Wire ReferenceRenderer

In `ReferenceRenderer.tsx`, when rendering a `text` reference:
```
if (reference.tab) {
  // Render monospace text body as before
  // Then render <TabPlayer tabText={reference.tab} bpm={task.bpm} />
}
```

`bpm` needs to flow from task metadata to the renderer. Check how it's currently passed through `buildSteps()` → `Focused.tsx` → `ReferenceRenderer`.

### Task 1.6 — Expand fingerpicking tabs

Current tabs show one arpeggio pattern on one chord. Need 4+ measures covering the chord progression.

Example for Nothing Else Matters (Em intro → D → C → Em):
```
Em:                          D:
e|------0-----------0---|  e|------2-----------2---|
B|----0---0-------0---0-|  B|----3---3-------3---3-|
G|--1-------1---1-------|  G|--2-------2---2-------|
D|----------------------|  D|-0-----------0--------|
A|----------------------|  A|---------------------|
E|-0-----------0--------|  E|---------------------|
```

Each song needs:
- Correct chord voicings for the arpeggio (not just open position — match the actual song)
- Pattern applied to each chord in the progression
- At least one full cycle of the progression (4-8 measures)
- Verified against known transcriptions (Ultimate Guitar, Songsterr)

### Task 1.7 — Test end-to-end

For each of the 5 songs, on dev server:
- [ ] Tab text renders as monospace in the Focused screen
- [ ] "▶ Hear it" button appears below the tab
- [ ] Playback sounds like the actual arpeggio pattern at correct tempo
- [ ] Stop button works mid-playback
- [ ] Note counter shows correct progress (e.g., "12/48 notes")

---

## Workstream 2: Strumming Song Coaching (20 songs)

**Goal:** Each strumming song shows chord diagrams alongside the text reference. No audio.

### Task 2.1 — Build chord voicing database

Unique chords across 20 strumming songs:

| Chord | Frets | Fingers | Barre |
|---|---|---|---|
| Am | [-1, 0, 2, 2, 1, 0] | [0, 0, 2, 3, 1, 0] | — |
| C | [-1, 3, 2, 0, 1, 0] | [0, 3, 2, 0, 1, 0] | — |
| G | [3, 2, 0, 0, 0, 3] | [2, 1, 0, 0, 0, 3] | — |
| D | [-1, -1, 0, 2, 3, 2] | [0, 0, 0, 1, 3, 2] | — |
| Em | [0, 2, 2, 0, 0, 0] | [0, 2, 3, 0, 0, 0] | — |
| F | [-1, -1, 3, 2, 1, 1] | [0, 0, 3, 2, 1, 1] | — |
| Dm | [-1, -1, 0, 2, 3, 1] | [0, 0, 0, 2, 3, 1] | — |
| A | [-1, 0, 2, 2, 2, 0] | [0, 0, 1, 2, 3, 0] | — |
| E | [0, 2, 2, 1, 0, 0] | [0, 2, 3, 1, 0, 0] | — |
| Em7 | [0, 2, 2, 0, 3, 0] | TBD | — |
| Dsus4 | [-1, -1, 0, 2, 3, 3] | TBD | — |
| A7sus4 | [-1, 0, 2, 0, 3, 0] | TBD | — |
| Cmaj7 | [-1, 3, 2, 0, 0, 0] | TBD | — |
| B7 | [-1, 2, 1, 2, 0, 2] | TBD | — |

**Note:** Frets array is [low E, A, D, G, B, high e]. -1 = muted, 0 = open. Must match `ChordDiagramProps` in `ChordDiagram.tsx`.

Verify: check `ChordDiagramSVG` to confirm frets array order (low-to-high or high-to-low).

### Task 2.2 — Add chords to song references

For each of the 20 strumming songs, add a `chords` array to the reference:
```json
{
  "type": "text",
  "body": "Progression:\n| Am | F | C | G |...",
  "mono": true,
  "chords": [
    { "name": "Am", "frets": [-1, 0, 2, 2, 1, 0], "fingers": [0, 0, 2, 3, 1, 0] },
    { "name": "F", "frets": [-1, -1, 3, 2, 1, 1], "fingers": [0, 0, 3, 2, 1, 1] },
    ...
  ]
}
```

Only include chords used in that song. Order matches progression.

### Task 2.3 — Wire ChordDiagramSVG rendering

In `ReferenceRenderer.tsx`, when rendering a `text` reference with `chords` array:
- Render a horizontal scrollable row of `<ChordDiagramSVG>` components
- Position above the monospace text body
- Responsive: wraps on narrow screens

---

## Workstream 3: Level Sequencing (219 tasks)

**Goal:** Every task has a `level` field (1-3). Suggestion engine gates progression.

### Task 3.1 — Define level criteria

| Skill Area | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| technique | Chromatic exercises, basic picking, warm-ups | Legato, string skipping, speed drills | Sweep picking, advanced patterns |
| chords | Open chords (Am, C, G, D, Em, A, E) | Barre chords, 7ths, sus chords | CAGED system, jazz voicings, inversions |
| scales_fretboard | Note names, basic fretboard orientation | Pentatonic boxes 1-3, major scale | All 5 pentatonic boxes, modes, connecting positions |
| rhythm | Basic strumming (D-D-U-U-D-U), easy songs | Syncopation, muted strums, 6/8 time | Complex patterns, percussive techniques |
| fingerpicking | Basic p-i-m-a, simple arpeggios | Travis picking, pattern songs | Complex fingerstyle, simultaneous melody+bass |
| ear_training | String identification, basic pitch matching | Interval recognition, chord quality | Chord progressions, key identification |

### Task 3.2 — Assign levels

Batch process all 219 tasks. Cross-reference:
- `difficulty` field (easy → likely L1, stretch → likely L2-3)
- `tags` (open_chords → L1, barre_chords → L2, caged_system → L3)
- Song tasks: open-chord songs → L1, barre chord songs → L2, complex fingerpicking → L3

Target distribution: ~40% L1 (~88 tasks), ~35% L2 (~77 tasks), ~25% L3 (~54 tasks).

### Task 3.3 — Verify engine gating

`suggestionEngine.ts` already computes `maxCompletedLevel` per skill area and gates at `level > maxCompleted + 1`. Verify:
1. New user with 0 completions → only sees L1 tasks
2. After completing L1 tasks in `chords` → L2 chord tasks appear
3. L3 tasks in `technique` don't appear until L2 technique tasks completed
4. Cross-skill-area: completing L2 in chords doesn't unlock L2 in scales

---

## Workstream 4: Retrieval Tasks (15-20 new tasks)

**Goal:** Guitar theory tasks that work fully in-app. `needs_guitar: false`, `type: retrieval`.

### Task 4.1 — Design retrieval tasks

**scales_fretboard (5-7 tasks):**
- Name all natural notes on the 6th (low E) string
- Name all natural notes on the 5th (A) string
- Given a fret position + string, name the note (quiz format)
- Identify which fret is the octave of an open string
- Name the notes in the A minor pentatonic scale

**chords (5-7 tasks):**
- Given a chord diagram/fingering, name the chord
- Name all notes in an Am chord / C chord / G chord
- Identify major vs minor from chord name
- Match chord name to its function (I, IV, V) in a key

**ear_training (5-6 tasks):**
- Name common intervals (unison through octave)
- Identify interval direction (ascending/descending)
- Name the notes in a major scale starting from C
- Identify key signature from sharps/flats count

Each task uses `structured_list` reference with `reveal` fields + `tools: ["reveal_hide"]`.

### Task 4.2 — Create JSON

Follow exact structure from existing tasks. Example:
```json
{
  "id": "gp-ret-001",
  "description": "Name the natural notes on the low E string across all 12 frets.",
  "type": "retrieval",
  "difficulty": "easy",
  "time_minutes": 5,
  "skill_area": "scales_fretboard",
  "action": "For each fret position, recall the note name. Tap to reveal and check yourself.",
  "context": "Knowing the notes on the low E string is the foundation for finding any chord root and navigating the fretboard.",
  "reference": {
    "type": "structured_list",
    "items": [
      { "primary": "Fret 0 (open)", "reveal": "E" },
      { "primary": "Fret 1", "reveal": "F" },
      { "primary": "Fret 3", "reveal": "G" },
      { "primary": "Fret 5", "reveal": "A" },
      { "primary": "Fret 7", "reveal": "B" },
      { "primary": "Fret 8", "reveal": "C" },
      { "primary": "Fret 10", "reveal": "D" },
      { "primary": "Fret 12", "reveal": "E (octave)" }
    ]
  },
  "tools": ["reveal_hide"],
  "completion": "self_report",
  "needs_guitar": false,
  "level": 1,
  "tags": ["fretboard_notes"]
}
```

---

## Workstream 5: Reference Enrichment (selective)

### Task 5.1 — Audit chord tasks

Review all 50 chord tasks. Categorize:
- **Needs diagram:** Tasks that teach a specific chord shape (e.g., "Learn the F barre chord")
- **Doesn't need diagram:** Tasks about strumming patterns, transitions between known chords, rhythm exercises

Expected: ~25-30 tasks need diagrams.

### Task 5.2 — Audit scale tasks

Review all 48 scale tasks. Categorize:
- **Needs tab:** Pentatonic box patterns, scale runs, specific fretboard patterns
- **Doesn't need tab:** Theory tasks (intervals, key signatures), ear training

Expected: ~20-25 tasks need tab.

### Task 5.3 — Add reference data

For identified chord tasks: add `chords` array with diagram data.
For identified scale tasks: add `tab` field with correct tab notation.

Verify all fret positions and note patterns against standard references.

### Task 5.4 — Fill missing context

26 tasks have no `context` field. Add 1-2 sentences explaining pedagogical purpose.

---

## Not In This Plan

These are real gaps but require separate infrastructure work:

- **Progressive BPM tracking** — UX Audit's #1 guitar gap. Needs server-side progress tracking (Priority 5 in MVP-Plan). Separate workstream.
- **Ear training audio** — 25 tasks need audio (Tone.js). MVP-Plan has this at P2. Separate workstream.
- **Spaced repetition** — Affects all categories, not guitar-specific. MVP-Plan P1.
- **Strumming audio synthesis** — Deliberately excluded. Text coaching + metronome + chord diagrams is the right approach per product principle.

---

*Document: guitar-task-bank-fixes.md*
*Last updated: April 11, 2026*
