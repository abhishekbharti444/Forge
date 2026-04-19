import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { apiFetch } from './lib/api'
import type { Session } from '@supabase/supabase-js'
import { Auth } from './states/Auth'
import { Landing } from './states/Landing'
import { IntentCapture } from './states/IntentCapture'
import { GoalHome } from './states/GoalHome'
import { Journeys } from './states/Journeys'
import { Focused } from './states/Focused'
import { AudioPlayerScreen } from './states/AudioPlayerScreen'
import { WhatsNext } from './states/WhatsNext'
import { DoneForToday } from './states/DoneForToday'
import { History } from './states/History'
import { TaskReview } from './states/TaskReview'

import { PodcastPlayer, KANNADA_EPISODES } from './components/PodcastPlayer'
import { recordCompletion } from './lib/momentum'
import { recordCompletion as recordProgress, getTasksCompletedToday as getProgressToday, getLastCategory as getProgressLastCategory } from './lib/progress'
import { getCompletedIds } from './lib/progress'
import { saveSession, restoreSession, clearSession } from './lib/sessionRecovery'

const IS_REVIEW = new URLSearchParams(window.location.search).has('review')

type AppState = 'loading' | 'auth' | 'intent' | 'home' | 'journeys' | 'focused' | 'audio' | 'whatsnext' | 'donefortoday' | 'history' | 'podcast' | 'error'

interface TaskData {
  task_id: string
  description: string
  time_minutes: number
  skill_area?: string
  goal_category?: string
  type?: string
  action?: string
  context?: string
  constraint_note?: string
  example?: string
  reference?: { type: string; [key: string]: any }
  tools?: string[]
  completion?: string
  prompts?: { prompt: string; lines: number }[]
  needs_guitar?: boolean
  bpm?: number
  chords?: string[]
  scale?: string
  scales?: string[]
  audioUrl?: string
  tags?: string[]
  sequence?: { name: string; order: number; total: number }
  song?: { title: string; artist: string; genre: string; capo: number }
  songSuggestions?: string[]
}

const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === 'true'
// const DONE_THRESHOLD = 3

