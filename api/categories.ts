import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './_lib/supabase.js'

const EMOJI_MAP: Record<string, string> = {
  learn_kannada: '🇮🇳', guitar_practice: '🎸', creative_writing: '✍️',
  public_speaking: '🗣', guided_thinking: '🧠', active_listening: '🎧',
  philosophy: '📖', distributed_systems: '🧩',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Get distinct categories with counts using multiple queries
  const { data: allCats, error: catError } = await supabaseAdmin
    .from('tasks')
    .select('goal_category')

  if (catError) return res.status(500).json({ error: catError.message })

  // Supabase default limit is 1000 — fetch remaining if needed
  let allRows = allCats || []
  if (allRows.length === 1000) {
    const { data: more } = await supabaseAdmin
      .from('tasks')
      .select('goal_category')
      .range(1000, 5000)
    if (more) allRows = [...allRows, ...more]
  }

  const counts = new Map<string, number>()
  for (const row of allRows) {
    const c = (row as any).goal_category
    counts.set(c, (counts.get(c) || 0) + 1)
  }

  const categories = [...counts.entries()].map(([id, count]) => ({
    id,
    label: id.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
    emoji: EMOJI_MAP[id] || '📚',
    count,
  }))

  return res.status(200).json({ categories })
}
