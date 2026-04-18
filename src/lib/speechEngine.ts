export interface Utterance {
  text: string
  lang?: string  // e.g. 'kn-IN' for Kannada, 'en-US' default
  pauseAfter: number  // seconds
  role?: 'prompt' | 'answer' | 'instruction' | 'example'
  audioUrl?: string  // pre-generated MP3 path, e.g. '/audio/kn/kn-211/0.mp3'
}

export type AudioMode = 'speak' | 'listen' | 'podcast'

interface Task {
  action?: string
  description: string
  context?: string
  constraint_note?: string
  example?: string
  reference?: { type: string; [key: string]: any }
  skill_area?: string
  time_minutes: number
}

export function generateScript(task: Task, mode: AudioMode): Utterance[] {
  const utterances: Utterance[] = []

  // Instruction
  utterances.push(en(task.action || task.description, (task as any).narrator_action_url, 2, 'instruction'))

  // Reference content
  if (task.reference) {
    utterances.push(...generateReferenceScript(task.reference, mode))
  }

  // Context and example — skip in podcast mode (reference IS the lesson)
  if (mode !== 'podcast') {
    if (mode === 'listen' && task.context) {
      utterances.push({ text: task.context, pauseAfter: 2, role: 'instruction' })
    }
    if (task.example) {
      utterances.push({ text: 'Example.', pauseAfter: 0.5, role: 'instruction' })
      utterances.push({ text: task.example, pauseAfter: 2, role: 'example' })
    }
  }

  return utterances
}

function generateReferenceScript(ref: { type: string; [key: string]: any }, mode: AudioMode): Utterance[] {
  switch (ref.type) {
    case 'structured_list': return scriptStructuredList(ref.items, mode)
    case 'fill_blank': return scriptFillBlank(ref.items, mode)
    case 'dialogue': return scriptDialogue(ref.lines, mode)
    case 'narration': return scriptNarration(ref.segments, ref.questions, mode)
    case 'steps': return scriptSteps(ref.steps, mode)
    case 'pairs': return scriptPairs(ref.pairs, mode)
    case 'graduated_recall': return scriptGraduatedRecall(ref.prompts, mode)
    case 'circling': return scriptCircling(ref.prompts, mode)
    case 'shadowing': return scriptShadowing(ref.phrases, mode)
    case 'context_guess': return scriptContextGuess(ref.items, mode)
    case 'sound_exercise': return scriptSoundExercise(ref, mode)
    default: return []
  }
}

function speakableText(primary: string, secondary?: string): string {
  // If primary contains Kannada script, use romanization instead
  if (/[\u0C80-\u0CFF]/.test(primary)) {
    return secondary || primary  // fallback to primary if no romanization
  }
  return primary
}

function scriptStructuredList(items: any[], mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  items.forEach((item, i) => {
    const spoken = speakableText(item.primary, item.secondary)
    if (mode === 'speak') {
      out.push({ text: `Word ${i + 1}. ${spoken}.`, pauseAfter: 0.5, role: 'prompt' })
      out.push({ text: 'What does it mean?', pauseAfter: 3, role: 'prompt' })
      if (item.reveal) out.push({ text: item.reveal, pauseAfter: 1.5, role: 'answer' })
    } else {
      out.push({ text: `${spoken}.`, pauseAfter: 0.5, role: 'instruction' })
      if (item.reveal) out.push({ text: `Means: ${item.reveal}.`, pauseAfter: 1, role: 'answer' })
    }
    if (item.details) {
      item.details.forEach((d: any) => {
        out.push({ text: `${d.label}: ${d.value}`, pauseAfter: 1, role: 'example' })
      })
    }
    out.push({ text: '', pauseAfter: 1, role: 'instruction' })
  })
  return out
}

function makeSpeakable(text: string): string {
  // Remove Kannada script characters — keep only Latin text, numbers, punctuation
  // This handles mixed text like "ನಾನು ನೀರು ___" → "blank"
  // and "Naanu neeru kudiyuttene" → unchanged
  const stripped = text.replace(/[\u0C80-\u0CFF]+/g, '').replace(/\s+/g, ' ').trim()
  return stripped || text  // fallback to original if everything was stripped
}

/** Prefer pre-generated Kokoro MP3 over browser TTS for English utterances */
function en(text: string, url: string | undefined, pauseAfter: number, role: Utterance['role']): Utterance {
  if (url) return { text: '', pauseAfter, role, audioUrl: url }
  return { text: makeSpeakable(text), pauseAfter, role }
}

function scriptFillBlank(items: any[], mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  items.forEach((item, i) => {
    const prompt = makeSpeakable(item.prompt).replace('___', '... blank ...')
    const answer = makeSpeakable(item.answer)
    out.push({ text: `Question ${i + 1}. Complete this: ${prompt}`, pauseAfter: 1, role: 'prompt' })
    if (item.hint) out.push({ text: `Hint: ${item.hint}`, pauseAfter: 0.5, role: 'prompt' })
    if (mode === 'speak') {
      out.push({ text: 'What goes in the blank?', pauseAfter: 4, role: 'prompt' })
    } else {
      out.push({ text: '', pauseAfter: 2, role: 'prompt' })
    }
    out.push({ text: `The answer is: ${answer}`, pauseAfter: 2, role: 'answer' })
  })
  return out
}

