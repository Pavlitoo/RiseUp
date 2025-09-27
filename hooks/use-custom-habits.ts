import { CustomHabit } from '@/types/custom-habit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const CUSTOM_HABITS_KEY = '@riseup_custom_habits';

interface CustomHabitsState {
  habits: CustomHabit[];
  loading: boolean;
}

const defaultState: CustomHabitsState = {
  habits: [],
  loading: false,
};

export function useCustomHabits() {
  const [state, setState] = useState(defaultState);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    const loadHabits = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const data = await AsyncStorage.getItem(CUSTOM_HABITS_KEY);
        const habits = data ? JSON.parse(data) : [];

        setState({
          habits,
          loading: false,
        });
      } catch (error) {
        console.error('Error loading custom habits:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadHabits();
  }, []); // Порожній масив залежностей

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
  }, [saveHabits]);

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
  }, [saveHabits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    setState(prev => {
      const updatedHabits = prev.habits.filter(habit => habit.id !== habitId);
      saveHabits(updatedHabits);
      return {
        ...prev,
        habits: updatedHabits,
      };
    });
  }, [saveHabits]);

  const toggleHabit = useCallback(async (habitId: string) => {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    setState(prev => {
      const updatedHabits = prev.habits.map(habit => {
        if (habit.id === habitId) {
          const wasCompleted = habit.completed;
          const newCompleted = !wasCompleted;
          const lastCompletedDate = habit.lastCompleted;
          
          let newCurrentCount = habit.currentCount;
          let newTotalCompletions = habit.totalCompletions;
          let newStreak = habit.streak;
          let newBestStreak = habit.bestStreak;
          
          if (newCompleted && !wasCompleted) {
            newCurrentCount += 1;
            newTotalCompletions += 1;
            
            // Smart streak calculation
            if (lastCompletedDate === yesterdayString) {
              newStreak += 1;
            } else if (lastCompletedDate === today) {
              // Same day completion, don't change streak
            } else {
              // Gap in completion, reset streak
              newStreak = 1;
            }
            
            newBestStreak = Math.max(newBestStreak, newStreak);
          } else if (!newCompleted && wasCompleted) {
            newCurrentCount = Math.max(0, newCurrentCount - 1);
            newTotalCompletions = Math.max(0, newTotalCompletions - 1);
            // Don't reduce streak when uncompleting, only when missing days
          }
          
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
      
      return {
        ...prev,
        habits: updatedHabits,
      };
    });
  }, [saveHabits]);

  const resetPeriodProgress = useCallback(async () => {
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
  }, [saveHabits]);

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
    getTotalProgress,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    resetPeriodProgress,
    getHabitsByCategory,
    getCompletedHabitsToday,
  };
}