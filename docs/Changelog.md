# Forge — Changelog

> Build history. Key decisions and what shipped per session.

---

## Session 1 — Mar 30 (Project Setup)
Scaffolded entire project: Vite + React + TS + Tailwind + Supabase client, all 6 UI states, all 6 API routes, suggestion engine, DB schema, local dev server, 175 creative writing tasks, e2e Playwright script.

## Session 2 — Mar 31 (Skill Hierarchy)
Added `skill_area` to task schema. Richer task structure: action/context/constraint/example. Suggestion engine balances across skill areas.

## Session 3 — Apr 1 (Enrich Creative Writing)
All 175 creative writing tasks enriched with full action/context/constraint/example structure.

## Session 4 — Apr 1-2 (Learn Kannada)
150 Kannada tasks across 6 skill areas. Goal parser + local server support.

## Session 5 — Apr 3 (Public Speaking)
150 public speaking tasks across 6 skill areas. 475 total tasks.

## Session 6 — Apr 3 (Reference Renderers)
Built StructuredList (tap-to-reveal), Steps, Pairs renderers. Composable task format: reference types × tools × completion signals.

## Session 7 — Apr 3 (Workspace Tools)
Built Timer, TextInput, Checklist components. Completion signals: self_report, timer_end, checklist_done, text_submitted.

## Session 8 — Apr 3 (Content Enrichment)
Added reference + tools data to Kannada (24 tasks) and public speaking (38 tasks).

## Session 9 — Apr 3 (History + States)
History screen, loading/error/empty states, browsable task catalog.

## Session 10 — Apr 3 (Quiz Mode)
StructuredList quiz/reverse-quiz with scoring. Details array support. 48 Kannada vocabulary items enriched.

## Session 11 — Apr 3 (Fill-blank + Dialogue)
FillBlank and Dialogue reference renderers. 10 Kannada tasks enriched.

## Session 12 — Apr 3 (Mobile + PWA)
Mobile responsiveness, PWA manifest + service worker.

## Session 14 — Apr 3 (Step-based Focused)
Rewrote Focused.tsx as step-based card carousel. Merged reflection into flow.

## Session 15 — Apr 3 (First Deploy)
Schema migration, seeded 475 tasks to Supabase, deployed to Vercel. Removed DB writes for read-only beta.

## Session 16 — Apr 5 (Speech Engine)
SpeechEngine: generateScript() for all 6 reference types. SpeechPlayer wrapping Web Speech API.

## Session 17 — Apr 5 (Audio Mode)
AudioPlayerScreen, mode selector (Screen/Speak/Listen) on task cards.

## Session 18 — Apr 5 (Audio Content)
Narration reference renderer. 10 Kannada story tasks, 8 guided thinking tasks, 5 active listening tasks. 🎧 badges.

## Session 19 — Apr 5 (Philosophy + Concepts)
146 philosophy tasks with level sequencing + concepts. ConceptBank screen. 328 structured_list items enriched with body text. Level-gated suggestion engine.

## Session 20 — Apr 8-15 (Guitar + Distributed Systems)
261 guitar tasks with ChordDiagram, FretboardDiagram, TabPlayer. 173 distributed systems tasks. Journeys system. PodcastPlayer for Kannada.

## Sprint 1 — Apr 11 (UX Audit Fixes)
4 changes: quiz-first default, metadata-driven buildSteps() (7 flows), 16 variable completion messages, structured reflect prompts (6 variants).

## Philosophy Shift — Apr 18
Removed Hook Model, streaks, variable rewards from all docs. Replaced with serotonergic design principles. Created Philosophy.md, Content-Strategy.md. Added 3 new categories: Deep Reading, Bodyweight Fitness, Conversation/Connection.

## Session 21 — Apr 18 (Deep Reading)

30 Deep Reading tasks across 5 skill areas (comprehension, structure, evaluation, connection, metacognition). Research-grounded in Maryanne Wolf, Adler's 4 levels, Bloom's taxonomy. Multi-prompt writing system: each task has a `prompts` array rendering as sequential focused inputs (one prompt per screen, can't peek ahead). New `prompt` step type in Focused.tsx. Wired into goal parser, category picker, local server, seed script. Fixed Supabase categories API pagination bug (1000-row limit).

## Session 22 — Apr 19 (Product Strategy)

No code. Deep product discussion captured in docs:
- Podcast Retention / Deep Listening explored as potential highest-impact unbuilt feature. Competitive landscape researched (Snipd, Margin, PodQuiz — all capture tools, none do forced retrieval). Added to Roadmap Tier 4 and Content-Strategy appendix with open questions.
- Audience reframe: "wasted motivation" — target is everyone whose motivation gets wasted on passive consumption, not just self-learners. Market is much larger than originally framed.
- Visible Growth Mirror identified as critical missing feature — the serotonergic alternative to gamification.
- Decided to keep categories bundled (not spin out as standalone products).
- Enriched Roadmap.md (target audience, cold start, growth mirror, 4 evolution decisions), Philosophy.md (competitive reframe), Content-Strategy.md (podcast retention appendix).

---

## Session 23 — Apr 22 (Group Exercises)

10 group public speaking exercises — hypothesis test for whether group practice makes speaking skills more fun and effective. Tasks are completely self-contained: read aloud and the group starts in 10 seconds. Each includes setup instructions, specific topic options, timing, rotation rules, and a learning lens.

New `group` boolean field on tasks. API filtering via `?group=true` query param (local server + Vercel). 👥 Group toggle pill on Journeys, Coach, and Suggestion screens (public_speaking only). WhatsNext filters out group tasks from solo random picks.

Skill areas covered: impromptu (3), storytelling (2), persuasion (2), presence (2), vocal_delivery (1). All use timer tool with timer_end completion.

---

*1,359 tasks. 15 screens. 9 categories. $22 total spend.*
