import './env.js'
import express from 'express'
import { readFileSync } from 'fs'

const app = express()
app.use(express.json())

// Load task banks from JSON
const creativeTasks = JSON.parse(readFileSync('./data/creative_writing.json', 'utf-8')).map((t: any, i: number) => ({
  id: `cw-task-${i}`, goal_category: 'creative_writing', ...t,
}))
const kannadaTasks = JSON.parse(readFileSync('./data/learn_kannada.json', 'utf-8')).map((t: any, i: number) => ({
  id: t.id || `kn-task-${i}`, goal_category: 'learn_kannada', ...t,
}))
const speakingTasks = JSON.parse(readFileSync('./data/public_speaking.json', 'utf-8')).map((t: any, i: number) => ({
  id: `ps-task-${i}`, goal_category: 'public_speaking', ...t,
}))
const guitarTasks = JSON.parse(readFileSync('./data/guitar_practice.json', 'utf-8')).map((t: any, i: number) => ({
  id: `gp-task-${i}`, goal_category: 'guitar_practice', ...t,
}))
const thinkingTasks = JSON.parse(readFileSync('./data/guided_thinking.json', 'utf-8')).map((t: any, i: number) => ({
  id: `gt-task-${i}`, goal_category: 'guided_thinking', ...t,
}))
const listeningTasks = JSON.parse(readFileSync('./data/active_listening.json', 'utf-8')).map((t: any, i: number) => ({
  id: `al-task-${i}`, goal_category: 'active_listening', ...t,
}))
const philosophyTasks = JSON.parse(readFileSync('./data/philosophy.json', 'utf-8')).map((t: any, i: number) => ({
  id: `pl-task-${i}`, goal_category: 'philosophy', ...t,
}))
const distributedTasks = JSON.parse(readFileSync('./data/distributed_systems.json', 'utf-8')).map((t: any, i: number) => ({
  id: `ds-task-${i}`, goal_category: 'distributed_systems', ...t,
}))
const deepReadingTasks = JSON.parse(readFileSync('./data/deep_reading.json', 'utf-8')).map((t: any, i: number) => ({
  id: `dr-task-${i}`, goal_category: 'deep_reading', ...t,
}))
const bodyweightFitnessTasks = JSON.parse(readFileSync('./data/bodyweight_fitness.json', 'utf-8')).map((t: any, i: number) => ({
  id: t.id || `bf-task-${i}`, goal_category: 'bodyweight_fitness', ...t,
}))
const conversationTasks = JSON.parse(readFileSync('./data/conversation.json', 'utf-8')).map((t: any, i: number) => ({
  id: t.id || `conv-task-${i}`, goal_category: 'conversation', ...t,
}))
const tasks = [...creativeTasks, ...kannadaTasks, ...speakingTasks, ...guitarTasks, ...thinkingTasks, ...listeningTasks, ...philosophyTasks, ...distributedTasks, ...deepReadingTasks, ...bodyweightFitnessTasks, ...conversationTasks]

// In-memory state
const state = {
  goal: null as string | null,
  events: [] as Array<{ task_id: string; event: string; skip_reason?: string; reflection_text?: string; duration_seconds?: number; created_at: string }>,
}

function todayStr() { return new Date().toISOString().split('T')[0] }

function completedToday() {
  const today = todayStr()
  return state.events.filter(e => e.event === 'completed' && e.created_at.startsWith(today)).length
}

// --- API Routes ---

app.get('/api/status', (_req, res) => {
  const count = completedToday()
  res.json({ done_for_today: count >= 3, tasks_completed_today: count, has_active_goal: !!state.goal })
})

