const KEY = 'weeklyActivity'

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function getActivity(): Record<string, number> {
  return JSON.parse(localStorage.getItem(KEY) || '{}')
}

function cutoff(): string {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

export function recordCompletion() {
  const activity = getActivity()
  const t = today()
  activity[t] = (activity[t] || 0) + 1
  // Clean old entries
  const min = cutoff()
  for (const k of Object.keys(activity)) {
    if (k < min) delete activity[k]
  }
  localStorage.setItem(KEY, JSON.stringify(activity))
}

export function getWeeklyMomentum() {
  const activity = getActivity()
  const min = cutoff()
  let activeDays = 0, totalTasks = 0
  const days: boolean[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const count = (key >= min && activity[key]) || 0
    days.push(count > 0)
    if (count > 0) { activeDays++; totalTasks += count }
  }

  const level = activeDays === 0 ? 'Start your week'
    : activeDays <= 2 ? 'Getting started'
    : activeDays <= 4 ? 'Building momentum'
    : 'On fire'

  return { activeDays, totalTasks, level, days }
}