function scriptDialogue(lines: any[], mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  out.push({ text: 'Dialogue practice.', pauseAfter: 1, role: 'instruction' })
  lines.forEach((line: any) => {
    const isUser = line.speaker.toLowerCase() === 'you'
    if (mode === 'speak' && isUser) {
      out.push({ text: `Your turn.`, pauseAfter: 1, role: 'prompt' })
    } else {
      out.push({ text: `${line.speaker} says:`, pauseAfter: 0.5, role: 'instruction' })
    }
    // Kannada audio via MP3 if available, else browser TTS with transliteration
    if (line.audio_url) {
      out.push({ text: '', pauseAfter: mode === 'speak' && isUser ? 3 : 1.5, role: isUser ? 'answer' : 'prompt', audioUrl: line.audio_url, lang: 'kn-IN' })
    } else {
      out.push({ text: makeSpeakable(line.text), pauseAfter: 1.5, role: isUser ? 'answer' : 'prompt' })
    }
  })
  return out
}

function scriptSteps(steps: string[], mode: AudioMode): Utterance[] {
  return steps.map((step, i) => ({
    text: `Step ${i + 1}. ${step}`,
    pauseAfter: mode === 'speak' ? 3 : 2,
    role: 'instruction' as const
  }))
}

function scriptPairs(pairs: any[], mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  pairs.forEach((pair, i) => {
    out.push({ text: `Pair ${i + 1}. Compare:`, pauseAfter: 0.5, role: 'prompt' })
    out.push({ text: pair.left, pauseAfter: 1, role: 'prompt' })
    out.push({ text: 'versus', pauseAfter: 0.5, role: 'prompt' })
    out.push({ text: pair.right, pauseAfter: mode === 'speak' ? 3 : 2, role: 'answer' })
  })
  return out
}

function scriptNarration(segments: any[], questions: any[], mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  segments.forEach((seg: any) => {
    out.push(en(seg.narrator_before || seg.text, seg.narrator_before_url, 1, 'instruction'))
    if (seg.audio_url) {
      out.push({ text: seg.audio_text || '', pauseAfter: seg.pauseAfter || 2, role: 'example', audioUrl: seg.audio_url, lang: 'kn-IN' })
    }
    if (seg.narrator_after) {
      out.push(en(seg.narrator_after, seg.narrator_after_url, 1, 'answer'))
    }
  })
  if (questions?.length) {
    out.push({ text: 'Now, let\'s test your understanding.', pauseAfter: 2, role: 'instruction' })
    questions.forEach((q: any, i: number) => {
      out.push(en(`Question ${i + 1}. ${q.narrator_before || q.prompt}`, q.narrator_before_url, mode === 'speak' ? 4 : 2, 'prompt'))
      out.push(en(`The answer is: ${q.narrator_after || q.answer}`, q.narrator_after_url, 2, 'answer'))
    })
  }
  return out
}

function scriptGraduatedRecall(prompts: any[], mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  prompts.forEach((p: any) => {
    out.push(en(p.prompt, p.narrator_before_url, mode === 'speak' ? (p.pause || 4) : 2, 'prompt'))
    out.push({ text: p.answer_audio || '', pauseAfter: 2, role: 'answer', audioUrl: p.audio_url, lang: 'kn-IN' })
  })
  return out
}

function scriptCircling(prompts: any[], _mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  prompts.forEach((p: any) => {
    out.push(en(p.narrator_before || p.text, p.narrator_before_url, 1, 'prompt'))
    if (p.audio_url) {
      out.push({ text: '', pauseAfter: 1.5, role: 'prompt', audioUrl: p.audio_url, lang: 'kn-IN' })
    }
    if (p.answer) out.push(en(p.narrator_after || p.answer, p.narrator_after_url, 1.5, 'answer'))
  })
  return out
}

function scriptShadowing(phrases: any[], mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  const speed = mode === 'speak' ? 'audio_normal' : 'audio_slow'
  phrases.forEach((p: any) => {
    out.push({ text: `${p.transliteration}. ${p.meaning}.`, pauseAfter: 1, role: 'instruction' })
    out.push({ text: p.text, pauseAfter: mode === 'speak' ? 3 : 2, role: 'prompt', audioUrl: p[`${speed}_url`], lang: 'kn-IN' })
  })
  return out
}

function scriptContextGuess(items: any[], mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  items.forEach((item: any) => {
    out.push(en(item.narrator_before || item.sentence, item.narrator_before_url, 2, 'prompt'))
    if (item.hint) out.push({ text: `Hint: ${item.hint}`, pauseAfter: mode === 'speak' ? 5 : 2, role: 'prompt' })
    if (item.audio_url) {
      out.push({ text: '', pauseAfter: 1, role: 'answer', audioUrl: item.audio_url, lang: 'kn-IN' })
    }
    out.push(en(item.narrator_after || `${item.unknown_word} means: ${item.answer}`, item.narrator_after_url, 2, 'answer'))
  })
  return out
}

function scriptSoundExercise(ref: any, _mode: AudioMode): Utterance[] {
  const out: Utterance[] = []
  const items = ref.pairs || ref.examples || []
  items.forEach((item: any) => {
    // Handle nested pair structures (short/long, dental/retroflex, etc.)
    for (const [, val] of Object.entries(item)) {
      if (typeof val === 'object' && val !== null && 'audio_text' in (val as any)) {
        const v = val as any
        out.push({ text: v.sound || v.text || v.audio_text, pauseAfter: 2, role: 'prompt', audioUrl: v.audio_url, lang: 'kn-IN' })
      }
    }
    // Simple examples (rhythm, connected_speech)
    if (item.text && item.audio_url) {
      out.push({ text: item.transliteration || item.text, pauseAfter: 2, role: 'prompt', audioUrl: item.audio_url, lang: 'kn-IN' })
    }
  })
  return out
}


