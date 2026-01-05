import { supabase } from './supabaseClient'
import type {
  Challenge,
  ChallengeSchedule,
  ChallengeWithSchedule,
  Checkin,
  Frequency,
  MonthlyRule,
} from './types'
import { formatDate } from './week'

export interface ChallengeFormValues {
  title: string
  description: string
  type: 'quantitative' | 'binary' | 'weight'
  unit: string
  target_value: number | null
  start_date: string
  end_date: string
  is_active: boolean
  frequency: Frequency
  weekly_days: number[]
  monthly_rule: MonthlyRule | null
}

export const fetchChallengesWithSchedules = async () => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*, challenge_schedules(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as ChallengeWithSchedule[]) ?? []
}

export const fetchChallengeById = async (id: string) => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*, challenge_schedules(*), checkins(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ChallengeWithSchedule & { checkins: Checkin[] }
}

export const fetchCheckinsForRange = async (start: Date, end: Date) => {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .gte('check_date', formatDate(start))
    .lte('check_date', formatDate(end))

  if (error) throw error
  return (data as Checkin[]) ?? []
}

export const fetchCheckinsForChallenge = async (challengeId: string) => {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('check_date', { ascending: false })

  if (error) throw error
  return (data as Checkin[]) ?? []
}

export const createChallengeWithSchedule = async (
  userId: string,
  form: ChallengeFormValues,
) => {
  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert({
      user_id: userId,
      title: form.title,
      description: form.description || null,
      type: form.type,
      unit: form.type === 'binary' ? null : form.unit,
      target_value: form.type === 'binary' ? null : form.target_value,
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: form.is_active,
    })
    .select()
    .single()

  if (error || !challenge) throw error

  const { error: scheduleError } = await supabase.from('challenge_schedules').insert({
    user_id: userId,
    challenge_id: challenge.id,
    frequency: form.frequency,
    weekly_days: form.frequency === 'weekly' ? form.weekly_days : null,
    monthly_rule: form.frequency === 'monthly' ? form.monthly_rule : null,
  })

  if (scheduleError) throw scheduleError
  return challenge as Challenge
}

export const updateChallengeWithSchedule = async (
  userId: string,
  challenge: Challenge,
  schedule: ChallengeSchedule | null,
  form: ChallengeFormValues,
) => {
  const { error } = await supabase
    .from('challenges')
    .update({
      title: form.title,
      description: form.description || null,
      type: form.type,
      unit: form.type === 'binary' ? null : form.unit,
      target_value: form.type === 'binary' ? null : form.target_value,
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: form.is_active,
    })
    .eq('id', challenge.id)

  if (error) throw error

  if (schedule) {
    const { error: scheduleError } = await supabase
      .from('challenge_schedules')
      .update({
        frequency: form.frequency,
        weekly_days: form.frequency === 'weekly' ? form.weekly_days : null,
        monthly_rule: form.frequency === 'monthly' ? form.monthly_rule : null,
      })
      .eq('id', schedule.id)

    if (scheduleError) throw scheduleError
  } else {
    const { error: scheduleInsertError } = await supabase.from('challenge_schedules').insert({
      user_id: userId,
      challenge_id: challenge.id,
      frequency: form.frequency,
      weekly_days: form.frequency === 'weekly' ? form.weekly_days : null,
      monthly_rule: form.frequency === 'monthly' ? form.monthly_rule : null,
    })
    if (scheduleInsertError) throw scheduleInsertError
  }
}

export const deleteChallenge = async (id: string) => {
  const { error } = await supabase.from('challenges').delete().eq('id', id)
  if (error) throw error
}

export interface CheckinInput {
  user_id: string
  challenge_id: string
  check_date: string
  value?: number | null
  done?: boolean | null
  note?: string | null
}

export const createCheckin = async (input: CheckinInput) => {
  const { data, error } = await supabase.from('checkins').insert(input).select().single()
  if (error) throw error
  return data as Checkin
}

export const deleteCheckin = async (id: string) => {
  const { error } = await supabase.from('checkins').delete().eq('id', id)
  if (error) throw error
}
