export interface CustomHabit {
  id: string;
  name: string;
  description?: string;
  icon: string; // emoji or icon name
  color: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number; // how many times per frequency period
  currentCount: number; // current progress in this period
  streak: number;
  completed: boolean;
  lastCompleted?: string;
  createdAt: string;
  updatedAt: string;
  // Deadline functionality
  deadline?: string; // ISO date string for habit deadline
  // Time-based settings
  reminderTime?: string; // HH:MM format
  // Progress tracking
  totalCompletions: number;
  bestStreak: number;
  // Visual settings
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  suggestedFrequency: 'daily' | 'weekly' | 'monthly';
  suggestedTarget: number;
}