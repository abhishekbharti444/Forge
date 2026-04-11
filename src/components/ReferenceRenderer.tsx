interface ListItem {
  primary: string; secondary?: string; reveal?: string; body?: string
  details?: Array<{ label: string; value: string }>
}

interface StructuredListProps {
  items: ListItem[]
  revealEnabled?: boolean
  mode?: 'learn' | 'review' | 'quiz' | 'reverse'
}

export function StructuredList({ items, revealEnabled, mode = 'learn' }: StructuredListProps) {
  const [quizIndex, setQuizIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [learnIndex, setLearnIndex] = useState(0)
  const [learnRevealed, setLearnRevealed] = useState(false)

  if (mode === 'quiz' || mode === 'reverse') {
    if (quizIndex >= items.length) {
      return (
        <div className="w-full text-center py-6">
          <p className="text-accent-green text-lg font-semibold mb-1">{score}/{items.length}</p>
          <p className="text-text-secondary text-sm">
            {score === items.length ? 'Perfect!' : score >= items.length * 0.7 ? 'Good job!' : 'Keep practicing!'}
          </p>
          <button onClick={() => { setQuizIndex(0); setScore(0); setAnswered(false) }}
            className="text-accent-amber text-sm mt-3">Try again</button>
        </div>
      )
    }
    const item = items[quizIndex]
    const shown = mode === 'quiz' ? item.primary : item.reveal
    const hidden = mode === 'quiz' ? item.reveal : item.primary
    return (
      <div className="w-full text-center py-4">
        <p className="text-text-secondary/40 text-xs mb-4">{quizIndex + 1} / {items.length}</p>
        <p className="text-text-primary text-2xl mb-1">{shown}</p>
        {mode === 'quiz' && item.secondary && <p className="text-text-secondary text-sm mb-4">{item.secondary}</p>}
        {answered ? (
          <div className="space-y-3 mt-4">
            <p className="text-accent-amber text-lg">{hidden}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setScore(s => s + 1); setAnswered(false); setQuizIndex(i => i + 1) }}
                className="px-4 py-2 bg-accent-green/20 text-accent-green rounded-lg text-sm">Got it ✓</button>
              <button onClick={() => { setAnswered(false); setQuizIndex(i => i + 1) }}
                className="px-4 py-2 bg-bg-surface text-text-secondary rounded-lg text-sm border border-border">Missed ✗</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAnswered(true)}
            className="mt-4 px-6 py-2.5 bg-bg-surface border border-border rounded-lg text-text-secondary text-sm">Show answer</button>
        )}
      </div>
    )
  }

  // Card-by-card Learn mode
  if (mode === 'learn') {
    const item = items[learnIndex]
    return (
      <div className="w-full">
        <p className="text-text-secondary/40 text-xs text-center mb-4">{learnIndex + 1} / {items.length}</p>
        <div className="bg-bg-surface border border-border rounded-xl px-5 py-5">
          {/* Term header */}
          <p className="text-text-primary text-xl font-semibold mb-0.5">{item.primary}</p>
          {item.secondary && <p className="text-text-secondary text-sm mb-5">{item.secondary}</p>}
          {!item.secondary && <div className="mb-5" />}

          {/* Body — the main learning content */}
          {item.body && (
            <p className="text-text-primary/90 text-[0.9rem] leading-[1.8] mb-5 text-justify">{item.body}</p>
          )}

          {/* Reveal — key takeaway */}
          {item.reveal && (
            <div className="border-t border-border/50 pt-4">
              {learnRevealed ? (
                <div className="bg-bg-primary rounded-lg px-4 py-3 border border-accent-amber/20">
                  <p className="text-accent-amber/60 text-[0.65rem] uppercase tracking-wider font-semibold mb-1.5">Key takeaway</p>
                  <p className="text-accent-amber text-sm leading-relaxed">{item.reveal}</p>
                </div>
              ) : (
                <button onClick={() => setLearnRevealed(true)}
                  className="w-full py-2.5 bg-bg-primary border border-border rounded-lg text-text-secondary/50 text-sm">
                  Show key takeaway
                </button>
              )}
            </div>
          )}

          {/* Details — pronunciation, tips, examples */}
          {item.details && item.details.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
              {item.details.map((d, i) => (
                <div key={i}>
                  <span className="text-accent-amber text-xs font-medium">{d.label}: </span>
                  <span className="text-text-secondary text-xs leading-relaxed">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => { setLearnIndex(i => i - 1); setLearnRevealed(false) }} disabled={learnIndex === 0}
            className="px-4 py-2 text-text-secondary text-sm disabled:opacity-20">← Back</button>
          <button onClick={() => { setLearnIndex(i => i + 1); setLearnRevealed(false) }} disabled={learnIndex >= items.length - 1}
            className="px-4 py-2 bg-accent-amber text-bg-primary rounded-lg text-sm font-semibold disabled:opacity-30">
            Next →
          </button>
        </div>
      </div>
    )
  }

  // Review mode — flat list
  return (
    <div className="w-full space-y-2">
      {items.map((item, i) => (
        <StructuredListRow key={i} item={item} revealEnabled={revealEnabled} />
      ))}
    </div>
  )
}

function StructuredListRow({ item, revealEnabled }: { item: ListItem; revealEnabled?: boolean }) {
  const [revealed, setRevealed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const hasDetails = item.details && item.details.length > 0

  return (
    <div className="bg-bg-surface border border-border rounded-lg"
      onClick={() => revealEnabled && item.reveal ? setRevealed(!revealed) : hasDetails && setExpanded(!expanded)}>
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-text-primary text-base">{item.primary}</span>
            {item.secondary && <span className="text-text-secondary text-sm ml-2">{item.secondary}</span>}
          </div>
          {hasDetails && <span className="text-text-secondary/30 text-xs mt-1">{expanded ? '▾' : '▸'}</span>}
        </div>
        {item.reveal && (
          revealEnabled ? (
            <p className={`text-sm mt-1.5 transition-opacity ${revealed ? 'text-accent-amber' : 'text-text-secondary/30 cursor-pointer'}`}>
              {revealed ? item.reveal : 'tap to reveal'}
            </p>
          ) : (
            <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">{item.reveal}</p>
          )
        )}
      </div>
      {expanded && hasDetails && (
        <div className="px-4 pb-3 pt-1 border-t border-border space-y-1.5">
          {item.details!.map((d, i) => (
            <div key={i}>
              <span className="text-accent-amber text-xs">{d.label}: </span>
              <span className="text-text-secondary text-xs">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface StepsProps {
  steps: string[]
}

export function Steps({ steps }: StepsProps) {
  return (
    <div className="w-full space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <span className="text-accent-amber text-sm font-semibold mt-0.5">{i + 1}</span>
          <p className="text-text-primary text-sm leading-relaxed">{step}</p>
        </div>
      ))}
    </div>
  )
}

interface PairsProps {
  pairs: Array<{ left: string; right: string }>
}

export function Pairs({ pairs }: PairsProps) {
  return (
    <div className="w-full space-y-5">
      {pairs.map((pair, i) => (
        <div key={i} className="space-y-0">
          <div className="bg-bg-surface border border-border rounded-t-xl px-4 py-3">
            <p className="text-text-primary text-sm leading-[1.7]">{pair.left}</p>
          </div>
          <div className="flex items-center justify-center bg-border/30 py-1">
            <span className="text-text-secondary/40 text-[0.6rem] uppercase tracking-widest font-semibold">vs</span>
          </div>
          <div className="bg-bg-surface border border-border rounded-b-xl px-4 py-3">
            <p className="text-text-primary text-sm leading-[1.7]">{pair.right}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

import { useState } from 'react'
import { TabPlayer } from './TabPlayer'
import { ChordDiagramSVG as _ChordDiagramSVG, lookupChord as _lookupChord } from './ChordDiagram'

interface FillBlankProps {
  items: Array<{ prompt: string; answer: string; hint?: string }>
}

export function FillBlank({ items }: FillBlankProps) {
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)

  if (index >= items.length) {
    return (
      <div className="w-full text-center py-6">
        <p className="text-accent-green text-lg font-semibold mb-1">{score}/{items.length}</p>
        <p className="text-text-secondary text-sm">{score === items.length ? 'Perfect!' : 'Keep practicing!'}</p>
        <button onClick={() => { setIndex(0); setScore(0); setInput(''); setRevealed(false) }}
          className="text-accent-amber text-sm mt-3">Try again</button>
      </div>
    )
  }

  const item = items[index]
  const isCorrect = revealed && input.trim().toLowerCase() === item.answer.toLowerCase()

  return (
    <div className="w-full space-y-4">
      <p className="text-text-secondary/40 text-xs text-center">{index + 1} / {items.length}</p>
      <p className="text-text-primary text-lg text-center leading-relaxed">
        {item.prompt.replace('___', '______')}
      </p>
      {item.hint && !revealed && (
        <p className="text-text-secondary/50 text-xs text-center">Hint: {item.hint}</p>
      )}
      {!revealed ? (
        <div className="space-y-3">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Your answer..."
            className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-amber/50 text-center"
            onKeyDown={e => e.key === 'Enter' && input.trim() && setRevealed(true)} />
          <button onClick={() => setRevealed(true)} disabled={!input.trim()}
            className="w-full py-2.5 bg-bg-surface border border-border rounded-xl text-text-secondary text-sm disabled:opacity-30">Check</button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <p className={`text-lg font-medium ${isCorrect ? 'text-accent-green' : 'text-text-primary'}`}>
            {isCorrect ? '✓ Correct!' : `Answer: ${item.answer}`}
          </p>
          {!isCorrect && input.trim() && (
            <p className="text-text-secondary/50 text-xs">You wrote: {input}</p>
          )}
          <button onClick={() => { if (isCorrect) setScore(s => s + 1); setIndex(i => i + 1); setInput(''); setRevealed(false) }}
            className="px-6 py-2.5 bg-accent-amber text-bg-primary rounded-xl text-sm font-semibold">Next</button>
        </div>
      )}
    </div>
  )
}

interface DialogueProps {
  lines: Array<{ speaker: string; text: string }>
}

export function Dialogue({ lines }: DialogueProps) {
  const [visibleCount, setVisibleCount] = useState(1)
  const allVisible = visibleCount >= lines.length

  return (
    <div className="w-full space-y-3">
      {lines.slice(0, visibleCount).map((line, i) => {
        const isUser = line.speaker.toLowerCase() === 'you'
        return (
          <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-xl ${isUser ? 'bg-accent-amber/15 border border-accent-amber/30' : 'bg-bg-surface border border-border'}`}>
              <p className={`text-xs mb-1 ${isUser ? 'text-accent-amber' : 'text-text-secondary/50'}`}>{line.speaker}</p>
              <p className="text-text-primary text-sm leading-relaxed">{line.text}</p>
            </div>
          </div>
        )
      })}
      {!allVisible && (
        <button onClick={() => setVisibleCount(c => c + 1)}
          className="w-full py-2 text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">
          Next line ↓
        </button>
      )}
      {allVisible && (
        <p className="text-accent-green text-xs text-center mt-2">Practice this conversation aloud!</p>
      )}
    </div>
  )
}

// ChordDiagram moved to ChordDiagram.tsx

export function ChordReference({ chords }: { chords: string[] }) {
  return (
    <div className="w-full">
      <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-3">Chords</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {chords.map(c => {
          const data = _lookupChord(c)
          return data ? (
            <_ChordDiagramSVG key={c} name={c} frets={data.frets} fingers={data.fingers} barre={data.barre} />
          ) : (
            <div key={c} className="flex flex-col items-center gap-1 bg-bg-surface border border-border rounded-xl px-3 py-3">
              <p className="text-text-primary text-sm font-semibold">{c}</p>
              <p className="text-text-secondary/40 text-xs">diagram unavailable</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface NarrationProps {
  segments: Array<{ text: string; pauseAfter?: number }>
  questions?: Array<{ prompt: string; answer: string }>
}

export function Narration({ segments, questions }: NarrationProps) {
  const [phase, setPhase] = useState<'reading' | 'quiz'>('reading')
  const [segIndex, setSegIndex] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)

  if (phase === 'reading') {
    return (
      <div className="w-full space-y-4">
        {/* Show segments up to current index */}
        {segments.slice(0, segIndex + 1).map((seg, i) => (
          <p key={i} className={`text-sm leading-relaxed ${i === segIndex ? 'text-text-primary' : 'text-text-secondary/50'}`}>
            {seg.text}
          </p>
        ))}
        <div className="flex justify-center pt-2">
          {segIndex < segments.length - 1 ? (
            <button onClick={() => setSegIndex(i => i + 1)}
              className="px-4 py-2 bg-bg-surface border border-border rounded-lg text-text-secondary text-sm">
              Continue reading ↓
            </button>
          ) : questions?.length ? (
            <button onClick={() => setPhase('quiz')}
              className="px-4 py-2 bg-accent-amber text-bg-primary rounded-lg text-sm font-semibold">
              Test yourself →
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  // Quiz phase
  if (!questions?.length) return null
  if (quizIndex >= questions.length) {
    return (
      <div className="w-full text-center py-6">
        <p className="text-accent-green text-lg font-semibold mb-1">{score}/{questions.length}</p>
        <p className="text-text-secondary text-sm">{score === questions.length ? 'Perfect!' : 'Keep practicing!'}</p>
        <button onClick={() => { setPhase('reading'); setSegIndex(0); setQuizIndex(0); setScore(0); setAnswered(false) }}
          className="text-accent-amber text-sm mt-3">Read again</button>
      </div>
    )
  }

  const q = questions[quizIndex]
  return (
    <div className="w-full text-center py-4">
      <p className="text-text-secondary/40 text-xs mb-4">{quizIndex + 1} / {questions.length}</p>
      <p className="text-text-primary text-lg mb-6">{q.prompt}</p>
      {!answered ? (
        <button onClick={() => setAnswered(true)}
          className="px-6 py-2.5 bg-bg-surface border border-border rounded-lg text-text-secondary text-sm">Show answer</button>
      ) : (
        <div className="space-y-3">
          <p className="text-accent-amber text-lg">{q.answer}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setScore(s => s + 1); setAnswered(false); setQuizIndex(i => i + 1) }}
              className="px-4 py-2 bg-accent-green/20 text-accent-green rounded-lg text-sm">Got it ✓</button>
            <button onClick={() => { setAnswered(false); setQuizIndex(i => i + 1) }}
              className="px-4 py-2 bg-bg-surface text-text-secondary rounded-lg text-sm border border-border">Missed ✗</button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ReferenceRendererProps {
  reference: { type: string; [key: string]: any }
  tools?: string[]
  bpm?: number
}

function TextReference({ body, mono, bpm }: { body: string; mono?: boolean; bpm?: number }) {
  return (
    <div className="w-full">
      <div className={mono ? 'font-mono text-sm bg-bg-surface border border-border rounded-xl px-4 py-3 overflow-x-auto whitespace-pre' : ''}>
        <p className={`text-text-primary leading-relaxed ${mono ? '' : 'text-base'}`}>{body}</p>
      </div>
      {mono && <TabPlayer tabText={body} bpm={bpm} />}
    </div>
  )
}

export function ReferenceRenderer({ reference, tools, bpm }: ReferenceRendererProps) {
  const revealEnabled = tools?.includes('reveal_hide')
  const hasBody = reference.type === 'structured_list' && reference.items?.some((i: any) => i.body)
  const hasReveal = reference.type === 'structured_list' && reference.items?.some((i: any) => i.reveal)
  const [mode, setMode] = useState<'learn' | 'review' | 'quiz' | 'reverse'>(hasReveal ? 'quiz' : hasBody ? 'learn' : 'review')

  const showModeToggle = reference.type === 'structured_list' && reference.items?.some((i: any) => i.reveal)

  return (
    <div className="w-full">
      {showModeToggle && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {(['learn', 'review', 'quiz', 'reverse'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-lg text-xs ${mode === m ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30' : 'bg-bg-surface text-text-secondary border border-border'}`}>
              {m === 'learn' ? 'Learn' : m === 'review' ? 'Review' : m === 'quiz' ? 'Quiz →' : '← Reverse'}
            </button>
          ))}
        </div>
      )}
      {reference.type === 'text' && <TextReference body={reference.body} mono={reference.mono} bpm={bpm} />}
      {reference.type === 'structured_list' && (
        <StructuredList items={reference.items} revealEnabled={revealEnabled} mode={mode} />
      )}
      {reference.type === 'steps' && <Steps steps={reference.steps} />}
      {reference.type === 'pairs' && <Pairs pairs={reference.pairs} />}
      {reference.type === 'fill_blank' && <FillBlank items={reference.items} />}
      {reference.type === 'dialogue' && <Dialogue lines={reference.lines} />}
      {reference.type === 'narration' && <Narration segments={reference.segments} questions={reference.questions} />}
    </div>
  )
}
