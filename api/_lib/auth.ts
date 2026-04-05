import type { VercelRequest } from '@vercel/node'
import { supabaseAdmin } from './supabase.js'

// Default dev user ID — used when SKIP_AUTH=true
const DEV_USER_ID = '8a8ca911-2755-4ed2-914b-c0a7d39a51ca'

export async function getUserId(req: VercelRequest): Promise<string | null> {
  if (process.env.SKIP_AUTH === 'true') return DEV_USER_ID

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null

  return user.id
}
