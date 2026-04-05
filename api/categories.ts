import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './_lib/supabase.js'

const EMOJI_MAP: Record<string, string> = {
  learn_kannada: '🇮🇳', guitar_practice: '🎸', creative_writing: '✍️',
  public_speaking: '🗣', guided_thinking: '🧠', active_listening: '🎧',
  philosophy: '📖', distributed_systems: '🧩',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('goal_category')

  if (error) return res.status(500).json({ error: error.message })

  const counts = new Map<string, number>()
  for (const row of data || []) {
    const c = row.goal_category
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
