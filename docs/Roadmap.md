# Forge — Roadmap

> The plan: what we're building, what's done, what's next.
> For the WHY behind these decisions, see [Philosophy.md](./Philosophy.md).
> For visual/interaction design, see [Design-System.md](./Design-System.md).
> For technical architecture, see [Architecture.md](./Architecture.md).
> For content principles and categories, see [Content-Strategy.md](./Content-Strategy.md).

---

## What Is This?

A practice tool that eliminates the decision of what to work on and makes every minute of practice count.

**Core loop:** Open app → see one suggestion → do it (or skip) → reflect → come back later.

> "Whenever I have a short pocket of time, show me a meaningful, time-bounded action that genuinely advances my goals."

---

## The Two Legs

Forge stands on two beliefs. Both are required. Either alone is insufficient.

**Leg 1: The right action at the right moment.**
Goals are decomposed into bounded micro-actions. The user opens the app and the decision is already made. This is behavioral activation — closing the gap between intention and action.

**Leg 2: The practice must be real.**
Time spent in Forge must produce actual skill progress — not the illusion of it. Retrieval over recognition. Production over consumption. Desirable difficulty over easy engagement.

| | Duolingo | Forge |
|---|---|---|
| Optimizes for | Engagement (DAU, streaks, session length) | Actual skill progress |
| Default mode | Recognition (tap the right answer from 4) | Retrieval (produce the answer from nothing) |
| Difficulty | Minimized — keep the user happy | Embraced — desirable difficulty drives learning |
| Success metric | "User opened the app today" | "User can do something they couldn't do yesterday" |

---

## Target Audience

People who want direction, not distraction. Self-learners, career switchers, hobbyists who actually practice, language learners, people training for something. They already pay for Duolingo Plus, MasterClass, Skillshare, Coursera.

What they lack: the micro-decision layer — "I have 12 minutes, what's the highest-value thing I can do right now?"

### The Larger Market: Wasted Motivation

*Added April 19, 2026*

The audience is bigger than "self-learners." It's everyone whose motivation gets wasted on passive consumption:

- The person who watches 50 guitar tutorials and still can't play a clean chord change
- The person who listens to 10 hours of podcasts a week and can barely recall 3 ideas
- The person who buys courses on public speaking and still freezes in meetings
- The person who reads 20 books a year and forms only vague impressions

These people don't lack motivation — they spend enormous time and money trying to get better. Guitar tutorials get billions of views. Fitness influencers have tens of millions of followers. Online courses are a $400B market. The motivation is clearly there. What's missing is the structure that converts consumption into practice.

Forge doesn't create motivation. It converts existing motivation into actual progress. The target isn't "people who want to learn" — it's "people who are already trying to learn and failing because everything they use optimizes for consumption, not production."

This reframe matters for positioning: Forge isn't competing with entertainment for attention. It's competing with tutorials, courses, and content platforms for the time people already dedicate to improvement — and offering a better return on that time.

---

## Key Risks

### Retention
- AI apps lose subscribers 30% faster than non-AI apps. 88% of users gone within 30 days.
- **Mitigation:** Genuine skill progress is the retention mechanism. Users return because they can do something today they couldn't do yesterday. If the practice doesn't work, no amount of gamification will save it.

### Cold Start
- First 5 sessions determine if someone stays. Task quality must be excellent from day one.
- **Mitigation:** Hand-curate task banks. Don't rely on raw LLM output.
- **Sharpened mitigation (April 19, 2026):** Task quality is necessary but not sufficient. The real mitigation is delivering a *felt difference* in the first 3 sessions. The user must experience a micro-proof: "I just wrote the author's argument from memory and I actually could" or "I just identified an unstated assumption I would have missed yesterday." That moment of "this is actually working" is what converts a trial into a habit. The task must produce it, not just be well-written.

### Visible Growth (missing, critical)
*Added April 19, 2026*
- Forge currently has momentum dots and completion counts. It lacks a **growth mirror** — concrete evidence that the user can do something today they couldn't do last month.
- Examples: "Your reading recall went from 40% to 70% over 6 weeks." "You've identified unstated assumptions in 12 passages." "Your pushup count went from 12 to 22."
- This is not gamification. It's a mirror. Gamification says "don't break the streak." A growth mirror says "look at what you've become." One produces anxiety, the other produces the serotonergic payoff the Philosophy doc describes.
- Without visible growth, felt competence is invisible. The user practices, improves, but can't see it. The growth mirror is the feature that makes the product self-reinforcing without any dopaminergic mechanics.
- **Priority:** Should be elevated from implicit to explicit. Currently not on any tier.

### Monetization
- Only ~3% of AI app users pay for premium.
- **Mitigation:** Target $10–15/mo. Validate willingness to pay after proving the core loop works.

