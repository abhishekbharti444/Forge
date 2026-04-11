# Forge — Micro-Decision Momentum Engine

> "Whenever I have a short pocket of time, show me a meaningful, time-bounded action that genuinely advances my goals."

---

## What Is This?

A web-first AI assistant that tells you the **best next 10–15 minute action** toward your goals. Not a planner, not a course app — a moment-aware task recommendation system that adapts silently to your behavior.

**Core loop:** Open app → see one suggestion → do it (or skip) → come back later.

---

## Why This Works (Research Backing)

### The Problem Is Real
- Decision fatigue is well-documented — quality of decisions deteriorates after prolonged decision-making, and people default to avoidance. This app eliminates the "what should I do?" decision entirely.
- People don't lack tasks. They lack **compelling direction in limited time fragments**.

### The Science Supports the Approach
- **Intelligent Tutoring Systems** raise test scores by 0.66 standard deviations (50th → 75th percentile). Brookings confirms ITS can match human tutoring effectiveness.
- **Microlearning** meta-analysis: significant positive effects on retention (OR = 1.87) and learning outcomes (SMD = 0.74).
- **Spaced repetition**: hundreds of studies confirm spacing out material produces superior long-term learning vs. massed practice.

### The Market Is Growing
- Microlearning market: ~$3.1–3.4B (2025) → $8–9.6B by 2032 (13–14% CAGR).
- AI personal coaching market: ~$7.2B (2025), growing at ~14.5% CAGR.
- Generative AI apps hit $1.9B revenue in H1 2025, doubling from prior half-year.

### The Competitive Gap Exists
| Product | What it does | Why it's NOT Forge |
|---|---|---|
| Duolingo | Micro-lessons for languages | Single domain, rigid curriculum, no cross-goal recommendations |
| Motion | AI calendar/task scheduling | Organizes existing tasks, doesn't generate or recommend learning actions |
| Reclaim.ai | AI calendar time-blocking | Defends time for habits, doesn't tell you what to do in that time |
| Sunsama | Daily planning ritual | Manual planning, not moment-to-moment recommendation |
| Rocky.AI | Conversational coaching | Chat-based, not action-first |
| 5Mins.ai / Headway | Microlearning content | Delivers content pieces, not personalized next-action decisions |

**Nobody does:** open app → get one personalized, time-bounded, goal-aligned action → do it.

---

## Key Risks

### Retention (The #1 Risk)
- AI apps lose subscribers 30% faster than non-AI apps. Annual retention: 21.1% (AI) vs. 30.7% (traditional).
- 88% of users gone within 30 days for average apps.
- **Mitigation:** Duolingo cracked this via gamification + retention obsession (DAU grew 4.5x, churn dropped from 47% → 28%). Retention must be the #1 design priority from day one.

### Cold Start
- First 5 sessions determine if someone stays. Task quality must be excellent from day one.
- **Mitigation:** Hand-curate task banks for launch categories. Don't rely on raw LLM output.

### Monetization
- Only ~3% of AI app users pay for premium. But direction-seekers already pay $10–20/mo for learning tools.
- **Mitigation:** Target $10–15/mo. Validate willingness to pay after proving the core loop works.

---

## Target Audience

People who **want direction, not distraction**. Small as a percentage, large in absolute numbers.

Who they are: self-learners, career switchers, hobbyists who actually practice, language learners, people training for something. They already pay for Duolingo Plus, MasterClass, Skillshare, Coursera.

What they lack: the micro-decision layer — "I have 12 minutes, what's the highest-value thing I can do right now?"

---

## Design Philosophy

Six design decisions that make Forge feel like a coach, not a task manager.

### 1. No Goal Dropdowns — Free-Text Intent

Instead of picking from a list, the user types: *"What do you want to get better at?"*

Keyword matching classifies the input into supported categories (MVP has 2 categories — LLM classification not needed yet). If it maps to a supported goal, start immediately. If not, say "We're launching with [X] and [Y] — pick one to start, and we'll add yours soon."

**Why:** The app eliminates decisions. The first interaction shouldn't be a decision. Free text feels personal — "I typed my thing and it understood me" vs. "I picked from a dropdown." Also collects demand data for unsupported goals for free.

### 2. No Timer — Focused View + Optional Reflection

User taps "Let's go" → task card expands into a clean focused view with just the task description. No countdown. When done, they tap "Done" and optionally write a one-line reflection (*"What did you notice?"*).

**Why:** Timers create pressure, not momentum. Finishing early feels wasteful, running over feels like failure. The reflection serves three purposes:
- It's the "investment" phase of the Hook Model — user puts something personal into the app
- It creates a journal-like history that becomes valuable over time
- It gives signal about task quality (wrote 3 sentences vs. tapped done instantly)

Reflection is always optional, never required.

### 3. "Not the Right Moment" Instead of Skip

Replace "Show me another" with **"Not the right moment"** + a one-tap reason:
- "Too long right now" → app learns to suggest shorter tasks at this time of day
- "Not in the mood for this type" → avoids this task type for the current session
- "Already know this" → marks as too easy, adjusts difficulty

**Why:** Generic skips feel like rejection and produce useless data. Contextual skips feel like the app is listening, and every skip becomes actionable behavioral signal.

### 4. Momentum Score, Not Streak

Replace the daily streak with a **rolling weekly momentum score**:
- Active 1 day this week → "Getting started"
- Active 3 days this week → "Building momentum"
- Active 5+ days this week → "On fire"
- 10+ tasks this week → bonus recognition regardless of days

