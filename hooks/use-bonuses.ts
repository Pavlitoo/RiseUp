import { firebaseService } from '@/services/FirebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from './use-auth';
import { createGlobalState } from './use-global-state';

const BONUSES_KEY = '@riseup_bonuses';

export interface Bonus {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'streak' | 'achievement' | 'special';
  reward: {
    experience: number;
    healthBoost?: number;
    specialEffect?: string;
    coins?: number;
  };
  requirement?: {
    type: 'streak' | 'completion' | 'perfect_days' | 'level';
    value: number;
  };
  claimed: boolean;
  unlockedAt?: string;
  claimedAt?: string;
  expiresAt?: string;
}

export interface DailyBonus {
  available: boolean;
  claimed: boolean;
  streak: number;
  multiplier: number;
  lastClaimedDate?: string;
  nextAvailableDate?: string;
}

interface BonusesState {
  bonuses: Bonus[];
  dailyBonus: DailyBonus;
  loading: boolean;
  initialized: boolean;
  lastLoadedUserId: string | null;
}

const defaultDailyBonus: DailyBonus = {
  available: true,
  claimed: false,
  streak: 1,
  multiplier: 1,
};

const defaultBonuses: Bonus[] = [
  {
    id: 'first_habit_completion',
    name: 'Перший крок',
    description: 'Виконайте свою першу звичку',
    icon: '🎯',
    type: 'achievement',
    reward: {
      experience: 50,
      coins: 25,
    },
    requirement: {
      type: 'completion',
      value: 1,
    },
    claimed: false,
  },
  {
    id: 'streak_3_days',
    name: 'Три дні поспіль',
    description: 'Підтримуйте серію 3 дні',
    icon: '🔥',
    type: 'streak',
    reward: {
      experience: 100,
      coins: 50,
      healthBoost: 20,
    },
    requirement: {
      type: 'streak',
      value: 3,
    },
    claimed: false,
  },
  {
    id: 'streak_7_days',
    name: 'Тиждень дисципліни',
    description: 'Підтримуйте серію 7 днів',
    icon: '💪',
    type: 'streak',
    reward: {
      experience: 200,
      coins: 100,
      healthBoost: 30,
      specialEffect: 'golden_aura',
    },
    requirement: {
      type: 'streak',
      value: 7,
    },
    claimed: false,
  },
  {
    id: 'perfect_week',
    name: 'Ідеальний тиждень',
    description: 'Виконайте всі звички протягом тижня',
    icon: '⭐',
    type: 'weekly',
    reward: {
      experience: 300,
      coins: 150,
      specialEffect: 'rainbow_effect',
    },
    requirement: {
      type: 'perfect_days',
      value: 7,
    },
    claimed: false,
  },
  {
    id: 'level_5_bonus',
    name: 'П\'ятий рівень',
    description: 'Досягніть 5 рівня',
    icon: '🏆',
    type: 'achievement',
    reward: {
      experience: 250,
      coins: 200,
      healthBoost: 50,
    },
    requirement: {
      type: 'level',
      value: 5,
    },
    claimed: false,
  },
  {
    id: 'comeback_bonus',
    name: 'Повернення',
    description: 'Поверніться після перерви',
    icon: '🌟',
    type: 'special',
    reward: {
      experience: 150,
      coins: 75,
      healthBoost: 25,
    },
    claimed: false,
  },
];

const defaultState: BonusesState = {
  bonuses: [...defaultBonuses],
  dailyBonus: { ...defaultDailyBonus },
  loading: false,
  initialized: false,
  lastLoadedUserId: null,
};

const useGlobalBonusesState = createGlobalState(defaultState);

