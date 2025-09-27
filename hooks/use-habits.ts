import { firebaseService } from '@/services/FirebaseService';
import { CharacterState, DailyStats } from '@/types/habit';
import { analytics } from '@/utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';

const CHARACTER_KEY = '@riseup_character';
const STATS_KEY = '@riseup_stats';
const TOTAL_COMPLETIONS_KEY = '@riseup_total_completions';

const defaultCharacter: CharacterState = {
  level: 1,
  health: 100,
  maxHealth: 100,
  experience: 0,
  maxExperience: 100,
  state: 'normal',
};

interface HabitsState {
  character: CharacterState;
  dailyStats: DailyStats | null;
  totalCompletions: number;
}

const defaultHabitsState: HabitsState = {
  character: defaultCharacter,
  dailyStats: null,
  totalCompletions: 0,
};

export function useHabits() {
  const [state, setState] = useState(defaultHabitsState);
  const { authState } = useAuth();
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  // Завантажуємо дані тільки один раз при ініціалізації
  useEffect(() => {
    if (!authState.user?.id) return;
    if (isInitialized.current) return;
    
    isInitialized.current = true;
    
    const loadData = async () => {
      try {
        console.log('🔄 Loading habits data from storage...');
        
        let character = defaultCharacter;
        let dailyStats = null;
        let totalCompletions = 0;
        
        try {
          if (authState.user) {
            const firebaseCharacter = await firebaseService.getCharacterState(authState.user.id);
          
            if (firebaseCharacter) character = firebaseCharacter;
          }
        } catch (error) {
          console.log('Firebase load failed, using local data:', error);
        }
        
        // Fallback to AsyncStorage
        const characterData = await AsyncStorage.getItem(CHARACTER_KEY);
        const statsData = await AsyncStorage.getItem(STATS_KEY);
        const totalCompletionsData = await AsyncStorage.getItem(TOTAL_COMPLETIONS_KEY);

        if (characterData) character = JSON.parse(characterData);
        if (statsData) dailyStats = JSON.parse(statsData);
        if (totalCompletionsData) totalCompletions = JSON.parse(totalCompletionsData);

        console.log('✅ Loaded character:', character);
        console.log('✅ Loaded stats:', dailyStats);
        console.log('✅ Loaded total completions:', totalCompletions);

        setState({
          character,
          dailyStats,
          totalCompletions,
        });
      } catch (error) {
        console.error('❌ Error loading habits data:', error);
        setState(defaultHabitsState);
      }
    };

    loadData();
  }, []); // Порожній масив залежностей

  // Функція для оновлення персонажа (викликається ззовні)
  const updateCharacterProgress = useCallback((customHabits: any[]) => {
    if (!authState.user) return;
    
    const customCompletedCount = customHabits.filter(h => h.completed).length;
    const completedCount = customCompletedCount;
    const totalCount = customHabits.length;
    const completionRate = totalCount > 0 ? completedCount / totalCount : 0;

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
        
        // Track level up
        analytics.trackLevelUp(newCharacter.level, authState.user?.id);
      }

      // Зберігаємо в AsyncStorage
      const savePromises = [
        AsyncStorage.setItem(CHARACTER_KEY, JSON.stringify(newCharacter))
      ];
      
      if (authState.user) {
        savePromises.push(firebaseService.saveCharacterState(authState.user.id, newCharacter));
      }
      
      Promise.all(savePromises)
        .then(() => console.log('✅ Character saved to storage'))
        .catch(error => console.error('❌ Error saving character:', error));

      return {
        ...prevState,
        character: newCharacter,
      };
    });
  }, [authState.user]);

  // Функція для оновлення статистики (викликається ззовні)
  const updateDailyStats = useCallback((customHabits: any[]) => {
    const today = new Date().toDateString();
    const customCompletedCount = customHabits.filter(h => h.completed).length;
    const completedCount = customCompletedCount;
    const totalCount = customHabits.length;

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
  }, []);

  return {
    character: state.character,
    dailyStats: state.dailyStats,
    totalCompletions: state.totalCompletions,
    loading: false,
    updateCharacterProgress,
    updateDailyStats,
  };
}