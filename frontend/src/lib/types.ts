export type ChallengeType = 'quantitative' | 'binary' | 'weight'
export type Frequency = 'daily' | 'weekly' | 'monthly'
export type MonthlyRule = 'first_day'

export interface Challenge {
  id: string
  user_id: string
  title: string
  description: string | null
  type: ChallengeType
  unit: string | null
  target_value: number | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChallengeSchedule {
  id: string
  user_id: string
  challenge_id: string
  frequency: Frequency
  weekly_days: number[] | null
  monthly_rule: MonthlyRule | null
  created_at: string
}

export interface Checkin {
  id: string
  user_id: string
  challenge_id: string
  check_date: string
  value: number | null
  done: boolean | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface ChallengeWithSchedule extends Challenge {
  challenge_schedules: ChallengeSchedule[]
}

export interface DayBucket {
  date: Date
  tasks: WeekTask[]
}

export interface WeekTask {
  challenge: Challenge
  schedule: ChallengeSchedule
  date: Date
  dateKey: string
  checkin?: Checkin
  isToday: boolean
  isPast: boolean
}
