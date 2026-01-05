export type GoalType = "number" | "checkbox" | "weight";

export type Goal = {
    id: string;
    user_id: string;
    title: string;
    category: string;
    type: GoalType;
    current_value: number;
    target_value: number | null;
    unit: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type Habit = {
    id: string;
    user_id: string;
    title: string;
    is_active: boolean;
    created_at: string;
};

export type HabitCheck = {
    id: string;
    habit_id: string;
    user_id: string;
    check_date: string;
    done: boolean;
};

export type MonthlyChallenge = {
    id: string;
    user_id: string;
    month_key: string;
    title: string;
    is_active: boolean;
    created_at: string;
};

export type MonthlyChallengeCheck = {
    id: string;
    challenge_id: string;
    user_id: string;
    check_date: string;
    done: boolean;
};