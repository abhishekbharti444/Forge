export interface Utterance {
  text: string
  lang?: string  // e.g. 'kn-IN' for Kannada, 'en-US' default
  pauseAfter: number  // seconds
  role?: 'prompt' | 'answer' | 'instruction' | 'example'
}

export type AudioMode = 'speak' | 'listen'

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
  utterances.push({ text: task.action || task.description, pauseAfter: 2, role: 'instruction' })

  // Reference content
  if (task.reference) {
    utterances.push(...generateReferenceScript(task.reference, mode))
  }

  // Context (listen mode only — gives the "why")
  if (mode === 'listen' && task.context) {
    utterances.push({ text: task.context, pauseAfter: 2, role: 'instruction' })
  }

  // Example
  if (task.example) {
    utterances.push({ text: 'Example.', pauseAfter: 0.5, role: 'instruction' })
    utterances.push({ text: task.example, pauseAfter: 2, role: 'example' })
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
  lines.forEach(line => {
    const spokenText = makeSpeakable(line.text)
    const isUser = line.speaker.toLowerCase() === 'you'
    if (mode === 'speak' && isUser) {
      out.push({ text: `Your turn. Say:`, pauseAfter: 1, role: 'prompt' })
      out.push({ text: spokenText, pauseAfter: 3, role: 'answer' })
    } else {
      out.push({ text: `${line.speaker}: ${spokenText}`, pauseAfter: 1.5, role: isUser ? 'answer' : 'prompt' })
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
  segments.forEach(seg => {
    out.push({ text: makeSpeakable(seg.text), pauseAfter: seg.pauseAfter || 2, role: 'instruction' })
  })
  if (questions?.length) {
    out.push({ text: 'Now, let\'s test your understanding.', pauseAfter: 2, role: 'instruction' })
    questions.forEach((q: any, i: number) => {
      out.push({ text: `Question ${i + 1}. ${q.prompt}`, pauseAfter: mode === 'speak' ? 4 : 2, role: 'prompt' })
      out.push({ text: `The answer is: ${q.answer}`, pauseAfter: 2, role: 'answer' })
    })
  }
  return out
}


