import { useState } from 'react'
import prompts from '../../data/distill_prompts.json'

interface DistillEntry {
  id: string
  title: string
  link: string
  tags: string[]
  tag?: string // backward compat with old single-tag entries
  responses: { prompt: string; text: string }[]
  created_at: string
}

type Step = 'home' | 'input' | 'prompt1' | 'prompt2' | 'prompt3' | 'done'

const LS_KEY = 'forge_distills'
const LS_RECENT_KEY = 'forge_distill_recent_prompts'

function getTags(d: DistillEntry): string[] {
  return d.tags?.length ? d.tags : d.tag ? [d.tag] : []
}

function loadDistills(): DistillEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveDistills(d: DistillEntry[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)) }

function pickPrompt(pool: { id: string; prompt: string }[], recentIds: string[]): { id: string; prompt: string } {
  const available = pool.filter(p => !recentIds.includes(p.id))
  const list = available.length > 0 ? available : pool
  return list[Math.floor(Math.random() * list.length)]
}

function getRecentPromptIds(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_RECENT_KEY) || '[]') } catch { return [] }
}
function recordPromptIds(ids: string[]) {
  const recent = getRecentPromptIds()
  const updated = [...ids, ...recent].slice(0, 30)
  localStorage.setItem(LS_RECENT_KEY, JSON.stringify(updated))
}

function buildChallengePool(selectedTags: string[]): { id: string; prompt: string }[] {
  const challengeMap = prompts.challenge as Record<string, { id: string; prompt: string }[]>
  return selectedTags.flatMap(t => challengeMap[t] || [])
}

interface Props { onHome: () => void }

