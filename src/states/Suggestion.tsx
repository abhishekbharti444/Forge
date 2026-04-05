import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

interface Task {
  id: string
  description: string
  action?: string
  context?: string
  constraint_note?: string
  example?: string
  skill_area?: string
  goal_category?: string
  type?: string
  difficulty?: string
  time_minutes: number
  reference?: { type: string; [key: string]: any }
  tools?: string[]
  needs_guitar?: boolean
  bpm?: number
  chords?: string[]
  level?: number
  concepts?: string[]
  tags?: string[]
  sequence?: { name: string; order: number; total: number }
  song?: { title: string; artist: string; genre: string; capo: number }
}

interface Props {
  onStartTask: (task: Task, mode: 'screen' | 'speak' | 'listen') => void
  onHistory?: () => void
  onHome?: () => void
  tasksCompletedToday: number
  initialCategory?: string
}

const SEQ_ICONS: Record<string, string> = {
  'Pentatonic Boxes': '🎵', 'CAGED System': '🏗', 'Open Chords': '🎸',
  'Barre Chords': '🎯', 'Fingerpicking Basics': '👆', 'Travis Picking': '🎹',
  'Major Pentatonic': '🌈', 'Key Transposition': '🔑', 'Scale-Chord Connection': '🔗',
  'Kannada Vowels': '✏️', 'Kannada Consonants': '📝', 'Reading Kannada': '📖',
  'Kannada Numbers': '🔢', 'Verb Tenses': '📐', 'Essential Grammar': '📏',
  'Self Introduction': '👋', 'Auto Rickshaw Kannada': '🛺', 'Restaurant Kannada': '🍽',
  'Fundamentals Core': '📡', 'Replication Core': '🔄', 'Partitioning Core': '📊',
  'Transactions Core': '💳', 'Consensus Core': '🤝', 'Fault Tolerance Core': '🛡',
  'Estimation Basics': '📏', 'System Design Practice': '🏗',
  'Philosophical Literacy': '📚', 'Ethics Foundations': '⚖️', 'Logic & Arguments': '🧩',
}