// Утилітні функції поза компонентом
const checkDailyBonusAvailability = (dailyBonus: DailyBonus): DailyBonus => {
  const today = new Date().toDateString();
  const lastClaimedDate = dailyBonus?.lastClaimedDate;
  
  if (!lastClaimedDate) {
    return {
      ...dailyBonus,
      available: true,
      claimed: false,
    };
  }

  const lastClaimed = new Date(lastClaimedDate);
  const todayDate = new Date(today);
  const diffTime = todayDate.getTime() - lastClaimed.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 1) {
    const newStreak = diffDays === 1 ? (dailyBonus.streak || 1) + 1 : 1;
    const newMultiplier = Math.min(Math.floor(newStreak / 7) + 1, 5);
    
    return {
      ...dailyBonus,
      available: true,
      claimed: false,
      streak: newStreak,
      multiplier: newMultiplier,
    };
  }

  return dailyBonus;
};

const ensureBonusesArray = (bonuses: any): Bonus[] => {
  return Array.isArray(bonuses) && bonuses.length > 0 ? bonuses : [...defaultBonuses];
};

const ensureDailyBonus = (dailyBonus: any): DailyBonus => {
  return dailyBonus && typeof dailyBonus === 'object' ? { ...defaultDailyBonus, ...dailyBonus } : { ...defaultDailyBonus };
};

