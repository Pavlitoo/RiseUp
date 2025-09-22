export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  type: 'streak' | 'completion' | 'level' | 'special';
  requirement: number;
  progress: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'streak' | 'motivation';
  scheduledFor: string;
  completed: boolean;
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  startDate: string;
  endDate: string;
  targetHabits: string[];
  targetCompletions: number;
  reward: string;
  progress: number;
  completed: boolean;
}