app.post('/api/goals/parse', (req, res) => {
  const { text } = req.body
  const lower = (text || '').toLowerCase()

  const goals: Record<string, string[]> = {
    creative_writing: ['writing', 'write', 'writer', 'poetry', 'poem', 'story', 'fiction', 'prose', 'creative', 'lyrics', 'songwriting', 'journal'],
    learn_kannada: ['kannada', 'ಕನ್ನಡ', 'karnataka', 'bengaluru', 'bangalore language'],
    public_speaking: ['speaking', 'speak', 'speech', 'presentation', 'public speaking', 'articulate', 'communicate', 'oratory', 'debate', 'toastmaster'],
    guitar_practice: ['guitar', 'acoustic', 'electric guitar', 'chord', 'fretboard', 'fingerpicking', 'strumming', 'riff', 'solo', 'tabs'],
    guided_thinking: ['thinking', 'reflect', 'decision', 'mindful', 'walk', 'clarity', 'perspective', 'gratitude'],
    active_listening: ['listening', 'comprehension', 'attention', 'focus', 'memory'],
    philosophy: ['philosophy', 'philosopher', 'ethics', 'morality', 'stoicism', 'existentialism', 'logic', 'fallacy', 'metaphysics', 'epistemology', 'critical thinking', 'argumentation'],
    distributed_systems: ['distributed', 'system design', 'scalability', 'consensus', 'replication', 'cap theorem', 'raft', 'paxos', 'fault tolerance', 'architecture', 'microservice', 'partitioning', 'sharding'],
    deep_reading: ['reading', 'read', 'deep reading', 'comprehension', 'books', 'book', 'articles', 'analytical reading', 'critical reading'],
    bodyweight_fitness: ['fitness', 'bodyweight', 'exercise', 'workout', 'pushup', 'pushups', 'squat', 'squats', 'plank', 'planks', 'strength', 'calisthenics', 'body weight', 'core', 'mobility'],
    conversation: ['conversation', 'conversations', 'connection', 'connecting', 'social skills', 'listening', 'empathy', 'vulnerability', 'communicate', 'relationships', 'people skills', 'small talk', 'deeper conversations'],
  }

  for (const [category, keywords] of Object.entries(goals)) {
    if (keywords.some(k => lower.includes(k))) {
      state.goal = category
      return res.json({ category, supported: true })
    }
  }
  res.json({ category: null, supported: false, input_saved: true, available: Object.keys(goals) })
})

app.get('/api/suggest', (_req, res) => {
  const count = completedToday()
  if (count >= 3) return res.json({ done_for_today: true, tasks_completed: count })

  const completedIds = new Set(state.events.filter(e => e.event === 'completed').map(e => e.task_id))
  const today = todayStr()
  const skippedIds = new Set(state.events.filter(e => e.event === 'skipped' && e.created_at.startsWith(today)).map(e => e.task_id))
  const goalTasks = tasks.filter((t: any) => t.goal_category === state.goal)

  // Level sequencing: compute max completed level per skill area
  const maxLevel: Record<string, number> = {}
  state.events.filter(e => e.event === 'completed').forEach(e => {
    const t = tasks.find((t: any) => t.id === e.task_id) as any
    if (t?.skill_area && t?.level) maxLevel[t.skill_area] = Math.max(maxLevel[t.skill_area] || 0, t.level)
  })

  const candidates = goalTasks.filter((t: any) => {
    if (completedIds.has(t.id) || skippedIds.has(t.id)) return false
    // Level gate
    if (t.level && t.level > 1) {
      const allowed = (maxLevel[t.skill_area] || 0) + 1
      if (t.level > allowed) return false
    }
    return true
  })

  if (!candidates.length) return res.json({ done_for_today: false, tasks_completed: count })

  // Phase-aware selection: prefer lowest incomplete phase
  let task
  const phases = [1, 2, 3, 4]
  const phaseThreshold = 0.7 // 70% complete to unlock next phase
  for (const phase of phases) {
    const phaseTasks = candidates.filter((t: any) => t.phase === phase)
    if (phaseTasks.length > 0) {
      // Check if previous phase is sufficiently complete
      if (phase > 1) {
        const prevPhaseTasks = goalTasks.filter((t: any) => t.phase === phase - 1)
        const prevCompleted = prevPhaseTasks.filter((t: any) => completedIds.has(t.id)).length
        if (prevPhaseTasks.length > 0 && prevCompleted / prevPhaseTasks.length < phaseThreshold) {
          continue // previous phase not done enough, skip this phase
        }
      }
      task = phaseTasks[Math.floor(Math.random() * phaseTasks.length)]
      break
    }
  }
  // Fallback: any candidate (for non-phased goals)
  if (!task) task = candidates[Math.floor(Math.random() * candidates.length)]
  res.json({ done_for_today: false, tasks_completed: count, task })
})

