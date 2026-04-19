import type { Utterance } from './speechEngine'

/**
 * A display segment = one "card" on screen.
 * Multiple utterances play while the same card is shown.
 * All utterances use pre-generated audioUrl — no browser TTS.
 */
export interface DisplaySegment {
  kannada?: string
  transliteration?: string
  english?: string
  label?: string
  utterances: Utterance[]
}

/**
 * Build display segments from a task's reference.
 * Uses narrator_before_url / audio_url / narrator_after_url for all audio.
 */
export type StoryMode = 'guided' | 'delayed' | 'selective' | 'immersive' | 'production'

// Word frequency tracker — how many times each Kannada word has been heard
function getWordFreqs(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('forge_word_freq') || '{}') } catch { return {} }
}
export function updateWordFreqs(sentences: { kn: string }[]) {
  const freqs = getWordFreqs()
  for (const s of sentences) {
    for (const w of s.kn.replace(/[.!?,;:।]/g, '').split(/\s+/).filter(Boolean)) {
      freqs[w] = (freqs[w] || 0) + 1
    }
  }
  localStorage.setItem('forge_word_freq', JSON.stringify(freqs))
}

export function buildSegments(task: any, storyMode?: StoryMode): DisplaySegment[] {
  const segments: DisplaySegment[] = []
  const ref = task.reference

  // Task intro
  segments.push({
    english: task.action || task.description,
    label: task.sequence ? `${task.sequence.name} · ${task.sequence.order}/${task.sequence.total}` : undefined,
    utterances: audioOrTts(task.narrator_action_url, task.action || task.description, 2),
  })

  if (!ref) return segments

  switch (ref.type) {
    case 'narration': segmentsNarration(ref, segments); break
    case 'graduated_recall': segmentsGraduatedRecall(ref, segments); break
    case 'circling': segmentsCircling(ref, segments); break
    case 'shadowing': segmentsShadowing(ref, segments); break
    case 'context_guess': segmentsContextGuess(ref, segments); break
    case 'sound_exercise': segmentsSoundExercise(ref, segments); break
    case 'dialogue': segmentsDialogue(ref, segments); break
    case 'structured_list': segmentsStructuredList(ref, segments); break
    case 'bilingual_story': segmentsBilingualStory(ref, segments, storyMode || 'guided'); break
  }

  return segments
}

/** Create utterance from audioUrl if available, fallback to TTS text */
function audioOrTts(url: string | undefined, text: string, pause: number, lang?: string): Utterance[] {
  if (!text && !url) return []
  return [{ text: text || '', pauseAfter: pause, role: 'instruction', audioUrl: url, lang }]
}

function segmentsNarration(ref: any, out: DisplaySegment[]) {
  for (const seg of ref.segments || []) {
    const utts: Utterance[] = []
    // English before (Kokoro MP3) — brief beat before Kannada
    if (seg.narrator_before_url) {
      utts.push({ text: '', pauseAfter: 0.3, role: 'instruction', audioUrl: seg.narrator_before_url })
    }
    // Kannada (IndicF5 MP3) — short pause before meaning
    if (seg.audio_url) {
      utts.push({ text: '', pauseAfter: 0.3, role: 'example', audioUrl: seg.audio_url, lang: 'kn-IN' })
    }
    // English after (Kokoro MP3) — longer breath before next segment
    if (seg.narrator_after_url) {
      utts.push({ text: '', pauseAfter: 1.0, role: 'answer', audioUrl: seg.narrator_after_url })
    }
    out.push({ kannada: seg.audio_text, english: seg.text, utterances: utts })
  }
  for (const [i, q] of (ref.questions || []).entries()) {
    const utts: Utterance[] = []
    if (q.narrator_before_url) {
      utts.push({ text: '', pauseAfter: 2.5, role: 'prompt', audioUrl: q.narrator_before_url })
    }
    if (q.narrator_after_url) {
      utts.push({ text: '', pauseAfter: 1.0, role: 'answer', audioUrl: q.narrator_after_url })
    }
    out.push({ english: q.prompt, label: `Question ${i + 1}`, utterances: utts })
  }
}

