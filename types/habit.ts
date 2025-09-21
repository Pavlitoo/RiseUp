export interface Habit {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  streak: number;
  lastCompleted?: string;
}

export interface CharacterState {
  level: number;
  health: number;
  maxHealth: number;
  experience: number;
  maxExperience: number;
  state: 'strong' | 'normal' | 'weak';
}

export interface DailyStats {
  date: string;
  completedHabits: number;
  totalHabits: number;
  experienceGained: number;
}