**Why:** Streaks punish healthy usage patterns. Someone using the app 4 days/week is doing great — a streak that breaks on day 5 makes them feel like they failed. Momentum rewards consistency without demanding daily use.

### 5. Clean Task Card — No Visible Metadata

The main screen shows ONLY:
- The task description in clear, inviting language
- A single "Let's go" button
- Nothing else — no type badges, no difficulty labels, no time estimates

Time estimate appears subtly *after* tapping "Let's go": *"This usually takes about 10 minutes"* — as reassurance, not a filter.

**Why:** Metadata makes it feel like a work assignment. The user should feel like they're receiving a nudge from a thoughtful coach, not browsing a categorized task database. Type/difficulty/time are internal scoring inputs, not user-facing UI.

### 6. "Done for Today" Rest State

After 2–3 completions in a day, the app shifts to a rest state:

> "You've done 3 tasks today. That's real progress. Come back tomorrow, or tap here if you want one more."

**Why:** Always showing another suggestion says "you're never done" — that's exhausting. A completion state creates a powerful psychological reward and makes the user *want* to come back tomorrow rather than feeling drained today.

---

## Architecture

See [Architecture.md](./Architecture.md) for full system design, tech choices, and expansion paths.

**Summary:** One Vercel project (React SPA + API Routes) + Supabase (Postgres + Auth). Two services, one deploy, $0/month.

---

## Progress

*Last updated: April 7, 2026*

### What's Built

| Area | Status | Details |
|---|---|---|
| Project scaffolding | ✅ | Vite + React 19 + TS + Tailwind 4 + Supabase client + GitHub |
| Creative Writing task bank | ✅ | 175 tasks in `creative_writing.json`, tagged with type/difficulty/time |
| DB schema & RLS | ✅ | `001_schema.sql`, `002_rls.sql`, `seed-tasks.mjs` — ready to run |
| Supabase project | ✅ | Project created, credentials configured |
| Auth middleware | ✅ | JWT validation + `SKIP_AUTH` dev mode |
| All 6 API routes | ✅ | suggest, events, goals/parse, momentum, history, status |
| Suggestion engine | ✅ | Weighted heuristics: type diversity, skip signals, difficulty ramp |
| All 6 UI states | ✅ | Auth, IntentCapture, Suggestion, Focused, Completion, DoneForToday |
| Local dev server | ✅ | In-memory backend, loads tasks from JSON, no Supabase dependency |
| E2E screenshot script | ✅ | Playwright walkthrough of full core loop |

### What's Left

| Task | Est. Hours | Notes |
|---|---|---|
| ~~Add `skill_area` to task schema~~ | ~~0.5~~ | ✅ Session 2 |
| ~~Update suggestion engine for skill area balancing~~ | ~~1~~ | ✅ Session 2 |
| ~~Richer task structure (action/context/example)~~ | ~~2~~ | ✅ Session 2 |
| ~~Enrich remaining 163 creative writing tasks~~ | ~~1.5~~ | ✅ Session 3 |
| ~~Generate + curate Learn Kannada task bank~~ | ~~3~~ | ✅ Session 4 |
| ~~Update goal parser for learn_kannada~~ | ~~0.5~~ | ✅ Session 4 |
| ~~Generate + curate Public Speaking task bank~~ | ~~3~~ | ✅ Session 5 |
| ~~Update goal parser for public_speaking~~ | ~~0.5~~ | ✅ Session 5 |
| ~~Implement composable task format — reference types~~ | ~~3~~ | ✅ Session 6 |
| ~~Implement workspace tools~~ | ~~3~~ | ✅ Session 7 |
| ~~Implement completion signals~~ | ~~1~~ | ✅ Session 7 |
| ~~Add reference/tools/completion to task data~~ | ~~2~~ | ✅ Session 8 |
| ~~History screen~~ | ~~2~~ | ✅ Session 9 |
| ~~Loading/error/empty states~~ | ~~2~~ | ✅ Session 9 |
| ~~Browsable task catalog (replaced one-at-a-time)~~ | ~~1~~ | ✅ Session 9 |
| **→ Core product complete** | | |
| Add `details` array to structured_list items | ~1 | Generic enrichment: pronunciation, tips, examples per item |
| Build quiz mode on structured_list | ~2 | Learn mode / quiz / reverse quiz with score tracking |
| Build `fill_blank` reference renderer | ~1 | Prompt with blank, user input, reveal answer |
| Build `dialogue` reference renderer | ~1 | Alternating speaker lines, user practices one role |
| Enrich Kannada tasks with details + fill_blank + dialogue | ~3 | Make in-app practice tasks fully interactive |
| Add `resources` and `level` fields to task data | ~1 | External links for guided-external tasks, progressive difficulty |
| **→ Interactive practice complete** | | |
| ~~Mobile responsiveness pass~~ | ~~2~~ | ✅ Session 12 |
| ~~PWA setup (manifest, service worker)~~ | ~~2~~ | ✅ Session 12 |
| ~~Landing page~~ | ~~3~~ | ✅ Session 13 |
| ~~Final polish, bug fixes~~ | ~~2~~ | ✅ Session 13 |
| **→ Product complete ✅** | | |
| ~~Run schema on Supabase + seed all task banks~~ | ~~0.5~~ | ✅ Deployed |
| ~~Deploy to Vercel + e2e test~~ | ~~1~~ | ✅ Live at https://app-mu-nine-97.vercel.app |
| **→ Friends Beta live 🚀** | | |

**Product live. All DB writes removed — read-only content experience for now.**

---

## Current State (as of April 7, 2026)

**Live URL:** https://app-mu-nine-97.vercel.app (stale — local is ahead)

