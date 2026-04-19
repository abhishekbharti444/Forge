import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { organizeJourneys, organizeCollections, organizeStages, organizeByPhase, COLLECTION_CONFIGS, STAGE_EMOJI, type Journey, type JourneyTask } from '../lib/journeys'
import { getCompletedIds } from '../lib/progress'
import { touchRecent, getRecent } from '../lib/sessionRecovery'

import { PodcastPlayer, KANNADA_STORIES } from '../components/PodcastPlayer'

interface Props {
  category: string
  categoryLabel: string
  onStartTask: (task: any, mode: 'screen' | 'speak' | 'listen') => void
  onHome: () => void
}

const JOURNEY_EMOJI: Record<string, string> = {
  technique: '🎯', chords: '🎸', scales_fretboard: '🎵', rhythm: '🥁',
  fingerpicking: '👆', ear_training: '👂', fundamentals: '📡', replication: '🔄',
  partitioning: '📊', transactions: '💳', consensus: '🤝', fault_tolerance: '🛡',
  estimation: '📏', vocabulary: '📝', grammar: '📐', script: '✏️',
  phrases: '💬', pronunciation: '🗣', culture: '🏛', philosophical_literacy: '📚',
  ethics: '⚖️', argumentation: '🧩', critical_thinking: '🔍', applied_philosophy: '🌍',
  vocal_delivery: '🎤', clarity: '💡', impromptu: '⚡', presence: '🧘',
  storytelling: '📖', persuasion: '🎯',
}