app.post('/api/events', (req, res) => {
  const { task_id, event, skip_reason, reflection_text, duration_seconds } = req.body
  state.events.push({ task_id, event, skip_reason, reflection_text, duration_seconds, created_at: new Date().toISOString() })
  res.json({ ok: true })
})

app.get('/api/momentum', (_req, res) => {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? 6 : day - 1
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - mondayOffset)
  weekStart.setHours(0, 0, 0, 0)

  const weekEvents = state.events.filter(e => e.event === 'completed' && new Date(e.created_at) >= weekStart)
  const daysActive = new Set(weekEvents.map(e => e.created_at.split('T')[0])).size
  const tasksCompleted = weekEvents.length

  let level = 'getting_started'
  if (daysActive >= 5 || tasksCompleted >= 10) level = 'on_fire'
  else if (daysActive >= 3) level = 'building'

  res.json({ level, days_active: daysActive, tasks_completed: tasksCompleted })
})

app.get('/api/history', (_req, res) => {
  const completed = state.events.filter(e => e.event === 'completed').reverse().slice(0, 50)
  const result = completed.map(e => {
    const task = tasks.find((t: any) => t.id === e.task_id)
    return { description: task?.description ?? '', skill_area: task?.skill_area ?? '', reflection: e.reflection_text, completed_at: e.created_at, duration_seconds: e.duration_seconds }
  })
  res.json({ tasks: result })
})

app.get('/api/concepts', (_req, res) => {
  const completedIds = new Set(state.events.filter(e => e.event === 'completed').map(e => e.task_id))
  const encountered: Record<string, Set<string>> = {}
  tasks.forEach((t: any) => {
    if (completedIds.has(t.id) && t.concepts?.length) {
      const area = t.skill_area || 'general'
      if (!encountered[area]) encountered[area] = new Set()
      t.concepts.forEach((c: string) => encountered[area].add(c))
    }
  })
  const result = Object.entries(encountered).map(([area, concepts]) => ({
    skill_area: area, concepts: [...concepts].sort()
  }))
  res.json({ groups: result, total: result.reduce((s, g) => s + g.concepts.length, 0) })
})

const EMOJI_MAP: Record<string, string> = {
  learn_kannada: '🇮🇳', guitar_practice: '🎸', creative_writing: '✍️',
  public_speaking: '🗣', guided_thinking: '🧠', active_listening: '🎧',
  philosophy: '📖', distributed_systems: '🧩', deep_reading: '📕',
}

app.get('/api/categories', (_req, res) => {
  const HIDDEN = new Set(['creative_writing', 'guided_thinking', 'active_listening'])
  const cats = new Map<string, number>()
  for (const t of tasks) {
    const c = (t as any).goal_category
    if (c && !HIDDEN.has(c)) cats.set(c, (cats.get(c) || 0) + 1)
  }
  const result = [...cats.entries()].map(([id, count]) => ({
    id,
    label: id.split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' '),
    emoji: EMOJI_MAP[id] || '📚',
    count,
  }))
  res.json({ categories: result })
})

app.get('/api/tasks', (req, res) => {
  const category = req.query.category as string | undefined
  const group = req.query.group as string | undefined
  const goalCategory = category || state.goal
  let filtered = goalCategory ? tasks.filter((t: any) => t.goal_category === goalCategory) : tasks
  if (group === 'true') filtered = filtered.filter((t: any) => t.group === true)
  else if (group === 'false') filtered = filtered.filter((t: any) => !t.group)
  res.json({ tasks: filtered, total: filtered.length })
})

app.listen(3001, () => {
  console.log(`API server running on http://localhost:3001`)
  console.log(`Loaded ${tasks.length} tasks, goal: ${state.goal || 'none'}, events: ${state.events.length}`)
})
