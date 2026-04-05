import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { apiFetch } from './lib/api'
import type { Session } from '@supabase/supabase-js'
import { Auth } from './states/Auth'
import { Landing } from './states/Landing'
import { IntentCapture } from './states/IntentCapture'
import { GoalHome } from './states/GoalHome'
import { Suggestion } from './states/Suggestion'
import { Focused } from './states/Focused'
import { AudioPlayerScreen } from './states/AudioPlayerScreen'
import { WhatsNext } from './states/WhatsNext'
import { DoneForToday } from './states/DoneForToday'
import { Coach } from './states/Coach'
import { History } from './states/History'
import { TaskReview } from './states/TaskReview'

import { recordCompletion } from './lib/momentum'

const IS_REVIEW = new URLSearchParams(window.location.search).has('review')

type AppState = 'loading' | 'auth' | 'intent' | 'home' | 'coach' | 'suggestion' | 'focused' | 'audio' | 'whatsnext' | 'donefortoday' | 'history' | 'error'

interface TaskData {
  task_id: string
  description: string
  time_minutes: number
  skill_area?: string
  goal_category?: string
  action?: string
  context?: string
  constraint_note?: string
  example?: string
  reference?: { type: string; [key: string]: any }
  tools?: string[]
  completion?: string
  needs_guitar?: boolean
  bpm?: number
  chords?: string[]
  tags?: string[]
  sequence?: { name: string; order: number; total: number }
  song?: { title: string; artist: string; genre: string; capo: number }
  songSuggestions?: string[]
}

const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === 'true'
// const DONE_THRESHOLD = 3

function App() {
  const [_session, setSession] = useState<Session | null>(null)
  const [appState, setAppState] = useState<AppState>('loading')
  const [currentTask, setCurrentTask] = useState<TaskData | null>(null)
  const [audioMode, setAudioMode] = useState<'speak' | 'listen'>('speak')
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0)
  const [lastCategory, setLastCategory] = useState('')

  useEffect(() => {
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
    setAppState('coach')
  }

  function handleStartTask(task: any, mode: 'screen' | 'speak' | 'listen') {
    setCurrentTask({
      task_id: task.id || task.task_id,
      description: task.description,
      time_minutes: task.time_minutes,
      skill_area: task.skill_area,
      goal_category: task.goal_category || lastCategory,
      action: task.action,
      context: task.context,
      constraint_note: task.constraint_note,
      example: task.example,
      reference: task.reference,
      tools: task.tools,
      completion: task.completion,
      needs_guitar: task.needs_guitar,
      bpm: task.bpm,
      chords: task.chords,
      tags: task.tags,
      sequence: task.sequence,
      song: task.song,
      songSuggestions: task.songSuggestions,
    })
    if (mode === 'screen') setAppState('focused')
    else { setAudioMode(mode); setAppState('audio') }
  }

  function handleDone() {
    recordCompletion()
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
      const next = data.tasks?.find((t: any) => t.sequence?.name === seqName && t.sequence?.order === nextOrder)
      if (next) {
        handleStartTask(next, 'screen')
      } else {
        setAppState('suggestion')
      }
    } catch {
      setAppState('suggestion')
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

  function renderState() {
    if (appState === 'intent') return <IntentCapture onGoalSet={handleGoalSet} />

    if (appState === 'home')
      return <GoalHome tasksCompletedToday={tasksCompletedToday} onPractice={handlePractice} onHistory={() => setAppState('history')} onEditGoals={() => setAppState('intent')} />

    if (appState === 'coach') {
      const catLabels: Record<string, string> = { creative_writing: 'Creative Writing', learn_kannada: 'Learn Kannada', public_speaking: 'Public Speaking', guitar_practice: 'Guitar Practice', guided_thinking: 'Guided Thinking', active_listening: 'Active Listening', philosophy: 'Philosophy' }
      return <Coach category={lastCategory} categoryLabel={catLabels[lastCategory] || lastCategory} lastCompletedId={currentTask?.task_id} lastSkillArea={currentTask?.skill_area} onStartTask={handleStartTask} onBrowseAll={() => setAppState('suggestion')} onHome={() => setAppState('home')} />
    }

    if (appState === 'suggestion')
      return <Suggestion onStartTask={handleStartTask} tasksCompletedToday={tasksCompletedToday} onHistory={() => setAppState('history')} initialCategory={lastCategory} onHome={() => setAppState('home')} />

    if (appState === 'focused' && currentTask)
      return <Focused task={currentTask} onDone={handleDone} onHome={() => setAppState('home')} onNextInSequence={handleNextInSequence} />

    if (appState === 'audio' && currentTask)
      return <AudioPlayerScreen task={currentTask} mode={audioMode} onDone={handleDone} onHome={() => setAppState('home')} />

    if (appState === 'whatsnext') {
      const catLabels: Record<string, string> = { creative_writing: 'Creative Writing', learn_kannada: 'Learn Kannada', public_speaking: 'Public Speaking', guitar_practice: 'Guitar Practice', guided_thinking: 'Guided Thinking', active_listening: 'Active Listening', philosophy: 'Philosophy' }
      return <WhatsNext completedSkillArea={currentTask?.skill_area} category={lastCategory} categoryLabel={catLabels[lastCategory] || lastCategory} tasksCompletedToday={tasksCompletedToday} onStartTask={handleStartTask} onDoneForNow={() => setAppState('home')} />
    }

    if (appState === 'donefortoday')
      return <DoneForToday count={tasksCompletedToday} onOneMore={() => setAppState('whatsnext')} onHistory={() => setAppState('history')} />

    if (appState === 'history') return <History onBack={() => setAppState('home')} />

    return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><p className="text-text-secondary">Loading...</p></div>
  }

  return <div key={appState} className="state-enter">{renderState()}</div>
}

export default App