function segmentsGraduatedRecall(ref: any, out: DisplaySegment[]) {
  for (const p of ref.prompts || []) {
    const utts: Utterance[] = []
    if (p.narrator_before_url) {
      utts.push({ text: '', pauseAfter: p.pause || 3, role: 'prompt', audioUrl: p.narrator_before_url })
    }
    if (p.audio_url) {
      utts.push({ text: '', pauseAfter: 2, role: 'answer', audioUrl: p.audio_url, lang: 'kn-IN' })
    }
    out.push({ english: p.prompt, kannada: p.answer_audio, utterances: utts })
  }
}

function segmentsCircling(ref: any, out: DisplaySegment[]) {
  for (const p of ref.prompts || []) {
    const utts: Utterance[] = []
    if (p.narrator_before_url) {
      utts.push({ text: '', pauseAfter: 0.5, role: 'prompt', audioUrl: p.narrator_before_url })
    }
    if (p.audio_url) {
      utts.push({ text: '', pauseAfter: 1, role: 'prompt', audioUrl: p.audio_url, lang: 'kn-IN' })
    }
    if (p.answer && p.narrator_after_url) {
      utts.push({ text: '', pauseAfter: 1.5, role: 'answer', audioUrl: p.narrator_after_url })
    }
    out.push({ english: p.text, kannada: p.audio_text, label: p.type?.replace('_', ' '), utterances: utts })
  }
}

function segmentsShadowing(ref: any, out: DisplaySegment[]) {
  for (const p of ref.phrases || []) {
    const utts: Utterance[] = []
    if (p.narrator_before_url) {
      utts.push({ text: '', pauseAfter: 0.5, role: 'instruction', audioUrl: p.narrator_before_url })
    }
    if (p.audio_slow_url) {
      utts.push({ text: '', pauseAfter: 2, role: 'prompt', audioUrl: p.audio_slow_url, lang: 'kn-IN' })
    }
    if (p.audio_normal_url) {
      utts.push({ text: '', pauseAfter: 2, role: 'prompt', audioUrl: p.audio_normal_url, lang: 'kn-IN' })
    }
    out.push({ kannada: p.text, transliteration: p.transliteration, english: p.meaning, utterances: utts })
  }
}

function segmentsContextGuess(ref: any, out: DisplaySegment[]) {
  for (const item of ref.items || []) {
    const utts: Utterance[] = []
    if (item.narrator_before_url) {
      utts.push({ text: '', pauseAfter: 3, role: 'prompt', audioUrl: item.narrator_before_url })
    }
    if (item.audio_url) {
      utts.push({ text: '', pauseAfter: 1, role: 'answer', audioUrl: item.audio_url, lang: 'kn-IN' })
    }
    if (item.narrator_after_url) {
      utts.push({ text: '', pauseAfter: 2, role: 'answer', audioUrl: item.narrator_after_url })
    }
    out.push({ english: item.sentence, kannada: item.audio_text, label: `What does "${item.unknown_word}" mean?`, utterances: utts })
  }
}

function segmentsSoundExercise(ref: any, out: DisplaySegment[]) {
  const items = ref.pairs || ref.examples || []
  for (const item of items) {
    const utts: Utterance[] = []
    const kannadaParts: string[] = []
    for (const [, val] of Object.entries(item)) {
      if (typeof val === 'object' && val !== null && 'audio_url' in (val as any)) {
        const v = val as any
        kannadaParts.push(v.audio_text || '')
        utts.push({ text: '', pauseAfter: 2, role: 'prompt', audioUrl: v.audio_url, lang: 'kn-IN' })
      }
    }
    if (item.audio_url) {
      kannadaParts.push(item.text || '')
      utts.push({ text: '', pauseAfter: 2, role: 'prompt', audioUrl: item.audio_url, lang: 'kn-IN' })
    }
    if (utts.length) {
      out.push({ kannada: kannadaParts.join('  vs  '), transliteration: item.transliteration, english: item.meaning, label: ref.focus, utterances: utts })
    }
  }
}

