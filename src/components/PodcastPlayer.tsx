import { useState, useEffect, useRef, useCallback } from 'react'
import type { Utterance } from '../lib/speechEngine'
import { SpeechPlayer } from '../lib/speechPlayer'
import { buildSegments, type DisplaySegment, type StoryMode } from '../lib/podcastEngine'

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
  const [storyMode, setStoryMode] = useState<StoryMode>(() => {
    const storyId = episode.taskIds[0]
    return (localStorage.getItem(`forge_story_mode_${storyId}`) as StoryMode) || 'guided'
  })
  const isStoryEpisode = episode.taskIds[0]?.startsWith('kn-story-')

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
      const taskSegs = buildSegments(task, isStoryEpisode ? storyMode : undefined)
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
  }, [episode, tasks, storyMode])

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
      setPlaying(false)
      setFinished(true)
    }

    player.play()
    setPlaying(true)
    setFinished(false)
  }

  function togglePlay() {
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
  const taskCount = episode.taskIds.length
  const currentTaskIdx = flatRef.current[uttIdx]?.taskIdx ?? 0
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
        <div className="flex items-center justify-between">
          <p className="text-text-secondary/40 text-xs uppercase tracking-wide">{episode.title}</p>
          <div className="flex items-center gap-2">
            {isStoryEpisode && (
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(['guided', 'delayed'] as StoryMode[]).map(m => (
                  <button key={m} onClick={() => { setStoryMode(m); localStorage.setItem(`forge_story_mode_${episode.taskIds[0]}`, m); playerRef.current?.stop(); setPlaying(false); setSegIdx(0); setUttIdx(0); setFinished(false) }}
                    className={`text-xs px-2 py-1 capitalize transition-colors ${storyMode === m ? 'bg-accent-amber/20 text-accent-amber' : 'text-text-secondary/30'}`}>
                    {m}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowTranslit(v => { const next = !v; localStorage.setItem('forge_translit', next ? 'show' : 'hide'); return next })}
              className={`text-xs px-2 py-1 rounded-lg border transition-colors ${showTranslit ? 'border-accent-amber/30 text-accent-amber' : 'border-border text-text-secondary/30'}`}>
              Aa
            </button>
          </div>
        </div>
        <p className="text-text-secondary/30 text-xs mt-0.5">Task {currentTaskIdx + 1} of {taskCount}</p>
      </div>

      {/* Display card — the main content area */}
      <div className="flex-1 flex items-center justify-center py-8">
        {finished ? (
          <div className="text-center">
            <p className="text-3xl mb-3">🎉</p>
            <p className="text-text-primary text-lg">Episode complete!</p>
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

function storyToTask(story: any): any {
  return {
    id: story.id,
    description: story.description,
    action: `${story.title_kn} — ${story.title}`,
    reference: { type: 'bilingual_story', sentences: story.sentences, vocabulary: story.vocabulary },
  }
}

export const KANNADA_STORIES: Episode[] = [
  {
    title: `📖 ${thirstyCrow.title_kn}`,
    description: thirstyCrow.description,
    taskIds: [thirstyCrow.id],
  },
]

export function getStoryTask(id: string): any | undefined {
  const map: Record<string, any> = { [thirstyCrow.id]: thirstyCrow }
  return map[id] ? storyToTask(map[id]) : undefined
}
