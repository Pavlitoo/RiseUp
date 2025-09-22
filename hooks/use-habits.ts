import { CharacterState, DailyStats, Habit } from '@/types/habit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect } from 'react';
import { createGlobalState } from './use-global-state';

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

interface HabitsState {
  habits: Habit[];
  character: CharacterState;
  dailyStats: DailyStats | null;
}

const defaultHabitsState: HabitsState = {
  habits: defaultHabits,
  character: defaultCharacter,
  dailyStats: null,
};

// Створюємо глобальний стан для звичок
const useGlobalHabitsState = createGlobalState(defaultHabitsState);

export function useHabits() {
  const [state, setState] = useGlobalHabitsState();

  // Завантажуємо дані тільки один раз при ініціалізації
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        console.log('🔄 Loading habits data from storage...');
        
        const habitsData = await AsyncStorage.getItem(HABITS_KEY);
        const characterData = await AsyncStorage.getItem(CHARACTER_KEY);
        const statsData = await AsyncStorage.getItem(STATS_KEY);

        const habits = habitsData ? JSON.parse(habitsData) : defaultHabits;
        const character = characterData ? JSON.parse(characterData) : defaultCharacter;
        const dailyStats = statsData ? JSON.parse(statsData) : null;

        console.log('✅ Loaded habits:', habits);
        console.log('✅ Loaded character:', character);
        console.log('✅ Loaded stats:', dailyStats);

        if (isMounted) {
          setState({
            habits,
            character,
            dailyStats,
          });
        }
      } catch (error) {
        console.error('❌ Error loading habits data:', error);
        if (isMounted) {
          setState(defaultHabitsState);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const updateCharacterProgress = useCallback((currentHabits: Habit[]) => {
    const completedCount = currentHabits.filter(h => h.completed).length;
    const totalCount = currentHabits.length;
    const completionRate = completedCount / totalCount;

    setState(prevState => {
      let newCharacter = { ...prevState.character };
      
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

      // Зберігаємо в AsyncStorage
      AsyncStorage.setItem(CHARACTER_KEY, JSON.stringify(newCharacter))
        .then(() => console.log('✅ Character saved to storage'))
        .catch(error => console.error('❌ Error saving character:', error));

      return {
        ...prevState,
        character: newCharacter,
      };
    });
  }, [setState]);

  const updateDailyStats = useCallback((currentHabits: Habit[]) => {
    const today = new Date().toDateString();
    const completedCount = currentHabits.filter(h => h.completed).length;
    const totalCount = currentHabits.length;

    const stats: DailyStats = {
      date: today,
      completedHabits: completedCount,
      totalHabits: totalCount,
      experienceGained: completedCount * 20,
    };

    setState(prevState => ({
      ...prevState,
      dailyStats: stats,
    }));
    
    // Зберігаємо в AsyncStorage
    AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats))
      .then(() => console.log('✅ Stats saved to storage'))
      .catch(error => console.error('❌ Error saving stats:', error));
  }, [setState]);

  const toggleHabit = useCallback(async (habitId: string) => {
    console.log('🔄 Toggling habit:', habitId);
    
    const today = new Date().toDateString();
    
    setState(prevState => {
      const updatedHabits = prevState.habits.map(habit => {
        if (habit.id === habitId) {
          const wasCompleted = habit.completed;
          const newCompleted = !wasCompleted;
          
          const updatedHabit = {
            ...habit,
            completed: newCompleted,
            streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            lastCompleted: newCompleted ? today : habit.lastCompleted,
          };
          
          console.log('✅ Updated habit:', updatedHabit);
          return updatedHabit;
        }
        return habit;
      });

      // Зберігаємо в AsyncStorage
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits))
        .then(() => {
          console.log('✅ Habits saved to storage');
          // Оновлюємо персонажа та статистику
          updateCharacterProgress(updatedHabits);
          updateDailyStats(updatedHabits);
        })
        .catch(error => console.error('❌ Error saving habits:', error));

      return {
        ...prevState,
        habits: updatedHabits,
      };
    });
  }, [setState, updateCharacterProgress, updateDailyStats]);

  const resetDailyHabits = useCallback(async () => {
    setState(prevState => {
      const resetHabits = prevState.habits.map(habit => ({
        ...habit,
        completed: false,
      }));
      
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(resetHabits))
        .then(() => console.log('✅ Daily habits reset'))
        .catch(error => console.error('❌ Error resetting habits:', error));
      
      return {
        ...prevState,
        habits: resetHabits,
      };
    });
  }, [setState]);

  return {
    habits: state.habits,
    character: state.character,
    dailyStats: state.dailyStats,
    loading: false, // Завжди false, оскільки стан завантажується асинхронно
    toggleHabit,
    resetDailyHabits,
  };
}