export function Distill({ onHome }: Props) {
  const [step, setStep] = useState<Step>('home')
  const [distills, setDistills] = useState<DistillEntry[]>(loadDistills)
  const [filterTag, setFilterTag] = useState<string | null>(null)

  // Input state
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // Prompt state
  const [p1, setP1] = useState<{ id: string; prompt: string }>({ id: '', prompt: '' })
  const [p2, setP2] = useState<{ id: string; prompt: string }>({ id: '', prompt: '' })
  const [p3, setP3] = useState<{ id: string; prompt: string }>({ id: '', prompt: '' })
  const [a1, setA1] = useState('')
  const [a2, setA2] = useState('')
  const [a3, setA3] = useState('')

  function startNew() {
    setTitle(''); setLink(''); setTags([])
    setA1(''); setA2(''); setA3('')
    setStep('input')
  }

  function toggleTag(id: string) {
    setTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  function beginPrompts() {
    const recent = getRecentPromptIds()
    const challengePool = buildChallengePool(tags)
    setP1(pickPrompt(prompts.recall, recent))
    setP2(pickPrompt(challengePool, recent))
    setP3(pickPrompt(prompts.apply, recent))
    setStep('prompt1')
  }

  function shufflePrompt(tier: 1 | 2 | 3) {
    const recent = getRecentPromptIds()
    if (tier === 1) setP1(pickPrompt(prompts.recall, [...recent, p1.id]))
    if (tier === 2) setP2(pickPrompt(buildChallengePool(tags), [...recent, p2.id]))
    if (tier === 3) setP3(pickPrompt(prompts.apply, [...recent, p3.id]))
  }

  function finish() {
    const entry: DistillEntry = {
      id: crypto.randomUUID(),
      title, link, tags,
      responses: [
        { prompt: p1.prompt, text: a1 },
        { prompt: p2.prompt, text: a2 },
        { prompt: p3.prompt, text: a3 },
      ],
      created_at: new Date().toISOString(),
    }
    const updated = [entry, ...distills]
    setDistills(updated)
    saveDistills(updated)
    recordPromptIds([p1.id, p2.id, p3.id])
    setStep('done')
  }

  const filtered = filterTag ? distills.filter(d => getTags(d).includes(filterTag)) : distills

  // --- Home: past distills + new button ---
  if (step === 'home') return (
    <div className="min-h-screen bg-bg-primary px-6 py-10 max-w-md mx-auto">
      <button onClick={onHome} className="text-text-secondary/40 text-xs mb-6 block">← Home</button>
      <p className="text-text-primary text-2xl font-semibold mb-6">🎧 Distill</p>

      <button onClick={startNew}
        className="w-full bg-accent-amber text-bg-primary font-semibold py-3 rounded-xl mb-8">
        New distill
      </button>

      {distills.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setFilterTag(null)}
              className={`px-3 py-1 rounded-full text-xs ${!filterTag ? 'bg-accent-amber text-bg-primary' : 'bg-bg-surface text-text-secondary border border-border'}`}>
              All
            </button>
            {prompts.tags.filter(t => distills.some(d => getTags(d).includes(t.id))).map(t => (
              <button key={t.id} onClick={() => setFilterTag(filterTag === t.id ? null : t.id)}
                className={`px-3 py-1 rounded-full text-xs ${filterTag === t.id ? 'bg-accent-amber text-bg-primary' : 'bg-bg-surface text-text-secondary border border-border'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(d => <DistillCard key={d.id} distill={d} />)}
          </div>
        </>
      )}

      {distills.length === 0 && (
        <p className="text-text-secondary/40 text-sm text-center mt-8">
          No distills yet. Listen to something, then capture what stuck.
        </p>
      )}
    </div>
  )

  // --- Input: title + link + tags (multi-select) ---
  if (step === 'input') return (
    <div className="min-h-screen bg-bg-primary px-6 py-10 max-w-md mx-auto">
      <button onClick={() => setStep('home')} className="text-text-secondary/40 text-xs mb-6 block">← Back</button>
      <p className="text-text-primary text-xl font-semibold mb-1">What did you listen to?</p>
      <p className="text-text-secondary text-sm mb-6">A podcast, a talk, an audiobook — anything worth remembering.</p>

      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
        className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-text-primary text-sm mb-3 placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-amber/40" />
      <input value={link} onChange={e => setLink(e.target.value)} placeholder="Link (optional)"
        className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-text-primary text-sm mb-6 placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-amber/40" />

      <p className="text-text-secondary text-sm mb-3">What was it about?</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {prompts.tags.map(t => (
          <button key={t.id} onClick={() => toggleTag(t.id)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${tags.includes(t.id) ? 'bg-accent-amber text-bg-primary' : 'bg-bg-surface text-text-secondary border border-border'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <button onClick={beginPrompts} disabled={!title.trim() || tags.length === 0}
        className="w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-accent-amber text-bg-primary">
        Next
      </button>
    </div>
  )

  // --- Prompt screens ---
  const promptConfig = [
    { step: 'prompt1' as Step, num: 1, prompt: p1, answer: a1, setAnswer: setA1, next: () => setStep('prompt2'), back: () => setStep('input'), lines: 3 },
    { step: 'prompt2' as Step, num: 2, prompt: p2, answer: a2, setAnswer: setA2, next: () => setStep('prompt3'), back: () => setStep('prompt1'), lines: 6 },
    { step: 'prompt3' as Step, num: 3, prompt: p3, answer: a3, setAnswer: setA3, next: finish, back: () => setStep('prompt2'), lines: 3 },
  ]
  const current = promptConfig.find(p => p.step === step)
  if (current) return (
    <div className="min-h-screen bg-bg-primary px-6 py-10 max-w-md mx-auto">
      <button onClick={current.back} className="text-text-secondary/40 text-xs mb-6 block">← Back</button>
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(n => (
          <div key={n} className={`w-2 h-2 rounded-full ${n === current.num ? 'bg-accent-amber' : 'bg-border'}`} />
        ))}
      </div>

      <p className="text-text-primary text-lg leading-relaxed mb-6">{current.prompt.prompt}</p>

      <textarea value={current.answer} onChange={e => current.setAnswer(e.target.value)}
        rows={current.lines} placeholder="Write here..."
        className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-text-primary text-sm leading-relaxed mb-4 placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-amber/40 resize-none" />

      <button onClick={() => shufflePrompt(current.num as 1 | 2 | 3)}
        className="text-text-secondary/40 text-xs mb-6 block mx-auto hover:text-text-secondary transition-colors">
        🔀 Different question
      </button>

      <button onClick={current.next} disabled={!current.answer.trim()}
        className="w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-accent-amber text-bg-primary">
        {current.num === 3 ? 'Distill' : 'Next'}
      </button>
    </div>
  )

  // --- Done ---
  if (step === 'done') return (
    <div className="min-h-screen bg-bg-primary px-6 py-10 max-w-md mx-auto flex flex-col items-center justify-center text-center">
      <p className="text-text-primary text-2xl font-semibold mb-2">Distilled. 📝</p>
      <p className="text-text-secondary text-sm mb-1">3 ideas from</p>
      <p className="text-text-primary text-sm font-medium mb-6">"{title}"</p>
      {distills.length > 1 && (
        <p className="text-text-secondary/40 text-xs mb-8">
          {distills.length} episode{distills.length > 1 ? 's' : ''} distilled
        </p>
      )}
      <button onClick={onHome} className="text-text-secondary text-sm hover:text-text-primary transition-colors">
        ← Home
      </button>
    </div>
  )

  return null
}

// --- Expandable card for past distills ---
function DistillCard({ distill }: { distill: DistillEntry }) {
  const [expanded, setExpanded] = useState(false)
  const distillTags = getTags(distill)
  const tagLabels = distillTags.map(id => prompts.tags.find(t => t.id === id)?.label || id).join(' · ')
  const date = new Date(distill.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

  return (
    <button onClick={() => setExpanded(!expanded)}
      className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-left hover:border-accent-amber/20 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-text-primary text-sm font-medium truncate flex-1 mr-2">{distill.title}</p>
        <span className="text-text-secondary/30 text-xs">{expanded ? '▾' : '▸'}</span>
      </div>
      <p className="text-text-secondary/40 text-xs mt-1">{tagLabels} · {date}</p>
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {distill.responses.map((r, i) => (
            <div key={i}>
              <p className="text-text-secondary text-xs mb-1">{r.prompt}</p>
              <p className="text-text-primary text-sm leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}
