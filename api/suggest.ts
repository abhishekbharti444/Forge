import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserId } from './_lib/auth.js'
import { suggest } from './_lib/services/suggestionEngine.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const result = await suggest(userId)
  return res.status(200).json(result)
}
