import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const banks = [
  { file: new URL('../data/creative_writing.json', import.meta.url), category: 'creative_writing' },
  { file: new URL('../data/learn_kannada.json', import.meta.url), category: 'learn_kannada' },
  { file: new URL('../data/public_speaking.json', import.meta.url), category: 'public_speaking' },
  { file: new URL('../data/guitar_practice.json', import.meta.url), category: 'guitar_practice' },
  { file: new URL('../data/guided_thinking.json', import.meta.url), category: 'guided_thinking' },
  { file: new URL('../data/active_listening.json', import.meta.url), category: 'active_listening' },
  { file: new URL('../data/philosophy.json', import.meta.url), category: 'philosophy' },
  { file: new URL('../data/distributed_systems.json', import.meta.url), category: 'distributed_systems' },
  { file: new URL('../data/deep_reading.json', import.meta.url), category: 'deep_reading' },
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
