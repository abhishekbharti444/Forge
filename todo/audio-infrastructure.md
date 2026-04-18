# Audio Infrastructure for Language Learning

> Companion to `language-curriculum-redesign.md`. Covers TTS options, pipeline design,
> and integration with Forge's existing audio infrastructure.

---

## The Problem

Phase 1 (Listen & Comprehend) and Phase 2 (Speak in Chunks) of the redesigned curriculum
are audio-first. Browser TTS for Kannada is poor — robotic, wrong stress patterns,
inconsistent across devices. The curriculum redesign is blocked without quality audio.

## What Forge Already Has

- `speechEngine.ts` — generates utterance scripts with `lang: 'kn-IN'` support
- `speechPlayer.ts` — wraps browser `SpeechSynthesis` API
- `AudioPlayerScreen.tsx` — full player UI with controls
- 🗣 and 🎧 mode buttons on task cards
- 10 narration tasks (kn-151 to kn-160) using browser TTS

The pipeline exists. The quality doesn't.

---

## TTS Options Evaluated

### Option 1: Sarvam AI (Recommended for MVP)

Indian-first TTS API. Purpose-built for Indian languages.

| Aspect | Details |
|---|---|
| Kannada support | ✅ Yes (Bulbul v2 and v3) |
| Quality | High — trained specifically on Indian language data |
| Pricing | Bulbul v2: ₹15/10K chars, Bulbul v3: ₹30/10K chars |
| Free credits | ₹1,000 on signup (~660K chars on v2, ~330K chars on v3) |
| Other languages | Hindi, Tamil, Telugu, Malayalam, Bengali, Marathi, Gujarati, Punjabi, English |
| API | REST, simple text-in audio-out |
| Rate limit | 60 req/min (Starter) |

**Cost estimate for Forge:**
- ~160 Kannada tasks × ~200 chars avg = ~32K characters
- Phase 1 stories (~30 tasks × ~500 chars) = ~15K characters
- Total: ~47K characters = ₹70 on v2 (~$0.85)
- Well within free credits. Entire curriculum pre-generated for under $1.

**Why this wins:** Built for Indian languages, cheapest option, free credits cover the entire task bank, supports all major Indian languages for future expansion.

### Option 2: Google Cloud TTS

| Aspect | Details |
|---|---|
| Kannada support | ✅ Yes — `kn-IN`, 30+ voices including Chirp3-HD (premium), WaveNet, Standard |
| Quality | Good. Chirp3-HD voices are near-human for supported languages. Kannada quality needs testing. |
| Pricing | Standard: free first 4M chars/month. WaveNet: $16/1M chars. Chirp3-HD: check pricing page |
| Other languages | 75+ languages, 380+ voices |
| API | REST + client libraries (Node.js, Python, Go, Java) |

**Cost estimate:** Standard tier is free for our volume. WaveNet/Chirp3-HD would be ~$0.75 for 47K chars.

**Pros:** Massive language coverage, multiple voice tiers, SSML support for fine control.
**Cons:** Not Indian-language-specialized. Kannada Chirp3-HD quality unknown without testing.

### Option 3: AI4Bharat IndicF5 (Self-hosted)

| Aspect | Details |
|---|---|
| Kannada support | ✅ Yes — one of 11 Indian languages |
| Quality | Near-human (claims). Trained on 1417 hours of Indian language speech. |
| Pricing | Free (MIT license, open source) |
| Hosting | Self-hosted. Requires GPU for inference. |
| Model | Based on F5-TTS, needs reference audio for voice cloning |

**Pros:** Free, open source, highest potential quality for Indian languages, voice cloning capability.
**Cons:** Requires GPU hosting ($5-20/month on cloud), needs reference audio clips, inference latency, operational overhead. Overkill for pre-generated static audio.

### Option 4: Browser Web Speech API (Current)

| Aspect | Details |
|---|---|
| Kannada support | ⚠️ Varies by device/browser. Often robotic or unavailable. |
| Quality | Poor for Kannada. Acceptable for English. |
| Pricing | Free |
| Offline | ✅ Works offline |

**Verdict:** Keep as fallback for English instructions. Not viable for Kannada content.

---

## Recommendation: AI4Bharat IndicF5 (Primary)

Content is pre-curated and static. We generate audio ONCE and ship as MP3s.
IndicF5 is the right investment because Forge is an Indian language learning product.

