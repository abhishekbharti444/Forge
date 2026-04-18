# Language Learning Curriculum Redesign

> Redesign Forge's Learn Kannada track to follow the natural language acquisition order:
> **Listen → Understand → Speak → Read → Write**
>
> Based on first-principles research: Krashen's Comprehensible Input, Swain's Output Hypothesis,
> Pimsleur's graduated recall, and how children naturally acquire language.

---

## The Problem

The current 160-task Kannada track follows a textbook approach — starts with script writing and word lists.
This is the exact inverse of natural acquisition. Children spend ~12 months listening before producing
their first word. Forge starts with "write ಅ five times."

Current breakdown:
- 84 learning (passive), 55 practice, 16 retrieval, 5 reflection
- 117 of 160 tasks have no structured reference — just text instructions
- Pronunciation is taught through text descriptions
- Grammar is taught as explicit rules before the learner has heard a single pattern

---

## Phase 1: Listen & Comprehend (~46 tasks)

The learner hears Kannada in context and proves understanding — responds in English.
Zero production pressure. This is the foundation Forge currently skips entirely.

### New Content to Create (~30 tasks)

- [ ] **Greetings & basics stories** (5 narration tasks)
      Situations: meeting someone, introducing yourself, asking how someone is,
      saying goodbye, thanking someone
- [ ] **Food & shopping stories** (5 narration tasks)
      Situations: ordering coffee, buying vegetables, at a restaurant,
      asking prices, paying
- [ ] **Directions & transport stories** (5 narration tasks)
      Situations: auto rickshaw, asking directions, bus stop,
      finding an address, at the train station
- [ ] **Daily life stories** (5 narration tasks)
      Situations: morning routine, at work, phone call,
      visiting a friend, at the doctor
- [ ] **Sentence matching tasks** (5 structured_list tasks)
      Hear/read 5 Kannada sentences, match to English meaning
- [ ] **Word spotting tasks** (5 structured_list tasks)
      Identify specific words in short passages

### Reorganized from Existing (16 tasks)

- [ ] Move pronunciation tasks (16) here as listening exercises
      Current: text descriptions of sounds → Reframe as: listen and identify sounds

### Audio Dependency

Phase 1 is audio-heavy. Text-only MVP uses transliteration as audio substitute.
Audio quality upgrade (Google Cloud TTS or pre-recorded) transforms this phase.

---

## Phase 2: Speak in Chunks (~52 tasks)

Learner produces Kannada in whole phrases, never isolated words.
Grammar is never named — absorbed from patterns.

### New Content to Create (~25 tasks)

- [ ] **Graduated recall tasks** (10 tasks, Pimsleur-style)
      Hear phrase → repeat → delay → produce from memory
      Covers: ordering food, asking directions, greetings, shopping, transport
- [ ] **Backward build-up drills** (5 structured_list tasks)
      "kodi" → "kaafi kodi" → "ondu kaafi kodi"
      Build phrases from the end for natural completion
- [ ] **Pattern discovery tasks** (10 fill_blank tasks)
      Show 5 sentences with same pattern, learner discovers the rule
      Covers: SOV structure, verb conjugation, question formation,
      negation, postpositions

### Reorganized from Existing (27 tasks)

- [ ] Move phrase tasks (27) here as dialogue/recall exercises
      Current: "Learn these greetings" → Reframe as: practice these conversations
      using vocabulary from Phase 1 stories

---

## Phase 3: Read (~74 tasks)

Script learning after oral foundation. Learner already knows what words
sound like and mean — now maps symbols to existing knowledge.

### New Content to Create (~10 tasks)

- [ ] **Sound-to-script mapping tasks** (10 structured_list tasks)
      "You know 'anna' (rice). Here's how it's written: ಅನ್ನ.
      Spot ಅ in these other words."

### Reorganized from Existing (64 tasks)

- [ ] Move vocabulary tasks (39) here as script recognition flashcards
      Current: "Learn 10 food words" → Reframe as: "You've heard these words
      in stories, now recognize them in script"
- [ ] Move script tasks (25) here
      Current position: Phase 1 → New position: Phase 3
      Writing ಅ ಆ ಇ makes sense now because learner already knows these sounds

---

## Phase 4: Write & Formalize (~58 tasks)

Grammar rules as confirmation of patterns already internalized.
Writing exercises. Cultural enrichment.

### New Content to Create (~5 tasks)

- [ ] **Grammar confirmation notes** (5 tasks)
      "You've been saying 'Naanu neeru kudiyuttene' and 'Avanu neeru kudiyuttaane'.
      Notice the verb ending changes? Here's why..."
      Explicit grammar as "aha" confirmation, not cold instruction

### Reorganized from Existing (53 tasks)

- [ ] Move grammar tasks (35) here — reframe from instruction to confirmation
- [ ] Move culture tasks (18) here as enrichment

---

## Infrastructure: Audio Quality

Critical for Phase 1 & 2. See `audio-infrastructure.md` for detailed plan.

- [ ] Evaluate Google Cloud TTS for Kannada quality
- [ ] Evaluate pre-recorded native speaker audio
- [ ] Build audio pipeline (generate/record → store → serve)
- [ ] Integrate audio into narration and dialogue reference types
- [ ] Add audio playback controls to Focused screen for listen-first tasks

---

## Implementation Order

1. **Resequence existing content** — reorganize 160 tasks into 4 phases using level field
2. **Author Phase 1 stories** — 30 new narration tasks (the content that doesn't exist)
3. **Author Phase 2 recall/pattern tasks** — 25 new tasks
4. **Author Phase 3 script-mapping tasks** — 10 new tasks
5. **Author Phase 4 grammar confirmations** — 5 new tasks
6. **Audio infrastructure** — upgrade from browser TTS to quality Kannada audio
7. **Reframe existing task text** — update action/context fields to match new curriculum narrative

---

## Success Criteria

- Learner can understand basic Kannada conversations after Phase 1 (not just read word lists)
- Learner can produce survival phrases after Phase 2 (not just recognize them)
- Script learning in Phase 3 feels like "connecting dots" not "starting from scratch"
- Grammar in Phase 4 feels like "oh, that's why!" not "memorize this rule"

---

*Created: April 12, 2026*
*Based on: First-principles language acquisition research session*
