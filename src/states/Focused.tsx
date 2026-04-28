import { useState, useEffect, useRef, useCallback } from 'react'
import { ReferenceRenderer, ChordReference } from '../components/ReferenceRenderer'
import { FretboardDiagram } from '../components/FretboardDiagram'
import { Timer, Metronome } from '../components/WorkspaceTools'
import { saveFocusedState, restoreFocusedState } from '../lib/sessionRecovery'
import { startReading, stopReading, isSupported, setupWakeLockReacquire, preloadVoices } from '../lib/readAloud'


// Split long text into visual paragraphs (~2-3 sentences each)
function Paragraphs({ text, className }: { text: string; className: string }) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  if (sentences.length <= 3) return <p className={className}>{text}</p>
  const chunks: string[] = []
  for (let i = 0; i < sentences.length; i += 3) {
    chunks.push(sentences.slice(i, i + 3).join('').trim())
  }
  return <div className="space-y-3">{chunks.map((c, i) => <p key={i} className={className}>{c}</p>)}</div>
}

interface Step {
  type: 'instruction' | 'reference' | 'exercise' | 'reflect' | 'prompt'
  title: string
  content?: any
  promptIndex?: number
}

interface Props {
  task: {
    description: string; time_minutes: number; skill_area?: string
    type?: string
    action?: string; context?: string; constraint_note?: string; example?: string
    reference?: { type: string; [key: string]: any }
    tools?: string[]
    completion?: string
    prompts?: { prompt: string; lines: number }[]
    bpm?: number
    chords?: string[]
    scale?: string
    scales?: string[]
    sequence?: { name: string; order: number; total: number }
    songSuggestions?: string[]
    audioUrl?: string
  }
  onDone: (extra?: { text?: string; promptResponses?: { prompt: string; text: string }[] }) => void
  onHome?: () => void
  onNextInSequence?: () => void
}

function buildSteps(task: Props['task']): Step[] {
  const steps: Step[] = []
  const tools = task.tools || []
  const refType = task.reference?.type

  // Retrieval tasks: study first, then quiz (structured_list only)
  // Fill_blank retrieval tasks are already interactive — show directly
  if (task.type === 'retrieval') {
    steps.push({ type: 'instruction', title: 'What to do' })
    if (refType === 'structured_list') {
      steps.push({ type: 'reference', title: 'Study' })
      steps.push({ type: 'exercise', title: 'Quiz' })
    } else if (refType) {
      steps.push({ type: 'reference', title: 'Exercise' })
    }
    steps.push({ type: 'reflect', title: 'Reflect' })
    return steps
  }

  // Metronome-led practice (guitar technique, rhythm) — metronome shown on instruction screen
  if (tools.includes('metronome')) {
    steps.push({ type: 'instruction', title: 'What to do' })
    steps.push({ type: 'reflect', title: 'Reflect' })
    return steps
  }

  // Multi-prompt writing (deep reading, structured reflection)
  if (task.prompts?.length && tools.includes('text_input')) {
    steps.push({ type: 'instruction', title: 'What to do' })
    task.prompts.forEach((_, i) => {
      steps.push({ type: 'prompt', title: `${i + 1} of ${task.prompts!.length}`, promptIndex: i })
    })
    return steps
  }

  // Writing-led practice (philosophy, reflection-heavy)
  if (tools.includes('text_input') && !task.reference) {
    steps.push({ type: 'instruction', title: 'What to do' })
    steps.push({ type: 'reflect', title: 'Write' })
    return steps
  }

  // Interactive exercises: dialogue, fill_blank — reference IS the exercise
  if (refType === 'fill_blank' || refType === 'dialogue') {
    steps.push({ type: 'instruction', title: 'What to do' })
    steps.push({ type: 'reference', title: refType === 'dialogue' ? 'Practice' : 'Exercise' })
    steps.push({ type: 'reflect', title: 'Reflect' })
    return steps
  }

  // Structured list with reveal — study first, then quiz
  if (refType === 'structured_list' && tools.includes('reveal_hide')) {
    steps.push({ type: 'instruction', title: 'What to do' })
    steps.push({ type: 'reference', title: 'Study' })
    steps.push({ type: 'exercise', title: 'Quiz' })
    steps.push({ type: 'reflect', title: 'Reflect' })
    return steps
  }

  // Timer-based practice (public speaking, timed drills)
  if (tools.includes('timer')) {
    steps.push({ type: 'instruction', title: 'What to do' })
    steps.push({ type: 'exercise', title: 'Practice' })
    steps.push({ type: 'reflect', title: 'Reflect' })
    return steps
  }

  // Guitar scale/fretboard practice: everything shown on instruction screen
  if (task.scale || task.scales || task.reference?.fretboard) {
    steps.push({ type: 'instruction', title: 'What to do' })
    steps.push({ type: 'reflect', title: 'Reflect' })
    return steps
  }

  // Default: instruction → study (if reference has renderable content) → reflect
  steps.push({ type: 'instruction', title: 'What to do' })
  if (refType) steps.push({ type: 'reference', title: 'Study' })
  steps.push({ type: 'reflect', title: 'Reflect' })
  return steps
}

