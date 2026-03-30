import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserId } from './_lib/auth.js'
import { supabaseAdmin } from './_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const today = new Date().toISOString().split('T')[0]

  const { count } = await supabaseAdmin
    .from('user_task_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event', 'completed')
    .gte('created_at', `${today}T00:00:00`)

  const { data: goals } = await supabaseAdmin
    .from('user_goals')
    .select('goal_category')
    .eq('user_id', userId)
    .limit(1)

  return res.status(200).json({
    done_for_today: (count ?? 0) >= 3,
    tasks_completed_today: count ?? 0,
    has_active_goal: (goals?.length ?? 0) > 0,
  })
}
