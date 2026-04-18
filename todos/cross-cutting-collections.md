# Cross-Cutting Collections

> Created: April 12, 2026
> Status: ✅ COMPLETE — Guitar Practice collections shipped and verified.
> Context: Song tasks (and other tagged groups like warm-ups, scale patterns) are buried inside journeys with no direct discoverability.

## Implementation Summary (April 12, 2026)

Collections for Guitar Practice are live. 4 tag-based collections (Songs, Warm-ups, Pentatonic Boxes, Strumming Patterns) render below the journeys list on the Journeys screen. Each collection reuses the same expandable card UI as journeys (progress bar, task list, Continue button). Tasks are filtered by tag and sorted by level then difficulty.

Files modified:
- `journeys.ts` — Added `COLLECTION_CONFIGS`, `CollectionConfig` interface, and `organizeCollections()` function
- `Journeys.tsx` — Extracted `renderCard()` helper, added `collections` state, computed collections in `useEffect`, rendered collections section with proper emoji lookup

---

## Problem

Tasks belong to a single `skill_area` (journey), but users often want to find tasks by *type* — "I want to practice a song" or "I need a warm-up." Currently, the only way to find songs is to scroll through 30+ tasks in the Fingerpicking or Chords journey.

## Constraint

Must not break existing journey structure. Songs stay in `fingerpicking` / `chords` skill areas. Warm-ups stay in `technique`. Etc.

## Solution: Collections

A collection is a cross-cutting view over tasks, powered by the existing `tags` field.

### Data

No schema changes needed. The `tags` field already contains the groupings:
- `songs` (25 tasks across chords + fingerpicking)
- `warm_up` (9 tasks in technique)
- `pentatonic_boxes` (9 tasks in scales_fretboard)
- `strumming_patterns` (13 tasks in rhythm)
- `fingerstyle_songs` (8 tasks in fingerpicking)
- etc.

A collection is simply a named tag with a display label and optional emoji.

### Collection Config

```json
{
  "guitar_practice_collections": [
    { "tag": "songs", "label": "Songs", "emoji": "🎵" },
    { "tag": "warm_up", "label": "Warm-ups", "emoji": "🔥" },
    { "tag": "pentatonic_boxes", "label": "Pentatonic Boxes", "emoji": "🎸" },
    { "tag": "strumming_patterns", "label": "Strumming Patterns", "emoji": "🥁" }
  ]
}
```

This can live in the task bank JSON or in a separate config. Keeps it data-driven.

### UI: GoalHome

Add a "Collections" section below the journeys list on GoalHome:

```
┌─────────────────────────┐
│ Guitar Practice          │
│ 0/219 tasks · 6 journeys │
│                          │
│ JOURNEYS                 │
│ 🎸 Chords        0/50 ▸ │
│ 👂 Ear Training   0/25 ▸ │
│ 👆 Fingerpicking  0/32 ▸ │
│ ...                      │
│                          │
│ COLLECTIONS              │
│ 🎵 Songs          25 ▸  │
│ 🔥 Warm-ups        9 ▸  │
│ 🎸 Pentatonic      9 ▸  │
│ 🥁 Strumming      13 ▸  │
└─────────────────────────┘
```

Tapping a collection shows the same journey-detail view but filtered by tag instead of skill_area.

### How It Works

1. GoalHome renders collections config for the active goal
2. Each collection shows task count (tasks matching that tag)
3. Tapping a collection filters the full task list by tag
4. Tasks still show their skill_area badge so the user knows where they "live"
5. "Continue" on a collection task navigates into the normal Focused flow

### Suggestion Engine

No changes needed. The suggestion engine still picks tasks by skill_area and level. Collections are purely a discovery/navigation mechanism.

### Effort

- Collection config: trivial (data)
- GoalHome UI: ~1-2 hours (render collections section)
- Collection detail view: ~1 hour (reuse journey detail with tag filter)
- Total: ~half a day

### Future Extensions

- Collections could work across ALL categories, not just guitar
- User-created collections (bookmarks/favorites)
- "Practice plan" collections that sequence tasks in a specific order

---

*Document: cross-cutting-collections.md*
*Last updated: April 12, 2026*
