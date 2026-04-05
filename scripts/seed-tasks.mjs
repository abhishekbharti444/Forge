import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const banks = [
  { file: '../data/creative_writing.json', category: 'creative_writing' },
  { file: '../data/learn_kannada.json', category: 'learn_kannada' },
  { file: '../data/public_speaking.json', category: 'public_speaking' },
  { file: '../data/guitar_practice.json', category: 'guitar_practice' },
  { file: '../data/guided_thinking.json', category: 'guided_thinking' },
  { file: '../data/active_listening.json', category: 'active_listening' },
  { file: '../data/philosophy.json', category: 'philosophy' },
  { file: '../data/distributed_systems.json', category: 'distributed_systems' },
]

// Clear existing tasks to avoid duplicates
console.log('🗑  Clearing existing tasks...')
const { error: delError } = await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
if (delError) {
  console.error('Delete failed:', delError.message)
  process.exit(1)
}
console.log('✅ Cleared')

let total = 0

for (const bank of banks) {
  const tasks = JSON.parse(readFileSync(bank.file, 'utf-8'))

  const rows = tasks.map(t => ({
    goal_category: bank.category,
    skill_area: t.skill_area,
    description: t.description,
    action: t.action || null,
    context: t.context || null,
    constraint_note: t.constraint_note || null,
    example: t.example || null,
    reference: t.reference || null,
    tools: t.tools || null,
    completion: t.completion || 'self_report',
    type: t.type,
    difficulty: t.difficulty,
    time_minutes: t.time_minutes,
  }))

  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50)
    const { error } = await supabase.from('tasks').insert(batch)
    if (error) {
      console.error(`Seed failed for ${bank.category} batch ${i}:`, error.message)
      process.exit(1)
    }
  }

  console.log(`✅ Seeded ${rows.length} ${bank.category} tasks`)
  total += rows.length
}

console.log(`\n🎉 Total: ${total} tasks seeded`)
