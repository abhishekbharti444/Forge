// Read Aloud — universal TTS layer for the Focused screen.
// Reads step content via Web Speech API, auto-advances pure-text steps.

// --- Text extraction ---

interface Step {
  type: 'instruction' | 'reference' | 'exercise' | 'reflect' | 'prompt'
  title: string
  content?: any
  promptIndex?: number
}

interface Task {
  action?: string; description?: string; context?: string
  constraint_note?: string; example?: string
  reference?: { type: string; [key: string]: any }
  tools?: string[]
  prompts?: { prompt: string; lines: number }[]
}

export function extractStepText(step: Step, task: Task): string[] {
  const texts: string[] = []

  if (step.type === 'instruction') {
    const action = task.action || task.description || ''
    if (action) texts.push(action)
    if (task.constraint_note) texts.push(task.constraint_note)
    if (task.context) texts.push(task.context)
    if (task.example) texts.push(task.example)
    return texts
  }

  if (step.type === 'reference' && task.reference) {
    const ref = task.reference
    if (ref.type === 'text') {
      if (ref.body) texts.push(ref.body)
    } else if (ref.type === 'structured_list' && ref.items) {
      for (const item of ref.items) {
        let line = item.primary || ''
        if (item.secondary) line += `. ${item.secondary}`
        if (item.reveal) line += `. ${item.reveal}`
        texts.push(line)
        if (item.details) {
          for (const d of item.details) texts.push(`${d.label}: ${d.value}`)
        }
      }
    } else if (ref.type === 'steps' && ref.steps) {
      ref.steps.forEach((s: string, i: number) => texts.push(`Step ${i + 1}. ${s}`))
    } else if (ref.type === 'fill_blank' && ref.items) {
      for (const item of ref.items) {
        texts.push(item.prompt)
        if (item.answer) texts.push(`Answer: ${item.answer}`)
      }
    } else if (ref.type === 'pairs' && ref.pairs) {
      for (const p of ref.pairs) texts.push(`${p.left}. versus. ${p.right}`)
    } else if (ref.type === 'dialogue' && ref.lines) {
      for (const line of ref.lines) texts.push(`${line.speaker}: ${line.text}`)
    }
    return texts
  }

  if (step.type === 'reflect') {
    // Just read the prompt, then wait for user input
    return texts // empty — reflect prompt is rendered by Focused.tsx, not extracted here
  }

  if (step.type === 'prompt' && task.prompts && step.promptIndex != null) {
    texts.push(task.prompts[step.promptIndex].prompt)
    return texts
  }

  // exercise steps are interactive (quiz, timer) — nothing to read
  return texts
}

/** Returns true if the step is pure-text (no user interaction needed) */
export function isAutoAdvanceStep(step: Step, task: Task): boolean {
  if (step.type === 'reflect' || step.type === 'prompt' || step.type === 'exercise') return false
  if (step.type === 'instruction') {
    // If instruction has interactive tools (metronome, timer), don't auto-advance
    const tools = task.tools || []
    if (tools.includes('metronome') || tools.includes('timer')) return false
  }
  return true
}

// --- Voice selection ---

let cachedVoice: SpeechSynthesisVoice | null = null

export function getBestVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice
  const voices = speechSynthesis.getVoices()
  // Prefer high-quality English voices
  const en = voices.filter(v => v.lang.startsWith('en'))
  // Prefer non-local (network/premium) voices, then by name quality heuristics
  const preferred = en.find(v => !v.localService) || en.find(v => /samantha|karen|daniel|google/i.test(v.name)) || en[0]
  cachedVoice = preferred || null
  return cachedVoice
}

// Chrome loads voices asynchronously — call this once on app init
export function preloadVoices(): Promise<void> {
  return new Promise(resolve => {
    const voices = speechSynthesis.getVoices()
    if (voices.length > 0) { resolve(); return }
    speechSynthesis.addEventListener('voiceschanged', () => resolve(), { once: true })
    // Timeout fallback in case event never fires
    setTimeout(resolve, 2000)
  })
}

// --- Speech playback ---

let cancelFn: (() => void) | null = null

export function speakTexts(texts: string[], onEnd: () => void): () => void {
  speechSynthesis.cancel()
  if (texts.length === 0) { onEnd(); return () => {} }

  const voice = getBestVoice()
  let cancelled = false
  let index = 0

  function speakNext() {
    if (cancelled || index >= texts.length) { if (!cancelled) onEnd(); return }
    const utt = new SpeechSynthesisUtterance(texts[index])
    if (voice) utt.voice = voice
    utt.rate = 1.0
    utt.onend = () => { index++; speakNext() }
    utt.onerror = (e) => { if (e.error !== 'canceled') { index++; speakNext() } }
    speechSynthesis.speak(utt)
  }

  speakNext()

  const cancel = () => { cancelled = true; speechSynthesis.cancel() }
  cancelFn = cancel
  return cancel
}

export function stopReading() {
  if (cancelFn) { cancelFn(); cancelFn = null }
  releaseWakeLock()
}

// --- Wake lock ---

let wakeLockSentinel: WakeLockSentinel | null = null

export async function acquireWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLockSentinel = await navigator.wakeLock.request('screen')
      // Reacquire on visibility change (wake lock is released when page goes hidden)
      wakeLockSentinel.addEventListener('release', () => { wakeLockSentinel = null })
    }
  } catch { /* browser doesn't support or user denied */ }
}

export function releaseWakeLock() {
  if (wakeLockSentinel) { wakeLockSentinel.release(); wakeLockSentinel = null }
}

// Reacquire wake lock when page becomes visible again
export function setupWakeLockReacquire() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && cancelFn) acquireWakeLock()
  })
}

// --- High-level API ---

export function startReading(step: Step, task: Task, onStepDone: () => void): () => void {
  const texts = extractStepText(step, task)
  acquireWakeLock()
  return speakTexts(texts, () => {
    if (isAutoAdvanceStep(step, task)) onStepDone()
  })
}

export function isSupported(): boolean {
  return 'speechSynthesis' in window
}
