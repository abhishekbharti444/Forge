# Forge — UX Audit

> Conducted April 11, 2026. Based on full UI walkthrough of localhost:5173 + UX research across habit-forming app design, dark mode patterns, and gamification psychology.

---

## Methodology

### UI Walkthrough
Complete core loop tested via Playwright browser automation:
1. **IntentCapture** — Goal selection (Learn Kannada)
2. **Home/Dashboard** — Greeting, weekly tracker, goal list
3. **GoalHome** — Journey list with task counts (6 journeys, 160 tasks)
4. **Journey Detail** — Expanded vocabulary journey (39 tasks)
5. **Focused Task** — 4-step flow: What to do → Study → Practice → Reflect
6. **Completion** — "Nice work" + next task suggestion
7. **Post-completion GoalHome** — Updated progress (1/160)
8. **Post-completion Home** — Updated greeting + weekly tracker

### Research Sources
- **thisisglance.com** — "How to Design Habit-Forming Apps" (habit loop, variable rewards, onboarding, ethical engagement)
- **catdoes.com** — "7 App Design Best Practices for 2026" (touch-first, dark mode, accessibility, performance)
- **xqa.io** — "Gamification in UX: Beyond Points, Badges, and Leaderboards" (Self-Determination Theory, Octalysis Framework, progression/mastery, autonomy, flow state)

---

## What's Working Well

### 1. One-Action-Per-Screen Principle ✅
The IntentCapture → Focused → Completion flow is clean and focused. Each screen has a single clear purpose. Aligns with Design System principle #2 and the habit-forming research: "friction is the enemy of daily use."

### 2. Micro-Task Structure ✅
Every task has a time estimate (5m, 10m, 15m), specific actionable instructions, and rich context (Rules, Why this matters, Example). The 4-step task flow maps directly to the habit loop:
- **Trigger** → "What to do" (clear instruction)
- **Routine** → Study + Practice (the actual learning)
- **Reward** → Reflect + Completion screen

### 3. Flashcard/Study UX ✅
The Learn/Review/Quiz/Reverse tabs, pronunciation guides, usage context ("Ondu kaapi kodi = Give one coffee"), and Kannada script display show real pedagogical depth. This is "genuine value over manipulation" — exactly what the research recommends.

### 4. Warm Dark Theme ✅
The `#171412` background with amber accent is well-executed. Research confirms 82% of users prefer dark mode (catdoes.com, 2026). The warm tone avoids the clinical feel of pure black.

### 5. Journey Structure ✅
6 journeys × ~20-39 tasks each gives visible long-term structure while keeping individual tasks bite-sized. Aligns with the "progression and mastery" driver from Self-Determination Theory.

### 6. Conversational Copy ✅
"Good afternoon. Ready for a quick session?" and "Nice work." feel warm and human. Aligns with Design System principle #1 (Warmth Is the Quiet Multiplier) and principle #7 (No Shame, Ever).

---

## Critical UX Gaps

### 🔴 P0 — No Variable Reward System

**Current:** Completion screen shows "Nice work." every time — static, predictable.

**Research says:** Variable rewards are significantly more effective than predictable ones at sustaining engagement. The "Variable Reward" concept from Nir Eyal's Hook Model and the Octalysis Framework both emphasize that unpredictability in rewards creates stronger habit loops. Duolingo's streak celebrations, XP bonuses, and random encouragement are the gold standard.

**Recommendation:**
- Randomize completion messages from a pool of 15-20 warm, varied messages
- Add occasional "bonus" moments: "🔥 That was fast — 3 minutes!", "You've learned 10 new words this week"
- Milestone celebrations at journey checkpoints (25%, 50%, 75%, 100%)
- Show specific stats: words learned, time spent, streak count

**Impact:** Directly addresses the weakest part of the current habit loop — the reward phase.

---

### 🔴 P0 — Weak Home Screen Hook

