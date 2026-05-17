export type Category = 'school' | 'gym' | 'skill' | 'bilingual' | 'reading' | 'personal' | 'travel';
export type Status = 'pending' | 'in-progress' | 'done' | 'skipped';

export interface ActivityBlock {
  id: string;
  date: string;
  category: Category;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  status: Status;
  note: string | null;
  energy_after: number | null;
  template_id: string | null;
  is_fixed: boolean;
}

export interface Streak {
  category: Category;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
}

export interface BilingualEntry {
  id: string;
  date: string;
  vocabulary_score: number | null;
  speaking_score: number | null;
  listening_score: number | null;
  words_learned: number;
  minutes_practiced: number;
  note: string | null;
}

export interface BilingualStats {
  total_minutes: number;
  avg_daily_minutes: number;
  avg_score: number;
  hours_logged: number;
  hours_to_b2: number;
  estimated_days_to_b2: number | null;
}

export interface DailySummary {
  date: string;
  total_planned: number;
  total_completed: number;
  total_skipped: number;
  completion_rate: number;
  categories: Partial<Record<Category, { planned: number; completed: number; skipped: number }>>;
}

export interface WeekDay {
  date: string;
  total: number;
  completed: number;
  skipped: number;
  completion_rate: number;
  gym_done: number;
  bilingual_done: number;
  reading_done: number;
  skill_done: number;
}

export interface WeeklySummary {
  start: string;
  days: WeekDay[];
  best_day: WeekDay | null;
  overall_completion_rate: number;
  total_completed: number;
  total_planned: number;
}

export interface Prediction {
  date: string;
  predicted_completion_rate: number;
  risk_flags: string[];
  suggestions: string[];
  category_risks: Partial<Record<Category, { skip_rate: number; avg_delay_min: number }>>;
}

export interface BilingualTip {
  fr: string;
  en: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  school:    '#2563eb',
  gym:       '#f97316',
  skill:     '#22c55e',
  bilingual: '#a855f7',
  reading:   '#eab308',
  personal:  '#ef4444',
  travel:    '#6b7280',
};

export const CATEGORY_BG: Record<Category, string> = {
  school:    'bg-blue-600',
  gym:       'bg-orange-500',
  skill:     'bg-green-500',
  bilingual: 'bg-purple-500',
  reading:   'bg-yellow-500',
  personal:  'bg-red-500',
  travel:    'bg-gray-500',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  school:    'École',
  gym:       'Gym',
  skill:     'Compétences',
  bilingual: 'Bilingue',
  reading:   'Lecture',
  personal:  'Personnel',
  travel:    'Transport',
};

export const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
