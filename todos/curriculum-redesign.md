# Forge Curriculum Redesign: From Reproduction to Creation

> Created: April 13, 2026
> Status: Phase 1 complete
> Trigger: Guitar song teaching experiment revealed a fundamental product question — should Forge teach users to reproduce existing content, or to create their own?

---

## The Insight

After spending significant effort trying to build a "Hear it" feature for song melodies (TabPlayer, alphaTab, Tone.js, pre-generated audio), we discovered:

1. We can't reliably produce correct song audio — notes from internet tabs are inconsistent, rhythm is guesswork
2. YouTube already does song tutorials infinitely better than we ever could
3. Apps like Yousician differentiate through real-time listening feedback, not content playback
4. **Teaching song reproduction is not what makes someone a musician**

## The Research

### Academic Finding (BMC Psychology, 2025)
"Creative thinking and combinatorial thinking have the most significant impact on musical creativity. Improvisation ability is the key mediator between expertise and musical creativity."

### Key Study: "Not All Musicians Are Creative" (ResearchGate, 2015)
Simply playing music (reproducing songs) does NOT increase creativity. Creativity requires participation in CREATION — improvisation and composition.

### Why 80% of Guitar Beginners Quit (Fender Research)
1. Finger pain / physical discomfort
2. **No structure** — don't know what to practice next ← Forge solves this
3. **Slow progress** — can't play anything recognizable
4. **Cognitive overload** — too much information, no clear path ← Forge solves this
5. Practice feels like work, not fun

### What Separates a Reproducer from a Creator

| Reproducer | Creator |
|---|---|
| Knows chord shapes | Understands WHY chords work together |
| Plays songs from tabs | Figures out songs by ear |
| Follows strumming patterns | Creates their own rhythmic feel |
| Plays memorized scales | Uses scales to express ideas |
| Needs sheet music/tabs | Can jam without preparation |
| Plays alone | Can play WITH others, respond, adapt |

### Where YouTube Fails (and Forge's Opportunity)
YouTube is great at showing HOW to play. It fails at:
- **Structure** — no curriculum, no "what's next"
- **Accountability** — no tracking, no progress measurement
- **Personalization** — same video for everyone
- **Creative exercises** — tutorials teach reproduction, not creation

**Forge's unique value: structured micro-decisions that build creative independence.**

---

## The Principle

> **Forge doesn't teach users to reproduce. Forge teaches users to create.**

This applies across ALL categories:

| Category | Reproduction (old) | Creation (new) |
|---|---|---|
| Guitar | "Play Tum Hi Ho" | "Create a melody using Am pentatonic over this progression" |
| Kannada | "Memorize these 20 words" | "Describe your morning routine in Kannada" |
| Philosophy | "Learn what Kant said" | "Construct an argument for/against this position" |
| Public Speaking | "Practice this speech structure" | "Improvise a 2-minute talk on a random topic" |
| Creative Writing | Already creative | Already aligned |
| Distributed Systems | "Learn about Paxos" | "Design a system that handles this failure scenario" |

---

## Guitar Curriculum Redesign

### Current State (236 tasks)
- Chords: 55 (mostly "learn this shape")
- Ear Training: 30 (good foundation)
- Fingerpicking: 33 (pattern-based, good)
- Rhythm: 28 (pattern-based, good)
- Scales/Fretboard: 54 (mostly positional)
- Technique: 36 (physical skills)
- **Songs: 26 (reproduction — to be reframed)**
- **Retrieval: 16 (quiz-based — good)**
- **Improvisation: 0 (critical gap)**
- **Composition: 0 (critical gap)**

### The Musician's Skill Stack (in learning order)

**Level 1: Physical Foundation** (current strength)
- Chord shapes (open, barre)
- Clean fretting, string changes
- Basic strumming patterns
- Basic fingerpicking (p-i-m-a)
- Tuning, posture, pick technique

**Level 2: Musical Ear** (partially built, needs expansion)
- Recognize major vs minor by ear
- Identify intervals (the building blocks of melody)
- Hear chord changes in music
- Match pitch — hear a note, find it on guitar
- Rhythmic dictation — hear a pattern, reproduce it

**Level 3: Theory as a Map** (weak — needs significant work)
- Keys and the number system (I-IV-V-vi)
- Why certain chords "go together" (diatonic harmony)
- The major scale as the master pattern
- Pentatonic scales as the improvisation toolkit
- Chord construction (how chords are built from scales)

**Level 4: Fretboard Fluency** (partially built)
- Notes on every string
- CAGED system — same chord, 5 positions
- Scale patterns connected across the neck
- Intervals on the fretboard (see the distance, hear the sound)

**Level 5: Creative Expression** (MISSING — the critical gap)
- Improvisation: play over a backing track using pentatonic
- Phrasing: space, dynamics, bends, vibrato — making notes sing
- Call and response: musical conversation
- Creating chord progressions that evoke specific moods
- Writing melodies over progressions
- Song structure: verse, chorus, bridge — how to organize ideas

### What Happens to Song Tasks?

Songs don't disappear — they get reframed:

**Before:** "Play the chord progression for Tum Hi Ho (Am-F-C-G)"
**After:** "The Am-F-C-G progression is one of the most popular in Bollywood (Tum Hi Ho, Kabira, and dozens more). Play it with 3 different strumming patterns. Then create your own pattern."

