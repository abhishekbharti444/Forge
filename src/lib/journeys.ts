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