| Content type | TTS source | Why |
|---|---|---|
| All Indian language content | **AI4Bharat IndicF5** (local) | Free forever, near-human quality, 11 Indian languages, voice cloning |
| English instructions/context | **Browser Web Speech API** | Free, good quality, works offline |
| Fallback (no audio file) | **Browser TTS** | Graceful degradation |

### Why IndicF5 Over Cloud APIs

- **Purpose-built for Indian languages.** Trained on 1,417 hours of Indian speech data.
  Google/Azure treat Kannada as one of 75+ languages. IndicF5 treats it as a first-class citizen.
- **Free forever.** MIT license. No API keys, no billing, no credits, no vendor lock-in.
- **All 11 Indian languages.** Kannada, Hindi, Tamil, Telugu, Malayalam, Bengali, Marathi,
  Gujarati, Odia, Punjabi, Assamese. Every future language Forge adds uses the same model.
- **Voice cloning.** Pick a reference voice → all content sounds like the same teacher.
  Consistent voice across the entire curriculum.
- **One-time setup, permanent capability.** 30 minutes of conda/pip setup.
  Then generate audio for any Indian language, any time, forever.
- **No runtime dependency.** Runs locally, generates static MP3s. No API that can
  change pricing, deprecate voices, or go down during generation.

### Why Not Cloud APIs?

Cloud TTS (Google, Azure, Sarvam) makes sense for runtime/dynamic TTS.
For pre-curated static content generated once, they add unnecessary dependency
for no quality advantage over a model specifically trained for Indian languages.

### Pipeline

```
Content authoring (JSON task data with Kannada text)
    ↓
scripts/generate-audio.py (build script, runs in indicf5 conda env)
    ↓ loads IndicF5 model locally
    ↓ generates WAV per segment → converts to MP3
    ↓
public/audio/kn/{task-id}/{segment-index}.mp3
    ↓
Task JSON references audio: { "audio_url": "/audio/kn/kn-001/0.mp3" }
    ↓
SpeechPlayer checks for audio_url → plays MP3 if available, falls back to browser TTS
```

### Pre-generation vs Runtime

Pre-generate all audio at build time. Reasons:
- Content is curated and static — no need for runtime TTS
- Eliminates API latency during user sessions
- Works offline (PWA)
- Zero per-user cost
- Audio files served from Vercel CDN (fast, free, globally cached)

### Audio File Strategy

- Format: MP3 @ 64kbps (universal browser support, excellent compression for speech)
- Source: WAV @ 24kHz mono 16-bit from IndicF5 → converted to MP3 via ffmpeg
- Per-segment files: one MP3 per sentence/phrase, not one giant file per task
- Naming: `public/audio/{lang}/{task-id}/{segment-index}.mp3`

### Storage & Bandwidth Analysis (Verified April 12, 2026)

**Audio size estimates:**

| Scope | Duration | WAV size | MP3 @ 64kbps | MP3 @ 128kbps |
|---|---|---|---|---|
| Existing 160 tasks | ~15 min | 41 MB | 6.9 MB | 13.7 MB |
| + Phase 1/2 new content (~230 tasks) | ~35 min | 96 MB | 16 MB | 32 MB |

**Where to store: Vercel static assets (`public/audio/`)**

| Metric | Vercel Free Tier | Our Usage | Headroom |
|---|---|---|---|
| Static asset size | ~100 MB soft limit | 16 MB (MP3 @ 64kbps) | 84 MB free |
| Bandwidth | 100 GB/month | ~1.5 MB/session (1-3 tasks) | **68,000 sessions/month** |

**Why NOT Supabase Storage:**

| Metric | Supabase Free Tier | Problem |
|---|---|---|
| Storage | 1 GB | Fine (16 MB = 1.6%) |
| Bandwidth | **2 GB/month** | Only **1,365 sessions/month** — bottleneck |

**Decision: Vercel static assets.** Audio files deploy with the app as static files in
`public/audio/`. Served from Vercel's global CDN. Browser caches after first load.
No API calls, no Supabase bandwidth drain, no extra infrastructure.
Architecture stays: two services, one deploy, $0/month.

### Scaling Plan: When Audio Exceeds 100 MB

Vercel Hobby tier limits static file uploads to 100 MB. Current usage: ~16 MB.
At ~16 MB per Indian language, we hit the limit around 6 languages.

