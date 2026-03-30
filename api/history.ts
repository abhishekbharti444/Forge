import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserId } from './_lib/auth.js'
import { supabaseAdmin } from './_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { data: events } = await supabaseAdmin
    .from('user_task_events')
    .select('task_id, reflection_text, duration_seconds, created_at')
    .eq('user_id', userId)
    .eq('event', 'completed')
    .order('created_at', { ascending: false })
    .limit(50)

  if (!events?.length) return res.status(200).json({ tasks: [] })

  const taskIds = events.map(e => e.task_id)
  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('id, description')
    .in('id', taskIds)

  const taskMap = new Map((tasks ?? []).map(t => [t.id, t.description]))

  const result = events.map(e => ({
    description: taskMap.get(e.task_id) ?? '',
    reflection: e.reflection_text,
    completed_at: e.created_at,
    duration_seconds: e.duration_seconds,
  }))

  return res.status(200).json({ tasks: result })
}