**What's built (local):**
- 1,036 tasks across 8 categories:
  - Creative Writing: 175 | Learn Kannada: 160 | Public Speaking: 150
  - Guitar Practice: 219 | Philosophy: 146 | Distributed Systems: 173
  - Guided Thinking: 8 | Active Listening: 5
- 30+ skill areas across all categories
- 8 reference types: text, structured_list, steps, pairs, fill_blank, dialogue, narration, (media future)
- 6 workspace tools: timer, reveal_hide, text_input, checklist, quiz mode, chord diagram
- 12 screens: Landing, Auth, IntentCapture, GoalHome, Coach, Suggestion (catalog), Focused (step-based), AudioPlayer, WhatsNext, DoneForToday, History, ConceptBank, TaskReview
- Audio mode: Screen / Listen+Speak / Listen only (Web Speech API + SpeechEngine)
- Level sequencing: tasks gated by completed level per skill area
- Concept tracking: concepts field on tasks, ConceptBank screen
- Body enrichment: 328+ structured_list items with body text
- ChordDiagram component (SVG chord rendering for guitar)
- TabPlayer component (guitar tab playback with Soundfont)
- Momentum tracking (localStorage-based weekly activity)
- PWA, mobile-ready

**New components not in earlier docs:**
- `GoalHome.tsx` — goal dashboard with momentum, practice button, history link
- `Coach.tsx` — smart task recommendation after completing a task
- `WhatsNext.tsx` — post-completion suggestion for next task
- `ConceptBank.tsx` — concepts encountered, grouped by skill area
- `ChordDiagram.tsx` — SVG chord diagram renderer
- `TabPlayer.tsx` — guitar tab playback with audio
- `momentum.ts` — localStorage-based weekly activity tracking

**What's intentionally NOT built yet:**
- Server-side user progress tracking (no DB writes from user flow)
- Personalized suggestions server-side (local momentum only)
- Deployed version is stale (475 tasks, missing new categories/features)

**Architecture decisions captured in:**
- Architecture.md → Composable Task Format, Product Principle, Audio Mode, Audio-Native Task Types
- Design-System.md → Adaptive Focused screen layouts
- MVP-Plan.md → Session log, What's Left

---

## Next Action Items

### Immediate
1. **Sync deployment** — re-seed Supabase with all 1,036 tasks (8 categories), update seed script, add new Vercel API routes for /api/concepts, redeploy
2. **Update Architecture.md** — add Guitar Practice (ChordDiagram, TabPlayer), Distributed Systems, Philosophy (level sequencing, concepts), GoalHome/Coach/WhatsNext flow
3. **Update Design-System.md** — new screens (GoalHome, Coach, WhatsNext, ConceptBank)

### After sync
- **Google Cloud TTS** — pre-generate Kannada audio for natural pronunciation
- **User progress flow design** — server-side completion tracking, personalized suggestions
- **More audio-native content** — story-based tasks for distributed systems, guitar ear training
- **Guitar Practice task bank** — ~150 tasks with chord references, practice routines
- **User progress flow design** — what gets saved, streaks/momentum, completion tracking
- **Enrich remaining tasks** — 126 Kannada + 112 public speaking tasks missing structured references
- **Add `resources` and `level` fields** — external links, progressive difficulty

---

## Session Log

### Session 1 — Mar 30 (Project Setup)
Built: Vite + React + TS + Tailwind + Supabase client + all 6 UI states + all 6 API routes + suggestion engine + DB schema + local dev server + 175 creative writing tasks + e2e script.

### Session 2 — Mar 31 (Skill Hierarchy + Task Structure)

Plan:
- [x] Update task schema — add `skill_area` and richer task fields (action, context, constraint, example)
- [x] Tag creative_writing.json tasks with skill_areas
- [x] Restructure a sample of tasks into richer format (~12 tasks, 2 per skill area)
- [x] Update local server to serve new task fields (no changes needed — `...t` spread handles it)
- [x] Update frontend to display layered task info
- [x] Update suggestion engine to balance across skill_areas

Changes:
- `001_schema.sql` — added `skill_area`, `action`, `context`, `constraint_note`, `example` to tasks table
- `creative_writing.json` — all 175 tasks tagged with skill_area (observation 55, structure 42, voice 25, dialogue 22, reflection 17, imagery 14). 12 tasks enriched with full action/context/constraint/example.
- `App.tsx` — TaskData interface extended, new fields passed through from API
- `Suggestion.tsx` — shows `action` (falls back to `description`)
- `Focused.tsx` — layered display: action → constraint → context (italic) → example (card)
- `suggestionEngine.ts` — Task interface extended, skill_area diversity scoring (+3), fetches lastSkillArea from DB
- `seed-tasks.mjs` — includes new fields

### Session 3 — Apr 1 (Content: Enrich Creative Writing)

Plan:
- [x] Enrich remaining 163 creative writing tasks with action/context/constraint_note/example
- [x] Review + curate enriched tasks (spot-check quality)

All 175 tasks now have the full richer structure. Processed in batches by skill area: imagery (12), reflection (15), dialogue (20), voice (23), structure (40), observation (53).

### Session 4 — Apr 1-2 (Content: Learn Kannada Task Bank)

Plan:
- [x] Define skill areas for Kannada learning
- [x] Generate Learn Kannada task bank — 150 tasks with full richer structure
- [x] Update goal parser to support learn_kannada category
- [x] Update local server to load both task banks and filter by goal

