# Forge — Content Strategy

> Created April 18, 2026. Based on full content audit of 1,319 tasks across 8 categories, serotonergic design research, and product evaluation goals.

---

## Design Philosophy: Serotonergic Content

Forge rejects the dopaminergic content model (consume more, feel stimulated, come back for another hit). Instead, content is designed around the serotonergic arc:

**Intent → Action → Reflection → Completion ("enough")**

Every task should leave the user feeling "I did something real" — not "I consumed something interesting." The distinction:

| Dopaminergic content | Serotonergic content |
|---|---|
| "Learn about X" | "Do X and notice what happens" |
| Consumption disguised as practice | Production that builds skill |
| Progress = tasks completed | Progress = things you can do that you couldn't before |
| Retention via streaks and rewards | Retention via felt competence |
| The app is the destination | The app is the doorway |

---

## Content Quality Principles

Extracted from auditing 1,319 tasks. The best tasks share five properties:

### 1. You Produce Something

A sentence, a sound, a physical action, a conversation. Not "learn about X" — "do X." The output can be in the app (written text, rep count) or in the real world (a conversation, a meal, a chord change). But something must be produced.

Bad: "Learn the Stoic Dichotomy of Control."
Good: "Your flight is cancelled. You're stuck for 8 hours. Apply the Dichotomy of Control: what's in your control, what isn't? Write 3 sentences."

### 2. There's a Specific Constraint

The constraint is what makes it deliberate practice instead of noodling. It bounds the task, focuses attention, and makes completion verifiable.

Bad: "Write a scene."
Good: "Write a scene in exactly 6 sentences. Each sentence must use a different sense."

Bad: "Do pushups."
Good: "Do pushups to failure. Chest touches floor, full lockout at top. If hips sag, stop — that's your real number."

### 3. You Can Tell If You Did It

Self-verifiable completion. The chord rings clean or it doesn't. You wrote 100 words or you didn't. You called someone or you didn't. No ambiguity.

### 4. It Connects to Something Real

"Why this matters" isn't decoration — it's what separates meaningful practice from busywork. The philosophy tasks are strong because they connect abstract concepts to real dilemmas. The fitness tasks work because the numbers connect to your actual physical capability.

### 5. It's Uncomfortable in the Right Way

"Argue against something you believe" is hard. "Learn about argumentation" is easy. The hard one builds the skill. Desirable difficulty — the struggle is the learning signal.

## Learning Effectiveness

Six cognitive strategies with robust research support (Weinstein et al., 2018). Forge's content must implement these — engagement without learning effectiveness is the Duolingo trap.

| Strategy | Evidence | Forge Status |
|---|---|---|
| **Spaced practice** | Distributing study over time produces superior retention. 140+ years of research. | ⚠️ Daily micro-tasks space sessions, but no algorithmic spacing of specific content review |
| **Retrieval practice** | Testing yourself beats re-reading. Roediger & Karpicke (2006). | ✅ Quiz-first default (Sprint 1). Production over recognition. |
| **Interleaving** | Mixing problem types improves transfer. | ⚠️ Suggestion engine balances skill areas, but journeys are siloed |
| **Elaboration** | Explaining *why* deepens understanding. | ✅ "Why this matters" on tasks; ⚠️ Reflect prompts could be more structured |
| **Concrete examples** | Specific examples make abstract concepts tangible. | ✅ Task cards include usage examples |
| **Dual coding** | Combining verbal and visual aids memory. | ✅ Kannada script + transliteration; chord diagrams + tab notation |

### The Critical Principle

**"Rereading produces familiarity. Retrieval produces knowledge."** (Roediger & Karpicke, 2006)

Every task should force the user to produce, not consume. When a task presents information (vocabulary list, concept explanation), it must be immediately followed by retrieval — hide the answers, produce them from memory. The struggle of recall is the learning signal.

### Per-Goal Practice Modality

Different skills need different practice. The task metadata (`type` + `tools` + `reference.type`) encodes the correct modality:

| Skill | What works | Forge approach |
|---|---|---|
| **Vocabulary** | Spaced repetition + active recall | Flashcards with quiz-first default. Gap: no SRS scheduling. |
| **Guitar** | Deliberate practice at edge of ability | Metronome drills, BPM targets, chord diagrams. Gap: no progressive BPM. |
| **Philosophy** | Elaboration — arguing positions, Socratic questioning | Writing exercises (81 tasks with text_input). Strong. |
| **Public speaking** | Actual speaking with self-review | Timer-based prompts. Gap: no audio recording. |
| **Distributed systems** | Problem-solving, scenario analysis | Gap: 54% passive. Needs scenario-based rewrite. |
| **Deep reading** | Forced output after bounded reading | Text_input for every task. New category. |
| **Fitness** | Progressive overload, form constraints | Timer + rep tracking. New category. |
| **Conversation** | Real-world interaction + reflection | Prompt → go live → reflect. New category. |

---

## Content Audit (April 2026)

### Summary

| Category | Tasks | Passive % | Active % | Verdict |
|---|---|---|---|---|
| Creative Writing | 175 | 12% | 88% | ✅ Gold standard — almost every task produces real writing |
| Guitar Practice | 261 | 14% | 86% | ✅ Strong — tasks require playing, not reading about playing |
| Public Speaking | 150 | 0% | 100% | ✅ Well-designed but blocked by missing audio recording |
| Learn Kannada | 261 | 41% | 59% | ⚠️ 106 "learn these words" tasks need retrieval twins |
| Philosophy | 146 | 32% | 68% | ⚠️ Learning tasks need "now apply it" follow-ups |
| Distributed Systems | 173 | 54% | 46% | 🔴 Majority passive — needs rewrite toward scenario-based practice |
| Guided Thinking | 8 | — | — | Too small to evaluate |
| Active Listening | 5 | — | — | Too small to evaluate |

