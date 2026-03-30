import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { IntentCapture } from './states/IntentCapture'
import { Suggestion } from './states/Suggestion'
import { Focused } from './states/Focused'
import { Completion } from './states/Completion'
import { DoneForToday } from './states/DoneForToday'

type AppState = 'loading' | 'intent' | 'suggestion' | 'focused' | 'completion' | 'done_for_today'

interface TaskData {
  task_id: string
  description: string
  time_minutes: number
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [appState, setAppState] = useState<AppState>('loading')
  const [currentTask, setCurrentTask] = useState<TaskData | null>(null)
  const [taskStartTime, setTaskStartTime] = useState<number>(0)
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0)

  useEffect(() => {
    initAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) checkStatus(session.access_token)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setSession(session)
      checkStatus(session.access_token)
    } else {
      // Auto sign in anonymously
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) console.error('Anonymous auth failed:', error.message)
      if (data.session) {
        setSession(data.session)
        checkStatus(data.session.access_token)
      }
    }
  }

  async function checkStatus(token: string) {
    const res = await fetch('/api/status', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (data.done_for_today) {
      setTasksCompletedToday(data.tasks_completed_today)
      setAppState('done_for_today')
    } else if (!data.has_active_goal) {
      setAppState('intent')
    } else {
      setAppState('suggestion')
    }
  }

  async function fetchSuggestion() {
    const token = session?.access_token
    if (!token) return
    const res = await fetch('/api/suggest', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (data.done_for_today) {
      setTasksCompletedToday(data.tasks_completed)
      setAppState('done_for_today')
    } else if (data.task) {
      setCurrentTask({ task_id: data.task.id, description: data.task.description, time_minutes: data.task.time_minutes })
      await logEvent(data.task.id, 'shown')
      setAppState('suggestion')
    }
  }

  async function logEvent(taskId: string, event: string, extra?: Record<string, unknown>) {
    const token = session?.access_token
    if (!token) return
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ task_id: taskId, event, ...extra }),
    })
  }

  function handleGoalSet() {
    setAppState('suggestion')
    fetchSuggestion()
  }

  function handleLetsGo() {
    if (!currentTask) return
    logEvent(currentTask.task_id, 'started')
    setTaskStartTime(Date.now())
    setAppState('focused')
  }

  async function handleSkip(reason: string) {
    if (!currentTask) return
    await logEvent(currentTask.task_id, 'skipped', { skip_reason: reason })
    fetchSuggestion()
  }

  function handleDone() {
    setAppState('completion')
  }

  async function handleComplete(reflection?: string) {
    if (!currentTask) return
    const duration = Math.round((Date.now() - taskStartTime) / 1000)
    await logEvent(currentTask.task_id, 'completed', {
      reflection_text: reflection || null,
      duration_seconds: duration,
    })
    setTasksCompletedToday(prev => prev + 1)
    if (tasksCompletedToday + 1 >= 3) {
      setAppState('done_for_today')
    } else {
      fetchSuggestion()
    }
  }

  function handleOneMore() {
    fetchSuggestion()
  }

  if (appState === 'loading') {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><p className="text-zinc-500">Loading...</p></div>
  }

  if (appState === 'intent') {
    return <IntentCapture token={session?.access_token ?? ''} onGoalSet={handleGoalSet} />
  }

  if (appState === 'suggestion') {
    if (!currentTask) {
      fetchSuggestion()
      return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><p className="text-zinc-500">Finding your next task...</p></div>
    }
    return <Suggestion task={currentTask} onLetsGo={handleLetsGo} onSkip={handleSkip} tasksCompletedToday={tasksCompletedToday} />
  }

  if (appState === 'focused') {
    return <Focused task={currentTask!} onDone={handleDone} />
  }

  if (appState === 'completion') {
    return <Completion onComplete={handleComplete} />
  }

  if (appState === 'done_for_today') {
    return <DoneForToday count={tasksCompletedToday} onOneMore={handleOneMore} />
  }

  return null
}

export default App