**Current:** Home screen leads with "Good afternoon. Ready for a quick session?" — informational but not motivating. The next action requires tapping a goal, then a journey, then "Continue."

**Research says:** "The home screen should show the most important content immediately" (thisisglance.com). The first 7-14 days are critical for habit formation. Every extra tap is friction that kills daily return rates.

**Recommendation:**
- Lead with a "Continue where you left off" card showing the next task title, time estimate, and a single-tap start button
- Move the greeting to secondary position
- On first visit of the day, show the task suggestion immediately — don't make the user navigate to it
- The current home screen becomes a "Browse" or "Goals" view accessible via a secondary action

**Impact:** Reduces taps-to-value from 5+ to 1. Critical for daily retention.

---

### 🔴 P0 — No Streak/Consistency Mechanic

**Current:** Weekly tracker shows "1 task this week" with M-T-W-T-F-S-S dots, but no streak counter, no "don't break the chain" mechanic, no daily goal.

**Research says:** Streak mechanics are the single most proven habit-formation tool across Duolingo, Headspace, and every successful daily-use app. The "Endowed Progress Effect" (xqa.io) states people are more motivated to complete a task if they feel they've already made progress.

**Recommendation:**
- Add a visible streak counter: "🔥 Day 1" prominently on home screen
- Set a daily target: "Do 1 task today" (low bar = high completion)
- Fill weekly dots with amber color as days are completed
- Add streak-protection: "You're on a 5-day streak! Keep it going?"
- Weekly reset is already in the Design System (principle #7) — streaks should complement this, not conflict

**Impact:** The #1 lever for daily return rate. Duolingo attributes much of its retention to streaks.

---

### 🟡 P1 — Journey Detail Shows ALL Tasks

**Current:** Clicking vocabulary shows all 39 tasks in a long scrollable list with ● (current) and ○ (upcoming) indicators.

**Research says:** Progressive disclosure is a core UX principle. Showing everything at once creates overwhelm and removes the sense of discovery. The "Endowed Progress Effect" works best when users see a partially-filled progress bar, not an endless list.

**Recommendation:**
- Show only the next 3-5 tasks by default
- Add a progress bar at the top: "1/39 vocabulary tasks" with visual fill
- "See all tasks" as a secondary action for users who want to browse
- Lock/fade tasks beyond the next few to create anticipation

**Aligns with:** Design System principle #3 (Progressive Discovery) — "The app reveals itself as you use it."

---

### 🟡 P1 — Completion Screen Undersells the Moment

**Current:** "Nice work. You just practiced vocabulary." + next task suggestion. Minimal, understated.

**Research says:** The completion state is the reward phase of the habit loop — the most important moment for building return behavior. It needs to feel genuinely rewarding.

**Recommendation:**
- Add a warm visual moment (subtle animation, glow — per Design System principle #4, "not confetti")
- Show specific stats: "5 min well spent · 10 new words · vocabulary 1/39"
- Show streak update: "🔥 Day 1 — you showed up"
- Show journey progress: "2.5% of vocabulary complete"
- Keep the next task suggestion — it's good

**Aligns with:** Design System principle #6 (Immediate Payoff) — "The completion state is the most important screen."

---

### 🟡 P1 — Slow Time-to-First-Value

**Current:** From IntentCapture to first task completion requires 12+ interactions:
1. Select goal → 2. Tap CTA → 3. Tap goal on home → 4. Tap journey → 5. Tap Continue → 6. Read instructions → 7. Tap Next → 8. Study flashcards → 9. Tap Next → 10. Practice → 11. Tap Next → 12. Reflect → 13. Finish

**Research says:** "Time to first value" is a critical engagement metric. The first experience should deliver value as fast as possible. Interactive onboarding beats tutorial-based onboarding.

**Recommendation:**
- After goal selection on first use, skip the home screen and go directly to the first task
- The home screen can be discovered on the second visit
- Consider a "Quick start" option: "Want to try a 5-minute task right now?"

**Impact:** Cuts first-session friction by ~50%. Users feel the value of the app before they've had time to bounce.

---

### 🟢 P2 — No Social/Sharing Mechanics

**Current:** No way to share progress, compare with friends, or feel part of a community.

**Research says:** Social connection is a core psychological driver in Self-Determination Theory. Even lightweight social features (sharing, leaderboards) significantly boost engagement.

**Recommendation:**
- Add a "Share" button on completion screen → generates a shareable card
- Example: "I just learned Kannada numbers 1-10 on Forge 🔥"
- Future: optional friends/accountability partners

---

### 🟢 P2 — Explore Section Is Passive

**Current:** "Explore more" shows additional goals as plain buttons with emoji + title. No descriptions, no framing.

**Recommendation:**
- Add one-line descriptions: "✍️ Creative Writing — Short prompts to sharpen your voice"
- Add "Popular" or "New" badges to create curiosity
- Consider "Recommended for you" based on selected goals

---

## Quick Wins (Ship This Week)

| # | Change | Effort | Impact |
|---|---|---|---|
| 1 | Randomize completion messages (pool of 15-20) | ~30 min | High — variable reward |
| 2 | Add streak counter to home screen ("🔥 Day 1") | ~1 hr | High — daily retention |
| 3 | Lead home screen with "Continue" card for next task | ~2 hr | High — reduces friction |
| 4 | Collapse journey tasks to next 3-5 with progress bar | ~2 hr | Medium — progressive disclosure |
| 5 | Add stats to completion screen (time, words, progress) | ~1 hr | Medium — reward quality |
| 6 | Skip home screen on first use (go straight to first task) | ~1 hr | High — time-to-first-value |

---

## Key Metrics to Track

From the habit-forming app research (thisisglance.com):

| Metric | What It Measures | Target |
|---|---|---|
| Day 1 retention | % who return the day after first use | > 40% |
| Day 7 retention | % who return within first week | > 20% |
| Day 30 retention | % still active after a month | > 10% |
| Session frequency | Average sessions per week | > 4 |
| Time to first value | Taps from install to first task completion | < 6 |
| Task completion rate | % of started tasks that are finished | > 80% |
| Streak length | Average consecutive days of use | > 3 |
| Feature adoption | % who use Study, Quiz, Reflect features | > 50% |

---

## Learning Effectiveness Critique

> ⚠️ The engagement recommendations above (streaks, variable rewards, gamification) address *retention of users*. This section addresses *retention of knowledge* — a fundamentally different problem. The biggest risk for Forge isn't that users don't come back. It's that they come back, do tasks, maintain streaks, but don't actually learn anything meaningful. This is the Duolingo trap.

### The Evidence Base

Six cognitive strategies have robust support from decades of research (Weinstein et al., 2018, "Six Strategies for Effective Learning"):

| Strategy | Evidence | Forge Status |
|---|---|---|
| **Spaced practice** | Distributing study over time produces superior long-term retention vs. massed practice. 140+ years of research. | ⚠️ Partial — daily micro-tasks space sessions, but no algorithmic spacing of *specific content review* |
| **Retrieval practice** | Testing yourself produces dramatically better retention than re-reading. Roediger & Karpicke (2006): retrieval group outperformed re-reading group significantly. | ⚠️ Tool exists (Quiz mode) but default path is passive (Learn mode first) |
| **Interleaving** | Mixing different problem types during practice improves transfer. | ❌ Journeys are siloed — vocabulary, grammar, phrases practiced separately |
| **Elaboration** | Explaining *why* and connecting to existing knowledge deepens understanding. | ✅ "Why this matters" section; ⚠️ Reflect step is too unstructured |
| **Concrete examples** | Specific examples make abstract concepts tangible. | ✅ Task cards include usage examples ("Ondu kaapi kodi = Give one coffee") |
| **Dual coding** | Combining verbal and visual information aids memory. | ✅ Kannada script + transliteration + pronunciation guide |

### 🔴 Critical Gap: Passive Consumption as Default

**Current:** The vocabulary journey's tasks are predominantly "Learn these 10 words: [list]" — passive reading. The 4-step task flow goes Learn → Study → Practice → Reflect, where Study defaults to "Learn" mode (showing answers) and Practice merely suggests switching to Quiz mode.

**Research says:** "Rereading produces familiarity. Retrieval produces knowledge." (Roediger & Karpicke, 2006). Active recall — forcing the brain to produce information from memory without looking — consistently outperforms passive methods across every subject, age group, and testing format studied. Students using active recall retain up to 50% more information.

**Recommendation:** Flip the default. Start with Quiz mode (show the prompt, hide the answer). Let users opt *into* Learn mode if they're stuck. The struggle of trying to recall is what builds the memory trace.

### 🔴 Critical Gap: No Spaced Repetition Algorithm

**Current:** Tasks are in a fixed linear sequence. Complete task 1, unlock task 2. No mechanism to resurface content based on individual retention.

**Research says:** Spaced repetition is "the most evidence-based method for building durable long-term memory" (iatrox.com, 2026). Reviewing at increasing intervals (1 day → 3 days → 7 days → 14 days) based on recall accuracy produces dramatically better long-term retention than any fixed schedule.

**Recommendation:** Track recall accuracy per item during Quiz mode. Items answered incorrectly resurface sooner. Items answered correctly get longer intervals. This doesn't require a full Anki-style SRS — even a simple 3-bucket system (new → learning → mastered) with fixed intervals would be a massive improvement.

### 🟡 Important Gap: No Assessment of Actual Learning

**Current:** Progress is measured as "1/39 tasks completed" — this tracks *exposure*, not *retention*. There's no way to distinguish "I did the task" from "I learned the material."

**Recommendation:** Add session-opening recall checks: "Yesterday you learned numbers 1-10. Quick: what's 7 in Kannada?" This serves double duty — it's retrieval practice AND it measures whether learning stuck. Track recall accuracy over time as the real progress metric, not task completion count.

### 🟡 Important Gap: One-Size-Fits-All Practice Model

**Current:** All skills use the same flow: read content → study flashcards → quiz → reflect. But different skills need fundamentally different practice modalities:

| Skill | What the research says works | Current Forge approach | Gap |
|---|---|---|---|
| **Vocabulary** | Spaced repetition + active recall | Flashcards with quiz option | No SRS, passive default |
| **Guitar** | Deliberate practice — playing at edge of ability with metronome, feedback, error correction | "Learn these chords" reading tasks | Reading about guitar ≠ practicing guitar |
| **Philosophy** | Elaboration — arguing positions, connecting ideas, Socratic questioning | Reading thought experiments | Needs more generative/argumentative tasks |
| **Public speaking** | Actual speaking practice with recording and self-review | Reading tips about clarity/presence | Needs audio recording + playback |
| **Distributed systems** | Problem-solving, system design exercises, tracing through scenarios | Reading concepts | Needs more interactive scenarios |

**Recommendation:** Differentiate the task flow by skill type. Guitar tasks should prompt "Play along with this audio" (using the AudioPlayer component that already exists). Public speaking tasks should prompt "Record yourself saying X." Philosophy tasks should ask "Argue the opposite position." The infrastructure for some of this already exists in the codebase (AudioPlayerScreen, WorkspaceTools).

### 🟢 Opportunity: Structured Reflection

**Current:** Reflect step shows "What did you notice?" with an optional free-text box.

**Research says:** Elaboration — explaining *why* something works and connecting it to existing knowledge — is one of the six evidence-based strategies. But it needs structure to be effective.

**Recommendation:** Replace the generic prompt with skill-specific structured prompts:
- Vocabulary: "Which word was hardest to remember? Why?"
- Guitar: "What part of the chord change felt awkward?"
- Philosophy: "How does this connect to something you already believe?"
- General: "Explain what you just learned as if teaching a friend"

### Architecture Assessment: Not One-Size-Fits-All (But Rendered As If It Is)

The task data is already goal-specific. The schemas are meaningfully different per goal:

| Goal | Types | Key Tools | Unique Fields |
|---|---|---|---|
| **Guitar** (219 tasks) | 71% practice, 29% learning | `metronome` (147), `timer` (30) | `needs_guitar`, `bpm`, `chords` |
| **Kannada** (160 tasks) | 53% learning, 34% practice, 10% retrieval | `reveal_hide` (32), `timer` (28), `text_input` (12) | `dialogue`, `narration`, `fill_blank` references |
| **Philosophy** (146 tasks) | 55% practice, 32% learning, 12% retrieval | `text_input` (81), `reveal_hide` (36) | `concepts`, `fill_blank`, `pairs` references |
| **Public Speaking** (150 tasks) | 93% practice, 5% reflection | `timer` (28), `text_input` (10) | Almost all performance-oriented |

Guitar tasks have BPM targets, metronome integration, and a `needs_guitar` flag. Kannada has dialogues, narrations, fill-in-the-blank. Philosophy is heavily `text_input` (writing/argumentation). Public speaking is almost entirely practice.

**The bottleneck is `buildSteps()` in `Focused.tsx`.** It builds the same 2-4 step flow for every task regardless of goal type: instruction → reference → exercise → reflect. The metronome, timer, chord diagrams, audio player, and text input components all exist — but they're embedded in a generic step structure that doesn't adapt to the learning modality.

**What's needed:** A metadata-driven rendering layer — NOT goal-specific modes.

Initial analysis proposed 4 goal-specific practice modes (deliberate_practice, spaced_retrieval, elaboration, performance). On deeper examination, this is a false simplification. Even within a single goal like Kannada, the 6 skill areas need fundamentally different practice: script needs motor practice, vocabulary needs SRS, pronunciation needs audio, phrases need dialogue, grammar needs pattern exercises, culture needs reading + reflection. "Kannada → spaced_retrieval" collapses all of these incorrectly.

The right approach: **the task metadata already encodes the correct practice mode.** The combination of `type` + `tools` + `reference.type` + `completion` tells the renderer exactly what to do:

```
Task metadata combination                                    → Rendering strategy
──────────────────────────────────────────────────────────────────────────────────
type: learning  + reference: structured_list + tools: reveal_hide  → Flashcard quiz
type: practice  + tools: metronome + bpm: 60                      → Metronome-guided drill
type: practice  + tools: text_input                                → Writing exercise
type: retrieval + reference: fill_blank                            → Fill-in-the-blank
type: practice  + reference: dialogue                              → Interactive dialogue
type: practice  + tools: timer                                     → Timed performance
type: reflection + tools: text_input                               → Structured reflection
```

This is more generic than goal-specific modes but more accurate. You don't need to know it's "guitar" to know that `tools: ['metronome']` + `bpm: 60` should show a metronome. You don't need to know it's "philosophy" to know that `tools: ['text_input']` should show a writing prompt. The composable task format described in Architecture.md (reference types × tools × completion signals) already encodes this — `buildSteps()` just needs to respect it.

### Cross-Cutting Gaps (Not Goal-Specific)

The deepest problems aren't about rendering — they're about learning infrastructure that no goal currently has:

| Gap | Affects | Why it matters |
|---|---|---|
| **No spaced repetition** | Kannada vocab, guitar chord memory, philosophy concepts | The single most evidence-based learning technique. Without it, users forget 80% within a week. |
| **No progressive difficulty** | Guitar BPM, language complexity, philosophy depth | Guitar practice MUST increase BPM over time. A task with `bpm: 60` should eventually become `bpm: 80`. No mechanism exists for this. |
| **No audio playback or recording** | Kannada pronunciation (16 tasks), guitar ear training (25 tasks), public speaking (150 tasks — ALL of them) | You cannot learn pronunciation from text. You cannot train your ear without audio. You cannot practice public speaking by typing. This is a fundamental capability gap. |
| **No actual assessment** | Everything | "1/39 completed" measures exposure, not retention. No mechanism to distinguish "I did the task" from "I learned the material." |
| **Passive default** | All flashcard-based tasks | Learn mode (show answer) before Quiz mode (test recall). Research says flip this. |

### Per-Goal Detailed Analysis

**Kannada (160 tasks):** 6 skill areas, each needing different practice. Script tasks correctly ask for handwriting practice. Vocabulary has flashcards but no SRS. Grammar has fill-in-the-blank exercises. Phrases have dialogue references but they render as text, not interactive conversation. Pronunciation is the biggest gap — 16 tasks that try to teach pronunciation through text descriptions, which is fundamentally inadequate. Culture tasks are reading-based, which is actually appropriate.

**Guitar (219 tasks):** The strongest dataset. 71% practice type, BPM targets on 147 tasks, metronome integration, `needs_guitar` flag, chord diagrams. The task design reflects real deliberate practice principles. Key gap: no progressive BPM tracking — you do 60 BPM forever with no mechanism to advance. Ear training (25 tasks) needs audio that doesn't exist.

**Philosophy (146 tasks):** 81 tasks with `text_input` — writing exercises that force articulation, which is the right approach. Structured lists with reveal/hide for concept learning. Fill-in-the-blank for retrieval. The cognitive ladder (comprehension → analysis → evaluation → synthesis → creation) is partially represented but could be more explicit in task sequencing.

**Public Speaking (150 tasks):** 93% practice type, which is the right ratio. But the tools are `timer` and `text_input`. The entire value proposition depends on audio recording and playback, which doesn't exist. This goal is the most compromised by the audio gap.

**Distributed Systems (219 tasks):** Not yet analyzed in detail. Key question: are tasks "read about consensus" or "design a system that handles X failure mode"? The latter is what builds real understanding.

**Creative Writing (100 tasks):** Not yet analyzed in detail. Writing-focused goals are the best fit for the current text-based UI.

### The Duolingo Warning

Duolingo has 600M users and best-in-class engagement metrics. It's also widely criticized for producing shallow learning — users maintain streaks but can't hold conversations. The core issue: gamification optimizes for *app opens*, not *skill acquisition*. Streaks measure consistency, not competence.

Forge's MVP-Plan explicitly positions against Duolingo ("Single domain, rigid curriculum, no cross-goal recommendations"). But the UX audit's engagement recommendations (streaks, variable rewards, gamification) risk recreating the same fundamental problem. The differentiator should be: **Forge makes you actually better at things, not just feel like you're making progress.**

### Revised Priority Stack

Combining engagement, learning effectiveness, and infrastructure:

| Priority | Change | Type | Status |
|---|---|---|---|
| ~~P0~~ | ~~Default to retrieval practice (Quiz first)~~ | Learning | ✅ Done — Sprint 1, Apr 11 |
| ~~P0~~ | ~~Make `buildSteps()` metadata-driven~~ | Learning | ✅ Done — Sprint 1, Apr 11 |
| ~~P0~~ | ~~Variable completion messages~~ | Engagement | ✅ Done — Sprint 1, Apr 11 |
| ~~P0~~ | ~~Structured reflect prompts per task type~~ | Learning | ✅ Done — Sprint 1, Apr 11 |
| P0 | Add session-opening recall checks | Learning | |
| P0 | Lead home screen with next task (reduce friction) | Engagement | |
| P0 | Add streak counter | Engagement | |
| P1 | Implement basic spaced repetition (3-bucket system) | Learning | |
| P1 | Add audio playback for pronunciation/ear training tasks | Infrastructure | |
| P1 | Add progressive difficulty tracking (BPM for guitar) | Learning | |
| P1 | Collapse journey tasks (progressive disclosure) | Engagement | |
| P2 | Add audio recording for public speaking | Infrastructure | |
| P2 | Add stats to completion screen | Engagement | |
| P2 | Social sharing | Engagement | |

---

## Sprint 1 Changelog (April 11, 2026)

**4 changes shipped:**
1. `ReferenceRenderer.tsx` — Default mode flipped from `learn`/`review` to `quiz` when items have `reveal` fields. Falls back to `learn` for body-heavy content.
2. `Focused.tsx` — `buildSteps()` refactored into 7 metadata-driven flows: retrieval→quiz-first, metronome→practice-led, text_input→writing-led, dialogue/fill_blank→interactive, structured_list+reveal_hide→study+quiz, timer→timed-practice, default→study+reflect.
3. `WhatsNext.tsx` — Static "Nice work." replaced with pool of 16 variable messages, randomly selected per session.
4. `Focused.tsx` — `reflectPrompt()` function added with 6 task-type-specific variants (metronome, text_input, retrieval, dialogue, fill_blank, generic fallback).

**Also:** `type` field (practice/learning/retrieval/reflection) threaded through `TaskData` in `App.tsx` → `Focused.tsx`.

**Bug fix:** `buildSteps()` default branch now checks `refType` (reference.type) instead of `task.reference` to decide whether to add a Study step. This fixes the empty Study page for guitar tasks where the `reference` column contains metadata (tags, chords, sequence, needs_guitar, bpm) but no renderable `type` field. Affected tasks: barre chord tasks (gp-038, gp-039, gp-040, gp-041, gp-049) and potentially others with metadata-only references.

---

## Research Notes

### Habit Loop (thisisglance.com)
The core habit loop is: **Trigger → Routine → Reward**. Forge's current loop:
- Trigger: User opens app (external trigger — no internal trigger yet)
- Routine: Metadata-driven task flow (varies by task type — 2-4 steps)
- Reward: Variable completion messages (16 variants)

The missing piece is the **internal trigger** — the emotional state that makes users think of Forge without being prompted. This comes from consistent, satisfying experiences over the first 7-14 days.

### Gamification Psychology (xqa.io)
Five psychological drivers relevant to Forge:
1. **Progression & Mastery** — Journey structure provides this ✅
2. **Autonomy & Choice** — Goal selection + skip option provides this ✅
3. **Social Connection** — Missing ❌
4. **Narrative & Meaning** — Task context ("Why this matters") provides this ✅
5. **Flow State** — 4-step task flow approaches this, but needs polish ⚠️

### Dark Mode & Touch-First (catdoes.com)
- 82% of users prefer dark mode — Forge's warm dark theme is well-positioned ✅
- 44pt minimum touch targets — needs verification across all interactive elements ⚠️
- EU Accessibility Act now enforced — accessibility audit recommended for future ⚠️
- Load time target: < 5 seconds — Forge is a Vite SPA, likely fast, but should measure ⚠️

---

## Framework Extensibility Assessment

> Core question: Can Forge's framework support ANY skill someone wants to practice, or is it structurally limited to certain types?

### What the Framework Assumes

Every skill in Forge is decomposed into **small, timed, text-primary tasks** with optional structured references and tools. The task schema:

```
description + action     → what to do (text)
context                  → why it matters (text)
reference                → study material (polymorphic JSON: structured_list, fill_blank, dialogue, narration, text, steps, pairs)
tools                    → interactive elements (array: timer, metronome, reveal_hide, text_input)
completion               → how to verify (self_report)
type                     → learning mode (practice, learning, reflection, retrieval)
+ goal-specific fields   → bpm, chords, needs_guitar, song, etc. (extensible via top-level or reference JSON)
```

This is a **micro-task + reference + tool** model. The question is: what skills fit this model?

### Skills That Fit Well

These skills can be meaningfully practiced through text instructions, timed exercises, flashcards, and writing prompts:

| Skill Type | Why It Fits | Reference Types Used | Tools Used |
|---|---|---|---|
| **Language learning** | Vocabulary = flashcards, grammar = fill_blank, phrases = dialogue, script = writing practice | structured_list, fill_blank, dialogue, narration | reveal_hide, text_input, timer |
| **Music practice** | Exercises are timed, metronome-driven, with specific targets (BPM, chords) | text, structured_list | metronome, timer |
| **Philosophy / critical thinking** | Reading + writing + argumentation are inherently text-based | structured_list, fill_blank, pairs | text_input, reveal_hide |
| **Public speaking** | Prompts + timed performance + self-reflection (with audio recording) | text | timer, text_input |
| **Technical concepts** (distributed systems, etc.) | Concept learning + retrieval + system design exercises | structured_list, fill_blank, steps | text_input, reveal_hide |
| **Creative writing** | Prompts + constraints + timed writing exercises | text | text_input, timer |
| **Meditation / mindfulness** | Timer-guided sessions + audio guidance (speechEngine exists) | text | timer |
| **Fitness (bodyweight)** | Exercise descriptions + timed sets + rep tracking | steps, text | timer |
| **Cooking basics** | Step-by-step recipes + timed stages | steps, structured_list | timer |
| **Study skills / exam prep** | Flashcards + retrieval practice + spaced repetition | structured_list, fill_blank | reveal_hide, text_input |

### Skills That Don't Fit

These skills require modalities the framework doesn't support:

| Skill Type | Why It Doesn't Fit | What's Missing |
|---|---|---|
| **Visual arts** (drawing, painting, photography) | Learning is visual — you need to see examples and produce visual output | Image display in references, canvas/upload for practice |
| **Interactive simulations** (chess, coding, math) | Need interactive widgets — board visualization, code editor, equation rendering | Domain-specific interactive components |
| **Video-dependent motor skills** (dance, yoga, martial arts, sign language) | Correct form requires video demonstration, not text description | Video playback in references |
| **Collaborative skills** (debate, team sports, pair programming) | Require another person — can't be practiced solo with a task card | Multi-user interaction |

### The Extensibility Mechanism

The framework IS architecturally extensible. Adding a new skill requires:

1. **Author a task bank** (JSON) following the schema — this is the main effort
2. **Add category** to IntentCapture + emoji maps — trivial
3. **If new reference type needed** (e.g., `image`, `code_block`, `video`) — add a case to `ReferenceRenderer`
4. **If new tool needed** (e.g., `audio_recorder`, `canvas`) — add a component to `WorkspaceTools`

The `reference` field is polymorphic JSON and the `tools` array is a string list — both are open for extension without schema changes. Goal-specific fields (like `bpm`, `needs_guitar`) can be added as top-level task fields or nested in the reference JSON.

**The bottleneck is content authoring, not architecture.** Writing 150+ well-structured tasks per goal with proper sequencing, skill areas, and references is significant manual effort. The framework can accommodate new skills — but each new skill needs someone to design the curriculum.

### What This Means for Forge's Identity

Forge is best suited for **knowledge + practice skills that can be expressed in text/audio with timed exercises.** This covers the majority of self-improvement goals people actually pursue: learning languages, practicing instruments, studying concepts, improving communication, building writing habits, developing mindfulness.

It is NOT suited for visual arts, interactive simulations, or video-dependent motor skills. This is a reasonable scope — trying to support everything would dilute the core experience.

The 5 current goals (Kannada, guitar, philosophy, public speaking, distributed systems) are all within the framework's sweet spot. Expanding to 10-15 goals in the same category (more languages, more instruments, more technical topics, writing, meditation, fitness) is straightforward. Expanding to visual/interactive skills would require new component types.