export function useBonuses() {
  const [state, setState] = useGlobalBonusesState();
  const { authState } = useAuth();
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  const currentUserId = authState.user?.id || null;

  // Мемоізований обробник для збереження
  const saveToStorage = useMemo(() => {
    return async (bonuses: Bonus[], dailyBonus: DailyBonus, userId?: string) => {
      try {
        const safeBonuses = ensureBonusesArray(bonuses);
        const safeDailyBonus = ensureDailyBonus(dailyBonus);
        const data = { bonuses: safeBonuses, dailyBonus: safeDailyBonus };
        
        // Асинхронне збереження без очікування
        AsyncStorage.setItem(BONUSES_KEY, JSON.stringify(data)).catch(console.error);
        
        if (userId) {
          firebaseService.saveBonuses(userId, data).catch(console.error);
        }
      } catch (error) {
        console.error('Error saving bonuses:', error);
      }
    };
  }, []);

  // Основний useEffect для завантаження даних
  useEffect(() => {
    // Запобігання повторному завантаженню
    if (loadingRef.current) return;
    if (state.initialized) return;

    const loadData = async () => {
      if (!mountedRef.current) return;
      
      loadingRef.current = true;
      
      try {
        setState(prev => ({ 
          ...prev, 
          loading: true,
        }));

        let bonuses = [...defaultBonuses];
        let dailyBonus = { ...defaultDailyBonus };

        if (currentUserId) {
          try {
            // Спробуємо завантажити з Firebase
            const firebaseData = await firebaseService.getBonuses(currentUserId);
            if (firebaseData) {
              bonuses = ensureBonusesArray(firebaseData.bonuses);
              dailyBonus = ensureDailyBonus(firebaseData.dailyBonus);
            }
          } catch (firebaseError) {
            console.log('Firebase failed, trying local storage:', firebaseError);
            
            try {
              // Fallback до AsyncStorage
              const localData = await AsyncStorage.getItem(BONUSES_KEY);
              if (localData) {
                const parsed = JSON.parse(localData);
                bonuses = ensureBonusesArray(parsed.bonuses);
                dailyBonus = ensureDailyBonus(parsed.dailyBonus);
              }
            } catch (storageError) {
              console.log('Local storage failed, using defaults:', storageError);
            }
          }
        }

        // Перевіряємо щоденний бонус
        const updatedDailyBonus = checkDailyBonusAvailability(dailyBonus);
        
        if (mountedRef.current) {
          setState({
            bonuses: ensureBonusesArray(bonuses),
            dailyBonus: updatedDailyBonus,
            loading: false,
            initialized: true,
            lastLoadedUserId: currentUserId,
          });
        }

      } catch (error) {
        console.error('Error loading bonuses:', error);
        if (mountedRef.current) {
          setState({
            bonuses: [...defaultBonuses],
            dailyBonus: { ...defaultDailyBonus },
            loading: false,
            initialized: true,
            lastLoadedUserId: currentUserId,
          });
        }
      } finally {
        loadingRef.current = false;
      }
    };

    loadData();

    return () => {
      mountedRef.current = false;
    };
  }, []); // Порожній масив залежностей

  // Callback функції
  const claimDailyBonus = useCallback(() => {
    const today = new Date().toDateString();
    
    setState(prev => {
      const updatedDailyBonus = {
        ...prev.dailyBonus,
        claimed: true,
        lastClaimedDate: today,
      };
      
      const safeBonuses = ensureBonusesArray(prev.bonuses);
      
      // Асинхронне збереження
      saveToStorage(safeBonuses, updatedDailyBonus, currentUserId || undefined);
      
      return {
        ...prev,
        dailyBonus: updatedDailyBonus,
      };
    });
  }, [saveToStorage, currentUserId]);

  const unlockBonus = useCallback((bonusId: string) => {
    setState(prev => {
      const safeBonuses = ensureBonusesArray(prev.bonuses);
      const updatedBonuses = safeBonuses.map(bonus => {
        if (bonus.id === bonusId && !bonus.claimed && !bonus.unlockedAt) {
          return {
            ...bonus,
            unlockedAt: new Date().toISOString(),
          };
        }
        return bonus;
      });
      
      saveToStorage(updatedBonuses, prev.dailyBonus, currentUserId || undefined);
      
      return {
        ...prev,
        bonuses: updatedBonuses,
      };
    });
  }, [saveToStorage, currentUserId]);

  const claimBonus = useCallback((bonusId: string) => {
    setState(prev => {
      const safeBonuses = ensureBonusesArray(prev.bonuses);
      const updatedBonuses = safeBonuses.map(bonus => {
        if (bonus.id === bonusId && !bonus.claimed && bonus.unlockedAt) {
          return {
            ...bonus,
            claimed: true,
            claimedAt: new Date().toISOString(),
          };
        }
        return bonus;
      });
      
      saveToStorage(updatedBonuses, prev.dailyBonus, currentUserId || undefined);
      
      return {
        ...prev,
        bonuses: updatedBonuses,
      };
    });
  }, [saveToStorage, currentUserId]);

  const checkBonusRequirements = useCallback((data: {
    streaks?: { [habitId: string]: number };
    totalCompletions?: number;
    perfectDays?: number;
    level?: number;
    isComeback?: boolean;
  }) => {
    const { streaks = {}, totalCompletions = 0, perfectDays = 0, level = 1, isComeback = false } = data;
    
    setState(prev => {
      const safeBonuses = ensureBonusesArray(prev.bonuses);
      let hasChanges = false;
      
      const updatedBonuses = safeBonuses.map(bonus => {
        if (bonus.claimed || bonus.unlockedAt) return bonus;
        
        let shouldUnlock = false;
        
        if (bonus.requirement) {
          switch (bonus.requirement.type) {
            case 'streak':
              const maxStreak = Object.keys(streaks).length > 0 ? Math.max(...Object.values(streaks), 0) : 0;
              shouldUnlock = maxStreak >= bonus.requirement.value;
              break;
            case 'completion':
              shouldUnlock = totalCompletions >= bonus.requirement.value;
              break;
            case 'perfect_days':
              shouldUnlock = perfectDays >= bonus.requirement.value;
              break;
            case 'level':
              shouldUnlock = level >= bonus.requirement.value;
              break;
          }
        } else if (bonus.type === 'special' && bonus.id === 'comeback_bonus') {
          shouldUnlock = isComeback;
        }
        
        if (shouldUnlock) {
          hasChanges = true;
          return {
            ...bonus,
            unlockedAt: new Date().toISOString(),
          };
        }
        
        return bonus;
      });
      
      if (hasChanges) {
        saveToStorage(updatedBonuses, prev.dailyBonus, currentUserId || undefined);
        return {
          ...prev,
          bonuses: updatedBonuses,
        };
      }
      
      return prev;
    });
  }, [saveToStorage, currentUserId]);

  // Getter функції
  const getAvailableBonuses = useCallback(() => {
    const safeBonuses = ensureBonusesArray(state.bonuses);
    return safeBonuses.filter(bonus => bonus.unlockedAt && !bonus.claimed);
  }, [state.bonuses]);

  const getUnclaimedCount = useMemo(() => {
    const safeBonuses = ensureBonusesArray(state.bonuses);
    return safeBonuses.filter(bonus => bonus.unlockedAt && !bonus.claimed).length;
  }, [state.bonuses]);

  const getClaimedBonuses = useCallback(() => {
    const safeBonuses = ensureBonusesArray(state.bonuses);
    return safeBonuses.filter(bonus => bonus.claimed);
  }, [state.bonuses]);

  const getBonusByType = useCallback((type: Bonus['type']) => {
    const safeBonuses = ensureBonusesArray(state.bonuses);
    return safeBonuses.filter(bonus => bonus.type === type);
  }, [state.bonuses]);

  const getTotalRewardsEarned = useCallback(() => {
    const claimedBonuses = getClaimedBonuses();
    return claimedBonuses.reduce((total, bonus) => ({
      experience: total.experience + (bonus.reward?.experience || 0),
      coins: total.coins + (bonus.reward?.coins || 0),
      healthBoost: total.healthBoost + (bonus.reward?.healthBoost || 0),
    }), { experience: 0, coins: 0, healthBoost: 0 });
  }, [getClaimedBonuses]);

  const addCustomBonus = useCallback((bonus: Omit<Bonus, 'id' | 'claimed'>) => {
    const newBonus: Bonus = {
      ...bonus,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      claimed: false,
      unlockedAt: new Date().toISOString(),
    };
    
    setState(prev => {
      const safeBonuses = ensureBonusesArray(prev.bonuses);
      const updatedBonuses = [...safeBonuses, newBonus];
      
      saveToStorage(updatedBonuses, prev.dailyBonus, currentUserId || undefined);
      
      return {
        ...prev,
        bonuses: updatedBonuses,
      };
    });
    
    return newBonus.id;
  }, [saveToStorage, currentUserId]);

  const removeExpiredBonuses = useCallback(() => {
    const now = new Date();
    
    setState(prev => {
      const safeBonuses = ensureBonusesArray(prev.bonuses);
      const updatedBonuses = safeBonuses.filter(bonus => {
        if (!bonus.expiresAt) return true;
        return new Date(bonus.expiresAt) > now;
      });
      
      if (updatedBonuses.length !== safeBonuses.length) {
        saveToStorage(updatedBonuses, prev.dailyBonus, currentUserId || undefined);
        return {
          ...prev,
          bonuses: updatedBonuses,
        };
      }
      
      return prev;
    });
  }, [saveToStorage, currentUserId]);

  // Cleanup effect для removeExpiredBonuses
  useEffect(() => {
    if (!state.initialized) return;
    
    const interval = setInterval(removeExpiredBonuses, 60000);
    return () => clearInterval(interval);
  }, [removeExpiredBonuses, state.initialized]);

  // Безпечне повернення даних
  return {
    bonuses: ensureBonusesArray(state.bonuses),
    dailyBonus: ensureDailyBonus(state.dailyBonus),
    loading: state.loading || false,
    initialized: state.initialized || false,
    claimDailyBonus,
    unlockBonus,
    claimBonus,
    checkBonusRequirements,
    getAvailableBonuses,
    getUnclaimedCount,
    getClaimedBonuses,
    getBonusByType,
    getTotalRewardsEarned,
    addCustomBonus,
    removeExpiredBonuses,
  };
}