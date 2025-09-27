import { defaultAchievements } from '@/constants/achievements';
import { Achievement } from '@/types/achievement';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import { createGlobalState } from './use-global-state';

const ACHIEVEMENTS_KEY = '@riseup_achievements';

interface AchievementsState {
  achievements: Achievement[];
  newUnlocked: Achievement[];
}

const defaultState: AchievementsState = {
  achievements: defaultAchievements,
  newUnlocked: [],
};

const useGlobalAchievementsState = createGlobalState(defaultState);

export function useAchievements() {
  const [state, setState] = useGlobalAchievementsState();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    let isMounted = true;
    
    const loadAchievements = async () => {
      try {
        const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
        const achievements = data ? JSON.parse(data) : defaultAchievements;

        if (isMounted) {
          setState(prev => ({
            ...prev,
            achievements,
          }));
        }
      } catch (error) {
        console.error('Error loading achievements:', error);
      }
    };

    loadAchievements();
    
    return () => {
      isMounted = false;
    };
  }, []); // Порожній масив залежностей

  const saveAchievements = useCallback(async (achievements: Achievement[]) => {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setState(prev => {
      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlocked) {
          const unlockedAchievement = {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };

          // Haptic feedback
          if (process.env.EXPO_OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          return unlockedAchievement;
        }
        return achievement;
      });

      const newlyUnlocked = updatedAchievements.find(a => a.id === achievementId && a.unlocked);
      const newUnlocked = newlyUnlocked ? [newlyUnlocked] : [];

      saveAchievements(updatedAchievements);

      return {
        achievements: updatedAchievements,
        newUnlocked,
      };
    });
  }, [setState, saveAchievements]);

  const updateProgress = useCallback((achievementId: string, progress: number) => {
    setState(prev => {
      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlocked) {
          const updatedAchievement = {
            ...achievement,
            progress: Math.min(progress, achievement.requirement),
          };

          // Check if achievement should be unlocked
          if (updatedAchievement.progress >= updatedAchievement.requirement) {
            return {
              ...updatedAchievement,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            };
          }

          return updatedAchievement;
        }
        return achievement;
      });

      saveAchievements(updatedAchievements);

      return {
        ...prev,
        achievements: updatedAchievements,
      };
    });
  }, [setState, saveAchievements]);

  const clearNewUnlocked = useCallback(() => {
    setState(prev => ({
      ...prev,
      newUnlocked: [],
    }));
  }, [setState]);

  const checkAchievements = useCallback((data: {
    streaks?: { [habitId: string]: number };
    totalCompletions?: number;
    perfectDays?: number;
    level?: number;
    currentTime?: Date;
  }) => {
    const { streaks = {}, totalCompletions = 0, perfectDays = 0, level = 1, currentTime = new Date() } = data;
    
    // Check streak achievements
    const maxStreak = Math.max(...Object.values(streaks), 0);
    updateProgress('streak_3', maxStreak);
    updateProgress('streak_7', maxStreak);
    updateProgress('streak_30', maxStreak);

    // Check completion achievements
    updateProgress('complete_100', totalCompletions);
    updateProgress('perfect_day', perfectDays);

    // Check level achievements
    updateProgress('level_5', level);
    updateProgress('level_10', level);

    // Check time-based achievements
    const hour = currentTime.getHours();
    if (hour < 7) {
      updateProgress('early_bird', 1);
    }
    if (hour >= 22) {
      updateProgress('night_owl', 1);
    }
  }, [updateProgress]);

  return {
    achievements: state.achievements,
    newUnlocked: state.newUnlocked,
    unlockAchievement,
    updateProgress,
    clearNewUnlocked,
    checkAchievements,
  };
}