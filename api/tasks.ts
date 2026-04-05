import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserId } from './_lib/auth.js'
import { supabaseAdmin } from './_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const category = req.query.category as string | undefined

  // If category specified, use it directly
  if (category) {
    const { data: tasks, error } = await supabaseAdmin.from('tasks').select('*').eq('goal_category', category)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ tasks: tasks ?? [], total: tasks?.length ?? 0 })
  }

  // Otherwise try to get user's active goal
  const userId = await getUserId(req)
  if (userId) {
    const { data: goals } = await supabaseAdmin
      .from('user_goals')
      .select('goal_category')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (goals?.length) {
      const { data: tasks, error } = await supabaseAdmin.from('tasks').select('*').eq('goal_category', (goals[0] as any).goal_category)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ tasks: tasks ?? [], total: tasks?.length ?? 0 })
    }
  }

  // Fallback: return all tasks
  const { data: tasks, error } = await supabaseAdmin.from('tasks').select('*')
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ tasks: tasks ?? [], total: tasks?.length ?? 0 })
}