**Total: 1,179 tasks across 6 main categories. ~370 are passive (31%).**

### What "Passive" Means

A task is passive when:
- Its type is `learning` with no active tools (`text_input`, `metronome`, `timer`)
- It starts with "Learn..." and presents a structured list without requiring production
- It says "Read the scenario and analyze" without requiring written output
- It's consumption (reading, listening) without a forced output

Passive tasks aren't worthless — they provide context and reference material. But they shouldn't be the majority, and they should always be paired with an active follow-up.

### Per-Category Analysis

#### Creative Writing (175 tasks) — ✅ Gold Standard

88% active. Tasks like "Write a scene of two characters watching the same sunset but seeing completely different things. 100 words." Every task has a specific constraint, a clear output, and a bounded scope. This is the template for all other categories.

**No changes needed.** This category demonstrates what good Forge content looks like.

#### Guitar Practice (261 tasks) — ✅ Strong

86% active. Tasks require physical playing — chord changes, metronome drills, hammer-ons, fingerpicking patterns. BPM targets on 147 tasks. ChordDiagram and TabPlayer components provide real reference material.

**Gap:** No progressive BPM tracking (you practice at 60 BPM forever). This is an infrastructure issue, not a content issue.

#### Public Speaking (150 tasks) — ✅ Strong Content, Blocked by Infrastructure

100% active — every task asks you to speak aloud. "Practice the power pause — stand still, 5 seconds of silence, THEN start speaking." Well-designed prompts with real constraints.

**Gap:** No audio recording. You can't improve speaking without hearing yourself. 150 well-designed tasks are all compromised by this single missing capability.

#### Learn Kannada (261 tasks) — ⚠️ 41% Passive

106 tasks are "Learn 10 X words: [list]." With quiz mode defaulting to retrieval, these are functional — you see "rice" and produce "ಅನ್ನ." But without SRS, you learn 10 words, never review them, and forget 8 within a week.

The narration-based tasks ("Listen to Ramu's first auto ride") are engaging context-setters but are passive consumption.

**Fix needed:** Every "Learn 10 words" task needs a paired "Recall those 10 words" retrieval task. The narration tasks need comprehension questions that require written answers.

**Two-modality split (April 2026):** Learn Kannada now has two distinct learning paths:
- **Visual modality** (existing tasks in Focused.tsx): structured lists, fill-blank, dialogue, script practice. Screen-first, no pre-generated audio. This is where explicit vocabulary instruction and active recall live.
- **Audio modality** (bilingual stories in PodcastPlayer): sentence-by-sentence Kannada→English narratives with scaffolded progression. Eyes-free, podcast-style. This is where contextual exposure and incidental acquisition live.

Stories are initially passive (consumption), which conflicts with the "production over consumption" principle. The scaffolded progression addresses this: guided → delayed translation → selective translation → KN-only with comprehension checks → production prompts. By Phase 4-5, the learner is actively producing and recalling — the story format just provides a more engaging container than isolated vocabulary drills.

#### Philosophy (146 tasks) — ⚠️ 32% Passive

47 tasks are "Learn about X" with structured lists. The 81 practice tasks are genuinely strong — "Should AI have rights? Argue your position in 5 sentences." "Pick a common belief. Use Socratic questioning to expose hidden assumptions."

**Fix needed:** Every "Learn about X" task needs a "Now apply X" follow-up. "Learn the Stoic Dichotomy of Control" → "Your flight is cancelled. Apply the Dichotomy: what's in your control? Write 3 sentences."

#### Distributed Systems (173 tasks) — 🔴 54% Passive

93 learning tasks, 36 practice, 34 retrieval. The practice tasks are "Read the scenario and analyze" — which sounds active but produces no verifiable output. The retrieval tasks (fill-in-the-blank) are the strongest part.

**Fix needed:** Major rewrite. "Learn about leader-based replication" should become "You have a Postgres primary with 2 replicas. The primary goes down. Write what happens in the next 30 seconds — step by step. What data might be lost?" Same concept, but the user produces the answer.

### Content Improvement Priority

| Priority | Category | Action | Effort |
|---|---|---|---|
| 1 | Distributed Systems | Rewrite 93 learning tasks as scenario-based practice | 3-4 days |
| 2 | Learn Kannada | Add retrieval twins for 106 vocabulary tasks | 2 days |
| 3 | Philosophy | Add "apply it" follow-ups for 47 learning tasks | 1-2 days |
| 4 | Public Speaking | Ship audio recording infrastructure | 1 day (code) |

---

## New Categories

Three new categories designed to test whether Forge works beyond structured skill-building — as a practice-for-life tool.

### Why These Three

The existing 8 categories all test one hypothesis: "Forge works for structured skill-building." They're all learning-oriented — language, instrument, writing, technical knowledge. The user practices alone, on a screen, building a measurable skill.

These three new categories test fundamentally different hypotheses:

