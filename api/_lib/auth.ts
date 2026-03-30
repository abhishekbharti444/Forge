import type { VercelRequest } from '@vercel/node'
import { supabaseAdmin } from './supabase.js'

export async function getUserId(req: VercelRequest): Promise<string | null> {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null

  return user.id
}