function App() {
  const [_session, setSession] = useState<Session | null>(null)
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = restoreSession()
    return (saved?.appState as AppState) || 'loading'
  })
  const [currentTask, setCurrentTask] = useState<TaskData | null>(() => {
    const saved = restoreSession()
    return saved?.currentTask || null
  })
  const [audioMode, setAudioMode] = useState<'speak' | 'listen'>(() => {
    const saved = restoreSession()
    return saved?.audioMode || 'speak'
  })
  const [tasksCompletedToday, setTasksCompletedToday] = useState(getProgressToday)
  const [lastCategory, setLastCategory] = useState(getProgressLastCategory)
  const [podcastEpisode, setPodcastEpisode] = useState(0)
  const [podcastTasks, setPodcastTasks] = useState<any[]>([])

  // Clean up legacy sessionStorage keys (one-time migration)
  useEffect(() => {
    sessionStorage.removeItem('forge_appState')
    sessionStorage.removeItem('forge_currentTask')
  }, [])

  // Persist session to localStorage on state changes
  useEffect(() => {
    if (appState === 'focused' || appState === 'audio') {
      saveSession(appState, currentTask, audioMode)
    }
  }, [appState, currentTask, audioMode])

  // visibilitychange: last reliable event on mobile — flush state when page goes hidden
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden' && (appState === 'focused' || appState === 'audio')) {
        saveSession(appState, currentTask, audioMode)
      }
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [appState, currentTask, audioMode])

  useEffect(() => {
    if (appState !== 'loading') return // restored from sessionStorage
    if (SKIP_AUTH) { checkStatus(); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      session ? checkStatus() : setAppState('auth')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      session ? checkStatus() : setAppState('auth')
    })
    return () => subscription.unsubscribe()
  }, [])

  function checkStatus() {
    const goals = JSON.parse(localStorage.getItem('activeGoals') || '[]')
    setAppState(goals.length ? 'home' : 'intent')
  }

  function handleGoalSet() {
    setAppState('home')
  }

  function handlePractice(category: string) {
    setLastCategory(category)
    setAppState('journeys')
  }

  async function handlePodcast(episodeIdx: number) {
    setPodcastEpisode(episodeIdx)
    try {
      const d = await apiFetch<{ tasks: any[] }>('/tasks?category=learn_kannada')
      setPodcastTasks(d.tasks || [])
    } catch { setPodcastTasks([]) }
    setAppState('podcast')
  }

  function handleStartTask(task: any, mode: 'screen' | 'speak' | 'listen') {
    const ref = task.reference || {} as any
    setCurrentTask({
      task_id: task.id || task.task_id,
      description: task.description,
      time_minutes: task.time_minutes,
      skill_area: task.skill_area,
      goal_category: task.goal_category || lastCategory,
      type: task.type,
      action: task.action,
      context: task.context,
      constraint_note: task.constraint_note,
      example: task.example,
      reference: task.reference,
      tools: task.tools,
      completion: task.completion,
      prompts: task.prompts,
      needs_guitar: task.needs_guitar || ref.needs_guitar,
      bpm: task.bpm || ref.bpm,
      chords: task.chords || ref.chords,
      scale: task.scale,
      scales: task.scales,
      tags: task.tags || ref.tags,
      sequence: task.sequence || ref.sequence,
      song: task.song || ref.song,
      songSuggestions: task.songSuggestions || ref.songSuggestions,
    })
    if (mode === 'screen') setAppState('focused')
    else { setAudioMode(mode); setAppState('audio') }
  }

  function handleDone() {
    clearSession()
    recordCompletion()
    if (currentTask) recordProgress(currentTask)
    const newCount = tasksCompletedToday + 1
    setTasksCompletedToday(newCount)
    setLastCategory(currentTask?.goal_category || lastCategory)
    setAppState('whatsnext')
  }

  async function handleNextInSequence() {
    if (!currentTask?.sequence || !currentTask.goal_category) return
    const nextOrder = currentTask.sequence.order + 1
    const seqName = currentTask.sequence.name
    try {
      const data = await apiFetch<{ tasks: any[] }>(`/tasks?category=${currentTask.goal_category}`)
      const tasks = (data.tasks || []).map((t: any) => {
        const ref = t.reference
        if (!ref) return t
        const seq = t.sequence || ref.sequence
        const song = t.song || ref.song
        const tags = t.tags || ref.tags
        return { ...t, sequence: seq, song, tags, bpm: t.bpm || ref.bpm, chords: t.chords || ref.chords, needs_guitar: t.needs_guitar || ref.needs_guitar, scale: t.scale || ref.scale, scales: t.scales || ref.scales }
      })
      const next = tasks.find((t: any) => t.sequence?.name === seqName && t.sequence?.order === nextOrder)
      if (next) {
        handleStartTask(next, 'screen')
      } else {
        setAppState('journeys')
      }
    } catch {
      setAppState('journeys')
    }
  }

  if (IS_REVIEW) return <TaskReview />

  if (appState === 'loading')
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><p className="text-text-secondary">Loading...</p></div>

  if (appState === 'error' as AppState)
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-text-primary text-lg mb-2">Something went wrong</p>
          <p className="text-text-secondary text-sm mb-6">Couldn't connect to the server.</p>
          <button onClick={checkStatus} className="px-6 py-2.5 bg-accent-amber text-bg-primary font-semibold rounded-xl">Try again</button>
        </div>
      </div>
    )

  if (appState === 'auth') return <Landing onGetStarted={() => setAppState('auth_form' as AppState)} />
  if (appState === 'auth_form' as AppState) return <Auth />

  const catLabels: Record<string, string> = {
    learn_kannada: 'Learn Kannada', public_speaking: 'Public Speaking',
    guitar_practice: 'Guitar Practice', philosophy: 'Philosophy',
    distributed_systems: 'Distributed Systems',
  }

  function renderState() {
    if (appState === 'intent') return <IntentCapture onGoalSet={handleGoalSet} />

    if (appState === 'home')
      return <GoalHome tasksCompletedToday={tasksCompletedToday} onPractice={handlePractice} onPodcast={handlePodcast} onHistory={() => setAppState('history')} onEditGoals={() => setAppState('intent')} />

    if (appState === 'journeys')
      return <Journeys category={lastCategory} categoryLabel={catLabels[lastCategory] || lastCategory} onStartTask={handleStartTask} onHome={() => setAppState('home')} />

    if (appState === 'focused' && currentTask)
      return <Focused task={currentTask} onDone={handleDone} onHome={() => { clearSession(); setAppState('journeys') }} onNextInSequence={handleNextInSequence} />

    if (appState === 'audio' && currentTask)
      return <AudioPlayerScreen task={currentTask} mode={audioMode} onDone={handleDone} onHome={() => { clearSession(); setAppState('journeys') }} />

    if (appState === 'podcast')
      return <PodcastPlayer episode={KANNADA_EPISODES[podcastEpisode]} tasks={podcastTasks}
        onDone={() => setAppState('home')}
        onTaskComplete={(taskId) => { const ids = getCompletedIds(); ids.add(taskId) }} />

    if (appState === 'whatsnext')
      return <WhatsNext completedSkillArea={currentTask?.skill_area} category={lastCategory} categoryLabel={catLabels[lastCategory] || lastCategory} tasksCompletedToday={tasksCompletedToday} onStartTask={handleStartTask} onDoneForNow={() => setAppState('journeys')} />

    if (appState === 'donefortoday')
      return <DoneForToday count={tasksCompletedToday} onOneMore={() => setAppState('whatsnext')} onHistory={() => setAppState('history')} />

    if (appState === 'history') return <History onBack={() => setAppState('home')} />

    return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><p className="text-text-secondary">Loading...</p></div>
  }

  return <div key={appState} className="state-enter">{renderState()}</div>
}

export default App