| Category | Hypothesis it tests | Modality | Screen time | Neurochemistry |
|---|---|---|---|---|
| **Deep Reading** | Can Forge improve how you think? | Intellectual, solo, book + app | Low (prompt + writing) | Serotonin (depth, meaning) |
| **Bodyweight Fitness** | Can measurable progress replace gamification? | Physical, solo, away from screen | Minimal (timer + rep count) | Endorphins (effort, mastery) |
| **Conversation** | Can Forge improve how you connect? | Social, with others, fully offline | Almost zero | Oxytocin (connection, vulnerability) |

Together they cover the three non-dopaminergic neurochemical pathways. If all three work, Forge isn't a learning app — it's a living-better app.

---

### Category: Deep Reading

> "The only category where Forge doesn't provide the content. The user brings their own book. Forge adds a lens, a boundary, and a forced output."

#### Why It Matters

Most people read passively — words go in, vague impressions form, details evaporate within days. Deep reading is the meta-skill that makes every other reading better. These tasks transform passive consumption into active thinking by adding one thing: a specific constraint that forces production.

This is also the anti-doomscrolling category. It doesn't replace content consumption — it makes existing consumption intentional and bounded.

#### Skill Areas

**Comprehension** — accurately restating what the author said
- "Read one page. Close the book. Write what the author argued in 3 sentences. No opinions — just their argument."
- "Read a chapter. Write the one sentence the author would say is the most important."
- "Read one page. List every claim the author makes. How many are stated vs. implied?"
- "Read 2 pages. Write a 1-sentence summary that someone who hasn't read the book would understand."
- "Read one page. What question is the author trying to answer? Write it as a single question."

**Analysis** — seeing the structure underneath
- "Read one page. What's the author's main claim? What's their strongest evidence? What's their weakest?"
- "Read two paragraphs. Identify the assumption the author never states but the argument depends on."
- "Read one page. Draw the argument as a chain: premise → premise → conclusion. Where is the chain weakest?"
- "Read one page. What would the author need to be true for their argument to work? List 3 hidden premises."
- "Read a paragraph. Is the author using logic, emotion, authority, or analogy to persuade? Identify which and write why."

**Critique** — pushing back intelligently
- "Find one sentence you disagree with. Write the strongest version of why you disagree in 4 sentences."
- "Read one page. Write what someone from the opposite position would say about it."
- "Find a claim the author presents as obvious. Write 3 reasons it might not be."
- "Read one page. What's the author NOT saying? What perspective is missing? Write 3 sentences."
- "Find the weakest argument on the page. Rewrite it to make it stronger."

**Synthesis** — connecting ideas across sources
- "What does what you read today remind you of from something else you've read? Write the connection in 3 sentences."
- "Read one page. How does this relate to something happening in your own life right now? Write 3 sentences."
- "Take an idea from today's reading and apply it to a completely different domain. Write 4 sentences."
- "Read one page. If you could ask the author one question, what would it be? Write the question and why you'd ask it."
- "What would a conversation between this author and the last author you read look like? Write 4 lines of dialogue."

**Expression** — distilling and rewriting
- "Pick a paragraph. Rewrite it in half the words without losing the meaning."
- "Take the author's main argument and explain it to a 12-year-old in 3 sentences."
- "Rewrite one paragraph in the author's style but about a completely different topic."
- "Pick the most complex sentence on the page. Break it into 3 simple sentences."
- "Write a one-paragraph book review based only on what you read today. Would you recommend it?"

#### Task Design

- **Reference type:** `text` (the prompt itself — no external content needed)
- **Tools:** `text_input` (every task requires writing), `timer` (optional for timed exercises)
- **Completion:** `text_submitted`
- **Difficulty curve:** comprehension → analysis → critique → synthesis
- **Time:** 5-10 minutes per task (1 minute reading, rest is writing)
- **Total tasks:** ~30-40 for initial bank (5-8 per skill area)

#### What Makes It Special

The reflections from this category accumulate into a **reading journal the user didn't plan to write.** The weekly mirror — "Here's everything you thought about what you read this week" — is genuinely meaningful. Over months, the user has a record of their intellectual life.

---

### Category: Bodyweight Fitness

> "The category where progress is a number. Not a feeling, not a self-assessment — a number. The number doesn't lie, and the number goes up."

#### Why It Matters

This is the purest test of the serotonergic retention thesis. If someone's pushup count goes from 12 to 22 over a month, they don't need a streak counter to come back. The progress IS the motivation. No gamification needed — the wall sit time is the streak.

Beginners see measurable gains within 1-2 weeks. That's faster feedback than any other category in Forge.

#### Skill Areas

**Push** (chest, shoulders, triceps)
- "Do pushups to near-failure. Chest must touch the floor. Arms must fully lock out at top. If hips sag, stop — that's your real number. Write your count."
- "Do 3 sets of pushups with 60 seconds rest. Write each set's count."
- "Do 10 slow pushups — 3 seconds down, 1 second pause at bottom, 3 seconds up. Write how many you completed with full tempo."
- "Pike pushups: feet on a chair, hands on floor, body in an inverted V. Do as many as you can. Write the count."
- "Diamond pushups: hands together under chest. Do as many as you can with full range of motion. Write the count."
- "Do pushups but pause for 2 seconds at the bottom of each rep. Write how many you completed before losing the pause."

**Squat** (legs, glutes)
- "Do 20 bodyweight squats. Go as low as you can while keeping heels flat. Write how low you got."
- "Wall sit: back flat against wall, thighs parallel to floor. Time it. Write the number."
- "Bulgarian split squats: back foot on a chair. 10 each leg. Write whether you completed all 10."
- "Single-leg squat to chair: stand on one leg, sit down slowly (3 seconds), stand back up. How many per leg?"
- "Do 15 jump squats. Squat to parallel, explode up, land softly. Write how many you completed with soft landings."
- "Lunge walk: 10 steps each leg. Back knee must touch (or nearly touch) the floor. Write whether you kept balance on all 20."

