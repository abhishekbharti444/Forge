# Forge — Deployment Guide

## Architecture Overview

```
Local Dev                    Production
─────────                    ──────────
data/*.json  ──seed──→  Supabase Postgres (tasks table)
app/src/*    ──build──→  Vercel CDN (React SPA)
app/api/*    ──deploy──→  Vercel Serverless Functions
```

- **Task data** lives in JSON files locally, seeded into Supabase for production
- **Frontend** is a Vite React SPA deployed to Vercel CDN
- **API routes** are Vercel serverless functions that query Supabase
- **Local dev** uses `server.local.ts` (in-memory, reads JSON directly — no Supabase needed)

---

## Prerequisites

- Node.js 20+
- Vercel CLI: `npm i -g vercel` (authenticated via `vercel login`)
- Supabase project with credentials in `app/.env.local`

### Required Environment Variables (`app/.env.local`)

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

`VITE_` prefixed vars are exposed to the frontend. `SUPABASE_SERVICE_ROLE_KEY` is server-only (API routes).

---

## Local Development

```bash
cd app
npm install
npx tsx server.local.ts
# Runs on http://localhost:3001
# Loads all task banks from data/*.json into memory
# No Supabase connection needed
```

The local server mirrors the production API but reads from JSON files instead of Supabase.

---

## Deployment Steps

### 1. Seed Tasks to Supabase

The seed script clears all existing tasks and re-inserts from JSON files.

```bash
cd app
node -e "$(cat)" --input-type=module << 'EOF'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const KNOWN_COLS = new Set(['description','type','difficulty','time_minutes','skill_area',
  'action','context','constraint_note','example','reference','tools','completion'])

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

// Clear all existing tasks
await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')

let total = 0
for (const bank of banks) {
  const tasks = JSON.parse(readFileSync(bank.file, 'utf-8'))
  const rows = tasks.map(t => {
    const extra = {}
    for (const [k, v] of Object.entries(t)) {
      if (!KNOWN_COLS.has(k) && k !== 'id') extra[k] = v
    }
    const ref = t.reference ? { ...t.reference, ...extra } : (Object.keys(extra).length ? extra : null)
    return {
      goal_category: bank.category, skill_area: t.skill_area, description: t.description,
      action: t.action || null, context: t.context || null, constraint_note: t.constraint_note || null,
      example: t.example || null, reference: ref, tools: t.tools || null,
      completion: t.completion || 'self_report', type: t.type, difficulty: t.difficulty, time_minutes: t.time_minutes,
    }
  })
  for (let i = 0; i < rows.length; i += 50) {
    const { error } = await supabase.from('tasks').insert(rows.slice(i, i + 50))
    if (error) { console.error(bank.category + ':', error.message); process.exit(1) }
  }
  console.log(`✅ ${rows.length} ${bank.category}`)
  total += rows.length
}
console.log(`\n🎉 Total: ${total} tasks seeded`)
EOF
```

### 2. Deploy to Vercel

```bash
cd app
npx vercel --prod
```

Vercel builds the Vite SPA and deploys the API routes as serverless functions.

### 3. Verify

```bash
# Check categories and counts
curl -s https://app-mu-nine-97.vercel.app/api/categories | python3 -m json.tool

# Check a specific category
curl -s "https://app-mu-nine-97.vercel.app/api/tasks?category=distributed_systems" | python3 -c "
import json, sys; d=json.load(sys.stdin); print(f'{d[\"total\"]} tasks')"
```

### 4. Commit and Push

```bash
cd app
git add -A
git commit -m "Deploy: description of changes"
git push
```

Note: Vercel is NOT connected to GitHub for auto-deploy. You must run `npx vercel --prod` manually.

---

## Gotchas & Lessons Learned

### Supabase Default Row Limit

**Problem:** Supabase JS client returns max 1000 rows by default. With 1036+ tasks, some are silently dropped.