Changes:
- `learn_kannada.json` — 150 tasks across 6 skill areas (vocabulary 35, grammar 33, script 25, phrases 25, pronunciation 16, culture 16)
- `server.local.ts` — loads both task banks, goal parser supports learn_kannada, suggest filters by active goal
- `api/goals/parse.ts` — added learn_kannada keywords

### Session 5 — Apr 3 (Content: Public Speaking Task Bank)

Plan:
- [x] Define skill areas for public speaking
- [x] Generate Public Speaking task bank — 150 tasks with full richer structure
- [x] Update goal parser + local server for public_speaking

Changes:
- `public_speaking.json` — 150 tasks across 6 skill areas (vocal_delivery 30, clarity 26, impromptu 25, presence 25, storytelling 24, persuasion 20)
- `server.local.ts` — loads all 3 task banks (475 total), public_speaking keywords in goal parser
- `api/goals/parse.ts` — added public_speaking keywords
- `TaskReview.tsx` — added public_speaking category button

### Session 6 — Apr 3 (Composable Task Format: Reference Renderers)

Plan:
- [x] Add reference/tools/completion fields to task interfaces
- [x] Build structured_list, steps, pairs reference renderers
- [x] Wire reference renderers into Focused screen
- [x] Add reference data to 10 Kannada tasks (8 structured_list, 1 steps, 1 pairs)

Changes:
- `App.tsx` — TaskData interface + fetchSuggestion passthrough for reference/tools/completion
- `ReferenceRenderer.tsx` — new file: StructuredList (tap-to-reveal), Steps (numbered), Pairs (side-by-side), dispatcher
- `Focused.tsx` — imports ReferenceRenderer, shows skill_area metadata bar, scrollable content area
- `learn_kannada.json` — 10 tasks now have structured reference data with reveal_hide tool

### Session 7 — Apr 3 (Composable Task Format: Workspace Tools)

Plan:
- [x] Build Timer component (countdown, start/pause, progress bar, onEnd)
- [x] Build TextInput component (textarea with optional submit)
- [x] Build Checklist component (toggleable items, onAllChecked)
- [x] Wire tools into Focused screen
- [x] Implement completion signals (self_report, timer_end, checklist_done, text_submitted)

Changes:
- `WorkspaceTools.tsx` — new file: Timer, TextInput, Checklist components
- `Focused.tsx` — renders tools based on task.tools array, completion signal controls button state

### Session 8 — Apr 3 (Content: Add reference/tools data)

Plan:
- [x] Add reference+tools to remaining Kannada tasks
- [x] Add reference+tools to public speaking tasks
- [x] Verify creative writing backward compat

Results:
- Kannada: 24 tasks with structured references, 62 with tools (timer, text_input, reveal_hide)
- Public speaking: 38 tasks with tools (28 timer, 10 text_input)
- Creative writing: 175 tasks unchanged, 0 reference/tools — backward compat confirmed

### Session 9 — Apr 3 (History Screen + Loading/Error/Empty States)

Plan:
- [x] History API — added skill_area to existing endpoint
- [x] History screen — date-grouped completed tasks with skill_area, duration, reflection
- [x] Navigation — subtle "History" link on Suggestion + "View history" on DoneForToday
- [x] Loading/error/empty states — error with retry in App.tsx, all 3 states in History

Changes:
- `server.local.ts` — added skill_area to history response
- `History.tsx` — new file: date-grouped list, loading/error/empty states
- `App.tsx` — added 'history' + 'error' states, try/catch on checkStatus/fetchSuggestion, error screen with retry
- `Suggestion.tsx` — added subtle History link top-right
- `DoneForToday.tsx` — added "View history" link alongside "One more"

### Session 10 — Apr 3 (Interactive Practice: Details + Quiz Mode)

Plan:
- [x] Add details array support to StructuredList renderer (tap to expand labeled rows)
- [x] Build quiz mode (learn / quiz / reverse quiz with score tracking)
- [x] Enrich 48 Kannada vocabulary items with pronunciation + example sentences

Changes:
- `ReferenceRenderer.tsx` — StructuredList: details expand, quiz/reverse mode with score. Learn/Quiz/Reverse toggle for lists with reveal.
- `learn_kannada.json` — 5 tasks (numbers, food, body parts, question words, colors) enriched with details arrays

### Session 11 — Apr 3 (Interactive Practice: Fill-blank + Dialogue)

Plan:
- [x] Build fill_blank reference renderer (prompt, input, check, score)
- [x] Build dialogue reference renderer (chat bubbles, progressive reveal, user highlight)
- [x] Wire both into ReferenceRenderer dispatcher
- [x] Add fill_blank to 5 grammar tasks + dialogue to 5 phrase tasks

Changes:
- `ReferenceRenderer.tsx` — added FillBlank (input + check + score) and Dialogue (chat-bubble progressive reveal) components
- `learn_kannada.json` — 5 grammar tasks now fill_blank (SOV, past tense, negation, beku/beda, future), 5 phrase tasks now dialogue (auto, restaurant, shopping, intro, doctor)

### Session 12 — Apr 3 (Mobile + PWA)

Plan:
- [x] Mobile responsiveness — no-scale viewport, theme-color, safe-area padding, overflow-x hidden
- [x] PWA setup — manifest.json, service worker, linked in index.html
- [x] Fix HTML title to 'Forge'

Changes:
- `index.html` — meta tags (viewport no-scale, theme-color, apple-mobile-web-app), manifest link, service worker registration, title fix
- `index.css` — safe-area padding, overflow-x hidden
- `manifest.json` — app name, theme, standalone display
- `sw.js` — cache shell, skip API calls, offline fallback

### Session 14 — Apr 3 (Step-based Focused Screen)

