const KEY = 'forge_completions'

interface Completion {
  taskId: string
  category: string
  skillArea: string
  level?: number
  concepts?: string[]
  completedAt: string
}

function getAll(): Completion[] {
  return JSON.parse(localStorage.getItem(KEY) || '[]')
}

export function recordCompletion(task: {
  task_id?: string; id?: string; goal_category?: string; skill_area?: string
  level?: number; concepts?: string[]
}) {
  const all = getAll()
  const id = task.task_id || task.id || ''
  if (all.some(c => c.taskId === id)) return // already recorded
  all.push({
    taskId: id,
    category: task.goal_category || '',
    skillArea: task.skill_area || '',
    level: task.level,
    concepts: task.concepts,
    completedAt: new Date().toISOString(),
  })
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function getCompletedIds(): Set<string> {
  return new Set(getAll().map(c => c.taskId))
}

export function getTasksCompletedToday(): number {
  const today = new Date().toISOString().split('T')[0]
  return getAll().filter(c => c.completedAt.startsWith(today)).length
}

export function getLevelProgress(category: string): Record<string, number> {
  const progress: Record<string, number> = {}
  for (const c of getAll()) {
    if (c.category === category && c.level != null) {
      progress[c.skillArea] = Math.max(progress[c.skillArea] || 0, c.level)
    }
  }
  return progress
}

export function getConcepts(): Record<string, string[]> {
  const grouped: Record<string, Set<string>> = {}
  for (const c of getAll()) {
    if (c.concepts?.length) {
      if (!grouped[c.skillArea]) grouped[c.skillArea] = new Set()
      c.concepts.forEach(concept => grouped[c.skillArea].add(concept))
    }
  }
  const result: Record<string, string[]> = {}
  for (const [area, set] of Object.entries(grouped)) result[area] = [...set]
  return result
}

export function getLastCategory(): string {
  const all = getAll()
  return all.length ? all[all.length - 1].category : ''
}