export function Suggestion({ onStartTask, onHistory, onHome, tasksCompletedToday, initialCategory }: Props) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [expandedSeq, setExpandedSeq] = useState<string | null>(null)
  const [expandedTag, setExpandedTag] = useState<string | null>(null)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([{ id: '', label: 'All' }])

  const [category, setCategory] = useState<string>(initialCategory || '')

  useEffect(() => {
    apiFetch<{ categories: { id: string; label: string }[] }>('/categories')
      .then(d => setCategories([{ id: '', label: 'All' }, ...(d.categories || [])]))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const cat = category ? `?category=${category}` : ''
    apiFetch<{ tasks: Task[] }>(`/tasks${cat}`)
      .then(d => { setTasks(d.tasks || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [category])

  // Separate sequences, songs, and independent tasks
  const sequenceMap = new Map<string, Task[]>()
  const songTasks: Task[] = []
  const independentTasks: Task[] = []
  for (const t of tasks) {
    if (t.sequence) {
      const arr = sequenceMap.get(t.sequence.name) || []
      arr.push(t)
      sequenceMap.set(t.sequence.name, arr)
    } else if (t.song) {
      songTasks.push(t)
    } else {
      independentTasks.push(t)
    }
  }
  sequenceMap.forEach(arr => arr.sort((a, b) => a.sequence!.order - b.sequence!.order))

  // Group songs by genre
  const songsByGenre = new Map<string, Task[]>()
  for (const t of songTasks) {
    const genre = t.song!.genre
    const arr = songsByGenre.get(genre) || []
    arr.push(t)
    songsByGenre.set(genre, arr)
  }

  // Group independent tasks by tag
  const tagGroups = new Map<string, Task[]>()
  for (const t of independentTasks) {
    const tag = t.tags?.[0] || 'other'
    const arr = tagGroups.get(tag) || []
    arr.push(t)
    tagGroups.set(tag, arr)
  }

  function changeCategory(c: string) {
    setCategory(c); setExpandedSeq(null); setExpandedTag(null); setExpandedTask(null); setLoading(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading tasks...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        {onHome && (
          <button onClick={onHome} className="text-text-secondary/40 text-xs hover:text-text-secondary transition-colors">← Home</button>
        )}
        <h1 className="text-xl font-semibold text-text-primary">Your tasks</h1>
        {onHistory && (
          <button onClick={onHistory} className="text-text-secondary/40 text-xs hover:text-text-secondary transition-colors">History</button>
        )}
      </div>

      {tasksCompletedToday > 0 && (
        <p className="text-text-secondary/50 text-xs mb-4">🔥 {tasksCompletedToday} task{tasksCompletedToday !== 1 ? 's' : ''} today</p>
      )}

      {/* Category picker */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(c => (
          <button key={c.id} onClick={() => changeCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm ${category === c.id ? 'bg-accent-amber text-bg-primary' : 'bg-bg-surface text-text-secondary'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Journeys */}
      {sequenceMap.size > 0 && (
        <>
          <p className="text-text-secondary/40 text-xs uppercase tracking-wide font-semibold mb-3">Journeys</p>
          <div className="space-y-3 mb-6">
            {[...sequenceMap.entries()].map(([name, seqTasks]) => {
              const isOpen = expandedSeq === name
              const total = seqTasks[0]?.sequence?.total || seqTasks.length
              const icon = SEQ_ICONS[name] || '📋'
              return (
                <div key={name} className="bg-bg-surface border border-purple-500/20 rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedSeq(isOpen ? null : name)}
                    className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
                    <span className="text-xl">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-semibold">{name}</p>
                      <p className="text-text-secondary/50 text-xs mt-0.5">{total} steps · Start journey →</p>
                      <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-purple-500/40 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                    <span className="text-text-secondary/30 text-sm">{isOpen ? '▾' : '▸'}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-purple-500/10 px-4 py-3">
                      {seqTasks.map((t, i) => (
                        <div key={t.id} className="flex gap-3">
                          <div className="flex flex-col items-center w-4 shrink-0">
                            {i > 0 && <div className="w-px flex-1 bg-border" />}
                            <div className={`w-3 h-3 rounded-full shrink-0 ${i === 0 ? 'bg-accent-amber ring-2 ring-accent-amber/30' : 'border-2 border-border bg-bg-primary'}`} />
                            {i < seqTasks.length - 1 && <div className="w-px flex-1 bg-border" />}
                          </div>
                          <button onClick={() => onStartTask(t, 'screen')}
                            className={`flex-1 text-left py-2 ${i === 0 ? '' : 'opacity-60'} hover:opacity-100 transition-opacity`}>
                            <p className={`text-sm leading-relaxed ${i === 0 ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                              {t.action || t.description}
                            </p>
                            <p className="text-text-secondary/40 text-xs mt-0.5">{t.time_minutes} min</p>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Songs */}
      {songsByGenre.size > 0 && (
        <>
          <p className="text-text-secondary/40 text-xs uppercase tracking-wide font-semibold mb-3">Songs</p>
          <div className="space-y-3 mb-6">
            {[...songsByGenre.entries()].map(([genre, songs]) => (
              <div key={genre}>
                <p className="text-text-secondary/50 text-xs mb-2">🎵 {genre === 'bollywood' ? 'Bollywood' : 'English'}</p>
                <div className="space-y-1">
                  {songs.map(t => (
                    <button key={t.id} onClick={() => onStartTask(t, 'screen')}
                      className="w-full bg-bg-surface border border-border rounded-lg px-4 py-2.5 text-left hover:border-accent-amber/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-text-primary text-sm font-medium">{t.song!.title}</p>
                          <p className="text-text-secondary/50 text-xs">{t.song!.artist}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-text-secondary/30 text-xs">{t.chords?.join(' ')}</span>
                          {t.song!.capo > 0 && <span className="text-accent-amber/50 text-xs">capo {t.song!.capo}</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Practice & Drills — independent tasks grouped by tag */}
      {tagGroups.size > 0 && (
        <>
          <p className="text-text-secondary/40 text-xs uppercase tracking-wide font-semibold mb-3">Practice & Drills</p>
          <div className="space-y-2">
            {[...tagGroups.entries()].map(([tag, tagTasks]) => {
              const isOpen = expandedTag === tag
              return (
                <div key={tag} className="bg-bg-surface border border-border rounded-xl overflow-hidden">
                  <button onClick={() => { setExpandedTag(isOpen ? null : tag); setExpandedTask(null) }}
                    className="w-full px-4 py-3 flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-text-primary text-sm">{tag.replace(/_/g, ' ')}</p>
                      <span className="text-text-secondary/30 text-xs">{tagTasks.length}</span>
                    </div>
                    <span className="text-text-secondary/30 text-xs">{isOpen ? '▾' : '▸'}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-border">
                      {tagTasks.map(t => {
                        const taskOpen = expandedTask === t.id
                        return (
                          <div key={t.id} className="border-b border-border last:border-b-0">
                            <button onClick={() => setExpandedTask(taskOpen ? null : t.id)}
                              className="w-full px-4 py-2.5 text-left flex items-center gap-2">
                              <p className="text-text-secondary text-sm flex-1 leading-relaxed">{t.action || t.description}</p>
                              <span className="text-text-secondary/30 text-xs shrink-0">{t.time_minutes}m</span>
                            </button>
                            {taskOpen && (
                              <div className="px-4 pb-3 space-y-2">
                                {t.context && <p className="text-text-secondary/70 text-sm leading-relaxed">{t.context}</p>}
                                <button onClick={() => onStartTask(t, 'screen')}
                                  className="w-full py-2.5 bg-accent-amber text-bg-primary font-semibold rounded-xl text-sm">
                                  Start
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
