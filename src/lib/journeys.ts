export interface JourneyTask {
  id: string
  description: string
  action?: string
  time_minutes: number
  difficulty?: string
  skill_area?: string
  level?: number
  sequence?: { name: string; order: number; total: number }
  [key: string]: any
}

export interface Journey {
  name: string        // skill_area display name
  key: string         // raw skill_area
  tasks: JourneyTask[]
  completed: number
  total: number
}

const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, stretch: 2 }

const PHASE_NAMES: Record<number, string> = {
  1: 'Listen & Comprehend',
  2: 'Speak in Chunks',
  3: 'Read & Recognize',
  4: 'Write & Formalize',
}
const PHASE_EMOJI: Record<number, string> = { 1: '🎧', 2: '🗣', 3: '📖', 4: '✍️' }

export function organizeByPhase(tasks: JourneyTask[], completedIds: Set<string>): Journey[] {
  const groups = new Map<number, JourneyTask[]>()
  for (const t of tasks) {
    const phase = (t as any).phase || 4
    const arr = groups.get(phase) || []
    arr.push(t)
    groups.set(phase, arr)
  }
  const journeys: Journey[] = []
  for (const phase of [1, 2, 3, 4]) {
    const phaseTasks = groups.get(phase) || []
    if (!phaseTasks.length) continue
    const completed = phaseTasks.filter(t => completedIds.has(t.id)).length
    journeys.push({
      name: `${PHASE_EMOJI[phase]} Phase ${phase}: ${PHASE_NAMES[phase]}`,
      key: `phase-${phase}`,
      tasks: phaseTasks,
      completed,
      total: phaseTasks.length,
    })
  }
  return journeys
}

export function organizeJourneys(tasks: JourneyTask[], completedIds: Set<string>): Journey[] {
  // Group by skill_area
  const groups = new Map<string, JourneyTask[]>()
  for (const t of tasks) {
    const key = t.skill_area || 'other'
    const arr = groups.get(key) || []
    arr.push(t)
    groups.set(key, arr)
  }

  const journeys: Journey[] = []
  for (const [key, groupTasks] of groups) {
    // Split into sequenced and loose
    const sequenced: JourneyTask[] = []
    const loose: JourneyTask[] = []
    for (const t of groupTasks) {
      if (t.sequence) sequenced.push(t)
      else loose.push(t)
    }

    // Sort sequenced by sequence order
    sequenced.sort((a, b) => a.sequence!.order - b.sequence!.order)

    // Sort loose: by level (if present), then difficulty
    loose.sort((a, b) => {
      if (a.level !== b.level) return (a.level || 0) - (b.level || 0)
      return (DIFF_ORDER[a.difficulty || 'medium'] || 1) - (DIFF_ORDER[b.difficulty || 'medium'] || 1)
    })

    const ordered = [...sequenced, ...loose]
    const completed = ordered.filter(t => completedIds.has(t.id)).length

    journeys.push({
      name: key.replace(/_/g, ' '),
      key,
      tasks: ordered,
      completed,
      total: ordered.length,
    })
  }

  // Sort journeys: ones with progress first, then alphabetical
  journeys.sort((a, b) => {
    if (a.completed > 0 && b.completed === 0) return -1
    if (b.completed > 0 && a.completed === 0) return 1
    return a.name.localeCompare(b.name)
  })

  return journeys
}

// --- Cross-cutting collections (tag-based groupings) ---

export interface CollectionConfig { tag: string; label: string; emoji: string; tier: 1 | 2 | 3 }

export const COLLECTION_CONFIGS: Record<string, CollectionConfig[]> = {
  guitar_practice: [
    // Tier 1: Foundations
    { tag: 'warm_up', label: 'Warm-Ups', emoji: '🔥', tier: 1 },
    { tag: 'strumming_patterns', label: 'Strumming Patterns', emoji: '🥁', tier: 1 },
    // Tier 2: Building Skills
    { tag: 'theory_sequence', label: 'Music Theory', emoji: '🧠', tier: 2 },
    { tag: 'pentatonic_boxes', label: 'Pentatonic Boxes', emoji: '🎸', tier: 2 },
    { tag: 'caged_system', label: 'CAGED System', emoji: '🗺️', tier: 2 },
    // Tier 3: Making Music
    { tag: 'pentatonic_soloing', label: 'Fretboard Soloing', emoji: '🎯', tier: 3 },
    { tag: 'progressions', label: 'Progressions', emoji: '🎵', tier: 3 },
    { tag: 'improvisation', label: 'Improvisation', emoji: '🎤', tier: 3 },
    { tag: 'composition', label: 'Composition', emoji: '✍️', tier: 3 },
  ],
}

export const TIER_LABELS: Record<number, string> = { 1: 'Foundations', 2: 'Building Skills', 3: 'Making Music' }
export const TIER_EMOJI: Record<number, string> = { 1: '🟢', 2: '🔵', 3: '🟣' }

export function organizeCollections(tasks: JourneyTask[], completedIds: Set<string>, category: string): Journey[] {
  const configs = COLLECTION_CONFIGS[category]
  if (!configs) return []

  return configs.map(c => {
    const matched = tasks.filter(t => (t.tags as string[] | undefined)?.includes(c.tag))
    matched.sort((a, b) => {
      if (a.level !== b.level) return (a.level || 0) - (b.level || 0)
      return (DIFF_ORDER[a.difficulty || 'medium'] || 1) - (DIFF_ORDER[b.difficulty || 'medium'] || 1)
    })
    return {
      name: c.label,
      key: `collection:${c.tag}`,
      tasks: matched,
      completed: matched.filter(t => completedIds.has(t.id)).length,
      total: matched.length,
    }
  }).filter(c => c.total > 0)
}

const STAGE_NAMES: Record<number, string> = { 1: 'Make Sounds', 2: 'Understand Music', 3: 'Create Music' }
const STAGE_EMOJI: Record<number, string> = { 1: '🟢', 2: '🔵', 3: '🟣' }

export function organizeStages(tasks: JourneyTask[], completedIds: Set<string>): Journey[] {
  const levels = [1, 2, 3]
  return levels.map(lvl => {
    const matched = tasks.filter(t => (t.level || 0) === lvl)
    matched.sort((a, b) => {
      const sa = (a.skill_area || '').localeCompare(b.skill_area || '')
      if (sa !== 0) return sa
      return (DIFF_ORDER[a.difficulty || 'medium'] || 1) - (DIFF_ORDER[b.difficulty || 'medium'] || 1)
    })
    return {
      name: STAGE_NAMES[lvl] || `Level ${lvl}`,
      key: `stage:${lvl}`,
      tasks: matched,
      completed: matched.filter(t => completedIds.has(t.id)).length,
      total: matched.length,
    }
  }).filter(s => s.total > 0)
}

export { STAGE_EMOJI }