function segmentsDialogue(ref: any, out: DisplaySegment[]) {
  for (const line of ref.lines || []) {
    const utts: Utterance[] = []
    if (line.narrator_before_url) {
      utts.push({ text: '', pauseAfter: 0.3, role: 'instruction', audioUrl: line.narrator_before_url })
    }
    if (line.audio_url) {
      utts.push({ text: '', pauseAfter: 1.5, role: 'prompt', audioUrl: line.audio_url, lang: 'kn-IN' })
    }
    if (line.narrator_after_url) {
      utts.push({ text: '', pauseAfter: 1, role: 'answer', audioUrl: line.narrator_after_url })
    }
    out.push({ kannada: line.audio_text || line.text, english: line.translation || line.text, label: line.speaker, utterances: utts })
  }
}

function segmentsStructuredList(ref: any, out: DisplaySegment[]) {
  for (const item of ref.items || []) {
    const utts: Utterance[] = []
    if (item.narrator_before_url) {
      utts.push({ text: '', pauseAfter: 1, role: 'prompt', audioUrl: item.narrator_before_url })
    }
    if (item.narrator_after_url) {
      utts.push({ text: '', pauseAfter: 1.5, role: 'answer', audioUrl: item.narrator_after_url })
    }
    out.push({ kannada: item.primary, transliteration: item.secondary, english: item.reveal, utterances: utts })
  }
}

function segmentsBilingualStory(ref: any, out: DisplaySegment[], mode: StoryMode) {
  const enPause = mode === 'delayed' ? 3.5 : 0.5
  const freqs = mode === 'selective' ? getWordFreqs() : null
  const KNOWN_THRESHOLD = 5

  // Production mode: EN prompt → pause → KN answer
  if (mode === 'production') {
    for (const s of ref.sentences || []) {
      out.push({
        english: s.en,
        kannada: s.kn,
        transliteration: s.tr,
        utterances: [
          { text: '', pauseAfter: 4.0, role: 'prompt', audioUrl: s.en_audio_url },
          { text: '', pauseAfter: 1.5, role: 'answer', audioUrl: s.kn_audio_url, lang: 'kn-IN' },
        ],
      })
    }
    return
  }

  // Vocabulary preview (skip for immersive — you should know these by now)
  if (ref.vocabulary?.length && mode !== 'immersive') {
    for (const v of ref.vocabulary) {
      out.push({
        kannada: v.kn,
        english: v.en,
        transliteration: v.tr,
        label: 'Vocabulary',
        utterances: [
          { text: '', pauseAfter: 0.8, role: 'example', audioUrl: v.kn_audio_url, lang: 'kn-IN' },
          { text: '', pauseAfter: 1.0, role: 'answer', audioUrl: v.en_audio_url },
        ],
      })
    }
  }

  // Build comprehension question lookup for immersive mode
  const compMap = new Map<number, string>()
  if (mode === 'immersive') {
    for (const c of ref.comprehension || []) compMap.set(c.after_sentence, c.question)
  }

  // Story sentences
  const sentences = ref.sentences || []
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i]
    const utts: Utterance[] = [
      { text: '', pauseAfter: mode === 'selective' ? 2.0 : mode === 'immersive' ? 1.5 : enPause, role: 'example', audioUrl: s.kn_audio_url, lang: 'kn-IN' },
    ]

    // In immersive mode: KN only, no EN
    if (mode === 'immersive') {
      out.push({ kannada: s.kn, transliteration: s.tr, utterances: utts })
      // Insert comprehension question after this sentence
      const q = compMap.get(i)
      if (q) {
        out.push({
          english: q,
          label: 'Comprehension',
          utterances: [{ text: q, pauseAfter: 4.0, role: 'prompt' }],
        })
      }
      continue
    }

    // Selective: skip EN if all words known
    const allKnown = freqs && s.kn.replace(/[.!?,;:।]/g, '').split(/\s+/).filter(Boolean)
      .every((w: string) => (freqs[w] || 0) >= KNOWN_THRESHOLD)
    if (!allKnown) {
      utts.push({ text: '', pauseAfter: 1.0, role: 'answer', audioUrl: s.en_audio_url })
    }
    out.push({ kannada: s.kn, english: allKnown ? undefined : s.en, transliteration: s.tr, utterances: utts })
  }
}