Plan:
- [x] Build step-based Focused screen (card carousel with dots navigation)
- [x] Auto-generate steps from existing task data (buildSteps function)
- [x] Merge reflection into Focused flow, remove separate Completion screen

Changes:
- `Focused.tsx` — rewritten as step-based flow: instruction → reference → exercise → reflect. Navigation dots, Next/Back, step counter. buildSteps() auto-generates from task fields.
- `App.tsx` — merged handleDone/handleComplete, removed Completion screen import and render

### Session 17 — Apr 5 (Audio Mode UI)

Plan:
- [x] Build AudioPlayerScreen (play/pause, progress bar, next, current utterance, done state)
- [x] Add mode selector to task cards (Screen / Speak / Listen)
- [x] Wire audio mode into App.tsx (routes to Focused or AudioPlayer based on mode)

Changes:
- `AudioPlayerScreen.tsx` — new file: minimal audio player UI using SpeechPlayer + generateScript
- `Suggestion.tsx` — "Let's go" replaced with 3 mode buttons, onStartTask passes mode
- `App.tsx` — audioMode state, handleStartTask routes by mode, AudioPlayerScreen renders for 'audio' state

### Session 18 — Apr 5 (Audio-Native Content)

Plan:
- [x] Build narration reference renderer (progressive segments + quiz phase)
- [x] Create 10 Kannada story-based tasks with narration reference
- [x] Create 8 guided thinking walk tasks with long pauses
- [x] Create 5 active listening exercises with comprehension questions
- [x] Add 🎧 badge to catalog for audio-native categories
- [x] Wire guided_thinking + active_listening into local server + catalog

Changes:
- `ReferenceRenderer.tsx` — added Narration component (segment reveal + quiz)
- `speechEngine.ts` — added scriptNarration, makeSpeakable for Kannada text
- `learn_kannada.json` — 10 new story tasks (kn-151 to kn-160)
- `guided_thinking.json` — new file: 8 tasks (decision, goals, creativity, self-check, first-principles, gratitude, perspective, career)
- `active_listening.json` — new file: 5 tasks (habits, decision fatigue, memory, 80/20, feedback loops)
- `server.local.ts` — loads all task banks, new goal parser keywords
- `Suggestion.tsx` — 6 categories with 🎧 badges, narration badge on task cards

### Session 19 — Apr 5 (Philosophy Category + Level Sequencing + Concept Bank)

Plan:
- [x] Create philosophy task bank — 146 tasks across 5 skill areas with level + concepts fields
- [x] Add `level` and `concepts` fields to task data interfaces
- [x] Update goal parser + local server for philosophy category
- [x] Add philosophy to category picker
- [x] Update suggestion engine to respect level sequencing
- [x] Build ConceptBank screen — concepts encountered, grouped by skill area
- [x] Add concept bank navigation to Suggestion.tsx
- [x] Enrich 328 structured_list items with `body` field across philosophy, Kannada, and guitar

Changes:
- `philosophy.json` — new file: 146 tasks across philosophical_literacy (29), ethics (30), argumentation (27), critical_thinking (27), applied_philosophy (33). Each task has level (1-3) and concepts array (289 unique concepts). Uses teach-then-test pattern with structured_list, fill_blank, steps, pairs, text_input.
- `gen-philosophy.mjs` — new file: generator script with helper functions for each reference type
- `App.tsx` — added `level`, `concepts` to TaskData interface, 'concepts' AppState, ConceptBank routing, onConcepts prop
- `Suggestion.tsx` — added `level`, `concepts` to Task interface, philosophy in category picker, Concepts link in header
- `server.local.ts` — loads philosophy tasks, philosophy keywords in goal parser, level sequencing in /api/suggest (computes max completed level per skill area, gates tasks at level > maxCompleted + 1), /api/concepts endpoint
- `ConceptBank.tsx` — new file: concepts grouped by skill area as tag chips, loading/empty states
- `philosophy.json` — all 133 structured_list items enriched with body text (philosophy explanations)
- `learn_kannada.json` — all 121 structured_list items enriched with body text (pronunciation, usage, culture)
- `guitar_practice.json` — all 74 structured_list items enriched with body text (technique, theory, practice tips)

### Session 16 — Apr 5 (SpeechEngine Core)

Plan:
- [x] Build SpeechEngine — generateScript() converts any task + mode to Utterance[]
- [x] Script generators for all 6 reference types (structured_list, fill_blank, dialogue, steps, pairs, text)
- [x] Build SpeechPlayer — Web Speech API wrapper with play/pause/next/stop, progress callbacks

Changes:
- `speechEngine.ts` — new file: generateScript(), per-reference-type script generators, Kannada lang detection
- `speechPlayer.ts` — new file: SpeechPlayer class wrapping Web Speech API with utterance queue and pause handling

Plan:
- [x] Landing page — hero, how it works, 3 categories, features grid, CTA, footer
- [x] Wire landing into app flow — unauthenticated → Landing → Get started → Auth
- [x] Final polish — no console.logs, no TODOs, no hardcoded strings, state flows verified

Changes:
- `Landing.tsx` — new file: full landing page
- `App.tsx` — Landing shown for unauthenticated users, SKIP_AUTH bypasses it
- `index.html` — title, meta tags, manifest, service worker (session 12)

### Session 15 — Apr 3 (Deployment + Fixes)

- [x] Schema migration (003_add_columns.sql) — added reference, tools, completion columns
- [x] Created /api/tasks Vercel route
- [x] Updated /api/history with skill_area
- [x] Seeded 475 tasks to Supabase
- [x] Fixed TS errors, deployed to Vercel
- [x] Fixed 401 on /api/tasks (made public read)
- [x] Added category picker to catalog (All / Creative Writing / Learn Kannada / Public Speaking)
- [x] Removed all DB writes from user flow (read-only content experience)
- [x] Removed IntentCapture dependency — catalog shows all categories directly

