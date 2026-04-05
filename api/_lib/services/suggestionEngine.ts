import { supabaseAdmin } from '../supabase.js'

interface Task {
  id: string
  description: string
  type: string
  difficulty: string
  time_minutes: number
  skill_area: string
  action?: string
  context?: string
  constraint_note?: string
  example?: string
}

interface SuggestResult {
  done_for_today: boolean
  tasks_completed: number
  task?: Task
}

export async function suggest(userId: string): Promise<SuggestResult> {
  const today = new Date().toISOString().split('T')[0]

  // 1. Check if done for today (3+ completions)
  const { count } = await supabaseAdmin
    .from('user_task_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event', 'completed')
    .gte('created_at', `${today}T00:00:00`)

  if ((count ?? 0) >= 3) {
    return { done_for_today: true, tasks_completed: count ?? 0 }
  }

  // 2. Get user's active goal
  const { data: goals } = await supabaseAdmin
    .from('user_goals')
    .select('goal_category')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!goals?.length) {
    return { done_for_today: false, tasks_completed: count ?? 0 }
  }

  const category = goals[0].goal_category

  // 3. Get completed task IDs
  const { data: completedEvents } = await supabaseAdmin
    .from('user_task_events')
    .select('task_id')
    .eq('user_id', userId)
    .eq('event', 'completed')

  const completedIds = (completedEvents ?? []).map(e => e.task_id)

  // 4. Get recently skipped task IDs (last 24h)
  const yesterday = new Date(Date.now() - 86400000).toISOString()
  const { data: skippedEvents } = await supabaseAdmin
    .from('user_task_events')
    .select('task_id, skip_reason')
    .eq('user_id', userId)
    .eq('event', 'skipped')
    .gte('created_at', yesterday)

  const skippedIds = (skippedEvents ?? []).map(e => e.task_id)
  const recentSkipReasons = (skippedEvents ?? []).map(e => e.skip_reason).filter(Boolean)

  // 5. Get last completed task type and skill_area
  const { data: lastCompleted } = await supabaseAdmin
    .from('user_task_events')
    .select('task_id')
    .eq('user_id', userId)
    .eq('event', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)

  let lastType: string | null = null
  let lastSkillArea: string | null = null
  if (lastCompleted?.length) {
    const { data: lastTask } = await supabaseAdmin
      .from('tasks')
      .select('type, skill_area')
      .eq('id', lastCompleted[0].task_id)
      .single()
    lastType = lastTask?.type ?? null
    lastSkillArea = lastTask?.skill_area ?? null
  }

  // 6. Get all candidate tasks
  const { data: allTasks } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('goal_category', category)

  if (!allTasks?.length) {
    return { done_for_today: false, tasks_completed: count ?? 0 }
  }

  const excludeIds = new Set([...completedIds, ...skippedIds])
  const candidates = allTasks.filter(t => !excludeIds.has(t.id))

  if (!candidates.length) {
    // All tasks done or skipped — reset by allowing completed ones back
    const fallback = allTasks.filter(t => !skippedIds.includes(t.id))
    if (!fallback.length) return { done_for_today: false, tasks_completed: count ?? 0 }
    return { done_for_today: false, tasks_completed: count ?? 0, task: pickBest(fallback, lastType, lastSkillArea, recentSkipReasons, completedIds.length) }
  }

  // 7. Score and pick
  const task = pickBest(candidates, lastType, lastSkillArea, recentSkipReasons, completedIds.length)
  return { done_for_today: false, tasks_completed: count ?? 0, task }
}

function pickBest(tasks: Task[], lastType: string | null, lastSkillArea: string | null, skipReasons: string[], totalCompleted: number): Task {
  const scored = tasks.map(t => {
    let score = 0

    // Type diversity: prefer different type from last
    if (lastType && t.type !== lastType) score += 2

    // Skill area diversity: prefer different skill area from last
    if (lastSkillArea && t.skill_area !== lastSkillArea) score += 3

    // Skip signals
    if (skipReasons.includes('too_long') && t.time_minutes <= 5) score += 2
    if (skipReasons.includes('wrong_type') && t.type === lastType) score -= 5
    if (skipReasons.includes('too_easy') && t.difficulty !== 'easy') score += 2

    // Difficulty ramp
    if (totalCompleted < 10 && t.difficulty === 'easy') score += 2
    if (totalCompleted >= 10 && t.difficulty !== 'easy') score += 1

    // Randomness
    score += Math.random()

    return { task: t, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].task
}
