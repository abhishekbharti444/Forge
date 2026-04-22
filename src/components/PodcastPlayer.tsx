import { useState, useEffect, useRef, useCallback } from 'react'
import type { Utterance } from '../lib/speechEngine'
import { SpeechPlayer } from '../lib/speechPlayer'
import { buildSegments, type DisplaySegment, type StoryMode, type StoryTier, TIER_CONFIG, TIER_ORDER, NEXT_TIER, getTierForMode, getDefaultModeForTier, getUnlockedTiers, unlockNextTier, getWordKnowledgeStats, updateWordFreqs } from '../lib/podcastEngine'

interface Episode {
  title: string
  description: string
  taskIds: string[]
}

interface PodcastPlayerProps {
  episode: Episode
  tasks: any[]
  onDone: () => void
  onTaskComplete?: (taskId: string) => void
}

interface FlatItem {
  segIdx: number
  taskIdx: number
  utt: Utterance
}

function clearMediaSession() {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = null
  navigator.mediaSession.setActionHandler('play', null)
  navigator.mediaSession.setActionHandler('pause', null)
  navigator.mediaSession.setActionHandler('nexttrack', null)
  navigator.mediaSession.setActionHandler('previoustrack', null)
}

export function PodcastPlayer({ episode, tasks, onDone, onTaskComplete }: PodcastPlayerProps) {
  const playerRef = useRef<SpeechPlayer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [segIdx, setSegIdx] = useState(0)
  const [uttIdx, setUttIdx] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showTranslit, setShowTranslit] = useState(() => localStorage.getItem('forge_translit') !== 'hide')
  const [transitioning, setTransitioning] = useState(false) // F1: fade transition
  const [toast, setToast] = useState<string | null>(null) // F2: mode switch toast
  const [storyMode, setStoryMode] = useState<StoryMode>(() => {
    const storyId = episode.taskIds[0]
    const saved = localStorage.getItem(`forge_story_mode_${storyId}`) as StoryMode | 'delayed' | null
    // migrate legacy 'delayed' mode to 'guided' with long pause
    if (saved === 'delayed') {
      localStorage.setItem(`forge_story_mode_${storyId}`, 'guided')
      localStorage.setItem(`forge_story_pause_${storyId}`, '3.5')
      return 'guided'
    }
    return saved || 'guided'
  })
  const [guidedPause, setGuidedPause] = useState<number>(() => {
    const saved = localStorage.getItem(`forge_story_pause_${episode.taskIds[0]}`)
    return saved ? parseFloat(saved) : 0.5
  })
  const storyTier = getTierForMode(storyMode)
  const isStoryEpisode = episode.taskIds[0]?.startsWith('kn-story-')
  const posKey = `forge_story_pos_${episode.taskIds[0]}`

  // F2: auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1500)
    return () => clearTimeout(t)
  }, [toast])

  function switchMode(mode: StoryMode) {
    // F1: fade transition
    setTransitioning(true)
    setTimeout(() => {
      setStoryMode(mode)
      localStorage.setItem(`forge_story_mode_${episode.taskIds[0]}`, mode)
      playerRef.current?.stop()
      setPlaying(false)
      setSegIdx(0)
      setUttIdx(0)
      setFinished(false)
      // E: clear saved position on mode switch
      localStorage.removeItem(posKey)
      // F2: show toast
      const tier = getTierForMode(mode)
      setToast(`${TIER_CONFIG[tier].emoji} ${TIER_CONFIG[tier].label} · ${mode}`)
      setTimeout(() => setTransitioning(false), 50)
    }, 200)
  }

  function switchTier(tier: StoryTier) {
    switchMode(getDefaultModeForTier(tier))
  }

  const segmentsRef = useRef<DisplaySegment[]>([])
  const flatRef = useRef<FlatItem[]>([])
  const taskBoundaries = useRef<number[]>([]) // segIdx where each task starts

  // Build segments on mount or mode change
  useEffect(() => {
    const episodeTasks = episode.taskIds
      .map(id => tasks.find(t => (t.id || t.task_id) === id) || getStoryTask(id))
      .filter(Boolean)

    const allSegments: DisplaySegment[] = []
    const flat: FlatItem[] = []
    const boundaries: number[] = []

    episodeTasks.forEach((task, tIdx) => {
      boundaries.push(allSegments.length)
      const taskSegs = buildSegments(task, isStoryEpisode ? storyMode : undefined, storyTier === 'guided' ? guidedPause : undefined)
      taskSegs.forEach(seg => {
        const segI = allSegments.length
        allSegments.push(seg)
        seg.utterances.forEach(utt => {
          flat.push({ segIdx: segI, taskIdx: tIdx, utt })
        })
      })
      // Silence between tasks
      const gapSeg: DisplaySegment = { utterances: [{ text: '', pauseAfter: 1.5, role: 'instruction' }] }
      const gapSegI = allSegments.length
      allSegments.push(gapSeg)
      flat.push({ segIdx: gapSegI, taskIdx: tIdx, utt: gapSeg.utterances[0] })
    })

    segmentsRef.current = allSegments
    flatRef.current = flat
    taskBoundaries.current = boundaries
  }, [episode, tasks, storyMode, guidedPause])

  // E: restore saved position on mount
  const [resumePrompt, setResumePrompt] = useState(false)
  const savedPosRef = useRef<number | null>(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(posKey)
      if (raw) {
        const pos = parseInt(raw, 10)
        if (pos > 0 && pos < flatRef.current.length) {
          savedPosRef.current = pos
          setResumePrompt(true)
        }
      }
    } catch { /* ignore */ }
  }, [])

  const startPlaying = useCallback(() => {
    if (!flatRef.current.length) return
    playFrom(0)
  }, [])

  function playFrom(startIdx: number) {
    playerRef.current?.stop()
    const flat = flatRef.current
    const utts = flat.slice(startIdx).map(f => f.utt)
    const player = new SpeechPlayer()
    playerRef.current = player
    player.load(utts)

    player.onProgress = (idx) => {
      const realIdx = idx + startIdx
      const item = flat[realIdx]
      if (item) {
        setSegIdx(item.segIdx)
        setUttIdx(realIdx)
        // E: persist position (throttled by SpeechPlayer's own callback rate)
        localStorage.setItem(posKey, String(realIdx))
        // Mark task complete when crossing boundary
        if (realIdx > 0) {
          const prev = flat[realIdx - 1]
          if (prev.taskIdx !== item.taskIdx) {
            onTaskComplete?.(episode.taskIds[prev.taskIdx])
          }
        }
      }
    }

    player.onComplete = () => {
      const lastTaskId = episode.taskIds[episode.taskIds.length - 1]
      if (lastTaskId) onTaskComplete?.(lastTaskId)
      // Update word frequency tracker for selective mode
      if (isStoryEpisode) {
        const storyTask = getStoryTask(episode.taskIds[0])
        if (storyTask?.reference?.sentences) updateWordFreqs(storyTask.reference.sentences)
      }
      // E: clear saved position on completion
      localStorage.removeItem(posKey)
      setPlaying(false)
      setFinished(true)
    }

    player.play()
    setPlaying(true)
    setFinished(false)
  }

  function togglePlay() {
    // E: handle resume prompt
    if (resumePrompt && savedPosRef.current !== null) {
      playFrom(savedPosRef.current)
      setResumePrompt(false)
      savedPosRef.current = null
      return
    }
    if (!playerRef.current) { startPlaying(); return }
    if (playing) {
      playerRef.current.pause()
      setPlaying(false)
    } else {
      playerRef.current.play()
      setPlaying(true)
    }
  }

  function skipNext() {
    const flat = flatRef.current
    const curTaskIdx = flat[uttIdx]?.taskIdx ?? 0
    const next = flat.findIndex(f => f.taskIdx > curTaskIdx)
    if (next >= 0) playFrom(next)
  }

  function skipPrev() {
    const flat = flatRef.current
    const curTaskIdx = flat[uttIdx]?.taskIdx ?? 0
    // Find start of current task
    const taskStart = flat.findIndex(f => f.taskIdx === curTaskIdx)
    // If we're past the first few utterances, restart current task; otherwise go to previous
    if (taskStart >= 0 && uttIdx - taskStart > 2 || curTaskIdx === 0) {
      playFrom(taskStart)
    } else {
      const prevStart = flat.findIndex(f => f.taskIdx === curTaskIdx - 1)
      if (prevStart >= 0) playFrom(prevStart)
    }
  }

  useEffect(() => { return () => { playerRef.current?.stop(); clearMediaSession() } }, [])

  // Media Session API — lock screen controls + background play
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: 'Learn Kannada',
      album: 'Forge',
    })
    navigator.mediaSession.setActionHandler('play', () => togglePlay())
    navigator.mediaSession.setActionHandler('pause', () => togglePlay())
    navigator.mediaSession.setActionHandler('nexttrack', () => skipNext())
    navigator.mediaSession.setActionHandler('previoustrack', () => skipPrev())
    return () => clearMediaSession()
  }, [episode])

  const seg = segmentsRef.current[segIdx]
  const totalSegs = segmentsRef.current.length
  const progress = totalSegs > 0 ? segIdx / totalSegs : 0
  const currentRole = flatRef.current[uttIdx]?.utt.role
  // Progressive reveal: show content only after its audio has started
  const showKannada = !seg?.kannada || currentRole === 'example' || currentRole === 'answer'
  const showEnglish = !seg?.english || currentRole === 'answer' || currentRole === 'instruction'
  const showTranslitReveal = !seg?.transliteration || currentRole === 'example' || currentRole === 'answer'
  // Story mode: KN first (utterances start with 'example'), Podcast mode: EN first
  const isStoryMode = seg?.utterances?.[0]?.role === 'example'

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col px-6 max-w-md mx-auto">
      {/* Header */}
      <div className="pt-8 pb-4">
        {/* Row 1: title + controls */}
        <div className="flex items-center justify-between">
          <p className="text-text-secondary/40 text-sm uppercase tracking-wide">{episode.title}</p>
          <div className="flex items-center gap-2">
            {isStoryEpisode && (() => {
              const unlocked = getUnlockedTiers(episode.taskIds[0])
              return (
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {TIER_ORDER.filter(t => unlocked.has(t)).map(t => (
                    <button key={t} onClick={() => switchTier(t)}
                      className={`text-xs px-2.5 py-1 transition-colors ${storyTier === t ? 'bg-accent-amber/20 text-accent-amber' : 'text-text-secondary/30 hover:text-text-secondary/50'}`}>
                      {TIER_CONFIG[t].emoji} {TIER_CONFIG[t].label}
                    </button>
                  ))}
                </div>
              )
            })()}
            <button onClick={() => setShowTranslit(v => { const next = !v; localStorage.setItem('forge_translit', next ? 'show' : 'hide'); return next })}
              className={`text-xs px-2 py-1 rounded-lg border transition-colors ${showTranslit ? 'border-accent-amber/30 text-accent-amber' : 'border-border text-text-secondary/30'}`}>
              Aa
            </button>
          </div>
        </div>
        {/* Row 2: description + secondary controls */}
        {isStoryEpisode && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <p className="text-text-secondary/40 text-xs italic">{TIER_CONFIG[storyTier].description[storyMode]}</p>
              {/* C: word knowledge stats for challenge tier */}
              {storyTier === 'challenge' && isStoryEpisode && (() => {
                const storyTask = getStoryTask(episode.taskIds[0])
                if (!storyTask?.reference?.sentences) return null
                const { known, total } = getWordKnowledgeStats(storyTask.reference.sentences)
                return <span className="text-xs text-accent-amber/50 whitespace-nowrap">{known}/{total} known</span>
              })()}
            </div>
            {storyTier === 'guided' && (
              <div className="flex items-center gap-0.5 shrink-0 ml-3">
                {([['short', 0.5], ['mid', 2.0], ['long', 3.5]] as const).map(([label, p]) => (
                  <button key={p} onClick={() => { setGuidedPause(p); localStorage.setItem(`forge_story_pause_${episode.taskIds[0]}`, String(p)); playerRef.current?.stop(); setPlaying(false); setSegIdx(0); setUttIdx(0) }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${guidedPause === p ? 'bg-accent-amber/10 text-accent-amber/70' : 'text-text-secondary/20 hover:text-text-secondary/40'}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
            {storyTier === 'challenge' && TIER_CONFIG[storyTier].modes.length > 1 && (
              <div className="flex items-center gap-0.5 shrink-0 ml-3">
                {TIER_CONFIG[storyTier].modes.map(m => (
                  <button key={m} onClick={() => switchMode(m)}
                    className={`text-xs px-2 py-1 rounded capitalize transition-colors ${storyMode === m ? 'bg-accent-amber/10 text-accent-amber/70' : 'text-text-secondary/20 hover:text-text-secondary/40'}`}>
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Display card — the main content area */}
      <div className={`flex-1 flex items-center justify-center py-8 transition-opacity duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* F2: mode switch toast */}
        {toast && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-secondary/90 text-text-secondary text-sm px-4 py-2 rounded-xl shadow-lg z-10 animate-pulse">
            {toast}
          </div>
        )}
        {/* E: resume prompt */}
        {resumePrompt && !playing && !finished ? (
          <div className="text-center">
            <p className="text-text-secondary/60 text-sm mb-4">Resume where you left off?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={togglePlay}
                className="text-sm text-accent-amber border border-accent-amber/30 rounded-xl px-4 py-2 hover:bg-accent-amber/10 transition-colors">
                Resume ▶
              </button>
              <button onClick={() => { setResumePrompt(false); savedPosRef.current = null; localStorage.removeItem(posKey) }}
                className="text-sm text-text-secondary/40 border border-border rounded-xl px-4 py-2 hover:text-text-secondary/60 transition-colors">
                Start over
              </button>
            </div>
          </div>
        ) : finished ? (
          <div className="text-center">
            <p className="text-3xl mb-3">🎉</p>
            <p className="text-text-primary text-lg mb-4">Episode complete!</p>
            {isStoryEpisode && (() => {
              // Unlock next tier on completion
              const storyId = episode.taskIds[0]
              const nextTier = NEXT_TIER[storyTier]
              if (!nextTier) return null
              // Unlock it
              unlockNextTier(storyId, storyTier)
              const nextConfig = TIER_CONFIG[nextTier]
              return (
                <button onClick={() => { switchTier(nextTier); setFinished(false) }}
                  className="text-sm text-accent-amber border border-accent-amber/30 rounded-xl px-4 py-2 hover:bg-accent-amber/10 transition-colors">
                  {nextConfig.emoji} Try {nextConfig.label} mode →
                </button>
              )
            })()}
          </div>
        ) : seg ? (
          <div className="text-center px-2 w-full">
            {seg.label && (
              <p className="text-text-secondary/30 text-xs uppercase tracking-wide mb-4">{seg.label}</p>
            )}
            {!isStoryMode && seg.english && (
              <p className={`text-sm leading-relaxed mb-3 ${seg.kannada ? 'text-text-secondary/60' : 'text-text-secondary'}`}>
                {seg.english}
              </p>
            )}
            {showKannada && seg.kannada && (
              <p className="text-2xl text-text-primary leading-loose mb-2">{seg.kannada}</p>
            )}
            {showTranslit && showTranslitReveal && seg.transliteration && (
              <p className="text-base text-accent-amber/80 mb-2">{seg.transliteration}</p>
            )}
            {isStoryMode && showEnglish && seg.english && (
              <p className="text-sm leading-relaxed mt-3 text-text-secondary/60">{seg.english}</p>
            )}
            {!seg.kannada && !seg.english && !seg.label && (
              <p className="text-text-secondary/20">···</p>
            )}
          </div>
        ) : (
          <p className="text-text-secondary/30">Tap play to start</p>
        )}
      </div>

      {/* Progress */}
      <div className="pb-2">
        <div className="w-full h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent-amber rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-10 py-6">
        <button onClick={skipPrev} className="text-text-secondary/40 hover:text-text-secondary text-xl p-2">⏮</button>
        <button onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-accent-amber text-bg-primary flex items-center justify-center text-2xl hover:bg-accent-amber-hover transition-colors">
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={skipNext} className="text-text-secondary/40 hover:text-text-secondary text-xl p-2">⏭</button>
      </div>

      {/* Done */}
      <button onClick={() => { playerRef.current?.stop(); onDone() }}
        className="text-text-secondary/30 text-xs py-4 hover:text-text-secondary transition-colors">
        Done for now
      </button>
    </div>
  )
}

// Episode definitions for Kannada Phase 1
export const KANNADA_EPISODES: Episode[] = [
  {
    title: 'Episode 1: First Sounds',
    description: 'Get your ear tuned to Kannada. Vowels, consonants, rhythm, and intonation.',
    taskIds: ['kn-201','kn-202','kn-203','kn-204','kn-205','kn-206','kn-207'],
  },
  {
    title: 'Episode 2: Survival Kannada',
    description: "Ramu's first days in Bengaluru. Coffee, food, auto rides, introductions, directions.",
    taskIds: [
      'kn-211','kn-221','kn-212','kn-222','kn-231',
      'kn-213','kn-223','kn-232','kn-214','kn-224','kn-233',
      'kn-215','kn-225','kn-234','kn-235',
      'kn-281','kn-282',
    ],
  },
  {
    title: 'Episode 3: Daily Life',
    description: "Ramu settles in. Family, market, weather, food, travel to Mysuru.",
    taskIds: [
      'kn-241','kn-251','kn-261','kn-242','kn-252','kn-262',
      'kn-243','kn-253','kn-263','kn-256','kn-265',
      'kn-244','kn-254','kn-266','kn-264',
      'kn-245','kn-255','kn-267','kn-257','kn-268','kn-269','kn-270',
    ],
  },
  {
    title: 'Episode 4: Putting It Together',
    description: 'Context guessing, combined drills, and your Phase 1 graduation test.',
    taskIds: [
      'kn-271','kn-272','kn-273',
      'kn-258','kn-259','kn-260',
      'kn-283','kn-284','kn-285','kn-286',
    ],
  },
]

// Bilingual stories — standalone episodes
import thirstyCrow from '../../data/stories/thirsty-crow.json'
import foxAndGrapes from '../../data/stories/fox-and-grapes.json'
import monkeyAndCroc from '../../data/stories/monkey-and-crocodile.json'
import antAndGrass from '../../data/stories/ant-and-grasshopper.json'
import lionAndMouse from '../../data/stories/lion-and-mouse.json'

const ALL_STORIES = [thirstyCrow, foxAndGrapes, monkeyAndCroc, antAndGrass, lionAndMouse]

function storyToTask(story: any): any {
  return {
    id: story.id,
    description: story.description,
    action: `${story.title_kn} — ${story.title}`,
    reference: { type: 'bilingual_story', sentences: story.sentences, vocabulary: story.vocabulary, comprehension: story.comprehension },
  }
}

export const KANNADA_STORIES: Episode[] = ALL_STORIES.map(s => ({
  title: `📖 ${s.title_kn}`,
  description: s.description,
  taskIds: [s.id],
}))

export function getStoryTask(id: string): any | undefined {
  const story = ALL_STORIES.find(s => s.id === id)
  return story ? storyToTask(story) : undefined
}
