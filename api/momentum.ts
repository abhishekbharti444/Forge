import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserId } from './_lib/auth.js'
import { supabaseAdmin } from './_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  // Get days active this week (Mon-Sun)
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? 6 : day - 1
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - mondayOffset)
  weekStart.setHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: summaries } = await supabaseAdmin
    .from('daily_summary')
    .select('date, tasks_completed')
    .eq('user_id', userId)
    .gte('date', weekStartStr)

  const daysActive = (summaries ?? []).filter(s => s.tasks_completed > 0).length
  const tasksCompleted = (summaries ?? []).reduce((sum, s) => sum + (s.tasks_completed || 0), 0)

  let level = 'getting_started'
  if (daysActive >= 5 || tasksCompleted >= 10) level = 'on_fire'
  else if (daysActive >= 3) level = 'building'

  return res.status(200).json({
    level,
    days_active: daysActive,
    tasks_completed: tasksCompleted,
    week_start: weekStartStr,
  })
}