The song becomes a REFERENCE POINT, not the goal. The user learns the underlying pattern and then applies it creatively.

### New Task Types Needed

1. **Improvisation tasks** — "Play any notes from Am pentatonic over this chord progression. No wrong notes — just explore."
2. **Composition prompts** — "Write a 4-bar chord progression that sounds sad. Then write one that sounds hopeful."
3. **Ear challenges** — "Listen to this progression (play audio). What are the chords? Figure it out by ear."
4. **Creative constraints** — "Write a melody using only 3 notes. Make it memorable."
5. **Reharmonization** — "Take the Am-F-C-G progression and substitute one chord. How does it change the feel?"

### Infrastructure Needed for Creative Tasks

- **Backing tracks** — Simple chord progression loops (Am-F-C-G at 90 BPM) for improvisation practice. These are generic, not song-specific, so no copyright issues. Can be generated with MIDI + FluidSynth.
- **Metronome** — Already built ✅
- **Timer** — Already built ✅
- **Self-report completion** — Already built ✅ ("Did you do it? How did it feel?")
- **Recording/playback** — Future: let users record themselves and listen back. Not MVP.

---

## Cross-Category Application

### Learn Kannada
**Current:** Heavy on vocabulary memorization (structured_list with reveal)
**Shift:** More production tasks — "Describe what you see around you in Kannada," "Have a conversation with yourself about your day," "Write a short message to a friend"
**Keep:** Vocabulary foundation is necessary, but add more OUTPUT tasks

### Philosophy
**Current:** Mix of knowledge and argumentation (already partially creative)
**Shift:** More "construct your own argument" tasks, ethical dilemma analysis, "write a 3-paragraph essay defending a position you disagree with"
**Already strong:** Critical thinking and argumentation tasks are inherently creative

### Public Speaking
**Current:** Practice-oriented (already good)
**Shift:** More impromptu speaking, "explain a complex topic in 60 seconds," "tell a story about something that happened today"
**Already strong:** Speaking IS creation

### Distributed Systems
**Current:** Knowledge-heavy
**Shift:** More design tasks — "Design a system that handles X failure," "What would break if Y happened?", "Propose a solution for Z constraint"
**This is the engineering equivalent of improvisation**

---

## Implementation Priority

### Phase 1: Guitar Creative Tasks (Highest Impact)
- Add 20-30 improvisation tasks
- Add 10-15 composition tasks
- Reframe 25 song tasks as pattern-learning + creative application
- Generate 5-10 backing track audio files (MIDI → MP3, generic progressions)

### Phase 2: Cross-Category Creative Tasks
- Add production tasks to Kannada
- Add design tasks to Distributed Systems
- Strengthen improvisation in Public Speaking

### Phase 3: Infrastructure
- Backing track player (simple audio loop)
- Recording/playback (future)
- Creative portfolio — save and revisit your compositions

---

## What We're NOT Doing

- Teaching songs (YouTube does this better)
- Real-time listening feedback (Yousician's territory)
- Video tutorials (YouTube does this better)
- Generating song audio (proven infeasible and unnecessary)

## What We ARE Doing

- **Structured creative practice** — the thing YouTube can't do
- **Progressive skill building** — from physical foundation to creative expression
- **Micro-decision momentum** — "here's your 10-minute creative challenge for today"
- **Making musicians, not mimics**

---

*Created: April 13, 2026*
*Based on: Academic research on musical creativity, guitar pedagogy analysis, product experimentation with audio generation, and Forge's core product principle*

---

## Phase 1 Results (April 13, 2026)

### What Changed
- **Removed:** 26 song reproduction tasks ("Play X by Y")
- **Added:** 12 progression-pattern tasks (grouped by chord pattern, creative variation required)
- **Added:** 18 improvisation tasks (pentatonic, blues, modal, constrained, rhythmic, ear-based)
- **Added:** 9 composition tasks (mood progressions, melody writing, reharmonization, song structure)
- **Added:** 4 rebalancing tasks (rhythm + ear_training creative L3)
- **Generated:** 6 backing track MP3s (~5MB total) for improvisation practice
- **Wired:** Audio player in Focused.tsx for tasks with backing tracks (11 tasks)
- **Updated:** Collections — Songs → Progressions, added Improvisation + Composition

### Final Task Count: 253 (was 236)

| Skill Area | L1 | L2 | L3 | Total |
|---|---|---|---|---|
| chords | 16 | 24 | 9 | 49 |
| ear_training | 11 | 12 | 10 | 33 |
| fingerpicking | 7 | 12 | 14 | 33 |
| rhythm | 10 | 18 | 4 | 32 |
| scales_fretboard | 16 | 30 | 22 | 68 |
| technique | 17 | 10 | 11 | 38 |
| **Total** | **77** | **106** | **70** | **253** |

### L3 Creative Coverage
- Every skill area now has creative L3 tasks
- L3 went from 46 → 70 tasks (+24)
- Creative L3 tasks: 26 (improvisation + composition + creative)
- Technique L3 tasks: 44 (physical skills — appropriate)

### Files Modified
- `data/guitar_practice.json` — 253 tasks (was 236)
- `src/states/Focused.tsx` — backing track audio player
- `src/lib/journeys.ts` — updated COLLECTION_CONFIGS
- `src/components/TonePlayer.tsx` — deleted
- `public/audio/guitar/backing/` — 6 MP3 files