**Fix:** Use `.range()` for pagination when fetching all rows:
```typescript
const { data } = await supabase.from('tasks').select('goal_category')
// If 1000 rows returned, fetch more
if (data.length === 1000) {
  const { data: more } = await supabase.from('tasks').select('goal_category').range(1000, 5000)
  allRows = [...data, ...more]
}
```

Per-category queries are fine (max ~220 tasks per category, well under 1000).

### Extra Fields Not in DB Schema

**Problem:** Some task banks (guitar_practice) have fields like `sequence`, `song`, `tags`, `bpm`, `chords` that aren't columns in the `tasks` table.

**Fix:** Pack extra fields into the `reference` jsonb column during seeding. Unpack them in the frontend when tasks are loaded:
```typescript
// In Suggestion.tsx — unpack extra fields from reference
const { sequence, song, tags, bpm, chords, ...cleanRef } = ref
return { ...task, sequence, song, tags, bpm, chords, reference: cleanRef }
```

### TypeScript Build Errors

**Problem:** Vercel runs `tsc -b` which is stricter than `tsc --noEmit`. Unused variables and Supabase type inference issues (`never` types) cause build failures.

**Fixes:**
- Remove or comment out unused variables (don't prefix with `_` — tsconfig may still flag them)
- Supabase `never` type errors in API routes are type-inference issues (no generated types). They don't affect runtime. Vercel still deploys despite these warnings.

### Vercel Deployment is Manual

Vercel is NOT connected to GitHub for auto-deploy. The workflow is:
1. Make changes locally
2. `npx vercel --prod` to deploy
3. `git push` to save to GitHub (separate step)

### Task Grouping in UI

Tasks are grouped by `tags[0]` in the Suggestion component. If a task bank doesn't have `tags`, tasks fall into "other". The fix: use `skill_area` as fallback:
```typescript
const tag = t.tags?.[0] || t.skill_area || 'other'
```

---

## Adding a New Task Bank

1. Create `data/new_category.json` with tasks following the existing format
2. Add the bank to `server.local.ts`:
   ```typescript
   const newTasks = JSON.parse(readFileSync('../data/new_category.json', 'utf-8')).map(...)
   ```
3. Add goal parser keywords to both:
   - `app/server.local.ts` (local dev)
   - `app/api/goals/parse.ts` (production)
4. Add emoji to `EMOJI_MAP` in both:
   - `app/server.local.ts`
   - `app/api/categories.ts`
5. Seed to Supabase (run the seed script above)
6. Deploy: `npx vercel --prod`
7. Categories appear automatically in the UI (GoalHome + Suggestion fetch from `/api/categories`)

### Task JSON Format

```json
{
  "id": "xx-001",
  "type": "learning|retrieval|practice|reflection",
  "difficulty": "easy|medium|stretch",
  "time_minutes": 5,
  "skill_area": "topic_name",
  "action": "What to do (shown prominently)",
  "description": "Brief description",
  "context": "Why this matters + background knowledge needed",
  "constraint_note": "Rules and boundaries",
  "example": "Concrete example of what good looks like",
  "reference": { "type": "structured_list|fill_blank|pairs|steps|narration|dialogue|text", ... },
  "tools": ["timer", "reveal_hide", "text_input", "checklist"],
  "completion": "self_report|timer_end|text_submitted|checklist_done"
}
```

---

## Current State (April 5, 2026)

| Category | Tasks | Status |
|---|---|---|
| Creative Writing | 175 | ✅ Deployed |
| Learn Kannada | 160 | ✅ Deployed |
| Public Speaking | 150 | ✅ Deployed |
| Guitar Practice | 219 | ✅ Deployed |
| Guided Thinking | 8 | ✅ Deployed |
| Active Listening | 5 | ✅ Deployed |
| Philosophy | 146 | ✅ Deployed |
| Distributed Systems | 173 | ✅ Deployed |
| **Total** | **1,036** | |

**Live URL:** https://app-mu-nine-97.vercel.app
**Repo:** https://github.com/abhishekbharti444/Forge