**Core** (abs, lower back, stability)
- "Plank: forearms on floor, body straight. Time it. If your hips sag, that's your real time. Write the number."
- "Hollow body hold: lie on back, arms overhead, legs straight, lift shoulders and feet 6 inches off floor. Time it."
- "Dead bug: lie on back, arms up, knees at 90°. Extend opposite arm and leg slowly. 10 each side. Write whether your lower back stayed flat."
- "Side plank: each side. Time both. Write both numbers."
- "Leg raises: lie on back, legs straight, raise to 90° and lower slowly. Do as many as you can without your lower back lifting off the floor. Write the count."

**Mobility** (flexibility, joint health)
- "Deep squat hold: squat as low as you can, heels flat, hold for 60 seconds. Write what felt tight."
- "Shoulder dislocates with a towel: hold wide, arms straight, bring from front to behind your back. 10 reps. Write how wide your grip needed to be."
- "Couch stretch: kneel with back foot against a wall, front foot forward. 60 seconds each side. Write which side was tighter."
- "Sit on the floor with legs straight. Reach for your toes. Hold for 60 seconds. Write where your hands reached — shins, ankles, toes, past toes?"
- "Stand on one foot, eyes closed. Time it. Each side. Write both numbers."

#### Task Design

- **Reference type:** `text` (form cues) or `steps` (multi-exercise sequences)
- **Tools:** `timer` (rest periods, holds, timed sets), `text_input` (rep counts, form notes)
- **Completion:** `text_submitted` (the rep count / time IS the completion)
- **Difficulty curve:** basic movements → tempo control → single-limb progressions → complex movements
- **Time:** 5-15 minutes per task
- **Total tasks:** ~30-40 for initial bank (6-10 per skill area)

#### The Progression Model

Unlike other categories, progression isn't in task complexity — it's in the user's own numbers. The same task ("pushups to failure") produces different results over time:

```
Week 1: 12
Week 3: 16
Week 6: 22
```

The history screen becomes a progress tracker without any special infrastructure. The form constraint ("chest touches floor, full lockout") ensures the numbers are honest.

#### The Form Problem (and Solution)

Bad form is the biggest risk. Every task must bake form cues into the constraint — the constraint IS the quality control:

- "Chest must touch the floor" (not half-reps)
- "If hips sag, stop — that's your real number" (honest counting)
- "3 seconds down, 1 second pause" (tempo prevents cheating)
- "Write whether your lower back stayed flat" (self-assessment of form)

---

### Category: Conversation / Connection

> "The most radical category. The app does almost nothing. It gives you a prompt. You close the app. You go have a real interaction with a real person. You come back and write what happened."

#### Why It Matters

This is the category that tests whether Forge can be the serotonergic product — not a skill-building tool, but a living-better tool. The task happens entirely in the real world. The app is a 30-second prompt and a reflection space. Total screen time: under 2 minutes. Total life impact: potentially enormous.

This is the oxytocin layer. Genuine human connection — not likes, not comments, not performative sharing. Real vulnerability with real people.

#### Skill Areas

**Listening** — hearing what someone actually says
- "In your next conversation, don't think about what you'll say next while the other person is talking. Just listen. After, write what they said that surprised you."
- "Ask someone about their day. When they answer, ask one follow-up question about a specific detail they mentioned. Write what the detail was."
- "Have a conversation where you don't give any advice. Only ask questions. Write how it felt."
- "Listen to someone for 2 minutes without interrupting. Not even 'mm-hmm.' Just eye contact and silence. Write what you noticed."
- "After your next conversation, write down 3 specific things the other person said. Not the topic — their actual words."

**Asking** — questions that open people up
- "Ask someone you see regularly one question you've never asked them. Write what they said."
- "Replace 'How are you?' with 'What's been on your mind lately?' once today. Write what happened."
- "Ask someone: 'What's something you've changed your mind about recently?' Write their answer."
- "Ask someone: 'What's something you're looking forward to?' Write their answer and whether it surprised you."
- "Ask a colleague about something outside of work. Write what you learned about them."

**Vulnerability** — sharing something real
- "Tell someone one specific thing you appreciate about them that you've never said. Write what you said and how they responded."
- "Admit to someone that you don't know something you feel like you should know. Write what it was."
- "Share one thing you're struggling with right now with someone you trust. Keep it to 2 sentences. Write what they said."
- "Tell someone about a mistake you made recently. Not a humble-brag mistake — a real one. Write what happened."
- "Ask someone for help with something small. Write what you asked and whether it was hard to ask."

**Presence** — being fully there
- "Have a 5-minute conversation with your phone in another room. Write what was different."
- "Next time you're with someone, notice their hands. What are they doing with them? Write what you observed."
- "Eat a meal with someone without any screens on the table. Write one thing you noticed about the conversation."
- "Make eye contact with someone for the full duration of their next sentence. Write what they were saying."
- "Sit with someone in silence for 2 minutes. No talking, no phones. Write what it felt like."

