import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserId } from './_lib/auth.js'
import { supabaseAdmin } from './_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { task_id, event, skip_reason, reflection_text, duration_seconds } = req.body

  if (!task_id || !event) return res.status(400).json({ error: 'task_id and event required' })
  if (!['shown', 'started', 'skipped', 'completed'].includes(event)) {
    return res.status(400).json({ error: 'Invalid event type' })
  }

  const { error } = await supabaseAdmin.from('user_task_events').insert({
    user_id: userId,
    task_id,
    event,
    skip_reason: event === 'skipped' ? skip_reason : null,
    reflection_text: event === 'completed' ? reflection_text : null,
    duration_seconds: event === 'completed' ? duration_seconds : null,
  })

  if (error) return res.status(500).json({ error: error.message })

  // Update daily summary on completion or skip
  if (event === 'completed' || event === 'skipped') {
    const today = new Date().toISOString().split('T')[0]
    const field = event === 'completed' ? 'tasks_completed' : 'tasks_skipped'

    // Upsert daily summary
    const { data: existing } = await supabaseAdmin
      .from('daily_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (existing) {
      await supabaseAdmin
        .from('daily_summary')
        .update({ [field]: (existing[field] || 0) + 1 })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin.from('daily_summary').insert({
        user_id: userId,
        date: today,
        [field]: 1,
      })
    }
  }

  return res.status(200).json({ ok: true })
}
