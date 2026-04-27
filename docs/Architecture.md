# Forge — Architecture

---

## Overview

```
┌─────────────────────────────────────────────────────┐
│                  Vercel (Free Tier)                  │
│                                                     │
│  ┌──────────────────┐   ┌────────────────────────┐  │
│  │  React SPA       │   │  API Routes            │  │
│  │  + Tailwind      │   │  (TypeScript)          │  │
│  │  + PWA           │   │                        │  │
│  │  + Landing Page  │   │  /api/suggest          │  │
│  │                  │   │  /api/events           │  │
│  │  Static assets   │   │  /api/goals/parse      │  │
│  │  served via CDN  │   │  /api/momentum         │  │
│  │                  │   │  /api/history          │  │
│  │                  │   │  /api/status           │  │
│  └──────────────────┘   └───────────┬────────────┘  │
│                                     │               │
└─────────────────────────────────────┼───────────────┘
            │                         │
            │  Supabase Auth          │  Supabase Postgres
            │  (JWT tokens)           │  (data queries)
            │                         │
            ▼                         ▼
┌─────────────────────────────────────────────────────┐
│                 Supabase (Free Tier)                 │
│                                                     │
│  ┌──────────────────┐   ┌────────────────────────┐  │
│  │  Auth             │   │  PostgreSQL            │  │
│  │                  │   │                        │  │
│  │  Email/password  │   │  users                 │  │
│  │  JWT issuance    │   │  user_goals            │  │
│  │  50K MAU free    │   │  tasks                 │  │
│  │                  │   │  user_task_events       │  │
│  │                  │   │  daily_summary          │  │
│  │                  │   │                        │  │
│  │                  │   │  500 MB free            │  │
│  └──────────────────┘   └────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Two services. One deploy command. $0/month.**

---

## Why This Architecture

### Decisions Made

| Decision | Choice | Alternatives Considered | Why This One |
|---|---|---|---|
| Frontend framework | React + Vite (SPA) | Next.js, Astro | No SSR needed — app is behind auth, no SEO content. SPA is simplest. |
| Backend | Vercel API Routes | Custom Express server, Supabase Edge Functions, Cloudflare Workers | Zero deploy overhead. Same repo as frontend. Free. Extract to Express later if needed. |
| Database | Supabase Postgres | Firebase Firestore, PlanetScale | Data is relational. Suggestion query is SQL-shaped. Auth bundled. |
| Auth | Supabase Auth | Firebase Auth, custom JWT | Comes free with Supabase. Frontend SDK handles login/signup. API validates JWT. |
| Goal parsing | Keyword matching | LLM classification (OpenAI) | 2 categories don't need an LLM. Zero cost, zero latency, no API dependency. |
| Task generation | Offline LLM + manual curation | Real-time LLM generation | Quality > speed. Hand-curated tasks are better than real-time generated ones. |
| Hosting | Vercel | Netlify, Cloudflare Pages | Best React/Vite support. API Routes built in. Generous free tier. |
| Notifications | Skip for MVP | Resend + cron, push notifications | Test organic return behavior first. Add email later if users say "I forget." |
| Server model | Serverless (Vercel Functions) | Always-on (Railway/Fly.io) | $0 cost. Cold start (200-500ms) acceptable for 20 test users. |

### What We Explicitly Avoided

- **Supabase-only (no API layer):** Business logic scattered across RLS policies, Edge Functions, and DB functions. Hard to test, hard to refactor. The suggestion engine is core IP — it deserves proper code.
- **Full custom backend from day one:** Deploying and maintaining a separate server adds ops overhead with no benefit at MVP scale.
- **Real-time LLM calls:** Adds latency, cost, and unpredictable quality. Pre-generated + curated tasks are faster and better.
- **Native mobile:** Adds weeks of development, app store review cycles, and platform-specific bugs. Web PWA tests the same core loop.

---

## Audio Infrastructure

Kannada bilingual stories require pre-generated audio (browser TTS can't produce quality Kannada). Two local TTS models generate audio offline:

- **IndicF5** — Kannada audio. Runs in conda env `indicf5`. ~1 min/sentence on CPU.
- **Kokoro-82M** — English audio. Runs in system Python. ~1 sec/sentence.

All audio normalized to -23 LUFS via ffmpeg loudnorm.

**Two-modality decision:** Only story audio is served in production. Visual tasks (vocabulary, grammar, script, phrases) don't need pre-generated audio — they're screen-first.

**Serving:** Story audio lives in `public/audio/stories/`, committed to git, served as static assets via Vercel CDN. At ~1MB per story (25 sentences × 2 languages × ~20KB each), this scales to 200+ stories before reaching any limits.

```
public/audio/stories/
├── kn-story-001/          # The Thirsty Crow
│   ├── kn_0.mp3 ... kn_21.mp3   # Kannada (IndicF5)
│   └── en_0.mp3 ... en_21.mp3   # English (Kokoro)
├── kn-story-002/          # next story
│   └── ...
```

Story metadata (sentences, translations, transliterations, audio URLs) lives in `data/stories/*.json`.

---

## Auth Flow

```
1. User opens app
2. Frontend → Supabase Auth SDK → login/signup (email + password)
3. Supabase returns JWT
4. Frontend stores JWT (Supabase SDK handles this)
5. Every API call: Frontend sends JWT in Authorization header
6. Vercel API Route → validates JWT against Supabase → extracts user_id → proceeds
```

No custom auth code. No session management. Supabase handles token refresh automatically.

---

## Data Model

```sql
-- Users (created by Supabase Auth, extended with our fields)
users
├── id              uuid        PK (matches Supabase auth.users.id)
├── email           text
├── goal_input_text text        -- raw text user typed ("I want to learn songwriting")
└── created_at      timestamptz

-- Active goals per user
user_goals
├── id              uuid        PK
├── user_id         uuid        FK → users.id
├── goal_category   text        -- mapped category: "creative_writing", "learn_kannada"
└── created_at      timestamptz

-- Pre-generated task bank (seeded from curated JSON)
tasks
├── id              uuid        PK
├── goal_category   text        -- which goal this task belongs to
├── skill_area      text        -- sub-skill within the goal (e.g., "observation", "vocabulary")
├── description     text        -- full original description (backward compat)
├── action          text        -- clear instruction: what to do
├── context         text        -- why this exercise matters
├── constraint_note text        -- the rules/boundaries
├── example         text        -- what good looks like
├── type            text        -- practice / learning / reflection / retrieval
├── difficulty      text        -- easy / medium / stretch
├── time_minutes    int         -- 5 / 10 / 15
├── reference       jsonb       -- structured content for the task (see Composable Task Format below)
├── tools           text[]      -- workspace tools needed: timer, reveal_hide, text_input, checklist
└── completion      text        -- how the task ends: self_report (default), timer_end, checklist_done, text_submitted

-- Every interaction tracked
user_task_events
├── id              uuid        PK
├── user_id         uuid        FK → users.id
├── task_id         uuid        FK → tasks.id
├── event           text        -- shown / started / skipped / completed
├── skip_reason     text        -- nullable: too_long / wrong_type / too_easy
├── reflection_text text        -- nullable: user's optional reflection on completion
├── duration_seconds int        -- nullable: time between start and done
└── timestamp       timestamptz

-- Aggregated daily stats (computed on write or via DB trigger)
daily_summary
├── id              uuid        PK
├── user_id         uuid        FK → users.id
├── date            date
├── tasks_completed int
├── tasks_skipped   int
└── momentum_level  text        -- getting_started / building / on_fire
```

### Indexes

```sql
-- Fast suggestion queries
CREATE INDEX idx_events_user_task ON user_task_events(user_id, task_id, event);
CREATE INDEX idx_events_user_date ON user_task_events(user_id, timestamp);
CREATE INDEX idx_tasks_category ON tasks(goal_category);
CREATE INDEX idx_daily_user_date ON daily_summary(user_id, date);
```

---

## API Endpoints

All endpoints require a valid Supabase JWT in the `Authorization: Bearer <token>` header (except `/api/tasks` and `/api/categories` which allow public read).

### `POST /api/goals/parse`

Classifies free-text goal input into a supported category.

```
Request:  { "text": "I want to write better songs" }
Response: { "category": "creative_writing", "supported": true }
    — or —
Response: { "category": null, "supported": false, "input_saved": true,
            "available": ["creative_writing", "learn_kannada", ...] }
```

Keyword matching across 8 categories.

### `GET /api/categories`

Returns all available goal categories with task counts.

```
Response: { "categories": [
  { "id": "creative_writing", "emoji": "✍️", "label": "Creative Writing", "count": 175 },
  { "id": "learn_kannada", "emoji": "🇮🇳", "label": "Learn Kannada", "count": 160 },
  ...
]}
```

### `GET /api/tasks`

Returns tasks, optionally filtered by category. Public read (no auth required).

```
GET /api/tasks                    → all tasks (or user's active goal)
GET /api/tasks?category=learn_kannada → tasks for specific category
Response: { "tasks": [...], "total": 160 }
```

### `GET /api/suggest`

Returns one task recommendation with level sequencing.

```
Response: { "task": { ... }, "tasks_completed": 2 }
    — or —
Response: { "done_for_today": true, "tasks_completed": 3 }
```

Level sequencing: computes max completed level per skill area, gates tasks at level > maxCompleted + 1.

### `POST /api/events`

Logs a user-task interaction (currently disabled in production — read-only mode).

### `GET /api/momentum`

Returns weekly momentum data.

```
Response: { "level": "building", "days_active": 3, "tasks_completed": 7, "week_start": "2026-03-23" }
```

### `GET /api/history`

Returns recent completed tasks with reflections and skill_area.

### `GET /api/concepts`

Returns concepts encountered by the user, grouped by skill area.

```
Response: { "concepts": { "ethics": ["utilitarianism", "deontology", ...], "fundamentals": ["CAP theorem", ...] } }
```

### `GET /api/status`

Returns current session state.

```
Response: { "done_for_today": false, "tasks_completed_today": 1, "has_active_goal": true }
```

---

## Suggestion Engine (v1)

Lives in `services/suggestionEngine.ts` — separate from route handlers for easy replacement later.

```
Input:  user_id
Output: one task object, or "done for today" signal

Algorithm:
1. Query daily_summary for today → if tasks_completed >= 3, return done_for_today
2. Get user's active goal_category
3. Query all tasks for that category
4. Exclude: tasks already completed by this user
5. Exclude: tasks skipped in the last 24 hours
6. Score remaining tasks:
   a. Type diversity:  +2 if different type from last completed task
   b. Skip signals:    +2 for shorter tasks if recent skip_reason = "too_long"
                       -5 for same type if recent skip_reason = "wrong_type"
                       +2 for harder tasks if recent skip_reason = "too_easy"
   c. Difficulty ramp: +2 for easy if user has < 10 total completions
                       +1 for medium/stretch if user has 10+ completions
   d. Randomness:      +random(0, 1) to prevent deterministic ordering
7. Return highest-scored task
```

### Why a Separate Module

The suggestion engine is the core IP. Keeping it in its own file means:
- Unit testable without HTTP concerns
- Swappable: heuristics today → ML model tomorrow → same API contract
- Readable: the scoring logic is the most important code in the project

---

## Composable Task Format

*Added April 3, 2026*

### The Problem

Different goal categories need fundamentally different things from the UI:
- **Creative writing**: just a prompt — user writes elsewhere. The app is a launcher.
- **Learn Kannada**: two modalities. Visual: structured word lists, script display, tap-to-reveal self-testing (the app is the learning tool). Audio: bilingual stories with sentence-by-sentence Kannada→English playback (the app is a podcast). Stories use pre-generated audio (IndicF5 for Kannada, Kokoro for English) committed to git and served as static assets. Visual tasks use no pre-generated audio.
- **Public speaking**: a visible timer, the prompt staying on screen while speaking. The app supports the performance.
- **Guitar**: chord diagrams, BPM reference, timer. The app is the practice companion.
- **Fitness**: exercise descriptions, rep counts, rest timers. The app is the coach.

Building category-specific UIs doesn't scale. Instead, we decompose what any task needs into composable primitives.

### What Every Task Needs

Regardless of category, completing a micro-task involves:

1. **Instruction** — what to do (action, constraint, context, example — already built)
2. **Reference material** — the actual content to learn from or respond to (NEW)
3. **Workspace tools** — interactive elements to do the task within the app (NEW)
4. **Completion signal** — how the user (or app) knows the task is done (NEW)

### Reference Types

How the task's content is presented. Stored in the `reference` jsonb field.

| Type | Renders as | Used by |
|---|---|---|
| `text` | Plain text prompt (current behavior, default) | Creative writing, drawing, photography, coding |
| `structured_list` | Rows with primary/secondary/reveal columns | Vocabulary, ingredients, exercises, items to memorize |
| `steps` | Ordered numbered sequence | Cooking, multi-step exercises, grammar patterns |
| `pairs` | Side-by-side comparison | Pronunciation minimal pairs, before/after, style comparison |
| `media` | Image/audio URL (future) | Chord diagrams, reference images, audio clips |

**Examples:**

```json
// Vocabulary task (Learn Kannada)
{
  "type": "structured_list",
  "items": [
    { "primary": "ಕಣ್ಣು", "secondary": "Kannu", "reveal": "eye" },
    { "primary": "ಮೂಗು", "secondary": "Moogu", "reveal": "nose" },
    { "primary": "ಬಾಯಿ", "secondary": "Baayi", "reveal": "mouth" }
  ]
}

// Speaking task (Public Speaking)
{
  "type": "text",
  "body": "Pick any object within reach. You have 30 seconds to think, then speak for exactly 90 seconds about why this object is the most important invention in human history."
}

// Grammar pattern (Learn Kannada)
{
  "type": "steps",
  "steps": [
    "Start with the subject: ನಾನು (Naanu = I)",
    "Add the object: ನೀರು (Neeru = water)",
    "End with the verb: ಕುಡಿಯುತ್ತೇನೆ (Kudiyuttene = drink)",
    "Full sentence: ನಾನು ನೀರು ಕುಡಿಯುತ್ತೇನೆ (I drink water)"
  ]
}

// Pronunciation minimal pairs
{
  "type": "pairs",
  "pairs": [
    { "left": "ಕಲ (kala) = art", "right": "ಕಾಲ (kaala) = time" },
    { "left": "ಬಲ (bala) = strength", "right": "ಬಾಲ (baala) = tail" }
  ]
}
```

### Workspace Tools

Interactive elements the Focused screen provides. Stored in the `tools` text array field.

| Tool | What it does | Used by |
|---|---|---|
| `timer` | Countdown timer (duration from `time_minutes` or custom) | Speaking, fitness, meditation, guitar practice |
| `reveal_hide` | Tap to show/hide content (the `reveal` field in structured_list items) | Vocabulary self-testing, memory, retrieval tasks |
| `text_input` | Inline text area for writing within the app | Reflection, journaling, clear thinking, translation exercises |
| `checklist` | Mark items as done (for multi-step tasks) | Cooking, multi-step exercises, practice routines |
| `recorder` | Audio recording via phone mic (future) | Speaking, pronunciation |

A task can request multiple tools: a fitness task might use `["timer", "checklist"]`.

### Completion Signals

How the task ends. Stored in the `completion` text field.

| Signal | Behavior | Default for |
|---|---|---|
| `self_report` | User taps "I'm done" (current behavior) | Everything without specific tools |
| `timer_end` | Timer runs out, auto-transition to completion | Timed speaking, meditation |
| `checklist_done` | All items checked, "I'm done" enables | Multi-step tasks |
| `text_submitted` | User writes something and submits | Reflection, translation, journaling |

### How the Focused Screen Adapts

The Focused screen assembles itself from the task's reference + tools + completion:

```
┌─────────────────────────────┐
│  [skill_area · difficulty    │  ← metadata bar (subtle)
│   · time_minutes]            │
│                              │
│  Action text                 │  ← always shown (from action field)
│                              │
│  ┌─ Reference ─────────────┐│  ← rendered based on reference.type
│  │  (list / steps / pairs  ││     structured_list → table with rows
│  │   / text / media)       ││     steps → numbered list
│  └─────────────────────────┘│     pairs → side-by-side cards
│                              │
│  Constraint                  │  ← always shown if present
│  Context (subtle)            │  ← always shown if present
│  Example (card)              │  ← always shown if present
│                              │
│  ┌─ Tools ─────────────────┐│  ← rendered based on tools array
│  │  [Timer] [Reveal/Hide]  ││     timer → countdown display
│  │  [Text input] [Checklist]│     reveal_hide → tap interactions
│  └─────────────────────────┘│     text_input → textarea
│                              │
│  [Completion button]         │  ← based on completion signal
└─────────────────────────────┘
```

Tasks without `reference` or `tools` render exactly as today — just action + constraint + context + example + "I'm done" button. Fully backward compatible.

### Product Principle: The Two Legs

*Updated April 11, 2026*

Forge stands on two product principles. Both are required. Either alone is insufficient.

**Leg 1: Eliminate the decision.** Be the practice ground when we can. Be the best coach when we can't. The user opens the app and the next action is already chosen. No planning, no browsing, no deciding.

**Leg 2: Make the practice real.** The time spent in Forge must produce actual skill progress — not the illusion of it. Retrieval over recognition. Production over consumption. Desirable difficulty over easy wins.

The Duolingo contrast: Duolingo optimizes for engagement (streaks, XP, recognition taps). Users complete millions of lessons and can't hold a conversation. Forge optimizes for actual learning. It's harder in the moment. But it works.

**The test for every feature:**
1. Does this eliminate a decision? (Leg 1)
2. Does this produce real skill progress? (Leg 2)
3. If neither — don't build it.

### Coach + Practice Ground

For tasks where our interface IS sufficient — vocabulary drilling, quizzing, timed speaking, fill-in-the-blank, dialogue practice, self-testing — the in-app experience should be complete. The user shouldn't need to leave.

For tasks where practice is inherently external — swimming, guitar, drawing — we provide the best possible instructions, technique cues, and resources, then welcome them back for reflection.

Fits (build it): quiz mode, fill-in-the-blank, dialogue practice, timer, text input, rich item details.
Doesn't fit (don't build): drawing canvas, code editor, video player, audio recorder, movement tracker.

### Task Types by Practice Location

| Practice happens... | Examples | App's role | In-app tools |
|---|---|---|---|
| **Fully in-app** | Vocabulary quiz, fill-blank, timed speaking, self-assessment, journaling | BE the practice ground | quiz, fill_blank, dialogue, timer, text_input, reveal_hide |
| **Guided external** | Swimming drills, guitar practice, drawing, cooking | Coach: instructions + technique cues + resources | text/steps reference, timer, checklist, `resources` links |
| **Thinking/analysis** | System design, architecture review, critical thinking | Present scenario, capture response | text reference, text_input, self_report |

### Practice Tool First, Learning Tool Second

*Added April 5, 2026*

**Practice tool first, but self-sufficient. No external reading required.**

Forge optimizes for practice — retrieval drills, application scenarios, design exercises. But every skill area must be learnable from scratch within the app. A user who's never read DDIA should be able to build distributed systems mastery using only Forge.

The balance: **gateway narrations** provide the "why" foundation, **concept cards** organize the knowledge, **fill-blanks** test recall, and **what-breaks scenarios** build intuition. The learning path is: story → reference → drill → apply.

**Default to retrieval, not presentation.** Quiz mode is the default for any structured_list with reveal fields. The user must produce the answer before seeing it. Learn mode (show answer first) is available as a fallback, not the starting point. This is a one-line change in rendering but a fundamental shift in learning effectiveness (Roediger & Karpicke, 2006).

| Goal type | Learning happens... | Forge's role | Content strategy |
|---|---|---|---|
| **Skill-based** | In the app | Teach + practice | Rich narrative content, progressive curriculum, in-app exercises |
| **Knowledge-based** | In the app (gateway narrations) + practice | Practice + reinforce | Gateway narrations for "why", concept cards for "what", drills for recall, scenarios for application |

**For knowledge-based goals (e.g., Distributed Systems):**

1. **Gateway narrations first.** Every skill area starts with a 5-minute story explaining WHY the topic exists. This is the foundation that makes everything else click.
2. **Concept cards as organized reference.** Dense is fine — the gateway narration provides context. Cards organize knowledge, not introduce it.
3. **Retrieval practice over re-reading.** Fill-blanks and quizzes that force recall are more effective than re-reading explanations.
4. **Application over theory.** "What breaks?" scenarios and design exercises build intuition that reading alone can't.
5. **System deep dives for connection.** Narrations about real systems (Kafka, Spanner, Cassandra) connect abstract concepts to concrete implementations.
6. **No external reading required, but depth available.** The app is self-sufficient. For users who want to go deeper, `resources` links point to the best external explanations.

### Enhanced Reference Types

Original 5 + 2 new interactive types:

| Type | Renders as | Practice location |
|---|---|---|
| `text` | Plain text prompt | External or thinking |
| `structured_list` | Rows with primary/secondary/reveal + optional `details` array | In-app (with quiz/reveal) |
| `steps` | Ordered numbered sequence | In-app or guided external |
| `pairs` | Side-by-side comparison | In-app |
| `media` | Image/audio URL (future) | In-app |
| `fill_blank` | Prompt with blank, user fills in, reveals answer | **In-app (NEW)** |
| `dialogue` | Alternating speaker lines, user practices one role | **In-app (NEW)** |

### Enhanced Structured List Items

List items support an optional `details` array for rich, category-agnostic content:

```json
{
  "primary": "ಅನ್ನ",
  "secondary": "Anna",
  "reveal": "rice",
  "details": [
    { "label": "Pronunciation", "value": "UN-na (short u, stress on first syllable)" },
    { "label": "Use it", "value": "Swalpa anna kodi = Give some rice" }
  ]
}
```

Same structure works across any domain:
- Guitar: `{ "label": "Fingers", "value": "Index on B1, Middle on D2" }`
- System design: `{ "label": "Trade-off", "value": "Higher consistency, lower availability" }`
- Cooking: `{ "label": "Tip", "value": "Crush lightly before adding" }`

### Quiz Mode on Structured Lists

Any structured_list with `reveal` fields supports quiz mode:
- **Learn mode** (default): see all items, tap to reveal
- **Quiz mode**: show one item at a time, user recalls, then reveals. Tracks score.
- **Reverse quiz**: show the reveal value, user recalls the primary

### Fill-in-the-Blank Reference

```json
{
  "type": "fill_blank",
  "items": [
    { "prompt": "ನಾನು ನೀರು ___", "answer": "ಕುಡಿಯುತ್ತೇನೆ", "hint": "drink (present tense)" },
    { "prompt": "The CAP theorem states you can have at most ___ of three properties", "answer": "two", "hint": "consistency, availability, partition tolerance" }
  ]
}
```

Works for: language grammar, system design, coding, trivia, exam prep.

### Dialogue Reference

```json
{
  "type": "dialogue",
  "lines": [
    { "speaker": "You", "text": "Namaskara, ___-ge hogbeku" },
    { "speaker": "Auto driver", "text": "Eshtu doora?" },
    { "speaker": "You", "text": "Hattira, 2 km" },
    { "speaker": "Auto driver", "text": "150 rupaayi" },
    { "speaker": "You", "text": "Tumba jaasti, 100 kodi" }
  ]
}
```

Works for: language phrases, interview prep, difficult conversations, customer service training.

### Additional Task Fields

| Field | Type | Purpose |
|---|---|---|
| `resources` | `Array<{ label, url }>` | External links (videos, articles, tools) for guided-external tasks |
| `level` | `number` | Progressive difficulty within a skill area (1=beginner, 2=intermediate, 3=advanced) |
| `concepts` | `string[]` | Philosophical/domain concepts covered by this task. Powers the Concept Bank. |
| `body` | `string` (on structured_list items) | 3-5 sentence explanation for Learn mode. Teaches the concept; `reveal` tests recall. |

### Level Sequencing

*Added April 5, 2026*

Tasks with a `level` field are gated by the user's progress in that skill area. The suggestion engine computes the max completed level per skill area from events, then filters:

- Level 1 tasks: always available
- Level 2+ tasks: only served if `level <= maxCompletedLevel + 1` for that skill area
- Tasks without a `level` field: always available (backward compatible)

This ensures beginners see foundational content first (learn the concept) before advancing to application and synthesis tasks.

### Practice Routines — Discovery vs Practice Mode

*Added April 25, 2026. Status: Design resolved. Ready to build after data infrastructure.*

#### The Problem

The current suggestion engine treats every task as one-shot: once completed, it's excluded from future suggestions. This works for **exercise-type tasks** ("Write a scene using only dialogue") where the value is in variety. But it breaks for **drill-type tasks** ("Pushups to failure — write your count") where the value is in repetition with progression.

#### Drills vs Exercises vs Reusable Tasks

Three distinct task behaviors:

| Type | Definition | Example | Progress signal | Engine behavior |
|---|---|---|---|---|
| **Exercise** | One-shot. Do it, move on. | "Write a scene using only dialogue" | Variety — doing many different exercises | Exclude after completion (current behavior) |
| **Drill** | Same action repeated. Measurable outcome trends over time. | "Pushups to failure — write your count" | The number: 12 → 16 → 22 | Re-serve with recency spacing. Show last result. |
| **Reusable** (future) | Same template, different content each time. | "Speak for 90 seconds on a random topic" | Built into task design (different topic each time) | Don't exclude after completion. No outcome tracking needed. |

**Drills are the core concept we build first.** A drill is any task the user should be able to do again because repetition builds the skill. The common thread isn't "produces a number" — it's "this specific action is worth repeating."

Drills vary in outcome type:

| Category | Drill task | Outcome type | What progress looks like |
|---|---|---|---|
| Fitness | Pushups to failure | Number (reps) | 12 → 16 → 22 |
| Fitness | Plank hold | Number (seconds) | 45s → 60s → 90s |
| Fitness | Deep squat hold | Seconds + observation | 30s, ankles tight → 50s, easier |
| Guitar | Am→G chord change | BPM + quality | 60 BPM sloppy → 60 BPM clean → 80 BPM |
| Guitar | Scale run | BPM | 40 → 60 → 80 |
| Kannada | Recall 10 vocabulary words | Score | 6/10 → 8/10 → 10/10 |
| Speaking | Speak for 60 seconds without fillers | Self-assessment | "5 fillers" → "2 fillers" → "none" |

Some produce clean numbers. Some produce qualitative observations. Some are just "I practiced this again and it felt different." All are drills — the user wants to come back to them.

Reusable tasks (speaking prompts, reading exercises) are a separate, simpler problem for later — they just need to not be excluded after completion. No outcome tracking or trend visualization needed.

#### The Insight: Repetition + Progressive Challenge

Real practice isn't pure repetition (treadmill → plateau). It's **the same movement pattern with progressive challenge.** Regular pushups → tempo pushups → pause pushups → diamond pushups. Same push pattern, evolving constraint.

But the user also needs an **ever-present practice space** — the ability to return to any drill they've done before, whenever they want. "I have 10 minutes and I want to do pushups" is a valid use of Forge.

The "Last time: 14" display transforms repetition into challenge. You don't need a different task to create novelty — you need a different number. The novelty is in your own progression.

#### Philosophy Alignment

This doesn't contradict the product philosophy. It fulfills it:

- **"Progress measured in capability, not points"** — the drill outcome IS capability. The pushup count is a living number, not a point.
- **"The app celebrates you leaving"** — the user does their drill, logs their number, and leaves.
- **"The app is a doorway to action"** — the practice space is a doorway to the same action, revisited.

The current "completed = gone forever" model actually contradicts the philosophy — it treats every task as a consumable instead of a practice ground.

#### Resolved Design Decisions

| Question | Decision |
|---|---|
| Engine auto-decide vs user choose? | User chooses from their drills. Smart suggestion engine comes later. |
| Fitness only or cross-category? | Cross-category from day one. Any task with a measurable, repeatable outcome can be a drill. |
| What about tasks done for months? | User decides what to practice. Rotation/staleness is a suggestion engine problem for later. |
| Where does "My Drills" live? | Separate screen inside each goal (not on GoalHome). When you're in Guitar, you see guitar drills. |
| Show "Last time" on the card? | Yes — show last outcome briefly. The data drives motivation by showing potential progress. |
| What's a drill vs what's not? | Drill = same action, measurable outcome that trends. Reusable templates (speaking, reading) are a separate concept for later. |

#### Data Requirements

Per drill completion, store:

| Field | Example | Purpose |
|---|---|---|
| `task_id` | bf-001 | Which drill |
| `outcome` | "14" | The number (reps, seconds, BPM, score) |
| `timestamp` | 2026-04-25T10:30:00Z | When |

Three data points per drill. No ML, no complex algorithm. Just recency + count + last result.

**Blocked by:** Server-side event tracking (Tier 2, item #13). Outcomes must persist across sessions and devices for the trend line to exist.

#### Task Field

```json
{
  "drill": true,
  "outcome_label": "reps"
}
```

- `drill: true` — engine re-serves this task instead of excluding it after completion. Shows in "My Drills."
- `outcome_label` (optional) — what the tracked metric represents ("reps", "seconds", "BPM", "score out of 10"). When present, display shows "Last time: 14 reps." When absent, display shows "Last practiced: 3 days ago." Not every drill needs a clean metric — qualitative drills (observations, self-assessments) work without it.

Tasks without `drill` field behave exactly as today (excluded after completion). Fully backward compatible.

#### UX Flow

**Accessing drills:**
```
GoalHome → tap goal card → Goal screen
  ├── Coach suggestion (current behavior)
  ├── Browse all tasks (current catalog)
  └── My Drills (new section)
        ├── Pushups to failure — Last: 14 reps, 3 days ago
        ├── Plank hold — Last: 52 sec, 5 days ago
        ├── Am→G chord change — Last practiced: 2 days ago
        └── Deep squat hold — Last practiced: 1 week ago
```

**Doing a drill:**
```
Tap drill → Focused screen (same as today)
  → "Last time: 14 reps" or "Last practiced: 3 days ago" shown subtly at top
  → Do the exercise
  → Log outcome (text_input, same as today)
  → Completion screen: "Pushups: 16 reps. Up from 14 last time. 💪"
     — or for non-metric drills: "Am→G practiced. 3rd time this week."
```

**Trend view (future, needs data):**
```
Tap drill → hold or expand → see history:
  Apr 25: 16 reps
  Apr 22: 14 reps
  Apr 18: 12 reps
  ↑ trend line
```

#### Implementation Layers

| Layer | What | Blocked by | Effort |
|---|---|---|---|
| **Content** | Add `drill: true` + `outcome_label` to fitness tasks | Nothing | 1 hour |
| **Engine** | Don't exclude `drill: true` tasks after completion | Nothing | Small code change |
| **UX** | "My Drills" section inside goal screen | Nothing | Half day |
| **UX** | Show "Last time: X" on drill cards and Focused screen | Outcome storage | Half day |
| **Data** | Store outcomes in `user_task_events.outcome` field | Server-side events (#13) | Part of infra sprint |
| **UX** | Trend visualization per drill | Data + design | 1 day |
| **UX** | Completion message with comparison ("Up from 14") | Outcome storage | 1 hour |

Layers 1-3 can ship without any infrastructure. The user won't see their trend line yet, but drills will stop disappearing after completion and will be accessible from "My Drills." Layers 4-7 come after the data infrastructure sprint.

#### References

- Scott H. Young, "Designing the Perfect Practice Loop" (2020) — practice loops are activities repeated with progressive challenge
- Daniel Coyle, R.E.P.S. gauge — effective practice requires Reaching/Repeating, Engagement, Purposefulness, Strong feedback
- Fitbod algorithm — exercise selector (what to do) + capability recommender (how hard), learns from user overrides
- Duolingo algorithm — interleaves new content with review based on forgetting curve, adaptive difficulty
- Progressive overload principle — the same movement with incrementally increasing demand is how physical adaptation works

### Concept Bank

*Added April 5, 2026*

Tasks tagged with `concepts: string[]` feed a Concept Bank — a growing list of philosophical/domain concepts the user has encountered, grouped by skill area. The `/api/concepts` endpoint aggregates unique concepts from completed tasks. The ConceptBank screen shows them as tag chips, making invisible progress visible ("I've encountered 47 concepts across 5 skill areas").

### Category Coverage (Updated)

| Category | Reference | Tools | Completion | Practice location |
|---|---|---|---|---|
| Creative writing | `text` | none | `self_report` | External |
| Learn Kannada (vocab) | `structured_list` + details + body | `reveal_hide`, `quiz` | `self_report` | **In-app** |
| Learn Kannada (grammar) | `fill_blank` | none | `self_report` | **In-app** |
| Learn Kannada (phrases) | `dialogue` | `timer` | `self_report` | **In-app** |
| Learn Kannada (script) | `structured_list` | `reveal_hide` | `self_report` | In-app + paper |
| Learn Kannada (stories) | `bilingual_story` JSON | audio playback | `self_report` | **Audio-first** (eyes-free) |
| Public speaking | `text` | `timer` | `timer_end` | In-app (speaking aloud) |
| Philosophy | `structured_list` + `fill_blank` + `text_input` + `steps` + `pairs` | `reveal_hide`, `text_input` | `self_report`, `text_submitted` | **In-app** |
| Guitar practice | `structured_list` + details + body | `timer` | `timer_end` | Guided external |
| System design | `text` + `fill_blank` | `text_input` | `text_submitted` | **In-app** |
| Swimming | `steps` + details | `timer`, `checklist` | `checklist_done` | Guided external |
| Table tennis | `steps` + details | `timer` | `self_report` | Guided external |
| Fitness | `structured_list` | `timer`, `checklist` | `checklist_done` | Guided external |
| Reading books | `text` | `text_input` | `text_submitted` | External + reflection |
| Better architect | `text` + `fill_blank` | `text_input` | `text_submitted` | **In-app** |
| Drawing/sketching | `text` | `timer` | `self_report` | External |
| Meditation | `text` | `timer` | `timer_end` | In-app |
| Interview prep | `dialogue` + `fill_blank` | `timer` | `self_report` | **In-app** |

7 reference types × 6 workspace tools × 4 completion signals. In-app practice maximized where the interface is sufficient.

---

## Audio Mode (Platform Feature)

*Added April 5, 2026*

### Overview

Audio mode makes every task usable without looking at the screen. It's not a "walking category" — it's a platform-level accessibility feature that multiplies usable practice time (commutes, walks, chores, gym).

Three interaction modes for every task:
- 📱 **Screen** — current step-based visual experience (default)
- 🎧🗣 **Listen + Speak** — app speaks through headset, user responds aloud (walking alone, exercising)
- 🎧 **Listen only** — app speaks, user absorbs silently (bus, train, crowded spaces)

### How It Works

**Listen + Speak flow:**
```
App: "How do you say 'water' in Kannada?"
     [3 sec pause — user thinks]
App: "Answer now."
     [user speaks aloud: "Neeru"]
App: "The answer is: Neeru. ನೀರು. Example: Swalpa neeru kodi — give some water."
     [2 sec pause]
App: "Next word..."
```

**Listen only flow:**
```
App: "Word one. ಅನ್ನ. Anna. Means: rice."
     [2 sec pause]
App: "Example: Swalpa anna kodi. Give some rice."
     [3 sec pause]
App: "Word two. ನೀರು. Neeru. Means: water."
     ...
```

No speech recognition needed. The app provides rhythm (prompt → pause → answer). User self-assesses. This is how language tapes have worked for decades.

### Technical Implementation

**Web Speech API (SpeechSynthesis):**
- Free, built into every modern mobile browser
- Works offline
- Supports multiple languages (including Kannada)
- Controllable: rate, pitch, pause between utterances
- No API keys, no cost, no audio files to generate

**SpeechEngine** — core component that converts any reference type to a timed speech script:

| Reference type | Listen + Speak script | Listen only script |
|---|---|---|
| `structured_list` | "What does [primary] mean?" → pause → "[reveal]" | "[primary]. [secondary]. Means: [reveal]." |
| `fill_blank` | "Complete: [prompt]" → pause → "Answer: [answer]" | "[prompt]. The answer is: [answer]." |
| `dialogue` | App speaks one role, pauses for user's role | App speaks all roles with pauses |
| `text` (action) | Speaks the prompt, starts timer | Speaks prompt + context + example |
| `steps` | Speaks each step with pauses | Same |
| `pairs` | "Compare: [left] versus [right]" | Same |

**Audio script auto-generated from existing task data.** No new content needed — all 475 tasks become audio-compatible.

### UX Flow

```
[Catalog] → tap task → mode selector:
   📱 Screen
   🎧🗣 Listen + Speak
   🎧 Listen only

→ Audio mode UI:
   - Minimal screen: play/pause, progress indicator, "Next" button
   - Screen can be locked — audio continues through headset
   - Media controls (earbuds tap) for pause/advance
   - Vibrate on task completion
```

### Category Compatibility

| Fit level | Categories | Why |
|---|---|---|
| **Excellent** (audio is as good or better) | Language learning, Public speaking, Mindfulness, Interview prep, Memory training | Practice IS speaking/listening/thinking |
| **Good** (works for many tasks) | System design, Critical thinking, Creative writing | Conceptual discussion, oral composition, prompt preview |
| **Limited** (theory only) | Guitar, Drawing, Cooking | Can learn concepts but can't practice the physical skill |

### Design Principle

Audio mode follows the same product principle: **be the practice ground when we can.** For speaking, listening, and thinking tasks, audio mode IS the practice ground — no screen needed. For physical-skill tasks, audio mode becomes the coach's voice in your ear.

### Audio-Native Task Types

*Added April 5, 2026*

Audio doesn't just read existing tasks aloud — it enables entirely new task types that text can't do well.

#### 1. Story-Based Learning + Comprehension

A 2-3 minute narrated story with learning content embedded, followed by comprehension questions.

- **Language:** A short story in simple Kannada with vocabulary in context → quiz on word meanings
- **System design:** A story about a system that failed → quiz on what went wrong and how to fix it
- **Public speaking:** A story about a great speech → quiz on techniques used

Stories stick — people remember narratives 22x better than isolated facts. This turns dry vocabulary lists into memorable experiences.

#### 2. Conversational Role-Play (Audio-Native)

The app SPEAKS one role in a conversation, the user speaks the other. Much more immersive than text bubbles.

- Auto ride: app speaks as the driver in Kannada, user responds
- Job interview: app asks interview questions, user answers aloud
- Difficult conversations: app plays a colleague/manager, user practices responses

#### 3. Guided Thinking Walks

Audio walks the user through a structured thinking process with pauses:

```
"Think of a decision you're facing..."
[10 sec pause]
"Now imagine you're 80 years old looking back. Which choice would you regret NOT making?"
[15 sec pause]
"What's the smallest step you could take this week?"
[10 sec pause]
```

Works for: decision-making, goal-setting, creative ideation, problem-solving, reflection.

#### 4. Active Listening Exercises

App speaks a 2-minute passage. User listens without notes. Then comprehension questions:
- "What were the 3 main points?"
- "What was the speaker's conclusion?"
- "What evidence did they use?"

Trains a skill everyone needs but nobody practices.

#### 5. Ear Training

- Hear two versions of a sentence with different emphasis → "Which sounds more confident?"
- Hear a tone of voice → "What emotion is this?"
- Hear a Kannada word → "Which meaning is correct?"

### Narration Reference Type

A new reference type that covers stories, listening exercises, and guided thinking:

```json
{
  "type": "narration",
  "segments": [
    { "text": "Ramu walked to the angadi...", "pauseAfter": 1 },
    { "text": "He asked: eshtu?", "pauseAfter": 2 },
    { "text": "The shopkeeper smiled and said: nooru rupaayi.", "pauseAfter": 1 }
  ],
  "questions": [
    { "prompt": "What does 'angadi' mean?", "answer": "shop", "type": "recall" },
    { "prompt": "How much did the shopkeeper ask for?", "answer": "100 rupees / nooru rupaayi", "type": "comprehension" }
  ]
}
```

The audio plays segments with pauses, then switches to interactive quiz mode for questions. Same structure works for:
- Story-based learning (narrate → quiz)
- Active listening (narrate → comprehension questions)
- Guided thinking (narrate prompts → user thinks during pauses)
- Ear training (narrate examples → identification questions)

### Audio Quality Strategy

| Content type | TTS approach | Why |
|---|---|---|
| English text | Browser Web Speech API | Free, good quality, works offline |
| Kannada words/phrases | Pre-generated via Google Cloud TTS | Browser Kannada TTS is poor; pre-generate once, serve as static MP3s |
| Story narration | Pre-generated via Google Cloud TTS | Needs natural pacing and emotion; browser TTS too robotic for stories |
| Guided thinking prompts | Browser Web Speech API | English, conversational, browser TTS is adequate |

Pre-generated audio stored as static files in `/public/audio/` or Supabase Storage. Referenced in task data as URLs. Falls back to browser TTS if audio file unavailable.

---

## Read Aloud (Universal Feature)

*Added April 27, 2026. Status: Designed, ready to build.*

### Overview

A universal read-aloud toggle on the Focused screen that narrates the current step's text content via Web Speech API. Not a separate audio mode — it's a layer on top of the existing screen experience. The user sees the same UI, but the app reads it aloud.

Designed for tasks with dense reading content (Philosophy concepts, Distributed Systems explanations, structured lists) where listening is easier than reading. Works for every task type — reads whatever text is visible, waits when user input is required.

### How It Works

- **Toggle:** 🔊 button in the top-right corner of the Focused screen. Tap to start reading, icon changes to 🔇, tap to stop.
- **Voice:** Auto-selects the best English voice available on the device (first non-compact `en-` voice).
- **Speed:** 1.0 (browser default).
- **Wake lock:** Screen stays on while audio is active via Screen Wake Lock API. Released when audio is toggled off or task completes.

### Reading Behavior Per Step Type

The audio reads everything on the current step until user input is required, then waits.

| Step content | Audio reads | Then... |
|---|---|---|
| Instruction (action + constraint + context) | All text sequentially | Auto-advances to next step |
| Reference: `text` | Body text | Auto-advances |
| Reference: `structured_list` | Each item: primary → secondary → reveal → details | Auto-advances |
| Reference: `steps` | Each step sequentially | Auto-advances |
| Reference: `fill_blank` | Prompt, pause, then answer | Auto-advances |
| Reference: `pairs` | Left, then right, for each pair | Auto-advances |
| Reference: `dialogue` | Each line with speaker attribution | Auto-advances |
| Quiz/reveal (interactive) | Reads the question | Waits for user to tap reveal |
| Text input (reflection, writing) | Reads the prompt | Waits for user to type |
| Timer step | Reads the instruction | Waits for timer interaction |

### Auto-Advance

When audio finishes reading a pure-text step (no user interaction needed), it automatically advances to the next step and begins reading. This creates a continuous listening experience through instruction → reference → content steps.

Interactive steps (quiz, text_input, timer) break the auto-advance — audio reads the prompt and waits. After the user completes the interaction and advances manually, audio resumes reading the next step.

### Toggle Persistence

- Toggle state persists for the current task session only (not across tasks, not across app restarts).
- If the user toggles audio on, it stays on for all remaining steps of that task.
- Toggling off cancels speech immediately via `speechSynthesis.cancel()`.

### Technical Implementation

- **Web Speech API:** `SpeechSynthesis.speak()` for narration, `SpeechSynthesisUtterance.onend` for auto-advance trigger.
- **Screen Wake Lock API:** `navigator.wakeLock.request('screen')` while audio is active. Released on toggle off or task completion.
- **Voice selection:** `speechSynthesis.getVoices()` → filter for `lang.startsWith('en')` → prefer non-local/non-compact voices → fallback to default.
- **Text extraction:** A function that takes the current step's data and returns a flat string (or array of strings with pauses) for the speech engine.

### What This Is NOT

- Not a separate audio mode or screen (like AudioPlayerScreen for Kannada stories)
- Not background playback — requires screen to stay on
- Not pre-generated audio — uses runtime TTS
- Not voice interaction — user still interacts via touch on screen

---

## App Flow

*Updated April 7, 2026*

```
Landing → Auth (Google) → GoalHome
                              ↓
                    ┌─── Practice ───┐
                    ↓                ↓
                  Coach          Suggestion (catalog)
                    ↓                ↓
              ┌─────┴─────┐    mode picker
              ↓           ↓        ↓
           Focused    AudioPlayer  Focused
           (steps)    (speak/listen) (steps)
              ↓           ↓        ↓
           WhatsNext ←────┘────────┘
              ↓
        ┌─────┴─────┐
        ↓           ↓
    Next task    DoneForNow → GoalHome
```

### Screens

| Screen | Purpose | Key features |
|---|---|---|
| `Landing` | Marketing page for unauthenticated users | Hero, how it works, categories, features, CTA |
| `Auth` | Google sign-in | Supabase Auth SDK |
| `IntentCapture` | Goal selection | Category cards with descriptions |
| `GoalHome` | Dashboard after login | Greeting, active goals, momentum, practice button, history link |
| `Coach` | Smart task recommendation | Suggests next task based on last completed skill area, avoids repetition |
| `Suggestion` | Browsable task catalog | Category picker, skill area filter, pagination, expandable cards, mode selector |
| `Focused` | Step-based task execution | Instruction → Reference → Exercise → Reflect, with navigation dots |
| `AudioPlayerScreen` | Audio mode task execution | Play/pause, progress bar, skip, current utterance display |
| `WhatsNext` | Post-completion suggestion | Suggests next task in same category, different skill area |
| `DoneForToday` | Rest state | Completion count, green dots, one-more option |
| `History` | Completed tasks list | Date-grouped, skill area, reflection text |
| `ConceptBank` | Concepts encountered | Grouped by skill area as tag chips |
| `TaskReview` | Dev tool (`?review`) | All tasks browsable, expandable, paginated |

### Domain-Specific Components

| Component | Purpose |
|---|---|
| `ReferenceRenderer` | Dispatches to type-specific renderers (structured_list, fill_blank, dialogue, narration, steps, pairs) |
| `WorkspaceTools` | Timer, TextInput, Checklist components |
| `ChordDiagram` | SVG guitar chord diagram renderer (6-string, 5-fret grid, finger dots, muted/open markers) |
| `TabPlayer` | Guitar tablature playback using Soundfont audio |

### Client-Side State

| System | Storage | Purpose |
|---|---|---|
| `momentum.ts` | localStorage | Weekly activity tracking (recordCompletion, getWeeklyMomentum) |
| `activeGoals` | localStorage | User's selected goal categories |
| App state | React useState | Current screen, current task, audio mode, tasks completed today |

---

## Task Categories

*Updated April 7, 2026*

| Category | Tasks | Skill Areas | Special features |
|---|---|---|---|
| Creative Writing | 175 | observation, structure, voice, dialogue, reflection, imagery | Text prompts, self_report |
| Learn Kannada | 160 | vocabulary, grammar, script, phrases, pronunciation, culture | structured_list + quiz, fill_blank, dialogue, narration stories |
| Public Speaking | 160 | vocal_delivery, clarity, impromptu, presence, storytelling, persuasion | Timer, speaking prompts, group exercises (👥 toggle) |
| Guitar Practice | 219 | technique, chords, scales_fretboard, rhythm, fingerpicking, ear_training | ChordDiagram, TabPlayer, bpm, needs_guitar flag |
| Philosophy | 146 | philosophical_literacy, ethics, argumentation, critical_thinking, applied_philosophy | Level sequencing (1-3), concepts array, teach-then-test |
| Distributed Systems | 173 | fundamentals, replication, partitioning, transactions, consensus, fault_tolerance, estimation | sequence field, tags, fill_blank, structured_list |
| Guided Thinking | 8 | decision_making, goal_setting, creative_ideation, self_awareness, problem_solving, gratitude, perspective, career | Narration with long pauses (10-20s), audio-native |
| Active Listening | 5 | comprehension | Narration passages + comprehension questions, audio-native |
| Deep Reading | 30 | comprehension, structure, evaluation, connection, metacognition | Multi-prompt writing, text_input, timer, bring-your-own-content |
| **Total** | **1,046** | **30+** | |

### Task Data Fields

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | ✓ | Unique identifier |
| description | string | ✓ | Full original description |
| type | string | ✓ | practice / learning / reflection / retrieval |
| difficulty | string | ✓ | easy / medium / stretch |
| time_minutes | number | ✓ | 5 / 10 / 15 |
| skill_area | string | ✓ | Sub-skill within the goal |
| action | string | | Clear instruction |
| context | string | | Why this exercise matters |
| constraint_note | string | | Rules/boundaries |
| example | string | | What good looks like |
| reference | jsonb | | Structured content (see Composable Task Format) |
| tools | string[] | | Workspace tools needed |
| completion | string | | How the task ends (default: self_report) |
| level | number | | Progressive difficulty (1-3), used by philosophy |
| concepts | string[] | | Concepts taught, used by philosophy |
| sequence | number | | Ordering within skill area, used by distributed_systems |
| tags | string[] | | Searchable tags |
| group | boolean | | Whether this is a group exercise (default: false) |
| bpm | number | | Tempo for guitar tasks |
| needs_guitar | boolean | | Whether physical guitar is required |

---

## Project Structure

```
forge/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── src/
│   ├── app/                   # React SPA
│   │   ├── components/        # UI components
│   │   ├── states/            # App state views (Suggestion, Focused, History, etc.)
│   │   ├── hooks/             # Custom React hooks (useAuth, useSuggestion, etc.)
│   │   ├── lib/               # Supabase client, API client
│   │   └── App.tsx
│   └── api/                   # Vercel API Routes
│       ├── suggest.ts
│       ├── events.ts
│       ├── goals/
│       │   └── parse.ts
│       ├── momentum.ts
│       ├── history.ts
│       ├── status.ts
│       └── _lib/              # Shared backend code
│           ├── supabase.ts    # Supabase admin client
│           ├── auth.ts        # JWT validation middleware
│           └── services/
│               └── suggestionEngine.ts
├── scripts/
│   └── seed-tasks.ts          # Import curated task JSON into Supabase
├── data/
│   ├── creative_writing.json  # Curated task bank
│   └── learn_kannada.json     # Curated task bank
├── index.html
├── vite.config.ts
├── vercel.json
├── package.json
└── tsconfig.json
```

---

## Free Tier Limits

| Service | Limit | MVP Usage | When You'd Upgrade |
|---|---|---|---|
| **Vercel** | 100 GB bandwidth, 100K function invocations/day | ~1 GB + 16 MB audio, ~200 invocations/day | Thousands of daily users |
| **Supabase** | 500 MB DB, 50K MAU, unlimited API | ~5 MB, 20 MAU | 500+ users or need always-on (no pause) |
| **Resend** (later) | 3K emails/month | ~600/month | 100+ daily users |
| **OpenAI** (one-time) | Pay-as-you-go | ~$10 for task generation | Only when generating new task banks |
| **AI4Bharat IndicF5** | Free (MIT, local) | ~16 MB MP3 generated once | Never — it's free forever |

**Supabase free tier caveat:** Projects pause after 1 week of inactivity. With 20 active test users, this shouldn't trigger. If it does, a single API call wakes it (few seconds delay on first request).

### Audio Storage Decision

Pre-generated Kannada TTS audio (via AI4Bharat IndicF5, run locally on M1 Pro) is stored as
static MP3 files in `public/audio/kn/`. Deployed with the app, served from Vercel's CDN.

- **Total audio:** ~16 MB (MP3 @ 64kbps, ~35 min for full curriculum)
- **Per-session bandwidth:** ~0.5-1.5 MB (user loads 1-3 tasks)
- **Capacity:** ~68,000 sessions/month within Vercel's 100 GB free bandwidth
- **Why not Supabase Storage:** 2 GB/month bandwidth limit = only 1,365 sessions. Bottleneck.
- **English narration:** Browser Web Speech API (runtime). IndicF5 is Indian languages only.

See `app/todo/audio-infrastructure.md` for full TTS evaluation and pipeline design.

**Scaling plan:** Vercel Hobby limits static uploads to 100 MB. At ~16 MB per language,
we hit this around 6 Indian languages. When approaching the limit, migrate audio files to
Cloudflare R2 (10 GB free, zero egress fees). Code change: `audio_url` switches from
relative path to full URL. $0/month.

---

## Expansion Paths

Each expansion is independent — you do them only when needed, and none requires rewriting what exists.

### → Dedicated Backend Server

**When:** Cold starts bother users, suggestion engine gets complex, need WebSockets or background jobs.

**How:** Extract `src/api/` into a standalone Express app. Deploy on Railway ($5/mo). Frontend changes one env var (`API_URL`). All route handlers, DB queries, and suggestion logic stay identical.

```
Before:  Browser → Vercel API Routes → Supabase
After:   Browser → Express on Railway → Supabase
```

**Effort:** A few hours.

### → Real-Time LLM Task Generation

**When:** 20+ goal categories, can't pre-generate task banks for all.

**How:** Add a conditional branch in `suggestionEngine.ts` — if task bank is empty for a goal, call OpenAI to generate a task, cache it in DB, return it.

```
suggestionEngine.ts
├── Check task bank → if tasks available, score and return one
└── If empty → call LLM → save to tasks table → return
```

**Effort:** Add one function, one API call. Architecture unchanged.

### → Native Mobile App

**When:** Users want push notifications, offline access, or App Store presence.

**How:** Build React Native app that calls the same API. API doesn't change.

```
Before:  React SPA → /api → Supabase
After:   React SPA → /api → Supabase
         React Native → /api → Supabase  (same API, new client)
```

**Effort:** New project, but backend is untouched.

### → Background Jobs (Email, Analytics)

**When:** Need nightly email reminders, weekly summaries, analytics aggregation.

**How:** GitHub Actions scheduled workflow → calls a protected API endpoint.

```yaml
# .github/workflows/daily-email.yml
on:
  schedule:
    - cron: '0 4 * * *'  # 4 AM UTC daily
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://forge.app/api/cron/send-reminders -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Effort:** One workflow file, one API endpoint. Free.

### → ML-Based Suggestion Engine

**When:** Thousands of completions/skips in the database, enough data to train a model.

**How:** Train model offline (Python). Replace the scoring function in `suggestionEngine.ts` with a call to the model (either embedded or as a separate service).

```
suggestionEngine.ts
├── Before: SQL query + heuristic scoring
└── After:  SQL query + ML model scoring (same function signature)
```

The API contract, frontend, and data model don't change. You're swapping one scoring function.

### → Multiple Databases / Caching

**When:** Need to separate analytics from main DB, add caching for hot suggestions.

**How:** Add Redis (Upstash has a free tier) for caching. Add a read replica or separate analytics DB. The Express API (once extracted) connects to multiple data sources. Frontend still talks to one API.

---

## Data Migration: localStorage → Supabase

*Designed April 27, 2026. Status: Ready to build.*

### The Problem

All user progress lives in localStorage. One cleared browser = everything gone. No cross-device sync. Reflections are discarded entirely. 5 of 8 API routes are dead code — the frontend never calls them.

| Data | Current storage | Survives clear? | Survives device switch? |
|---|---|---|---|
| Task completions | `localStorage: forge_completions` | ❌ | ❌ |
| Reflections | **Nowhere** — discarded in handleDone | ❌ | ❌ |
| Prompt responses | **Nowhere** — discarded in handleDone | ❌ | ❌ |
| Active goals | `localStorage: activeGoals` | ❌ | ❌ |
| Weekly momentum | `localStorage: weeklyActivity` | ❌ | ❌ |
| Distill entries | `localStorage: forge_distills` | ❌ | ❌ |
| Session recovery | `localStorage: forge_session` | ❌ (4hr TTL) | ❌ |

### Design Principles

1. **Dual-write.** Every write goes to localStorage (instant, offline) AND Supabase (async, persistent). localStorage is the speed/offline layer. Supabase is the source of truth.
2. **API routes for all writes.** No direct Supabase client calls from frontend for data mutations. Business logic stays server-side. Frontend calls endpoints.
3. **Silent reconciliation on load.** When the app loads, compare localStorage with Supabase. Upload anything missing. Download anything the other device wrote. No user-visible sync UI.
4. **Offline-first.** If the API call fails, localStorage has the data. Reconciliation catches it on next load.
5. **Session recovery stays in localStorage.** `forge_session` and `forge_focused` are ephemeral (4hr TTL), device-specific. They don't belong in Supabase.

### Schema Changes

#### Enhanced: `user_task_events`

Add `response_data` jsonb column for prompt responses and drill outcomes:

```sql
ALTER TABLE user_task_events ADD COLUMN response_data jsonb;
```

The `response_data` field stores:
- **Multi-prompt tasks** (Deep Reading, Conversation): `{ prompts: [{prompt: "...", text: "..."}] }`
- **Drill outcomes** (Fitness, Guitar): `{ reps: 12 }` or `{ hold_seconds: 45 }` or `{ bpm: 80 }`
- **Regular tasks**: null (reflection goes in `reflection_text`)

#### New: `distills` table

Distill is a first-class concept — forced production from memory. Covers both external content (podcasts, articles) and spaced retrieval of Forge tasks.

```sql
CREATE TABLE distills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('external', 'task')),
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  title text NOT NULL,
  link text,
  tag text NOT NULL,
  responses jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_distills_user ON distills(user_id, created_at DESC);

ALTER TABLE distills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own distills" ON distills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own distills" ON distills FOR INSERT WITH CHECK (auth.uid() = user_id);
```

| Column | Type | Purpose |
|---|---|---|
| `source_type` | `'external' \| 'task'` | External = user-provided content. Task = spaced retrieval of a Forge task. |
| `task_id` | uuid, nullable | Links to `tasks.id` for task distills. Null for external. |
| `title` | text | Podcast name (external) or task description (task distill). |
| `link` | text, nullable | URL for external content. |
| `tag` | text | Topic tag (business, science, tech, etc.). For task distills, auto-mapped from goal_category. |
| `responses` | jsonb | `[{prompt: "...", text: "..."}, ...]` — always 3 entries. |

#### Existing: `user_goals` (start using it)

The table exists. RLS policies exist. The `/api/goals/parse` endpoint exists. Just need to wire the frontend to use it.

### Write Paths

#### Task completion (handleDone)

```
User taps "I'm done" in Focused.tsx
  ↓
App.handleDone() fires:
  1. localStorage: recordCompletion(task)     ← existing, keep
  2. localStorage: recordMomentum()           ← existing, keep
  3. API: POST /api/events                    ← NEW: wire this call
     { task_id, event: 'completed',
       reflection_text, response_data,
       duration_seconds }
  ↓
/api/events handler:
  1. Insert into user_task_events
  2. Upsert daily_summary (increment tasks_completed)
```

The API call is fire-and-forget — don't await it, don't block the UX. If it fails, reconciliation catches it.

#### Task skip

```
User taps "Skip" in Coach/Suggestion
  ↓
API: POST /api/events
  { task_id, event: 'skipped', skip_reason }
```

#### Goal selection (IntentCapture)

```
User picks goals in IntentCapture
  ↓
1. localStorage: setItem('activeGoals', [...])   ← existing, keep
2. API: sync goals to user_goals table           ← NEW
   DELETE existing goals for user
   INSERT new goals
```

On app load: read goals from Supabase, fall back to localStorage.

#### Distill completion

```
User finishes 3 prompts in Distill.tsx
  ↓
1. localStorage: saveDistills(updated)            ← existing, keep
2. API: POST /api/distills                        ← NEW
   { source_type: 'external', title, link, tag, responses }
```

### Read Paths

| Data | Primary source | Fallback |
|---|---|---|
| Goals | `GET /api/goals` → `user_goals` | `localStorage: activeGoals` |
| Momentum | Computed from `user_task_events` (today's count) | `localStorage: weeklyActivity` |
| History | `GET /api/history` → `user_task_events` + `tasks` | `localStorage: forge_completions` |
| Distills | `GET /api/distills` → `distills` table | `localStorage: forge_distills` |
| Completed task IDs | `GET /api/events?type=completed` → `user_task_events` | `localStorage: forge_completions` |

### Reconciliation (on app load)

```
App loads → user authenticated
  ↓
1. Fetch server completions: GET /api/completions → Set<task_id + timestamp>
2. Read localStorage completions: forge_completions
3. Find local-only: completions in localStorage not in Supabase
4. Upload missing: POST /api/events for each (batch)
5. Find server-only: completions in Supabase not in localStorage
6. Download missing: add to localStorage forge_completions
  ↓
Same for distills:
7. Fetch server distills: GET /api/distills
8. Compare with localStorage forge_distills (match by title + created_at)
9. Upload/download missing
  ↓
Same for goals:
10. Fetch server goals: GET /api/goals
11. If server has goals → use them (server wins)
12. If server empty but localStorage has goals → upload them
```

Matching rule for dedup: `(task_id, created_at within 60 seconds)` = same event.

### Distill as Retention Layer (Future Extension)

The `distills` table supports `source_type: 'task'` for spaced retrieval of Forge tasks:

1. User completes a task → event in `user_task_events`
2. After N days, Forge surfaces a "revisit this" prompt
3. User answers 3 recall prompts → entry in `distills` with `source_type: 'task'`, `task_id` linking to original
4. The growth mirror shows: "You've distilled 15 podcasts and revisited 23 Forge tasks"

Prompts for task distills can be generic (from the existing pool) or task-specific (generated from task metadata). Generic works for MVP.

### Implementation Phases

| Phase | What | Effort | Unlocks |
|---|---|---|---|
| 1 | Add `response_data` column. Wire `handleDone()` → `POST /api/events`. Store reflections + prompt responses. | 2 hr | Reflections saved, history works, usage data |
| 2 | Create `distills` table. Wire Distill.tsx → `POST /api/distills`. | 2 hr | Distills persist across devices |
| 3 | Sync goals: IntentCapture writes to `user_goals`. App load reads from Supabase. | 1 hr | Goals persist across devices |
| 4 | Reconciliation on load: compare localStorage ↔ Supabase, sync missing. | 3 hr | Offline completions eventually sync, device switch works |
| 5 | Read from server: momentum, progress, completed IDs from Supabase instead of localStorage. | 2 hr | Server is source of truth |

Total: ~10 hours across 5 phases. Each phase is independently deployable.

---

## Security

- All API routes validate Supabase JWT before processing
- Supabase Row Level Security (RLS) enabled — users can only read/write their own data
- No secrets in frontend code — Supabase anon key is safe to expose (RLS protects data)
- API route secrets (Supabase service key) stored in Vercel environment variables
- CORS configured to allow only the Forge domain

---

## Monitoring (MVP-Light)

- **Vercel Analytics** (free) — page views, function invocations, errors
- **Supabase Dashboard** — DB size, auth users, API usage
- **Application logging** — `console.log` in API routes, visible in Vercel function logs
- No external monitoring tools needed at MVP scale

---

*Document created: March 29, 2026*
*Last updated: April 5, 2026*
*Repository: [github.com/abhishekbharti444/Forge](https://github.com/abhishekbharti444/Forge)*
