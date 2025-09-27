import { useAchievements } from '@/hooks/use-achievements';
import { useAuth } from '@/hooks/use-auth';
import { useCoins } from '@/hooks/use-coins';
import { useCustomHabits } from '@/hooks/use-custom-habits';
import { useHabits } from '@/hooks/use-habits';
import { useStatistics } from '@/hooks/use-statistics';
import { translationService } from '@/services/TranslationService';
import { CustomHabit } from '@/types/custom-habit';
import { useCallback, useEffect, useState } from 'react';

export function useTranslatedHabits() {
  const { habits, loading, toggleHabit: originalToggleHabit, ...habitActions } = useCustomHabits();
  const { updateCharacterProgress, updateDailyStats } = useHabits();
  const { checkAchievements } = useAchievements();
  const { addCoins } = useCoins();
  const { updateDailyRecord } = useStatistics();
  const { authState } = useAuth();
  const [translatedHabits, setTranslatedHabits] = useState<CustomHabit[]>([]);
  const [translating, setTranslating] = useState(false);

  const translateHabits = useCallback(async () => {
    if (habits.length === 0) {
      setTranslatedHabits([]);
      return;
    }

    setTranslating(true);
    
    try {
      const translated = await Promise.all(
        habits.map(habit => translationService.translateHabit(habit, authState.settings.language))
      );
      
      setTranslatedHabits(translated);
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslatedHabits(habits);
    } finally {
      setTranslating(false);
    }
  }, [habits, authState.settings.language]);

  useEffect(() => {
    translateHabits();
  }, [translateHabits]);

  // Обгортаємо toggleHabit для додавання логіки бонусів та досягнень
  const toggleHabit = useCallback(async (habitId: string) => {
    // Спочатку виконуємо оригінальний toggle
    await originalToggleHabit(habitId);
    
    // Отримуємо оновлені звички
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const wasCompleted = habit.completed;
        const newCompleted = !wasCompleted;
        
        if (newCompleted && !wasCompleted) {
          // Award coins for completion
          addCoins(10);
        }
        
        return { ...habit, completed: newCompleted };
      }
      return habit;
    });

    // Оновлюємо персонажа та статистику
    updateCharacterProgress(updatedHabits);
    updateDailyStats(updatedHabits);

    // Перевіряємо досягнення та бонуси
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
    
    // Removed checkBonuses call as it doesn't exist in useBonuses hook
    
    updateDailyRecord(
      completedHabits.map(h => h.id),
      updatedHabits.length
    );
  }, [originalToggleHabit, habits, addCoins, updateCharacterProgress, updateDailyStats, checkAchievements, updateDailyRecord]);

  return {
    habits: translatedHabits,
    loading: loading || translating,
    toggleHabit,
    ...habitActions,
  };
}