Live: https://app-mu-nine-97.vercel.app

---

## Product Evolution Decisions

*Captured March 31, 2026*

### Second Goal Category: Public Speaking

Replacing Learn Kannada with Public Speaking for the friends beta. Rationale:
- Enormous demand, consistently ranked as a top skill people want to improve
- Genuine market gap — no "5-minute daily public speaking practice" product exists
- Naturally varied sub-skills: vocal delivery, storytelling, impromptu speaking, persuasion, clarity, presence
- Progress is felt quickly — users notice improved articulation in real conversations
- The "must speak aloud" constraint filters for higher-intent practice moments

### Skill Hierarchy

Goals are not flat — they decompose into skill areas. Example:

```
Public Speaking
├── Vocal Delivery (pace, volume, filler words, pauses)
├── Storytelling Structure (hooks, narrative arc, callbacks)
├── Impromptu Speaking (thinking on your feet, frameworks)
├── Persuasion (framing, evidence, emotional appeal)
├── Clarity (explaining complex things simply, analogies)
└── Presence (confidence, body language, eye contact)
```

Adding `skill_area` to the task schema. The suggestion engine balances across skill areas so users develop breadth, not just depth in one area. Skip patterns per skill area become a meaningful signal.

### Richer Task Structure

Current tasks are a single `description` blob. This makes them feel like commands rather than complete instruction sets. Splitting into layered fields:

- **action** — the specific thing to do
- **context** — why this exercise matters
- **constraint** — what makes it a deliberate practice exercise
- **example** — optional, shows what good looks like

The UI presents these progressively — show the action on the suggestion card, reveal full context on the focused screen, surface the example as a hint if needed.

✅ Implemented in Session 2. All 175 creative writing tasks and 150 Kannada tasks have the full structure.

### Composable Task Format

*Added April 3, 2026*

The app should be the **workspace** for the task, not just a task launcher. Creative writing only needs a prompt (user writes elsewhere), but learning categories (Kannada, guitar, public speaking) need the app to present reference material and provide interactive tools.

Instead of building category-specific UIs, we decompose what any task needs into **composable primitives**:

1. **Reference types** — how content is presented: `text`, `structured_list`, `steps`, `pairs`, `media`
2. **Workspace tools** — interactive elements: `timer`, `reveal_hide`, `text_input`, `checklist`, `recorder`
3. **Completion signals** — how the task ends: `self_report`, `timer_end`, `checklist_done`, `text_submitted`

A Kannada vocabulary task = `structured_list` + `reveal_hide` + `self_report`.
A public speaking task = `text` + `timer` + `timer_end`.
A fitness task = `structured_list` + `timer` + `checklist` + `checklist_done`.

5 reference types × 5 tools × 4 completion signals covers virtually any micro-task category. New categories just combine existing primitives — no new UI components needed.