**When approaching the limit → migrate audio to Cloudflare R2:**
- 10 GB free storage, 10M reads/month, **zero egress fees**
- Upload MP3s to R2, serve from `https://audio.forge.app/kn/...`
- Code change: `audio_url` switches from relative path to full URL — rest of app unchanged
- $0/month. No per-download cost (unlike S3/GCS which charge egress)
- Alternatives considered: Vercel Pro ($20/mo, 1 GB limit) — unnecessary cost;
  GitHub Releases (free, 2 GB) — works but hacky

### Language Limitation

**IndicF5 supports Indian languages ONLY.** English text produces gibberish.
Tested and confirmed April 12, 2026.

| Language | TTS Source |
|---|---|
| Kannada, Hindi, Tamil, Telugu, etc. | IndicF5 (pre-generated MP3s) |
| English | Browser Web Speech API (runtime, good quality) |

### Task Data Changes

Add optional `audio_url` to reference items and narration segments:

```json
// structured_list item with audio
{
  "primary": "ಅನ್ನ",
  "secondary": "Anna",
  "reveal": "rice",
  "audio_url": "/audio/kn/kn-021/0.mp3"
}

// narration segment with audio
{
  "text": "ರಾಮು ಅಂಗಡಿಗೆ ಹೋದ.",
  "pauseAfter": 2,
  "audio_url": "/audio/kn/kn-151/0.mp3"
}
```

### SpeechPlayer Changes

Minimal change — check for `audio_url` before falling back to browser TTS:

```typescript
// In speechPlayer.ts
async playUtterance(utterance: Utterance) {
  if (utterance.audio_url) {
    await this.playAudioFile(utterance.audio_url);
  } else {
    await this.playSpeechSynthesis(utterance);
  }
}
```

---

## Implementation Steps

**Machine:** Apple M1 Pro, 32GB RAM — more than sufficient. Model needs ~2-4GB during inference.

1. [ ] Set up IndicF5 environment (`conda create -n indicf5 python=3.10 && pip install`)
2. [ ] Test with a few Kannada sentences — verify quality, pick reference voice from prompts/
3. [ ] Write `scripts/generate-audio.mjs` — reads task JSON, extracts Kannada text, calls IndicF5, saves MP3s
4. [ ] Run on existing 160 Kannada tasks (structured_list items, narration segments, dialogue lines)
5. [ ] Add `audio_url` field to task data schema
6. [ ] Update `speechPlayer.ts` to prefer audio files over browser TTS
7. [ ] Update `ReferenceRenderer` to show play button on items with audio
8. [ ] Run on new Phase 1/2 content as it's authored
9. [ ] When adding Hindi/Tamil/Telugu — same script, same model, different text

---

## Cost Summary

| Item | Cost |
|---|---|
| AI4Bharat IndicF5 (all Indian languages, forever) | **Free** (MIT license, run locally) |
| Audio file hosting (Vercel CDN) | **Free** (within static asset limits) |
| Future languages (Hindi, Tamil, Telugu, etc.) | **Free** (same model, same pipeline) |

**Total: $0. Now and forever.**

---

## Future: Adding More Languages

The pipeline is language-agnostic across Indian languages. To add Hindi, Tamil, Telugu:
1. Author task content in the new language
2. Run `scripts/generate-audio.py` with `--lang hi` (IndicF5 supports all 11 Indian languages)
3. Audio files land in `public/audio/{lang}/`
4. Same SpeechPlayer, same rendering, different content

This is the infrastructure that makes the "interchangeable Indian languages" idea viable later.

---

## Quality Test Results (April 12, 2026)

**Setup:** M1 Pro 32GB, conda env `indicf5`, Python 3.10, f5_tts 0.1.0, torch 2.11

**Findings:**
- Model loaded via f5_tts directly (AutoModel wrapper has torch.compile bug on Apple Silicon)
- Patched `model.py` in HF cache to remove `torch.compile` calls
- Checkpoint keys have `ema_model._orig_mod.` prefix — must strip before loading
- Reference audio: `PAN_F_HAPPY_00001.wav` (Punjabi female, from IndicF5 repo)
- Generated 5 test sentences + 8-segment story (35s total audio)
- **Quality: near-human, natural pronunciation, correct stress patterns**
- **English text produces gibberish** — model is Indian languages only
- CPU inference: RTF 13-50x (slow). MPS (Metal GPU) needed for batch generation.

---

*Created: April 12, 2026*
*Updated: April 12, 2026 — IndicF5 confirmed as primary, storage analysis added, quality test results*
