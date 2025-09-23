import { CustomHabit } from '@/types/custom-habit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect } from 'react';
import { useAchievements } from './use-achievements';
import { useBonuses } from './use-bonuses';
import { useCoins } from './use-coins';
import { createGlobalState } from './use-global-state';
import { useStatistics } from './use-statistics';

const CUSTOM_HABITS_KEY = '@riseup_custom_habits';

interface CustomHabitsState {
  habits: CustomHabit[];
  loading: boolean;
}

const defaultState: CustomHabitsState = {
  habits: [],
  loading: false,
};

const useGlobalCustomHabitsState = createGlobalState(defaultState);

export function useCustomHabits() {
  const [state, setState] = useGlobalCustomHabitsState();
  const { checkAchievements } = useAchievements();
  const { checkBonuses } = useBonuses();
  const { addCoins } = useCoins();
  const { updateDailyRecord } = useStatistics();

  useEffect(() => {
    let isMounted = true;
    
    const loadHabits = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const data = await AsyncStorage.getItem(CUSTOM_HABITS_KEY);
        const habits = data ? JSON.parse(data) : [];

        if (isMounted) {
          setState({
            habits,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error loading custom habits:', error);
        if (isMounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    loadHabits();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveHabits = useCallback(async (habits: CustomHabit[]) => {
    try {
      await AsyncStorage.setItem(CUSTOM_HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving custom habits:', error);
    }
  }, []);

  const createHabit = useCallback(async (habitData: Omit<CustomHabit, 'id' | 'createdAt' | 'updatedAt' | 'currentCount' | 'streak' | 'completed' | 'totalCompletions' | 'bestStreak'>) => {
    const newHabit: CustomHabit = {
      ...habitData,
      id: Date.now().toString(),
      currentCount: 0,
      streak: 0,
      completed: false,
      totalCompletions: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState(prev => {
      const updatedHabits = [...prev.habits, newHabit];
      saveHabits(updatedHabits);
      return {
        ...prev,
        habits: updatedHabits,
      };
    });

    return newHabit;
  }, [setState, saveHabits]);

  const updateHabit = useCallback(async (habitId: string, updates: Partial<CustomHabit>) => {
    setState(prev => {
      const updatedHabits = prev.habits.map(habit =>
        habit.id === habitId
          ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
          : habit
      );
      
      saveHabits(updatedHabits);
      return {
        ...prev,
        habits: updatedHabits,
      };
    });
  }, [setState, saveHabits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    setState(prev => {
      const updatedHabits = prev.habits.filter(habit => habit.id !== habitId);
      saveHabits(updatedHabits);
      return {
        ...prev,
        habits: updatedHabits,
      };
    });
  }, [setState, saveHabits]);

  const toggleHabit = useCallback(async (habitId: string) => {
    const today = new Date().toDateString();
    
    setState(prev => {
      const updatedHabits = prev.habits.map(habit => {
        if (habit.id === habitId) {
          const wasCompleted = habit.completed;
          const newCompleted = !wasCompleted;
          
          let newCurrentCount = habit.currentCount;
          let newTotalCompletions = habit.totalCompletions;
          let newStreak = habit.streak;
          let newBestStreak = habit.bestStreak;
          
          if (newCompleted && !wasCompleted) {
            newCurrentCount += 1;
            newTotalCompletions += 1;
            newStreak += 1;
            newBestStreak = Math.max(newBestStreak, newStreak);
            
            // Award coins for completion
            addCoins(10);
          } else if (!newCompleted && wasCompleted) {
            newCurrentCount = Math.max(0, newCurrentCount - 1);
            newTotalCompletions = Math.max(0, newTotalCompletions - 1);
            newStreak = Math.max(0, newStreak - 1);
          }
          
          // Check if target is reached
          const targetReached = newCurrentCount >= habit.targetCount;
          
          return {
            ...habit,
            completed: newCompleted,
            currentCount: newCurrentCount,
            totalCompletions: newTotalCompletions,
            streak: newStreak,
            bestStreak: newBestStreak,
            lastCompleted: newCompleted ? today : habit.lastCompleted,
            updatedAt: new Date().toISOString(),
          };
        }
        return habit;
      });

      saveHabits(updatedHabits);

      // Update statistics and check achievements
      const completedHabits = updatedHabits.filter(h => h.completed);
      const streaks = updatedHabits.reduce((acc, habit) => {
        acc[habit.id] = habit.streak;
        return acc;
      }, {} as { [key: string]: number });
      
      const totalCompletions = updatedHabits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
      const perfectDays = completedHabits.length === updatedHabits.length && updatedHabits.length > 0 ? 1 : 0;
      
      checkAchievements({
        streaks,
        totalCompletions,
        perfectDays,
        level: Math.floor(totalCompletions / 100) + 1,
        currentTime: new Date(),
      });
      
      checkBonuses({
        totalCompletions,
        perfectDays,
        currentStreak: Math.max(...Object.values(streaks), 0),
        completedToday: completedHabits.length,
        currentTime: new Date(),
      });
      
      updateDailyRecord(
        completedHabits.map(h => h.id),
        updatedHabits.length
      );

      return {
        ...prev,
        habits: updatedHabits,
      };
    });
  }, [setState, saveHabits, addCoins, checkAchievements, checkBonuses, updateDailyRecord]);

  const resetPeriodProgress = useCallback(async () => {
    // Reset current count for all habits (called daily/weekly/monthly)
    setState(prev => {
      const updatedHabits = prev.habits.map(habit => ({
        ...habit,
        currentCount: 0,
        completed: false,
        updatedAt: new Date().toISOString(),
      }));
      
      saveHabits(updatedHabits);
      return {
        ...prev,
        habits: updatedHabits,
      };
    });
  }, [setState, saveHabits]);

  const getHabitsByCategory = useCallback((category?: string) => {
    if (!category) return state.habits;
    return state.habits.filter(habit => habit.category === category);
  }, [state.habits]);

  const getCompletedHabitsToday = useCallback(() => {
    return state.habits.filter(habit => habit.completed);
  }, [state.habits]);

  const getTotalProgress = useCallback(() => {
    const totalHabits = state.habits.length;
    const completedHabits = state.habits.filter(habit => habit.completed).length;
    return totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  }, [state.habits]);

  return {
    habits: state.habits,
    loading: state.loading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    resetPeriodProgress,
    getHabitsByCategory,
    getCompletedHabitsToday,
    getTotalProgress,
  };
}