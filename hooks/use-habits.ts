import { CharacterState, DailyStats, Habit } from '@/types/habit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const HABITS_KEY = '@riseup_habits';
const CHARACTER_KEY = '@riseup_character';
const STATS_KEY = '@riseup_stats';

const defaultHabits: Habit[] = [
  {
    id: '1',
    name: 'Пити воду',
    icon: '💧',
    completed: false,
    streak: 0,
  },
  {
    id: '2',
    name: 'Тренування',
    icon: '💪',
    completed: false,
    streak: 0,
  },
  {
    id: '3',
    name: 'Медитація',
    icon: '🧘',
    completed: false,
    streak: 0,
  },
  {
    id: '4',
    name: 'Читання',
    icon: '📚',
    completed: false,
    streak: 0,
  },
];

const defaultCharacter: CharacterState = {
  level: 1,
  health: 100,
  maxHealth: 100,
  experience: 0,
  maxExperience: 100,
  state: 'normal',
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [character, setCharacter] = useState<CharacterState>(defaultCharacter);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsData, characterData, statsData] = await Promise.all([
        AsyncStorage.getItem(HABITS_KEY),
        AsyncStorage.getItem(CHARACTER_KEY),
        AsyncStorage.getItem(STATS_KEY),
      ]);

      if (habitsData) {
        setHabits(JSON.parse(habitsData));
      }
      if (characterData) {
        setCharacter(JSON.parse(characterData));
      }
      if (statsData) {
        setDailyStats(JSON.parse(statsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(newHabits));
      setHabits(newHabits);
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const saveCharacter = async (newCharacter: CharacterState) => {
    try {
      await AsyncStorage.setItem(CHARACTER_KEY, JSON.stringify(newCharacter));
      setCharacter(newCharacter);
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  const saveDailyStats = async (stats: DailyStats) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
      setDailyStats(stats);
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };

  const toggleHabit = async (habitId: string) => {
    const today = new Date().toDateString();
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const wasCompleted = habit.completed;
        const newCompleted = !wasCompleted;
        
        return {
          ...habit,
          completed: newCompleted,
          streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
          lastCompleted: newCompleted ? today : habit.lastCompleted,
        };
      }
      return habit;
    });

    await saveHabits(updatedHabits);
    await updateCharacterProgress(updatedHabits);
    await updateDailyStats(updatedHabits);
  };

  const updateCharacterProgress = async (currentHabits: Habit[]) => {
    const completedCount = currentHabits.filter(h => h.completed).length;
    const totalCount = currentHabits.length;
    const completionRate = completedCount / totalCount;

    let newCharacter = { ...character };
    
    // Gain/lose experience based on completion rate
    const expChange = completedCount * 20 - (totalCount - completedCount) * 10;
    newCharacter.experience = Math.max(0, Math.min(newCharacter.maxExperience, newCharacter.experience + expChange));

    // Update health based on completion rate
    if (completionRate >= 0.8) {
      newCharacter.health = Math.min(newCharacter.maxHealth, newCharacter.health + 10);
      newCharacter.state = 'strong';
    } else if (completionRate >= 0.5) {
      newCharacter.state = 'normal';
    } else {
      newCharacter.health = Math.max(20, newCharacter.health - 15);
      newCharacter.state = 'weak';
    }

    // Level up if experience is maxed
    if (newCharacter.experience >= newCharacter.maxExperience) {
      newCharacter.level += 1;
      newCharacter.experience = 0;
      newCharacter.maxExperience += 50;
      newCharacter.maxHealth += 20;
      newCharacter.health = newCharacter.maxHealth;
    }

    await saveCharacter(newCharacter);
  };

  const updateDailyStats = async (currentHabits: Habit[]) => {
    const today = new Date().toDateString();
    const completedCount = currentHabits.filter(h => h.completed).length;
    const totalCount = currentHabits.length;

    const stats: DailyStats = {
      date: today,
      completedHabits: completedCount,
      totalHabits: totalCount,
      experienceGained: completedCount * 20,
    };

    await saveDailyStats(stats);
  };

  const resetDailyHabits = async () => {
    const resetHabits = habits.map(habit => ({
      ...habit,
      completed: false,
    }));
    await saveHabits(resetHabits);
  };

  return {
    habits,
    character,
    dailyStats,
    loading,
    toggleHabit,
    resetDailyHabits,
  };
}