function reflectPrompt(task: Props['task']): { question: string; hint: string } {
  const tools = task.tools || []
  if (tools.includes('metronome')) return { question: 'Could you keep tempo cleanly?', hint: 'Where did you stumble? What BPM felt comfortable?' }
  if (tools.includes('text_input') && !task.reference) return { question: task.constraint_note || 'Read back what you wrote.', hint: task.constraint_note ? '' : 'Does it hold up? What would you change?' }
  if (task.type === 'retrieval') return { question: 'Which items did you miss?', hint: 'What tripped you up? Any patterns?' }
  if (task.reference?.type === 'dialogue') return { question: 'Could you say your lines without looking?', hint: 'Try once from memory. What stuck, what didn\'t?' }
  if (task.reference?.type === 'fill_blank') return { question: 'Which blanks were hardest?', hint: 'What made them tricky? How would you remember next time?' }
  return { question: 'What did you notice?', hint: 'What was easy, what was hard, what surprised you.' }
}

export function Focused({ task, onDone, onHome, onNextInSequence }: Props) {
  const steps = buildSteps(task)
  const prompt = reflectPrompt(task)
  const taskId = (task as any).task_id || ''

  // Restore saved state if available (survives tab eviction)
  const saved = taskId ? restoreFocusedState(taskId) : null

  const [current, setCurrent] = useState(() => {
    if (saved && saved.stepIndex >= 0 && saved.stepIndex < steps.length) return saved.stepIndex
    return 0
  })
  const [reflection, setReflection] = useState(() => saved?.reflection || '')
  const [promptResponses, setPromptResponses] = useState<string[]>(() => {
    const len = task.prompts?.length || 0
    if (saved?.promptResponses?.length === len) return saved.promptResponses
    return new Array(len).fill('')
  })
  const [quizDone, setQuizDone] = useState(false)
  const [audioOn, setAudioOn] = useState(false)
  const cancelRef = useRef<(() => void) | null>(null)
  const [learnIndex, setLearnIndex] = useState(0)

  // Preload voices once
  useEffect(() => { if (isSupported()) { preloadVoices(); setupWakeLockReacquire() } }, [])

  // Reset learnIndex when step changes
  useEffect(() => { setLearnIndex(0) }, [current])

  // Read aloud when audio is on and step or learnIndex changes
  const handleAutoAdvance = useCallback(() => {
    if (current < steps.length - 1) {
      const next = current + 1
      setCurrent(next)
      saveNow(next)
    }
  }, [current, steps.length])

  useEffect(() => {
    if (!audioOn) { cancelRef.current?.(); cancelRef.current = null; return }
    const cancel = startReading(steps[current], task, handleAutoAdvance, learnIndex)
    cancelRef.current = cancel
    return () => { cancel() }
  }, [audioOn, current, learnIndex])

  // Stop reading on unmount
  useEffect(() => () => stopReading(), [])

  function toggleAudio() {
    if (audioOn) { stopReading(); setAudioOn(false) }
    else { setAudioOn(true) }
  }

  // Refs for visibilitychange flush (always has latest values)
  const stateRef = useRef({ current, reflection, promptResponses })
  stateRef.current = { current, reflection, promptResponses }

  // Persist on step transitions (immediate)
  function saveNow(stepOverride?: number) {
    const s = stateRef.current
    saveFocusedState(taskId, stepOverride ?? s.current, s.reflection, s.promptResponses)
  }

  // Debounced save for text input (1s)
  useEffect(() => {
    const t = setTimeout(() => saveNow(), 1000)
    return () => clearTimeout(t)
  }, [reflection, promptResponses])

  // visibilitychange: flush immediately when page goes hidden
  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === 'hidden') saveNow() }
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [])

  const step = steps[current]
  const isLast = current === steps.length - 1

  function updatePromptResponse(idx: number, value: string) {
    setPromptResponses(prev => { const next = [...prev]; next[idx] = value; return next })
  }

  const hasPromptContent = promptResponses.some(r => r.trim())

  function next() {
    cancelRef.current?.() // cancel any in-progress speech before advancing
    if (isLast) {
      stopReading()
      setAudioOn(false)
      const text = task.prompts?.length
        ? promptResponses.map((r, i) => `${task.prompts![i].prompt}\n${r}`).filter((_, i) => promptResponses[i].trim()).join('\n\n')
        : reflection
      const structured = task.prompts?.length
        ? promptResponses.map((r, i) => ({ prompt: task.prompts![i].prompt, text: r })).filter(r => r.text.trim())
        : undefined
      onDone(text ? { text, promptResponses: structured } : undefined)
    } else {
      const nextStep = current + 1
      saveNow(nextStep)
      setCurrent(nextStep)
      setQuizDone(false)
    }
  }

  // Determine if this step has an active quiz that blocks Next
  const isQuizStep = step.type === 'exercise' &&
    (task.type === 'retrieval' || (task.reference?.type === 'structured_list' && task.tools?.includes('reveal_hide')))
  const showNext = !isQuizStep || quizDone

  // Button label logic
  const nextLabel = (() => {
    if (isLast) return (reflection || hasPromptContent) ? 'Save & finish' : 'Finish'
    if (step.type === 'reference' && steps[current + 1]?.type === 'exercise') return 'Ready for quiz →'
    return 'Next →'
  })()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col px-6 pt-8 pb-44 max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        {onHome && (
          <button onClick={() => { stopReading(); setAudioOn(false); onHome() }} className="text-text-secondary text-sm hover:text-text-primary transition-colors">← Back</button>
        )}
        <div className="text-text-secondary/40 text-xs flex gap-2">
          {task.skill_area && <span>{task.skill_area.replace('_', ' ')}</span>}
          <span>· {task.time_minutes} min</span>
        </div>
        <span className="text-text-secondary/30 text-xs">{current + 1}/{steps.length}</span>
        {isSupported() && (
          <button onClick={toggleAudio} className="text-lg ml-2 opacity-40 hover:opacity-100 transition-opacity">
            {audioOn ? '🔇' : '🔊'}
          </button>
        )}
      </div>

      {/* Step title */}
      <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-4">{step.title}</p>

      {/* Step content */}
      <div className="flex-1">
        {step.type === 'instruction' && (
          <div className="space-y-5">
            {/* Layer 1: Title */}
            <p className="text-text-primary text-lg leading-[1.7]">{(task.action || task.description).split('.')[0]}.</p>

            {/* Layer 2: Visuals */}
            {task.chords && task.chords.length > 0 && (
              <ChordReference chords={task.chords} />
            )}
            {task.scales && task.scales.length > 0 && (
              <FretboardDiagram scales={task.scales} />
            )}
            {task.scale && !task.scales && (
              <FretboardDiagram scale={task.scale} />
            )}
            {!task.scale && !task.scales && task.reference?.fretboard && (
              <FretboardDiagram {...task.reference.fretboard} />
            )}
            {task.reference?.type === 'text' && task.reference?.mono && !task.scale && !task.reference?.fretboard && (
              <ReferenceRenderer reference={task.reference} tools={task.tools} bpm={task.bpm} />
            )}

            {/* Layer 3: Tools */}
            {task.audioUrl && (
              <div className="flex items-center gap-3">
                <audio controls loop src={task.audioUrl} className="h-8" />
                <span className="text-text-secondary/40 text-xs">Backing track</span>
              </div>
            )}
            {task.bpm && (
              <Metronome bpm={task.bpm} />
            )}

            {/* Layer 4: Details (expandable) */}
            {(task.constraint_note || task.context || task.example || (task.action && task.description !== task.action)) && (
              <details className="group">
                <summary className="text-accent-amber text-xs font-semibold uppercase tracking-wide cursor-pointer select-none">
                  Details ▸
                </summary>
                <div className="space-y-4 mt-3">
                  {task.action && task.description !== task.action && (
                    <Paragraphs text={task.action ? task.description : ''} className="text-text-secondary text-sm leading-relaxed text-justify" />
                  )}
                  {task.constraint_note && (
                    <div>
                      <p className="text-accent-amber/60 text-xs font-semibold uppercase tracking-wide mb-1">Rules</p>
                      <Paragraphs text={task.constraint_note} className="text-text-secondary text-sm leading-relaxed text-justify" />
                    </div>
                  )}
                  {task.context && (
                    <div>
                      <p className="text-accent-amber/60 text-xs font-semibold uppercase tracking-wide mb-1">Why this matters</p>
                      <Paragraphs text={task.context} className="text-text-secondary/80 text-sm leading-relaxed text-justify" />
                    </div>
                  )}
                  {task.example && (
                    <div>
                      <p className="text-accent-amber/60 text-xs font-semibold uppercase tracking-wide mb-1">Example</p>
                      <div className="bg-bg-surface border border-border rounded-xl px-4 py-3">
                        <Paragraphs text={task.example} className="text-text-primary text-sm leading-relaxed text-justify" />
                      </div>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        )}

        {step.type === 'reference' && task.reference && (
          <ReferenceRenderer reference={task.reference} tools={task.tools} bpm={task.bpm}
            forcedMode={task.reference.type === 'structured_list' && step.title === 'Study' ? 'learn' : undefined}
            onLearnIndexChange={setLearnIndex} />
        )}

        {step.type === 'prompt' && task.prompts && step.promptIndex != null && (
          <div className="space-y-4">
            <p className="text-text-primary text-lg leading-relaxed">{task.prompts[step.promptIndex].prompt}</p>
            <textarea
              value={promptResponses[step.promptIndex] || ''}
              onChange={e => updatePromptResponse(step.promptIndex!, e.target.value)}
              rows={task.prompts[step.promptIndex].lines + 1}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-amber/50 resize-none text-sm"
            />
          </div>
        )}

        {step.type === 'exercise' && (
          <div className="space-y-5">
            {task.tools?.includes('metronome') && task.bpm && (
              <Metronome bpm={task.bpm} />
            )}
            {task.tools?.includes('timer') && (
              <Timer seconds={task.time_minutes * 60} onEnd={() => {}} />
            )}
            {task.reference?.type === 'structured_list' && (
              <ReferenceRenderer reference={task.reference} tools={task.tools} forcedMode="quiz" onComplete={() => setQuizDone(true)} />
            )}
          </div>
        )}

        {step.type === 'reflect' && (
          <div className="space-y-4">
            <p className="text-text-primary text-lg">{prompt.question}</p>
            {prompt.hint && <p className="text-text-secondary text-sm">{prompt.hint}</p>}
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="Optional — but reflections make learning stick..."
              rows={4}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-amber/50 resize-none text-sm"
            />
            {task.sequence && task.sequence.order < task.sequence.total && (
              <div className="bg-bg-surface border border-purple-500/20 rounded-xl px-4 py-3">
                <p className="text-purple-400 text-xs font-semibold uppercase tracking-wide mb-1">{task.sequence.name}</p>
                <p className="text-text-secondary text-sm">{task.sequence.order} of {task.sequence.total} complete</p>
              </div>
            )}
            {task.songSuggestions && task.songSuggestions.length > 0 && (
              <div className="bg-bg-surface border border-accent-amber/20 rounded-xl px-4 py-3">
                <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">🎵 You can now play</p>
                <p className="text-text-secondary text-xs">Songs that use the chords you just learned!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border/30 px-6 py-4">
        <div className="max-w-md mx-auto space-y-3">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-accent-amber' : i < current ? 'bg-accent-green' : 'bg-border'}`} />
          ))}
        </div>

        {/* Next / Done / Continue in sequence */}
        {showNext && (isLast && task.sequence && task.sequence.order < task.sequence.total && onNextInSequence ? (
          <div className="space-y-2">
            <button onClick={() => { onDone(reflection ? { text: reflection } : undefined); onNextInSequence() }}
              className="w-full py-3.5 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors">
              Continue → {task.sequence.name} ({task.sequence.order + 1}/{task.sequence.total})
            </button>
            <button onClick={next}
              className="w-full py-2.5 bg-bg-surface border border-border text-text-secondary rounded-xl text-sm">
              {reflection ? 'Save & finish' : 'Finish'}
            </button>
          </div>
        ) : (
          <button onClick={next}
            className="w-full py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl hover:bg-accent-amber-hover transition-colors">
            {isLast ? ((reflection || hasPromptContent) ? 'Save & finish' : 'Finish') : nextLabel}
          </button>
        ))}

        {/* Back */}
        {current > 0 && (
          <button onClick={() => { const prev = current - 1; saveNow(prev); setCurrent(prev); setQuizDone(false) }}
            className="w-full text-text-secondary/40 text-sm hover:text-text-secondary transition-colors py-1">
            ← Back
          </button>
        )}
        </div>
      </div>
    </div>
  )
}
