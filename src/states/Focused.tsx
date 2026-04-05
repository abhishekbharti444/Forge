import { useState } from 'react'
import { ReferenceRenderer, ChordReference } from '../components/ReferenceRenderer'
import { Timer, Metronome } from '../components/WorkspaceTools'

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
  type: 'instruction' | 'reference' | 'exercise' | 'reflect'
  title: string
  content?: any
}

interface Props {
  task: {
    description: string; time_minutes: number; skill_area?: string
    action?: string; context?: string; constraint_note?: string; example?: string
    reference?: { type: string; [key: string]: any }
    tools?: string[]
    completion?: string
    bpm?: number
    chords?: string[]
    sequence?: { name: string; order: number; total: number }
    songSuggestions?: string[]
  }
  onDone: (extra?: { text?: string }) => void
  onHome?: () => void
  onNextInSequence?: () => void
}

function buildSteps(task: Props['task']): Step[] {
  const steps: Step[] = []

  // Step 1: Instruction
  steps.push({ type: 'instruction', title: 'What to do' })

  // Step 2: Reference (if task has structured content)
  if (task.reference) {
    steps.push({ type: 'reference', title: 'Study' })
  }

  // Step 3: Exercise (if task has interactive tools — quiz lives inside reference renderer)
  if (task.reference?.type === 'fill_blank' || task.reference?.type === 'dialogue') {
    // reference step IS the exercise
  } else if (task.reference?.type === 'structured_list' && task.tools?.includes('reveal_hide')) {
    steps.push({ type: 'exercise', title: 'Practice' })
  } else if (task.tools?.includes('timer') || task.tools?.includes('metronome')) {
    steps.push({ type: 'exercise', title: 'Practice' })
  }

  // Step 4: Reflect
  steps.push({ type: 'reflect', title: 'Reflect' })

  return steps
}

export function Focused({ task, onDone, onHome, onNextInSequence }: Props) {
  const steps = buildSteps(task)
  const [current, setCurrent] = useState(0)
  const [reflection, setReflection] = useState('')
  const step = steps[current]
  const isLast = current === steps.length - 1

  function next() {
    if (isLast) {
      onDone(reflection ? { text: reflection } : undefined)
    } else {
      setCurrent(c => c + 1)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col px-6 py-8 max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        {onHome && (
          <button onClick={onHome} className="text-text-secondary/40 text-xs hover:text-text-secondary transition-colors">← Home</button>
        )}
        <div className="text-text-secondary/40 text-xs flex gap-2">
          {task.skill_area && <span>{task.skill_area.replace('_', ' ')}</span>}
          <span>· {task.time_minutes} min</span>
        </div>
        <span className="text-text-secondary/30 text-xs">{current + 1}/{steps.length}</span>
      </div>

      {/* Step title */}
      <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-4">{step.title}</p>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {step.type === 'instruction' && (
          <div className="space-y-5">
            <p className="text-text-primary text-lg leading-[1.7]">{task.action || task.description}</p>
            {task.constraint_note && (
              <div>
                <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">Rules</p>
                <Paragraphs text={task.constraint_note} className="text-text-secondary text-sm leading-relaxed text-justify" />
              </div>
            )}
            {task.context && (
              <div>
                <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">Why this matters</p>
                <Paragraphs text={task.context} className="text-text-secondary/80 text-sm leading-relaxed text-justify" />
              </div>
            )}
            {task.example && (
              <div>
                <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">Example</p>
                <div className="bg-bg-surface border border-border rounded-xl px-4 py-3">
                  <Paragraphs text={task.example} className="text-text-primary text-sm leading-relaxed text-justify" />
                </div>
              </div>
            )}
            {task.chords && task.chords.length > 0 && (
              <ChordReference chords={task.chords} />
            )}
          </div>
        )}

        {step.type === 'reference' && task.reference && (
          <ReferenceRenderer reference={task.reference} tools={task.tools} bpm={task.bpm} />
        )}

        {step.type === 'exercise' && (
          <div className="space-y-5">
            {task.tools?.includes('metronome') && task.bpm && (
              <Metronome bpm={task.bpm} />
            )}
            {task.tools?.includes('timer') && (
              <Timer seconds={task.time_minutes * 60} onEnd={() => {}} />
            )}
            {task.reference?.type === 'structured_list' && task.tools?.includes('reveal_hide') && (
              <div>
                <p className="text-text-secondary text-sm mb-3">Switch to Quiz mode and test yourself:</p>
                <ReferenceRenderer reference={task.reference} tools={task.tools} />
              </div>
            )}
          </div>
        )}

        {step.type === 'reflect' && (
          <div className="space-y-4">
            <p className="text-text-primary text-lg">What did you notice?</p>
            <p className="text-text-secondary text-sm">Jot a quick thought — what was easy, what was hard, what surprised you.</p>
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

      {/* Navigation */}
      <div className="mt-6 space-y-3">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-accent-amber' : i < current ? 'bg-accent-green' : 'bg-border'}`} />
          ))}
        </div>

        {/* Next / Done / Continue in sequence */}
        {isLast && task.sequence && task.sequence.order < task.sequence.total && onNextInSequence ? (
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
            {isLast ? (reflection ? 'Save & finish' : 'Finish') : 'Next →'}
          </button>
        )}

        {/* Back */}
        {current > 0 && (
          <button onClick={() => setCurrent(c => c - 1)}
            className="w-full text-text-secondary/40 text-sm hover:text-text-secondary transition-colors py-1">
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