export function Journeys({ category, categoryLabel, onStartTask, onHome }: Props) {
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [collections, setCollections] = useState<Journey[]>([])
  const [stages, setStages] = useState<Journey[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [podcastEpisode, setPodcastEpisode] = useState<number | null>(null)
  const [allTasks, setAllTasks] = useState<any[]>([])
  const completedIds = getCompletedIds()

  useEffect(() => {
    apiFetch<{ tasks: any[] }>(`/tasks?category=${category}`)
      .then(d => {
        const tasks: JourneyTask[] = (d.tasks || []).map((t: any) => {
          const ref = t.reference || {}
          const { sequence, tags, bpm, chords, needs_guitar, scale, scales, audioUrl, songSuggestions, ...cleanRef } = ref
          return {
            ...t,
            id: t.id || t.task_id,
            sequence: t.sequence || sequence,
            tags: t.tags || tags,
            bpm: t.bpm || bpm,
            chords: t.chords || chords,
            needs_guitar: t.needs_guitar || needs_guitar,
            scale: t.scale || scale,
            scales: t.scales || scales,
            audioUrl: t.audioUrl || audioUrl,
            songSuggestions: t.songSuggestions || songSuggestions,
            reference: Object.keys(cleanRef).length ? cleanRef : t.reference,
          }
        })
        setAllTasks(d.tasks || [])
        setJourneys(category === 'learn_kannada' ? organizeByPhase(tasks, completedIds) : organizeJourneys(tasks, completedIds))
        setCollections(organizeCollections(tasks, completedIds, category))
        setStages(organizeStages(tasks, completedIds))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  function continueJourney(j: Journey) {
    const next = j.tasks.find(t => !completedIds.has(t.id))
    touchRecent(category, j.key)
    if (next) onStartTask(next, 'screen')
    else onStartTask(j.tasks[0], 'screen') // all done — restart from first
  }

  function startFromJourney(j: Journey, t: any) {
    touchRecent(category, j.key)
    onStartTask(t, 'screen')
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading journeys...</p>
    </div>
  )

  const totalCompleted = journeys.reduce((s, j) => s + j.completed, 0)
  const totalTasks = journeys.reduce((s, j) => s + j.total, 0)

  function renderCard(j: Journey, emoji: string) {
    const isOpen = expanded === j.key
    const pct = j.total > 0 ? (j.completed / j.total) * 100 : 0
    const allDone = j.completed === j.total

    return (
      <div key={j.key} className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(isOpen ? null : j.key)}
          className="w-full px-4 py-4 text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{emoji}</span>
              <span className="text-text-primary text-sm font-medium capitalize truncate">{j.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs ${allDone ? 'text-green-500' : 'text-text-secondary/50'}`}>
                {j.completed}/{j.total}
              </span>
              <span className="text-text-secondary/30 text-xs">{isOpen ? '▾' : '▸'}</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${allDone ? 'bg-green-500' : 'bg-accent-amber'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-border">
            {!allDone && (
              <button
                onClick={() => continueJourney(j)}
                className="w-full px-4 py-3 bg-accent-amber/10 text-accent-amber text-sm font-semibold text-left hover:bg-accent-amber/20 transition-colors"
              >
                ▶ Continue
              </button>
            )}
            <div className="max-h-80 overflow-y-auto">
              {j.tasks.map((t, i) => {
                const done = completedIds.has(t.id)
                const isNext = !done && !j.tasks.slice(0, i).some(prev => !completedIds.has(prev.id))
                return (
                  <button
                    key={t.id}
                    onClick={() => startFromJourney(j, t)}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-3 border-b border-border/50 last:border-b-0 hover:bg-bg-primary/50 transition-colors ${done ? 'opacity-50' : ''}`}
                  >
                    <span className="text-xs shrink-0 w-5 text-center">
                      {done ? '✅' : isNext ? '●' : '○'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-relaxed truncate ${done ? 'text-text-secondary line-through' : isNext ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                        {t.action || t.description}
                      </p>
                    </div>
                    <span className="text-text-secondary/30 text-xs shrink-0">{t.time_minutes}m</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Story player mode
  if (podcastEpisode !== null && category === 'learn_kannada') {
    const ep = KANNADA_STORIES[-(podcastEpisode + 1)]
    return (
      <PodcastPlayer
        episode={ep}
        tasks={allTasks}
        onDone={() => setPodcastEpisode(null)}
        onTaskComplete={(taskId) => {
          const ids = getCompletedIds()
          ids.add(taskId)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-1">
        <button onClick={onHome} className="text-text-secondary/40 text-xs hover:text-text-secondary">← Home</button>
      </div>
      <h1 className="text-xl font-semibold text-text-primary mb-1">{categoryLabel}</h1>
      <p className="text-text-secondary/50 text-xs mb-6">
        {totalCompleted}/{totalTasks} tasks completed · {journeys.length} journeys
      </p>

      {/* Stories for Kannada — primary audio experience */}
      {category === 'learn_kannada' && (
        <div className="mb-8">
          <p className="text-text-secondary/50 text-xs uppercase tracking-wide mb-3">📖 Stories</p>
          <div className="space-y-2">
            {KANNADA_STORIES.map((ep, i) => (
              <button key={`story-${i}`} onClick={() => setPodcastEpisode(-(i + 1))}
                className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-left hover:border-accent-amber/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-text-primary text-sm font-medium">{ep.title}</span>
                  <span className="text-accent-amber text-lg">▶</span>
                </div>
                <p className="text-text-secondary/50 text-xs">{ep.description}</p>
              </button>
            ))}
          </div>
          <p className="text-text-secondary/50 text-xs uppercase tracking-wide mt-8 mb-3">📱 Browse & Study</p>
        </div>
      )}

      {/* Recent journeys — LRU pinned at top */}
      {(() => {
        const recentKeys = getRecent(category)
        if (!recentKeys.length) return null
        const allItems = [...stages, ...journeys, ...collections]
        const recentItems = recentKeys.map(k => allItems.find(j => j.key === k)).filter(Boolean) as Journey[]
        if (!recentItems.length) return null
        const getEmoji = (j: Journey) => {
          if (j.key.startsWith('stage:')) return STAGE_EMOJI[parseInt(j.key.split(':')[1]) || 1] || '📋'
          if (j.key.startsWith('collection:')) {
            const tag = j.key.replace('collection:', '')
            return (COLLECTION_CONFIGS[category] || []).find(x => x.tag === tag)?.emoji || '📋'
          }
          return JOURNEY_EMOJI[j.key] || '📋'
        }
        return (
          <>
            <p className="text-text-secondary/50 text-xs uppercase tracking-wide mb-3">Recent</p>
            <div className="space-y-3 mb-8">
              {recentItems.map(j => renderCard(j, getEmoji(j)))}
            </div>
          </>
        )
      })()}

      {stages.length > 0 && (
        <>
          <p className="text-text-secondary/50 text-xs uppercase tracking-wide mb-3">Your Path</p>
          <div className="space-y-3">
            {stages.map(s => {
              const lvl = parseInt(s.key.split(':')[1]) || 1
              return renderCard(s, STAGE_EMOJI[lvl] || '📋')
            })}
          </div>
          <p className="text-text-secondary/50 text-xs uppercase tracking-wide mt-8 mb-3">By Topic</p>
        </>
      )}

      <div className="space-y-3">
        {journeys.map(j => renderCard(j, JOURNEY_EMOJI[j.key] || '📋'))}
      </div>

      {collections.length > 0 && (
        <>
          <p className="text-text-secondary/50 text-xs uppercase tracking-wide mt-8 mb-3">Collections</p>
          <div className="space-y-3">
            {collections.map(c => {
              const tag = c.key.replace('collection:', '')
              const cfg = (COLLECTION_CONFIGS[category] || []).find(x => x.tag === tag)
              return renderCard(c, cfg?.emoji || '📋')
            })}
          </div>
        </>
      )}
    </div>
  )
}