**Reconnection** — reaching out across distance
- "Text someone you haven't talked to in a while. Not 'hey how are you' — something specific: 'I was thinking about [shared memory].' Write what you sent."
- "Call someone instead of texting them. Keep it under 5 minutes. Write one sentence about how it felt compared to texting."
- "Write a handwritten note to someone. 3 sentences. Write what you said."
- "Send a voice note to a friend — not about anything urgent. Just because. Write what you talked about."
- "Reach out to someone who helped you in the past. Tell them the specific impact they had. Write what you said."

**Appreciation** — expressing what you usually don't
- "Think of someone who made your life better this year. Tell them. Write what you said."
- "Thank someone for something specific they did, not something general. Not 'thanks for everything' — 'thank you for [specific thing] because [specific reason].' Write it."
- "Notice someone doing their job well today — a barista, a colleague, a bus driver. Tell them you noticed. Write what happened."
- "Write down 3 things about your closest relationship that you take for granted. Pick one. Mention it to them today."
- "Tell someone what you admire about how they handle something difficult. Write what you said."

#### Task Design

- **Reference type:** `text` (the prompt)
- **Tools:** `text_input` (reflection after the interaction)
- **Completion:** `text_submitted`
- **No timer.** These tasks don't have a duration — the interaction takes as long as it takes.
- **Time:** 1 minute to read prompt + real-world interaction + 2 minutes to reflect
- **Total tasks:** ~30-35 for initial bank (5-6 per skill area)

#### The Flow Difference

This category inverts the Forge model. In every other category, the app is the workspace — you practice IN the app. Here, the app is the doorway:

