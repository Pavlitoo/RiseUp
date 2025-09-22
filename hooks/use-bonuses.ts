import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect } from 'react';
import { createGlobalState } from './use-global-state';

const BONUSES_KEY = '@riseup_bonuses';

export interface Bonus {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'streak' | 'achievement';
  requirement: number;
  reward: {
    experience: number;
    healthBoost?: number;
    specialEffect?: string;
    coins?: number;
    characterUpgrade?: string;
  };
  unlocked: boolean;
  claimed: boolean;
  unlockedAt?: string;
  claimedAt?: string;
}

export interface DailyBonus {
  date: string;
  available: boolean;
  claimed: boolean;
  streak: number;
  multiplier: number;
}

interface BonusesState {
  bonuses: Bonus[];
  dailyBonus: DailyBonus;
  weeklyChallenge: {
    active: boolean;
    target: number;
    progress: number;
    reward: number;
    endsAt: string;
  };
}

const defaultBonuses: Bonus[] = [
  {
    id: 'first_habit',
    name: 'Перша звичка',
    description: 'Виконай свою першу звичку',
    icon: '🌟',
    type: 'achievement',
    requirement: 1,
    reward: { experience: 50, coins: 10 },
    unlocked: false,
    claimed: false,
  },
  {
    id: 'perfect_week',
    name: 'Ідеальний тиждень',
    description: 'Виконай всі звички протягом тижня',
    icon: '👑',
    type: 'weekly',
    requirement: 7,
    reward: { experience: 200, healthBoost: 20, coins: 50, characterUpgrade: 'golden_aura' },
    unlocked: false,
    claimed: false,
  },
  {
    id: 'streak_master',
    name: 'Майстер серій',
    description: 'Досягни серії в 30 днів',
    icon: '🔥',
    type: 'streak',
    requirement: 30,
    reward: { experience: 500, coins: 100, specialEffect: 'fire_aura', characterUpgrade: 'fire_master' },
    unlocked: false,
    claimed: false,
  },
  {
    id: 'early_bird_bonus',
    name: 'Рання пташка',
    description: 'Виконай звичку до 7:00 ранку',
    icon: '🌅',
    type: 'daily',
    requirement: 1,
    reward: { experience: 30, healthBoost: 5, coins: 5 },
    unlocked: false,
    claimed: false,
  },
  {
    id: 'consistency_king',
    name: 'Король постійності',
    description: 'Виконай звички 100 днів',
    icon: '💎',
    type: 'achievement',
    requirement: 100,
    reward: { experience: 1000, coins: 200, specialEffect: 'diamond_aura', characterUpgrade: 'diamond_master' },
    unlocked: false,
    claimed: false,
  },
  {
    id: 'habit_collector',
    name: 'Колекціонер звичок',
    description: 'Виконай кожну звичку мінімум 10 разів',
    icon: '🏆',
    type: 'achievement',
    requirement: 10,
    reward: { experience: 300, coins: 75, characterUpgrade: 'collector_badge' },
    unlocked: false,
    claimed: false,
  },
  {
    id: 'weekend_warrior',
    name: 'Воїн вихідних',
    description: 'Виконай всі звички у вихідні',
    icon: '⚔️',
    type: 'weekly',
    requirement: 2,
    reward: { experience: 150, coins: 30, healthBoost: 15 },
    unlocked: false,
    claimed: false,
  },
];

const defaultState: BonusesState = {
  bonuses: defaultBonuses,
  dailyBonus: {
    date: new Date().toISOString().split('T')[0],
    available: true,
    claimed: false,
    streak: 0,
    multiplier: 1,
  },
  weeklyChallenge: {
    active: false,
    target: 0,
    progress: 0,
    reward: 0,
    endsAt: '',
  },
};

const useGlobalBonusesState = createGlobalState(defaultState);

