# Forge — Docs

> A practice tool that eliminates the decision of what to work on and makes every minute of practice count.

## Read in This Order

1. **[Philosophy.md](./Philosophy.md)** — Why Forge exists. Neurochemistry, psychology frameworks, design principles. Read first.
2. **[Roadmap.md](./Roadmap.md)** — What's built, what's next, consolidated priority stack.
3. **[Content-Strategy.md](./Content-Strategy.md)** — How to write good tasks. Content audit. Category details.
4. **[Design-System.md](./Design-System.md)** — How it looks and behaves. Colors, typography, screens, UI decisions.
5. **[Architecture.md](./Architecture.md)** — Technical stack, data model, APIs, expansion paths.
6. **[Changelog.md](./Changelog.md)** — Build history. One paragraph per session.

## Codebase Quick Reference

```
src/
├── App.tsx                — State machine. Routes between screens based on appState.
├── states/                — One file per screen:
│   ├── GoalHome.tsx       — Dashboard: greeting, momentum, goal cards
│   ├── Journeys.tsx       — Task catalog for a goal, grouped by skill area
│   ├── Focused.tsx        — Step-based task flow: instruction → reference → exercise → reflect
│   ├── WhatsNext.tsx      — Post-completion: congrats + next task suggestion
│   ├── DoneForToday.tsx   — Completion rest state (sage green dots, exhale)
│   ├── IntentCapture.tsx  — "What do you want to get better at?"
│   ├── AudioPlayerScreen  — Listen/Speak mode for audio-native tasks
│   ├── PodcastPlayer.tsx  — Bilingual story player (Kannada→English, sentence-by-sentence)
│   ├── History.tsx        — Completed tasks with reflections
│   ├── ConceptBank.tsx    — Concepts encountered, grouped by skill area
│   ├── Coach.tsx          — Smart task recommendation
│   ├── Landing.tsx        — Public landing page
│   └── Auth.tsx           — Supabase auth
├── components/            — Shared UI:
│   ├── ReferenceRenderer  — Renders all reference types (structured_list, fill_blank, dialogue, etc.)
│   ├── WorkspaceTools.tsx — Timer, TextInput, Checklist
│   ├── ChordDiagram.tsx   — SVG chord diagram for guitar
│   ├── FretboardDiagram   — Fretboard scale visualization
│   └── TabPlayer.tsx      — Guitar tab playback with Soundfont
├── lib/                   — Utilities:
│   ├── progress.ts        — localStorage: completed tasks, levels, concepts
│   ├── momentum.ts        — localStorage: weekly activity tracking
│   ├── speechEngine.ts    — Generates utterance scripts from task data
│   ├── speechPlayer.ts    — Web Speech API wrapper
│   ├── journeys.ts        — Groups tasks into skill-area journeys
│   ├── api.ts             — API fetch wrapper
│   └── supabase.ts        — Supabase client init
api/                       — Vercel API routes:
├── tasks.ts               — GET /api/tasks — returns tasks by category
├── categories.ts          — GET /api/categories — available goal categories
├── suggest.ts             — GET /api/suggest — suggestion engine (currently unused by frontend)
├── events.ts              — POST /api/events — log task events
├── history.ts             — GET /api/history — completed tasks
├── momentum.ts            — GET /api/momentum — weekly momentum
├── goals/parse.ts         — POST /api/goals/parse — free text → category
├── status.ts              — GET /api/status — done-for-today check
└── _lib/                  — Shared: auth, supabase client, suggestion engine
data/                      — Task banks (JSON, one file per category)
server.local.ts            — Local dev server (Express, in-memory state, port 3001)
scripts/                   — DB schema, seed scripts, content generation, audio generation
```

## Key Patterns

**State machine:** `App.tsx` manages `appState` as a string. Each state renders one screen component. No router — just a switch on state.

**Task data flow:** `data/*.json` → `server.local.ts` (local) or `api/tasks.ts` (prod) → `App.tsx` → screen components. Tasks carry `reference`, `tools`, and `completion` fields that drive rendering.

**Composable task format:** Any task = reference type × tools × completion signal. `Focused.tsx`'s `buildSteps()` reads task metadata to build the right step flow. No goal-specific rendering logic — it's all metadata-driven.

**Progress:** Currently localStorage only (`progress.ts`, `momentum.ts`). Supabase schema exists (`user_task_events`, `daily_summary`) but frontend doesn't write to it yet.

## Adding a New Category

1. Author tasks as JSON in `data/` following [Content-Strategy.md](./Content-Strategy.md) quality principles
2. Add category keywords to `server.local.ts` goal parser + `api/goals/parse.ts`
3. Add emoji + label to `EMOJI_MAP` in `server.local.ts` and `GoalHome.tsx`
4. No new UI components needed — the composable task format handles rendering

## Running Locally

```bash
cd app
npm install
npm run dev          # Vite frontend on :5173
npm run dev:server   # Express API on :3001
npm run dev:all      # Both
```