1. See prompt (30 seconds)
2. "Go do it" (not "Let's go" — different energy, acknowledges you're leaving)
3. App goes away. You live.
4. Come back whenever. "How did it go?"
5. Write reflection.
6. Done.

No timer. No reference material. No quiz. Just a nudge and a space to process what happened.

#### Expected Behavior

- **Highest skip rate** of any category. These tasks require courage, not just time.
- **Longest reflections** of any category. The emotional content is real.
- **Strongest return signal.** Users who complete Conversation tasks and feel the impact will return for more — not because of a streak, but because the last one mattered.
- **Most meaningful weekly mirror.** "This week you had 4 conversations you wouldn't have had otherwise" is the most serotonergic thing Forge could show anyone.

---

## Evaluation Plan

### What We're Testing

| Question | How we measure it | Category that answers it |
|---|---|---|
| Does Forge work for intellectual meta-skills? | Completion rate + reflection depth | Deep Reading |
| Can measurable progress replace gamification? | Return rate without reminders + numbers trending up | Bodyweight Fitness |
| Can Forge improve how people connect? | Completion rate + reflection length + return rate | Conversation |
| Which neurochemical pathway drives the strongest return? | Compare Day 7 return rates across categories | All three vs. existing |
| Is Forge a learning tool or a living tool? | Which categories users choose when given all options | All |

### Launch Plan

**Phase 1: Author content (1-2 days)**
- Deep Reading: 30 tasks (6 per skill area)
- Bodyweight Fitness: 30 tasks (6-8 per skill area)
- Conversation: 30 tasks (5 per skill area)
- Follow the content quality principles: every task produces something, has a constraint, is self-verifiable

**Phase 2: Integrate into Forge (half day)**
- Add 3 new JSON task banks
- Add categories to goal parser + category picker
- No new UI components needed — `text_input` + `timer` + `text_submitted` cover all three
- Conversation tasks may need a "Go do it" button variant instead of "Let's go" (optional polish)

**Phase 3: Test with users (2-4 weeks)**
- Add these alongside existing categories
- Track per-category: completion rate, skip rate, reflection word count, return rate
- After 2 weeks: compare metrics across all categories
- After 4 weeks: interview users about which categories felt most valuable

### Success Signals

- ✅ At least one user completes a Conversation task and writes a reflection longer than 2 sentences
- ✅ At least one user's fitness numbers show measurable improvement over 2 weeks
- ✅ Deep Reading reflections reference specific books/ideas (not generic responses)
- ✅ Users who try the new categories return at equal or higher rates than skill-building categories
- ✅ At least one user says "this changed how I [read / exercise / talk to people]"

---

*Document created: April 18, 2026*
*Based on: Content audit of 1,319 tasks + serotonergic design research*

---

## Distill — Podcast & Audio Retention

> Status: **Fully designed. Ready to build.**
> Designed: April 24, 2026. Based on competitive analysis, prompt design research, and serotonergic design principles.

### What It Is

Distill is a user-initiated feature that converts passive podcast/audio consumption into retained knowledge through forced production. The user brings the content. Forge provides 3 guided prompts that force recall, critical thinking, and personal application. Total time: 3-5 minutes after listening.

**The name:** Distill. You listened to 60 minutes. You're extracting the 3 things that matter. That's distillation — reducing something large into its essence.

### Why It Matters

- **Universal audience.** Almost everyone listens to podcasts. Largest addressable audience of any Forge feature.
- **Zero-friction adoption.** Upgrades an existing habit instead of adding a new one. 2 minutes MORE with something they already do for hours.
- **Validates the core thesis.** Tests whether Forge can make existing daily habits more valuable without changing them.
- **Compounds over time.** After 6 months: 180+ distilled ideas. "I listened to 500 hours" means nothing. "I captured 180 ideas and can recall 150 of them" means something.
- **Unoccupied competitive gap.** Every existing app (Snipd, Margin, Podwise, Recite) captures and summarizes FOR the user. Forge asks the USER to produce from THEIR memory. The struggle to recall is the learning mechanism.

### Why Forge, Not a Journal

A blank journal asks "what do you want to write?" Forge asks "can you answer THIS?" Five specific ways Forge goes beyond journaling:

1. **Spaced retrieval** (future) — Forge resurfaces your own notes days later and tests recall.
2. **Pre-listen lens** (future) — Forge changes HOW you listen by setting a focus directive before you start.
3. **Cross-episode patterns** (future) — Forge surfaces connections and contradictions across entries.
4. **Skill progression** (future) — prompts evolve from basic recall to argument evaluation to cross-source synthesis.
5. **Accountability of a specific question** — a specific prompt holds you accountable: you either know or you don't.

Items 1-4 require server-side data infrastructure. Item 5 works from day one and is the MVP differentiator.

### How It's Different From Other Categories

Every other Forge category: Forge has the content → Forge picks a task → user does it.
Distill: **User brings the content → Forge provides the structure → user produces output.**

This is a fundamentally different interaction pattern — user-initiated, not app-initiated. It requires its own data model, entry point, and flow.

---

### UX Flow

#### Entry Point

Compact "🎧 Distill" button on GoalHome, positioned above the goal category cards. Visible without scrolling, but not competing with the primary practice flow.

Tapping "🎧 Distill" opens the Distill screen with two paths:
- **"New distill"** — start a new capture
- **Past distills** — scrollable list of previous captures below

#### Input Screen (Single Screen)

```
┌─────────────────────────┐
│  ← Back                 │
│                         │
│  What did you listen to?│
│                         │
│  ┌───────────────────┐  │
│  │ Title             │  │  ← required text input
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Link (optional)   │  │  ← optional URL input
│  └───────────────────┘  │
│                         │
│  What was it about?     │
│                         │
│  [Business] [Science]   │  ← 8 tappable pills
│  [Tech] [Ideas]         │     one selected = highlighted
│  [Psychology] [History] │
│  [Career] [Finance]     │
│                         │
│  ┌───────────────────┐  │
│  │    Next            │  │  ← enabled when title + tag selected
│  └───────────────────┘  │
└─────────────────────────┘
```

#### Prompt Screens (3 sequential screens, step dots at top)

Each prompt is one screen. Same visual language as Focused.tsx — warm dark theme, step navigation dots, one action per screen.

**Screen 1 — Recall (Easy)**
```
┌─────────────────────────┐
│  ● ○ ○                  │  ← step dots
│                         │
│  [prompt text]          │  ← from recall prompt pool
│                         │
│  ┌───────────────────┐  │
│  │                   │  │  ← small input (2-3 lines)
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  🔀                     │  ← shuffle icon (get different prompt)
│                         │
│  ┌───────────────────┐  │
│  │    Next            │  │  ← enabled when text entered
│  └───────────────────┘  │
└─────────────────────────┘
```

**Screen 2 — Challenge (Deep)**
```
┌─────────────────────────┐
│  ○ ● ○                  │
│                         │
│  [tag-specific prompt]  │  ← from challenge prompt pool for selected tag
│                         │
│  ┌───────────────────┐  │
│  │                   │  │  ← larger input (4-6 lines)
│  │                   │  │
│  │                   │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  🔀                     │
│                         │
│  ┌───────────────────┐  │
│  │    Next            │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

**Screen 3 — Apply (Medium)**
```
┌─────────────────────────┐
│  ○ ○ ●                  │
│                         │
│  [apply prompt]         │  ← from apply prompt pool
│                         │
│  ┌───────────────────┐  │
│  │                   │  │  ← small input (2-3 lines)
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  🔀                     │
│                         │
│  ┌───────────────────┐  │
│  │    Distill         │  │  ← final action button
│  └───────────────────┘  │
└─────────────────────────┘
```

#### Completion Screen

```
┌─────────────────────────┐
│                         │
│                         │
│   Distilled. 📝         │
│                         │
│   3 ideas from          │
│   "[episode title]"     │
│                         │
│                         │
│   ← Home                │
│                         │
└─────────────────────────┘
```

No "What's next?" screen. No continuation nudge. Distill is a standalone act — you captured, you're done.

#### Revisit Screen

Accessed from the Distill entry point (past distills listed below "New distill").

```
┌─────────────────────────┐
│  ← Back                 │
│                         │
│  Your Distills          │
│                         │
│  [All] [Business] [Tech]│  ← tag filter pills
│                         │
│  ┌───────────────────┐  │
│  │ "How I Built This"│  │  ← episode title
│  │ Business · Apr 23 │  │  ← tag + date
│  │ ▸ tap to expand   │  │  ← shows 3 responses
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ "Huberman on Sleep│  │
│  │ Science · Apr 21  │  │
│  │ ▸ tap to expand   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

Reverse chronological. Filterable by tag. Tap to expand shows the 3 prompts and responses.

---

### Topic Tags

11 tags, multi-select. User taps all that apply — challenge prompts are drawn from the combined pool of selected tags. At least one tag required.

| Tag | Short label | Covers |
|---|---|---|
| Business & Strategy | Business | Startups, management, leadership, entrepreneurship |
| Science & Health | Science | Research, nutrition, medicine, Huberman-style |
| Technology | Tech | Engineering, AI, product, tools, software |
| Philosophy & Ideas | Ideas | Big-picture thinking, ethics, meaning, worldview |
| Psychology & Behavior | Psychology | Habits, decision-making, relationships, cognitive science |
| History & Culture | History | Narrative, context, society, politics |
| Career & Skills | Career | Interviews, career advice, craft, professional development |
| Finance & Economics | Finance | Markets, personal finance, macro, investing |
| Self-improvement | Growth | Productivity, habits, mindset, behavior change |
| Spirituality & Meaning | Spirituality | Inner life, contemplation, purpose, existential questions |
| Design & Creativity | Creativity | Creative process, craft, aesthetic choices, making things |

Multi-select means overlapping content is handled naturally — a Huberman episode on habits can be tagged both Science and Growth, and the challenge prompt may come from either pool.

---

### Prompt Architecture

3 prompts per session. 3 tiers with different difficulty and input size.

#### Prompt 1 — Recall (Easy, 1-2 sentences, small input)

Universal prompts — work for any tag. Pool of ~8, rotated.

Example prompts:
- "What's the one idea from this you'd tell a friend about? Say it in 2 sentences."
- "If you had to summarize this in one sentence for someone who hasn't heard it, what would you say?"
- "What's something you heard that you didn't know before?"
- "What's the one thing that stuck with you most? Why?"
- "In one sentence: what was this really about?"
- "What's one thing the speaker said that made you pause?"
- "If you could only remember one thing from this a month from now, what should it be?"
- "What surprised you?"

#### Prompt 2 — Challenge (Deep, 3-5 sentences, large input)

Tag-specific prompts that force critical thinking. Pool of ~8 per tag = 64 total.

**Business & Strategy:**
- "What's one decision the speaker described that you would have made differently? Why?"
- "What assumption is the speaker's argument built on? Would it hold in a different market or era?"
- "What's the biggest risk in the strategy they described that they didn't mention?"
- "If you had to argue the opposite of the speaker's main point, what would you say?"
- "What's one thing from this that applies to something you're working on right now? How specifically?"
- "What would have to be true for the speaker's advice to be wrong?"
- "What's the difference between what the speaker said and what they actually did?"
- "Who would disagree with this, and what would their strongest argument be?"

**Science & Health:**
- "What's one claim that you'd want to see the evidence for before believing?"
- "What's the mechanism the speaker described? Can you explain it without jargon?"
- "What's one thing from this that contradicts something you previously believed?"
- "If you were designing a study to test the speaker's main claim, what would you measure?"
- "What's the difference between what the research actually showed and how the speaker framed it?"
- "What's one limitation of the evidence that wasn't mentioned?"
- "How would you explain the key finding to someone with no science background?"
- "What's one thing from this you'd want to verify before changing your behavior?"

**Technology:**
- "What's one thing mentioned that you'd want to actually try or build?"
- "What trade-off is the speaker making that they didn't explicitly name?"
- "What problem does this solve, and what new problems does it create?"
- "If this technology succeeds, what breaks? What becomes obsolete?"
- "What's the strongest argument against adopting what the speaker recommends?"
- "How would this work differently at 10x scale?"
- "What's the speaker assuming about their users that might not be true?"
- "What's one thing from this that changes how you think about something you're building?"

**Philosophy & Ideas:**
- "What's one idea you heard that conflicts with something you already believe? Sit with the tension."
- "What's the strongest version of the argument you disagree with?"
- "What question did this episode raise that it didn't answer?"
- "If you had to live by the speaker's main idea for a week, what would change in your daily life?"
- "What's the hidden assumption in the speaker's worldview?"
- "What would someone from a completely different culture think of this argument?"
- "What's the most uncomfortable implication of what the speaker said?"
- "How does this connect to something you've been thinking about lately?"

**Psychology & Behavior:**
- "What's one behavior pattern the speaker described that you recognize in yourself?"
- "What's the difference between knowing this and actually doing it? What makes it hard?"
- "If you explained this to someone struggling with the exact problem discussed, what would you say?"
- "What's one thing from this that challenges how you think about your own habits?"
- "What would the speaker say about a specific decision you made recently?"
- "What's the gap between the research finding and how people actually behave? Why?"
- "What's one thing from this you've heard before but never actually applied?"
- "If this is true, what should you stop doing?"

**History & Culture:**
- "What's one thing about this period or event that you didn't know? Why does it matter now?"
- "What parallel do you see between what was described and something happening today?"
- "What's the story the speaker told, and what's the story they didn't tell? Whose perspective is missing?"
- "What would someone living through the events described think of how we talk about them now?"
- "What's one assumption about this period that the episode challenged?"
- "If you had to explain why this matters to someone who doesn't care about history, what would you say?"
- "What decision from this story would you have made differently with the information they had at the time?"
- "What's the most important cause-and-effect chain in what you heard?"

**Career & Skills:**
- "What's one piece of advice from this that contradicts something you've been told before? Which do you believe?"
- "What's the speaker's actual edge — the thing that made them successful that they might not even realize?"
- "If you applied the speaker's main lesson to your current work situation, what would you do differently this week?"
- "What's the difference between the speaker's path and the advice they're giving? Are they the same?"
- "What's one skill or habit mentioned that you've been avoiding? Why?"
- "What would the speaker say about where you are in your career right now?"
- "What's the hardest thing about what the speaker recommends that they made sound easy?"
- "If you could ask the speaker one follow-up question, what would it be and why?"

**Finance & Economics:**
- "What's one claim about money or markets that you'd want to verify before acting on?"
- "What's the speaker's incentive? How might that bias their advice?"
- "If you followed this advice, what's the worst realistic outcome?"
- "What's the difference between this advice and what you're actually doing with your money?"
- "What assumption about the economy is the speaker making that might not hold?"
- "What would someone with the opposite financial philosophy say about this?"
- "What's one thing from this that made you uncomfortable about your own financial decisions?"
- "If this advice is right, what should you do this week? Be specific."

#### Prompt 3 — Apply (Medium, 1-2 sentences, small input)

Universal prompts — work for any tag. Pool of ~8, rotated.

Example prompts:
- "What's one thing from this you'd actually do or change? Be specific — not 'be more mindful' but 'meditate for 5 minutes before checking email tomorrow.'"
- "What's one thing you want to remember from this a month from now?"
- "If you could send one sentence from this episode to someone specific, who and what?"
- "What's one question this raised that you want to think more about?"
- "What's the one thing from this that's most relevant to your life right now?"
- "Did this change your mind about anything? If so, what? If not, why not?"
- "What's one thing you heard that you want to bring up in your next conversation?"
- "Write one sentence that captures what this episode meant to you personally."

---

### Prompt Mechanics

- **3 prompts per session.** No skipping. The constraint is the value.
- **Shuffle:** Unlimited shuffles per prompt, but shuffled prompts stay within the same difficulty tier. Easy stays easy, deep stays deep. The user can find a prompt that resonates, but can't escape the difficulty.
- **Prompt selection:** Random from pool, avoiding recently shown prompts (tracked in localStorage).
- **Input validation:** "Next" button enabled only when text is entered. No empty submissions.

### Prompt Design Principles

1. **No right answer, but can't fake it.** Every prompt requires having actually listened and thought.
2. **Small input, high signal.** The constraint forces compression, which forces understanding.
3. **Easy → Deep → Medium arc.** Easy entry builds momentum. Deep middle is where learning happens. Medium close provides serotonergic payoff.
4. **The 3-second rule.** Every prompt should make the user think "I'm not sure I can answer that" for about 3 seconds, then realize they can. That gap is where learning happens.
5. **Prompts feel like a curious friend, not a teacher.** "What would you push back on?" not "What were the 3 main points?"

---

### Data Model

Distill does not fit the existing `tasks` + `user_task_events` model — there are no pre-authored tasks. Requires a separate table.

**MVP (localStorage):**
```json
{
  "distills": [
    {
      "id": "uuid",
      "title": "How I Built This — Airbnb",
      "link": "https://...",
      "tag": "business_strategy",
      "responses": [
        { "prompt": "What's the one idea...", "text": "..." },
        { "prompt": "What decision would you...", "text": "..." },
        { "prompt": "What's one thing you'd...", "text": "..." }
      ],
      "created_at": "2026-04-24T10:30:00Z"
    }
  ]
}
```

**Future (Supabase):**
```sql
distills
├── id              uuid        PK
├── user_id         uuid        FK → users.id
├── title           text        NOT NULL
├── link            text        nullable
├── tag             text        NOT NULL
├── responses       jsonb       -- array of { prompt, text }
└── created_at      timestamptz
```

**Storage decision:** localStorage for MVP. Migrate to Supabase when server-side data infrastructure is built (same sprint as user_task_events migration). The revisit experience degrades without persistence — this is a known trade-off, accepted for shipping speed.

---

### Visual Design

- Same Forge warm dark theme (`#171412` bg, `#262220` surfaces, `#e8a849` amber accent)
- Step dots at top for the 3 prompt screens
- One prompt per screen, same layout as Focused.tsx steps
- Variable input box sizes: small (2-3 lines) for prompts 1 and 3, large (4-6 lines) for prompt 2
- Shuffle icon (🔀) below the input, subtle

---

### Competitive Landscape (April 2026)

**AI Capture Tools:**
- **Snipd** — AI podcast player. Triple-tap to save "snips," AI transcripts/summaries, export to Notion/Readwise. Market leader.
- **Margin** — detects rewinds, auto-saves moments, has spaced repetition. Closest to Forge's philosophy but resurfaces AI's clips, not user's own words.
- **Onda, Podwise** — AI note-takers and summarizers.

**AI Quiz Generators:**
- **PodQuiz, StudyChat, Recite** — paste episode, get auto-generated quiz.

**The gap:** Every app captures and summarizes FOR the user. AI does the thinking. Forge asks the USER to produce from THEIR memory. The struggle to recall is the learning mechanism.

Research: AI-structured notes showed 91% retrieval success at 30 days, but only when paired with spaced-retrieval prompts (Journal of Learning Analytics, 2022-2024). Capture alone isn't enough. None of the existing apps do genuine retrieval practice.

**Readwise's model (for future reference):** Daily review resurfaces 5-15 past highlights with spaced repetition. Each highlight's probability of resurfacing decreases after being shown. "Themed Reviews" allow custom subsets by tag or project. Key insight: the review comes to YOU — you don't browse an archive. This is the model for Forge's future spaced resurfacing of distills.

---

### Future Enhancements (Not MVP)

1. **Spaced resurfacing** — Forge shows a past distill response and asks "do you still remember why this mattered?" Requires Supabase storage.
2. **Pre-listen lens** — one focus directive before listening. Changes HOW you listen.
3. **Cross-episode patterns** — after enough entries, surface connections and contradictions.
4. **Skill progression** — prompts evolve from basic recall to argument evaluation to cross-source synthesis.
5. **App-initiated review tasks** — suggestion engine surfaces "review a past distill" as a task alongside regular category tasks.

---

*Designed: April 24, 2026*
*Status: Ready to build. Estimated effort: 2-3 days (UI + prompts + localStorage).*