---

## Research Backing

- **Intelligent Tutoring Systems** raise test scores by 0.66 standard deviations (Brookings).
- **Microlearning** meta-analysis: significant positive effects on retention (OR = 1.87) and learning outcomes (SMD = 0.74).
- **Spaced repetition**: 140+ years of research confirming superior long-term retention.
- **Retrieval practice**: testing yourself produces dramatically better retention than re-reading (Roediger & Karpicke, 2006).

---

## Current State (April 25, 2026)

**Live URL:** https://app-mu-nine-97.vercel.app (stale — local is ahead)

### What's Built

- 1,302 tasks across 11 categories:
  - Creative Writing: 175 | Learn Kannada: 261 | Public Speaking: 160
  - Guitar Practice: 284 | Philosophy: 146 | Distributed Systems: 173
  - Deep Reading: 30 | Bodyweight Fitness: 30 | Conversation: 30
  - Guided Thinking: 8 | Active Listening: 5
- 35+ skill areas across all categories
- 8 reference types: text, structured_list, steps, pairs, fill_blank, dialogue, narration, sound_exercise
- 6 workspace tools: timer, reveal_hide, text_input, checklist, quiz mode, chord diagram
- 16 screens: Landing, Auth, IntentCapture, GoalHome, Coach, Journeys, Focused (step-based), AudioPlayer, PodcastPlayer, WhatsNext, DoneForToday, History, ConceptBank, TaskReview, Distill
- Audio mode: Screen / Listen+Speak / Listen only (Web Speech API + SpeechEngine)
- Level sequencing, concept tracking, momentum tracking (localStorage)
- ChordDiagram + FretboardDiagram + TabPlayer components
- PWA, mobile-ready
- Multi-prompt writing system: `prompts` array on tasks, rendered as sequential focused screens (one prompt per step, can't peek ahead)
- Distill: podcast/audio retention via forced production. 3 guided prompts (recall → challenge → apply), 80 authored prompts, 8 topic tags, shuffle, localStorage, past distills with tag filtering. User-initiated from GoalHome.

### What's Not Built Yet

- Server-side progress tracking (all progress is localStorage)
- Spaced repetition
- Session-opening recall checks
- Audio recording (public speaking)
- Progressive BPM tracking (guitar)
- Weekly reflection mirror

---

## Priority Stack

Single source of truth. Consolidated from UX audit findings, content audit, and infrastructure assessment.

### Tier 0 — Content (the differentiator)

| # | Task | Type | Effort |
|---|---|---|---|
| 1 | ~~Author Deep Reading task bank (~30 tasks)~~ | Content | ✅ Done (Apr 18) |
| 2 | ~~Author Bodyweight Fitness task bank (~30 tasks)~~ | Content | ✅ Done (Apr 25) |
| 3 | ~~Author Conversation/Connection task bank (~30 tasks)~~ | Content | ✅ Done (Apr 25) |
| 4 | Rewrite Distributed Systems passive tasks as scenario-based practice | Content | 3-4 days |
| 5 | Add retrieval twins for Kannada vocabulary tasks | Content | 2 days |
| 6 | Add "apply it" follow-ups for Philosophy learning tasks | Content | 1-2 days |

### Tier 1 — Code Fixes (align code with philosophy)

| # | Task | Type | Effort |
|---|---|---|---|
| 7 | Fix: Store reflections (currently discarded in handleDone) | Bug | 30 min |
| 8 | Fix: Wire DoneForToday screen (currently unreachable) | Bug | 30 min |
| 9 | Fix: WhatsNext task selection (currently random) | Bug | 2 hr |
| 10 | Fix: Flip WhatsNext default (completion primary, continuation secondary) | Philosophy | 30 min |
| 11 | Make completion messages contextual (replace Math.random with task-aware selection) | Philosophy | 1 hr |
| 12 | Sync deployment (re-seed Supabase with all tasks, redeploy) | Infrastructure | 2 hr |

### Tier 2 — Learning Effectiveness

| # | Task | Type | Effort |
|---|---|---|---|
| 13 | Migrate progress to Supabase (dual-write, schema exists) | Infrastructure | 1 day |
| 14 | Session-opening recall checks | Learning | 1 day |
| 15 | Basic spaced repetition (3-bucket Leitner system) | Learning | 2-3 days |
| 16 | Progressive BPM tracking for guitar | Learning | 1 day |
| 17 | Structured feedback loop ("What was hardest?" per skill area) | Learning | 1 day |
| 18 | Lead home screen with next task (reduce taps-to-value) | Usability | 2 hr |

### Tier 3 — Deepening

| # | Task | Type | Effort |
|---|---|---|---|
| 19 | Weekly reflection mirror ("here's what you practiced and noticed") | Learning | 2 hr |
| 20 | Intelligent task selection in WhatsNext (journey-aware, skill-balanced) | Learning | 1-2 days |
| 21 | Stats on completion screen (time, items learned, progress) | Usability | 1 hr |
| 22 | Audio recording for public speaking (MediaRecorder API) | Infrastructure | 1 day |
| 23 | Collapse journey tasks (show next 3-5, progressive disclosure) | Usability | 2 hr |
| 24 | Task clarification ("?" icon, LLM-powered Q&A) | Feature | 2-3 days |

### Tier 4 — Later

| # | Task | Type |
|---|---|---|
| 25 | Guitar ear training audio (Tone.js) | Infrastructure |
| 26 | LLM feedback analysis + personalized tasks | Feature |
| 27 | More goal categories (based on demand data) | Content |
| 28 | Extract API to standalone server | Infrastructure |
| 29 | Native mobile app | Feature |
| 30 | Monetization (freemium, $10-15/mo) | Business |
| 31 | ~~**Distill** — podcast/audio retention via forced production. 3 guided prompts (recall → challenge → apply) after listening. 8 topic tags drive prompt selection. User-initiated from GoalHome. 80 prompts authored (8 recall + 64 tag-specific challenge + 8 apply). **Shipped Apr 25.**~~ | ✅ Done |

### Kannada Bilingual Stories — Scaffolded Progression

**Strategic decision (April 19, 2026):** Stories are the audio-first learning modality. Standalone podcast episodes (structured vocabulary drills with narration) are deprecated as a user-facing format. The vocabulary and phrases from those episodes remain accessible through the visual modality (Focused.tsx with structured lists, fill-blank, dialogue). Only story audio is served in production — committed to git, served via Vercel CDN.

Research basis: combining incidental learning (stories in context) with intentional learning (scaffolded active recall) produces significantly greater gains than either alone. Stories provide engagement and contextual memory; the scaffolded progression adds the active recall and production that passive listening lacks.

Prototype built: "The Thirsty Crow" — 22 sentence pairs, KN→EN audio, progressive reveal, toggleable transliteration. Research-backed scaffolding with fading (d=0.71 vs d=0.32 for constant support, Belland et al. 2024).

| # | Phase | Description | Effort |
|---|---|---|---|
| 31 | Delayed Translation | Same story, EN comes after 3-4s gap instead of 0.5s. Forces active processing. | 10 min |
| 32 | Selective Translation | Track word frequency; skip EN for sentences where all words heard 5+ times. Creates i+1 gap. | 1-2 hr |
| 33 | KN-Only + Comprehension | Full story in Kannada. Pause every 3-4 sentences with EN comprehension question. Replay with translations if needed. | 2-3 hr |
| 34 | Production Prompts | EN prompt → 4s pause → KN answer. "How do you say: The crow was thirsty?" Reuses graduated recall format. | 1-2 hr |
| 35 | Mode Selector UI | Pill selector: Guided · Delayed · Immersive. Per-story, persisted in localStorage. | 30 min |
| 36 | More Tier 1 stories | Fox and the Grapes, Monkey and the Crocodile, Ant and the Grasshopper, Lion and the Mouse. ~2 hr each. | Content |
| 37 | Tier 2 stories | Tenali Raman tales, Akbar-Birbal adapted to Kannada. Compound sentences, dialogue, idioms. | Content |

References: Krashen (comprehensible input), Swain (output hypothesis), Glossika (commercial validation of audio sentence method), Beelinguapp (parallel text, 4M+ users, no Kannada support).

---

## Success Signals

Not looking for thousands of users. Looking for:

- ✅ 5–10 users opening the app 4+ days/week
- ✅ Task completion rate > 50% (of tasks shown)
- ✅ Users returning after day 7 without reminders
- ✅ At least one user saying "this is actually useful"
- ✅ Reflection usage > 30%
- ✅ At least one user's fitness numbers showing measurable improvement
- ✅ At least one Conversation task reflection longer than 2 sentences
- ✅ Deep Reading reflections referencing specific books/ideas

---

## Cost

| Item | Cost |
|---|---|
| Vercel (frontend + API routes) | Free tier |
| Supabase (auth + Postgres DB) | Free tier |
| OpenAI API (batch task generation) | ~$10 one-time |
| Domain name | ~$12/year |
| **Total** | **~$22** |

---

## Product Evolution Decisions

Key decisions captured during development:

- **Public Speaking over Learn Kannada** for friends beta — enormous demand, genuine market gap, progress felt quickly
- **Skill hierarchy** — goals decompose into skill areas; suggestion engine balances across them
- **Composable Task Format** — reference types × tools × completion signals; new categories combine existing primitives (see [Architecture.md](./Architecture.md))
- **Retrieval-first default** — Quiz mode before Learn mode; production over recognition
- **Metadata-driven rendering** — `buildSteps()` branches on task metadata, not goal type
- **Serotonergic design shift (April 18, 2026)** — removed Hook Model, streaks, variable rewards from design philosophy; replaced with serotonergic principles (see [Philosophy.md](./Philosophy.md))
- **Three new categories (April 18, 2026)** — Deep Reading, Bodyweight Fitness, Conversation/Connection added to test whether Forge works beyond structured skill-building (see [Content-Strategy.md](./Content-Strategy.md))
- **Audience reframe: wasted motivation (April 19, 2026)** — the target audience isn't a niche of "self-learners." It's everyone whose motivation gets wasted on passive consumption — tutorial watchers, course buyers, podcast listeners who retain nothing. Forge converts existing motivation into progress. The market is much larger than originally framed.
- **Keep categories bundled (April 19, 2026)** — debated whether strong categories (Guitar, Public Speaking, Podcast Retention) should be standalone products. Decision: no. The bundle IS the product. Categories cross-pollinate, standalone products fragment effort, and the "practice layer across your life" positioning only works with breadth. Individual categories can have branded entry points for marketing without splitting the codebase.
- **Visible growth mirror identified as critical gap (April 19, 2026)** — Forge has momentum dots and completion counts but no evidence of actual capability growth. A growth mirror ("your recall went from 40% to 70%") is the missing feature that makes the product self-reinforcing without gamification. Elevated to explicit priority.
- **Podcast Retention added to roadmap (April 19, 2026)** — potentially the highest-impact unbuilt feature. Universal audience, zero-friction adoption (upgrades existing habit), unoccupied competitive gap (all existing tools capture/summarize; none do forced retrieval). Strategy not finalized — needs prompt design work. See Content-Strategy.md appendix.
- **Distill fully designed (April 24, 2026)** — renamed from "Podcast Retention" to "Distill." All open questions resolved: 3-prompt sequence (recall → challenge → apply), 8 topic tags, 80 authored prompts, user-initiated from GoalHome, unlimited shuffle within difficulty tier, no skipping, variable input sizes, localStorage for MVP with Supabase migration planned. Separate data model (not tasks/events). See Content-Strategy.md § Distill.
- **Priority reorder (April 24, 2026)** — after discussion on product direction, reordered priorities: (1) content for broad appeal categories (Fitness, Conversation, Distill), (2) data infrastructure (server-side events, store reflections), (3) suggestion engine rewrite, (4) spaced repetition. Content quality improvements to existing categories (DS rewrite, Kannada retrieval twins, Philosophy follow-ups) deferred until data shows which categories retain users.
- **Discovery vs Practice mode identified (April 25, 2026)** — Forge currently treats all tasks as one-shot (completed = excluded forever). But drill-type tasks (pushups, chord changes, vocabulary recall) are meant to be repeated with progressive challenge. Drills defined narrowly: same action, measurable outcome that trends over time (reps, seconds, BPM, score). Distinct from reusable templates (speaking prompts, reading exercises) which vary content each time. "My Drills" lives inside each goal screen. User chooses what to practice; smart suggestion comes later. Show "Last time: X" on drill cards. Task fields: `drill: true` + `outcome_label`. Layers 1-3 (content tagging, engine change, My Drills UI) can ship without data infrastructure. Trend visualization needs server-side events. Full design in Architecture.md § Practice Routines.
- **Broad-appeal content complete (April 25, 2026)** — All three new categories shipped: Deep Reading (Apr 18), Bodyweight Fitness (Apr 25), Conversation/Connection (Apr 25). Together they cover the three non-dopaminergic neurochemical pathways: serotonin (reading/depth), endorphins (physical effort), oxytocin (human connection). Distill also shipped (Apr 25) — podcast retention via forced production. Content breadth phase is complete. Next priority shifts to data infrastructure and suggestion engine.
- **Conversation skill areas research-grounded (April 25, 2026)** — Conversation category designed from communication science research: ICCS 10 dimensions, Motivational Interviewing OARS, Chris Voss tactical empathy, Gottman bids for connection, improv "yes and." 5 skill areas: listening, asking, empathy, vulnerability, responding. Every task uses 4-prompt multi-prompt system with specificity test (prompts must be harder to answer without doing the task). 20 of 30 tasks are drills (repeatable daily).
- **Seed script infrastructure fix (April 25, 2026)** — `prompts` and `drill` fields were not being packed into reference jsonb by the seed script. Deep Reading's multi-prompt flow was silently broken in production. Fixed seed script, App.tsx fallback, and Focused.tsx guard. All prompt-based tasks now work from Supabase.

---

*Created: March 29, 2026*
*Last updated: April 25, 2026*
