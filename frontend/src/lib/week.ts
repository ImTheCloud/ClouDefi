import type { Challenge, ChallengeSchedule, Checkin, DayBucket, WeekTask } from './types'

export const formatDate = (date: Date) => date.toISOString().slice(0, 10)

export const startOfWeek = (anchor = new Date()) => {
  const d = new Date(anchor)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday = 1, Sunday = 0
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + diff)
  return d
}

export const weekDays = (anchor = new Date()) => {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, idx) => {
    const next = new Date(start)
    next.setDate(start.getDate() + idx)
    return next
  })
}

const toMondayIndex = (date: Date) => {
  const jsDay = date.getDay() // 0=Sun
  return (jsDay + 6) % 7 // 0=Mon ... 6=Sun
}

const inRange = (date: Date, start: Date, end: Date) =>
  date.getTime() >= start.getTime() && date.getTime() <= end.getTime()

const occursOnDate = (
  challenge: Challenge,
  schedule: ChallengeSchedule,
  date: Date,
) => {
  if (!challenge.is_active) return false
  const start = new Date(challenge.start_date)
  const end = new Date(challenge.end_date)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  if (!inRange(date, start, end)) return false

  if (schedule.frequency === 'daily') return true

  if (schedule.frequency === 'weekly') {
    if (!schedule.weekly_days) return false
    return schedule.weekly_days.includes(toMondayIndex(date))
  }

  if (schedule.frequency === 'monthly') {
    return schedule.monthly_rule === 'first_day' && date.getDate() === 1
  }

  return false
}

export const buildWeek = (
  challenges: Challenge[],
  schedules: ChallengeSchedule[],
  checkins: Checkin[],
  anchor = new Date(),
): DayBucket[] => {
  const days = weekDays(anchor)
  const todayKey = formatDate(new Date())
  const checkinMap = new Map<string, Checkin>()
  checkins.forEach((c) => checkinMap.set(`${c.challenge_id}-${c.check_date}`, c))

  return days.map((date) => {
    const dateKey = formatDate(date)
    const tasks: WeekTask[] = []

    challenges.forEach((challenge) => {
      const schedule = schedules.find((s) => s.challenge_id === challenge.id)
      if (!schedule) return
      if (!occursOnDate(challenge, schedule, date)) return
      const checkin = checkinMap.get(`${challenge.id}-${dateKey}`)

      tasks.push({
        challenge,
        schedule,
        date,
        dateKey,
        checkin,
        isToday: dateKey === todayKey,
        isPast: date.getTime() <= new Date().setHours(0, 0, 0, 0),
      })
    })

    return { date, tasks }
  })
}