Full spec: [Architecture.md → Composable Task Format](./Architecture.md#composable-task-format)

### Feedback Loop (Scoped)

**For MVP:** Free-text reflection + skip reasons (already built). Add `skill_area` to suggestion engine for balanced coverage.

**Post-MVP Priority 1:** Structured feedback per completion — "What was hardest?" with skill-area-specific options. Feeds directly into suggestion engine weighting. No LLM needed.

**Post-MVP Priority 3:** LLM analysis of accumulated reflections + structured feedback → surface patterns → generate personalized tasks. This is what makes the app genuinely adaptive.

---

## Build Details

**Data model:** See [Architecture.md](./Architecture.md#data-model)

**API endpoints:**
- `POST /api/goals/parse` — takes free text, returns mapped goal category (keyword matching)
- `GET /api/suggest` — returns one task (user's goal + scoring logic)
- `POST /api/events` — logs shown/started/skipped/completed with skip_reason and reflection
- `GET /api/history` — recent completed tasks with reflections
- `GET /api/momentum` — weekly momentum score + daily completion count
- `GET /api/status` — whether user has hit "done for today" threshold

Auth handled directly by Supabase client SDK on frontend. API routes validate Supabase JWT.

**Suggestion logic (v1) — simple weighted heuristics:**
1. If user has completed 3+ tasks today → return "done for today" state
2. Get all tasks for user's goal not completed or recently skipped
3. Avoid same task type as last completed task
4. If skip_reason was "too_long" recently → prefer shorter tasks
5. If skip_reason was "wrong_type" → exclude that type this session
6. If skip_reason was "too_easy" → boost difficulty
7. Favor easier tasks if user has < 10 total completions, otherwise mix harder ones
8. Random pick from top-scored candidates (adds variety)

No ML. No complex scoring. Just rules that learn from contextual skips.

**What friends get:** Sign up → type goal → get tasks → do them → reflect → momentum → done for today.
**What they don't get:** History screen, second goal, landing page, PWA, mobile polish, email notifications.

---

## Success Signals (Post-Launch)

Not looking for thousands of users. Looking for:

- ✅ 5–10 users opening the app 4+ days/week
- ✅ Task completion rate > 50% (of tasks shown)
- ✅ Users returning after day 7 without reminders
- ✅ At least one user saying "this is actually useful"
- ✅ Reflection usage > 30% (indicates investment in the experience)
- ✅ Users hitting "done for today" regularly (indicates multi-task sessions)

If yes → invest in native mobile, more goals, smarter scoring, growth.
If no → task quality or core loop needs rethinking. Learned in 4 weeks, not 6 months.

---

## MVP Cost

| Item | Cost |
|---|---|
| Vercel (frontend + API routes) | Free tier |
| Supabase (auth + Postgres DB) | Free tier |
| OpenAI API (batch task generation) | ~$10 one-time |
| Resend (email, added later) | Free tier |
| Domain name | ~$12/year |
| **Total** | **~$22** |

---

## Habit Formation Design (Hook Model)

| Phase | Implementation |
|---|---|
| **Trigger** | "I have 10 free minutes" (internal) + daily email (external, added later) |
| **Action** | Open app → see one clean suggestion → tap "Let's go" (minimal friction) |
| **Variable Reward** | Task variety — sometimes creative, sometimes learning, sometimes reflection. The suggestion itself is the reward. |
| **Investment** | Reflection text, completion history, behavioral data that improves future suggestions. The app gets more personal over time. |

Products integrated into habits achieve 94% higher retention than those requiring conscious decisions each use.

---

## Post-MVP Roadmap (If Signals Are Positive)

### Priority 1 — Structured Feedback Loop

**What:** After task completion, add one structured question alongside the free-text reflection. Options are specific to the task's skill area.

**Example (Public Speaking → Vocal Delivery):**
> "What was hardest?" → "Staying on pace" / "Avoiding filler words" / "Varying my tone" / "It felt easy"

**Why first:**
- Turns every completion into an actionable signal, not just a journal entry
- Feeds directly into the suggestion engine — if someone consistently says pacing is hard, weight toward more pacing exercises at easier difficulty
- No LLM needed — just structured options per skill area and rules in the engine
- Makes the user feel heard — "the app noticed I struggle with X and gave me more practice"

**Signal to build:** Reflection text is mostly empty (users skip it), but skip rates vary by skill area.

---

### Priority 2 — Task Clarification ("Ask About This Task")

**What:** A lightweight Q&A interaction on the task card. User taps a "?" icon, asks a question about the current task, gets a short contextual answer. Keeps them in the app instead of Googling or skipping.

**Design constraints:**
- Not a full chat interface — single-turn Q&A with max 2-3 follow-ups
- Small "?" icon on the task card, not prominent until needed
- LLM receives task description + user's goal as context, answers only about this task
- Pre-generate 1-2 suggested questions per task as quick-tap options (e.g., "Show me an example," "Simplify this," "What should I focus on?")
- After 2-3 exchanges, nudge: "Ready to start?"
- Streaming responses to minimize perceived latency

**Cost impact:** Adds per-interaction LLM cost. At GPT-4o-mini pricing, ~$0.50-1/day at 100 DAU. Requires extracting API to a standalone server for streaming support.

**Signal to build:** High skip rates on tasks that mention specific techniques or domain-specific terms.

---

### Priority 3 — LLM-Powered Feedback Analysis & Personalized Tasks

**What:** Periodically analyze accumulated reflections + structured feedback to surface patterns and generate personalized tasks.

**Examples:**
- "You've mentioned 'rushing' in 4 reflections this week. Here's a task specifically designed for pace control."
- "You've completed 12 storytelling tasks but only 2 vocal delivery tasks. Here's an easy vocal warm-up to try."
- Generate a custom task targeting a specific weakness identified from feedback patterns.

**Why this order:**
- Needs real data first — structured feedback (Priority 1) must be collecting for weeks before patterns emerge
- Needs the standalone server (Priority 2 dependency) for LLM calls
- This is what makes Forge a product, not a task randomizer — the app genuinely gets smarter over time

**Signal to build:** Users with 20+ completions show measurable patterns in their structured feedback data.

---

### Priority 4+

4. **More goal categories** — expand from 2 to 5–10 based on collected demand data from unsupported goal inputs
5. **Extract API to standalone server** — move from Vercel API Routes to Express on Railway ($5/mo) when latency or complexity demands it
6. **Native mobile app** — React Native, with proper push notifications
7. **Skill progression visualization** — radar chart or simple view showing time spent across skill areas
8. **Monetization** — freemium with premium tier ($10–15/mo) for unlimited goals, advanced stats, priority task generation
9. **Social/community** — optional accountability features, not core to the loop

---

### Priority 5 — Progress Migration to Supabase

**What:** Move progress tracking from localStorage (`momentum.ts`, `progress.ts`) to Supabase. The schema already exists — `user_task_events` and `daily_summary` tables are defined in `001_schema.sql` but the frontend never writes to them.

**Why it matters:**
- Progress doesn't sync across devices
- Progress is lost on browser clear
- Server-side intelligence (SRS scheduling, adaptive recommendations) is impossible without server-side progress data
- The `user_task_events` table already tracks `shown`, `started`, `skipped`, `completed` — the schema is ready

**Implementation:** Dual-write (localStorage + Supabase) during transition. Read from localStorage for speed, sync to Supabase in background. Eventually read from Supabase as source of truth.

**Not P0.** localStorage works for single-device MVP. This becomes critical when SRS or cross-device sync is needed.

---

### Priority 6 — Intelligent Task Selection Engine

**What:** Replace the random next-task picker in `WhatsNext.tsx` with an intelligent recommendation engine.

**Current state:** `WhatsNext.tsx` line 37 picks a random task from the entire category: `tasks[Math.floor(Math.random() * tasks.length)]`. The journey system has careful sequencing, but the "keep going" suggestion after completing a task ignores it entirely.

**What it should do:**
1. Respect journey sequence — suggest the next uncompleted task in the current journey
2. Balance across skill areas — if you've done 5 vocabulary tasks, suggest grammar
3. Factor in SRS due items (once SRS exists) — review items take priority over new material
4. Consider time of day / session length — shorter tasks for quick sessions

**Not P0.** Random selection is acceptable for early usage. This becomes important when users have 100+ completed tasks and need intelligent guidance on what to do next. Depends on Priority 5 (server-side progress) for full implementation.

---

## UX Audit Findings (April 2026)

> Full audit in `UX-Audit.md`. Summary of infrastructure gaps and implementation paths below.

### Context

A full UX walkthrough + research synthesis (habit-forming app design, evidence-based learning, gamification psychology) revealed that the engagement layer is solid but the **learning effectiveness layer** has critical gaps. The task data is well-designed with goal-specific metadata (BPM for guitar, dialogues for Kannada, text_input for philosophy), but the rendering in `buildSteps()` treats all tasks identically.

### Infrastructure Gap 1: Spaced Repetition (Effort: 2-3 days)

**Problem:** No mechanism to resurface forgotten material at optimal intervals. "1/39 completed" tracks exposure, not retention.

**What exists:** `structured_list` items already have individual reviewable units (each Kannada word, each philosopher, each chord) with consistent shape (`primary`, `secondary`, `reveal`, `details`, `body`). Quiz mode in `ReferenceRenderer` already shows items one at a time.

**Implementation path:**
1. New table: `user_item_reviews(user_id, task_id, item_index, correct, reviewed_at, next_review_at, interval_days)`
2. Modify Quiz mode to record right/wrong per item ("Got it" / "Missed it" buttons)
3. Leitner 3-box algorithm: new → 1 day, correct → double interval, wrong → reset
4. New dynamic "Review" task type that queries due items across tasks for a goal

**Risk:** Low. SRS is a solved problem. Data shape supports it.

### Infrastructure Gap 2: Audio (Effort: 0.5-3 days depending on scope)

**Problem:** Kannada pronunciation (16 tasks), guitar ear training (25 tasks), and public speaking (150 tasks) need audio.

**What already exists (surprise finding):**
- `speechEngine.ts` — generates utterance scripts with `lang` field supporting `kn-IN` for Kannada
- `speechPlayer.ts` — wraps browser `SpeechSynthesis` API with play/pause/progress
- `AudioPlayerScreen.tsx` — full screen component with controls
- The 🗣 and 🎧 buttons on Completion screen already link to these modes

**What's still missing:**
- Audio recording for public speaking: `MediaRecorder` API wrapper (~1 day)
- Guitar tone synthesis for ear training: Tone.js integration (~2-3 days)
- Surfacing audio more prominently in the task flow (🗣/🎧 are on Completion screen but should be in Study step)

**Risk:** Medium. Browser Kannada TTS quality varies by device. Guitar audio synthesis is real work.

### Infrastructure Gap 3: Progressive Difficulty (Effort: ~1 day for guitar)

**Problem:** Guitar tasks have static `bpm` fields. Practice at 60 BPM forever = stagnation.

**Implementation path:**
1. New table: `user_skill_levels(user_id, goal_category, skill_area, param_name, current_value)`
2. After guitar task: "Could you play this cleanly?" → Yes: bump BPM by 5-10
3. Override static `bpm` with user's current level when rendering

**For non-guitar goals:** Journey sequencing already handles progressive difficulty. Tasks get harder as you advance through sequences. No additional infrastructure needed.

**Risk:** Low for guitar. Non-issue for other goals.

### Infrastructure Gap 4: Metadata-Driven Rendering (Effort: ~2 hours)

**Problem:** `buildSteps()` in `Focused.tsx` builds the same step flow for every task. The task data already encodes different practice needs through `type`, `tools`, `reference.type`, and `completion`.

**Implementation path:** Make `buildSteps()` branch on task metadata:
- `tools: ['metronome']` + `bpm` → lead with metronome-guided drill
- `tools: ['text_input']` → lead with writing prompt
- `reference.type: 'dialogue'` → interactive dialogue rendering
- `reference.type: 'fill_blank'` → fill-in-the-blank quiz
- `type: 'retrieval'` → quiz-first (no Learn mode)

**Risk:** Low. One function refactor. Components already exist.

### Revised Priority Stack

| Priority | Change | Type | Effort |
|---|---|---|---|
| P0 | Default to retrieval practice (Quiz first) | Learning | 30 min |
| P0 | Make `buildSteps()` metadata-driven | Learning | 2 hr |
| P0 | Lead home screen with next task | Engagement | 2 hr |
| P0 | Add streak counter | Engagement | 1 hr |
| P1 | Implement basic spaced repetition | Learning | 2-3 days |
| P1 | Surface audio (🗣/🎧) in Study step, not just Completion | Infrastructure | 1 hr |
| P1 | Add audio recording for public speaking | Infrastructure | 1 day |
| P1 | Progressive BPM tracking for guitar | Learning | 1 day |
| P1 | Variable completion messages | Engagement | 30 min |
| P1 | Collapse journey tasks (show next 3-5) | Engagement | 2 hr |
| P1 | Structured reflect prompts per task type | Learning | 1 hr |
| P2 | Guitar ear training audio (Tone.js) | Infrastructure | 2-3 days |
| P2 | Session-opening recall checks | Learning | 1 day |
| P2 | Stats on completion screen | Engagement | 1 hr |
| P2 | Social sharing | Engagement | 2 hr |

---

*Document created: March 29, 2026*
*Last updated: April 11, 2026*
*Repository: [github.com/abhishekbharti444/Forge](https://github.com/abhishekbharti444/Forge)*
