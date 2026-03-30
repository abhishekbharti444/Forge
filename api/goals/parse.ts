import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserId } from '../_lib/auth.js'
import { supabaseAdmin } from '../_lib/supabase.js'

const GOAL_KEYWORDS: Record<string, string[]> = {
  creative_writing: ['writing', 'write', 'writer', 'poetry', 'poem', 'story', 'stories', 'fiction', 'prose', 'essay', 'songwriting', 'lyrics', 'creative', 'author', 'novel', 'journal'],
}

function matchGoal(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [category, keywords] of Object.entries(GOAL_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return category
  }
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'text required' })

  const category = matchGoal(text)

  // Save the raw input regardless
  await supabaseAdmin
    .from('profiles')
    .update({ goal_input_text: text })
    .eq('id', userId)

  if (!category) {
    return res.status(200).json({
      category: null,
      supported: false,
      input_saved: true,
      available: Object.keys(GOAL_KEYWORDS),
    })
  }

  // Upsert user goal
  await supabaseAdmin
    .from('user_goals')
    .delete()
    .eq('user_id', userId)

  await supabaseAdmin
    .from('user_goals')
    .insert({ user_id: userId, goal_category: category })

  return res.status(200).json({ category, supported: true })
}
