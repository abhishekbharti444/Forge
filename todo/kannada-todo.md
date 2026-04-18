# Kannada Language Track — TODO

> Covers everything: content creation, audio generation, database seeding, integration.
> Check off items as completed. Indented items are sub-tasks.
>
> **Workflow:**
> 1. Write ALL text content (Phases 1-4) in temp files
> 2. Merge into single `learn_kannada.json` with correct sequencing
> 3. Review the complete file
> 4. Generate audio via script (reads learn_kannada.json → produces MP3s → writes audio_url back)
> 5. Seed to Supabase via `seed-tasks.mjs`
> 6. Deploy to Vercel (MP3s as static assets + updated API)

---

## 1. Audio Infrastructure ✅ (mostly done)

- [x] Research TTS options → decided on AI4Bharat IndicF5
- [x] Install IndicF5 environment (conda + Python 3.10)
- [x] HuggingFace access + model download
- [x] Fix torch.compile + weight loading bugs on Apple Silicon
- [x] Quality test: 5 sentences + 8-segment story → quality confirmed
- [x] Confirm: IndicF5 = Indian languages only, English = browser TTS
- [x] Storage decision: Vercel static assets, Cloudflare R2 when >100MB

---

## 2. Write Phase 1: Listen & Comprehend ✅

- [x] 7 sound familiarization tasks (kn-201 to kn-207)
- [x] 5 Tier 1 stories (kn-211 to kn-215)
- [x] 5 Tier 1 graduated recall drills (kn-221 to kn-225)
- [x] 5 Tier 1 circling exercises (kn-231 to kn-235)
- [x] 5 Tier 2 stories (kn-241 to kn-245)
- [x] 10 Tier 2 graduated recall drills (kn-251 to kn-260)
- [x] 10 Tier 2 circling exercises (kn-261 to kn-270)
- [x] 3 context guessing exercises (kn-271 to kn-273)
- [x] 6 vocabulary review spirals (kn-281 to kn-286)
- [x] Bug fixes: beku→bekaa, hannu typo, baarda→beda, bandhu→bantu, tanna form
- [x] Interleaved sequence defined in kannada_phase1_sequence.md
- [x] Quality review: language accuracy, pedagogy, engagement

**Phase 1: 56 new tasks in 11 temp files → ready to merge**

---

## 3. Write Phase 2: Speak in Chunks

- [ ] 10 shadowing exercises (greetings, food, auto, questions, numbers, family, time, shopping, directions, full conversation)
- [ ] 10 new survival dialogues (darshini, bus ticket, clothing shop, phone call, temple, hotel, pharmacy, family chat, weather, food delivery)
- [ ] 10 production recall drills (English prompt → user produces Kannada)
- [ ] 3 vocabulary review spirals
- [ ] Identify 27 existing tasks (5 dialogue + 22 phrase) to resequence into Phase 2

**Phase 2: 33 new + 27 existing = 60 tasks**

---

## 4. Write Phase 3: Read & Recognize

- [ ] 5 new reading comprehension tasks
- [ ] 2 vocabulary review spirals
- [ ] Identify 52 existing tasks (25 script + 22 structured_list + 5 fill_blank) to resequence

**Phase 3: 7 new + 52 existing = 59 tasks**

---

## 5. Write Phase 4: Write & Formalize

- [ ] 5 new writing exercises
- [ ] Identify 63 existing tasks (35 grammar + 18 culture + 10 pronunciation) to resequence

**Phase 4: 5 new + 63 existing = 68 tasks**

---

## 6. Merge into learn_kannada.json

- [ ] Merge 56 Phase 1 new tasks from temp files
- [ ] Merge Phase 2 new tasks
- [ ] Merge Phase 3 new tasks
- [ ] Merge Phase 4 new tasks
- [ ] Resequence all 160 existing tasks into correct phases
- [ ] Apply interleaved ordering (stories → drills → circling, not blocks)
- [ ] Add `phase` field to every task (1/2/3/4)
- [ ] Verify final task count matches plan (~265)
- [ ] Delete temp `kannada_phase1_*.json` files

---

## 7. Content Review (gate before audio)

- [ ] Kannada language accuracy (script, transliterations, grammar)
- [ ] Vocabulary progression (no word used before introduced)
- [ ] Story continuity (Ramu's timeline)
- [ ] All `audio_text` fields have valid Kannada script
- [ ] Phase 2 speaking difficulty progression
- [ ] Phase 3-4 resequencing correctness
- [ ] Final sign-off

---

## 8. Audio Generation (runs ONCE on final learn_kannada.json)

- [ ] Switch IndicF5 to MPS (Metal GPU) for speed
- [ ] Find/record male reference audio for Ramu/Venkatesh
- [ ] Write `scripts/generate-audio.py`:
  - [ ] Read `learn_kannada.json` → extract all `audio_text` fields
  - [ ] Generate WAV per segment via IndicF5
  - [ ] Convert WAV → MP3 @ 64kbps via ffmpeg
  - [ ] Save to `public/audio/kn/{task-id}/{index}.mp3`
  - [ ] Write `audio_url` field back into `learn_kannada.json`
  - [ ] Idempotent: skip if audio_url already exists
- [ ] Run script
- [ ] Spot-check 10% of generated audio
- [ ] Verify total size < 100 MB

---

## 9. Seed & Deploy

- [ ] Run `seed-tasks.mjs` → pushes updated learn_kannada.json to Supabase
- [ ] Update `speechPlayer.ts` → prefer audio_url MP3 over browser TTS
- [ ] Update `ReferenceRenderer` → play buttons on audio items
- [ ] Add renderers for new reference types (sound_exercise, graduated_recall, circling)
- [ ] Test full flow end-to-end (local dev)
- [ ] Deploy to Vercel
- [ ] Verify: audio loads from CDN, tasks serve from DB, new content types render

---

## 10. Validation

- [ ] Self-test: complete Phase 1 as a learner
- [ ] Get 2-3 Kannada learners to test
- [ ] Collect feedback → adjust content
- [ ] Decide on A2 expansion (words 350-800)

---

## Summary

| Step | What | Status |
|---|---|---|
| 1. Audio infra | IndicF5 setup + quality test | ✅ Done |
| 2. Phase 1 text | 56 new tasks | ✅ Done (in temp files) |
| 3. Phase 2 text | 33 new tasks | Not started |
| 4. Phase 3 text | 7 new tasks | Not started |
| 5. Phase 4 text | 5 new tasks | Not started |
| 6. Merge | All tasks → one learn_kannada.json | After all text done |
| 7. Review | Language, pedagogy, engagement | After merge |
| 8. Audio | IndicF5 → MP3s + audio_url | After review |
| 9. Seed & deploy | DB + Vercel | After audio |
| 10. Validate | User testing | After deploy |

**Total: 101 new tasks to write + 160 existing to resequence = ~265 task curriculum**

---

*Created: April 13, 2026*
*Updated: April 14, 2026 — Restructured workflow: all text first → merge → review → audio → seed → deploy*
*Companion docs: kannada-content-plan.md, audio-infrastructure.md, language-curriculum-redesign.md*