export function useBonuses() {
  const [state, setState] = useGlobalBonusesState();

  useEffect(() => {
    let isMounted = true;
    
    const loadBonuses = async () => {
      try {
        const data = await AsyncStorage.getItem(BONUSES_KEY);
        const bonusesData = data ? JSON.parse(data) : defaultState;

        if (isMounted) {
          setState(bonusesData);
        }
      } catch (error) {
        console.error('Error loading bonuses:', error);
      }
    };

    loadBonuses();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveBonuses = useCallback(async (bonusesState: BonusesState) => {
    try {
      await AsyncStorage.setItem(BONUSES_KEY, JSON.stringify(bonusesState));
    } catch (error) {
      console.error('Error saving bonuses:', error);
    }
  }, []);

  const checkBonuses = useCallback((data: {
    totalCompletions?: number;
    perfectDays?: number;
    currentStreak?: number;
    completedToday?: number;
    currentTime?: Date;
  }) => {
    const { 
      totalCompletions = 0, 
      perfectDays = 0, 
      currentStreak = 0, 
      completedToday = 0,
      currentTime = new Date() 
    } = data;

    setState(prev => {
      const newBonuses = prev.bonuses.map(bonus => {
        if (bonus.unlocked) return bonus;

        let shouldUnlock = false;

        switch (bonus.type) {
          case 'achievement':
            if (bonus.id === 'first_habit' && totalCompletions >= 1) shouldUnlock = true;
            if (bonus.id === 'consistency_king' && totalCompletions >= 100) shouldUnlock = true;
            break;
          case 'weekly':
            if (bonus.id === 'perfect_week' && perfectDays >= 7) shouldUnlock = true;
            break;
          case 'streak':
            if (bonus.id === 'streak_master' && currentStreak >= 30) shouldUnlock = true;
            break;
          case 'daily':
            if (bonus.id === 'early_bird_bonus' && currentTime.getHours() < 7 && completedToday > 0) {
              shouldUnlock = true;
            }
            break;
        }

        if (shouldUnlock) {
          return {
            ...bonus,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };
        }

        return bonus;
      });

      // Update daily bonus
      const today = new Date().toISOString().split('T')[0];
      let newDailyBonus = prev.dailyBonus;
      
      if (newDailyBonus.date !== today) {
        newDailyBonus = {
          date: today,
          available: true,
          claimed: false,
          streak: completedToday > 0 ? newDailyBonus.streak + 1 : 0,
          multiplier: Math.min(3, 1 + Math.floor(newDailyBonus.streak / 7) * 0.5),
        };
      }

      const newState = {
        ...prev,
        bonuses: newBonuses,
        dailyBonus: newDailyBonus,
      };

      saveBonuses(newState);
      return newState;
    });
  }, [setState, saveBonuses]);

  const claimBonus = useCallback((bonusId: string) => {
    setState(prev => {
      const newBonuses = prev.bonuses.map(bonus => {
        if (bonus.id === bonusId && bonus.unlocked && !bonus.claimed) {
          return {
            ...bonus,
            claimed: true,
            claimedAt: new Date().toISOString(),
          };
        }
        return bonus;
      });

      const newState = {
        ...prev,
        bonuses: newBonuses,
      };

      saveBonuses(newState);
      return newState;
    });
  }, [setState, saveBonuses]);

  const claimDailyBonus = useCallback(() => {
    setState(prev => {
      const newDailyBonus = {
        ...prev.dailyBonus,
        claimed: true,
      };

      const newState = {
        ...prev,
        dailyBonus: newDailyBonus,
      };

      saveBonuses(newState);
      return newState;
    });
  }, [setState, saveBonuses]);

  const getAvailableBonuses = useCallback(() => {
    return state.bonuses.filter(bonus => bonus.unlocked && !bonus.claimed);
  }, [state.bonuses]);

  const getUnclaimedCount = useCallback(() => {
    return state.bonuses.filter(bonus => bonus.unlocked && !bonus.claimed).length;
  }, [state.bonuses]);

  return {
    bonuses: state.bonuses,
    dailyBonus: state.dailyBonus,
    weeklyChallenge: state.weeklyChallenge,
    checkBonuses,
    claimBonus,
    claimDailyBonus,
    getAvailableBonuses,
    getUnclaimedCount,
  };
}