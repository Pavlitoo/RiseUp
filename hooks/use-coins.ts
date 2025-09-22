import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect } from 'react';
import { createGlobalState } from './use-global-state';

const COINS_KEY = '@riseup_coins';
const PURCHASES_KEY = '@riseup_purchases';

export interface Purchase {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: 'character_upgrade' | 'theme' | 'special_effect' | 'boost';
  effect: string;
  purchased: boolean;
}

interface CoinsState {
  coins: number;
  totalEarned: number;
  purchases: Purchase[];
}

const defaultPurchases: Purchase[] = [
  {
    id: 'golden_theme',
    name: 'Золота тема',
    description: 'Розкішна золота тема для додатку',
    icon: '✨',
    cost: 100,
    type: 'theme',
    effect: 'golden_theme',
    purchased: false,
  },
  {
    id: 'character_hat',
    name: 'Капелюх для персонажа',
    description: 'Стильний капелюх для вашого персонажа',
    icon: '🎩',
    cost: 50,
    type: 'character_upgrade',
    effect: 'hat_accessory',
    purchased: false,
  },
  {
    id: 'double_xp_boost',
    name: 'Подвійний досвід',
    description: 'Отримуйте подвійний досвід протягом дня',
    icon: '⚡',
    cost: 75,
    type: 'boost',
    effect: 'double_xp_24h',
    purchased: false,
  },
  {
    id: 'rainbow_aura',
    name: 'Райдужна аура',
    description: 'Красива райдужна аура навколо персонажа',
    icon: '🌈',
    cost: 150,
    type: 'special_effect',
    effect: 'rainbow_aura',
    purchased: false,
  },
];

const defaultState: CoinsState = {
  coins: 0,
  totalEarned: 0,
  purchases: defaultPurchases,
};

const useGlobalCoinsState = createGlobalState(defaultState);

export function useCoins() {
  const [state, setState] = useGlobalCoinsState();

  useEffect(() => {
    let isMounted = true;
    
    const loadCoins = async () => {
      try {
        const [coinsData, purchasesData] = await Promise.all([
          AsyncStorage.getItem(COINS_KEY),
          AsyncStorage.getItem(PURCHASES_KEY),
        ]);

        const coins = coinsData ? JSON.parse(coinsData) : { coins: 0, totalEarned: 0 };
        const purchases = purchasesData ? JSON.parse(purchasesData) : defaultPurchases;

        if (isMounted) {
          setState(prev => ({
            ...prev,
            coins: coins.coins,
            totalEarned: coins.totalEarned,
            purchases,
          }));
        }
      } catch (error) {
        console.error('Error loading coins:', error);
      }
    };

    loadCoins();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveCoins = useCallback(async (coins: number, totalEarned: number) => {
    try {
      await AsyncStorage.setItem(COINS_KEY, JSON.stringify({ coins, totalEarned }));
    } catch (error) {
      console.error('Error saving coins:', error);
    }
  }, []);

  const savePurchases = useCallback(async (purchases: Purchase[]) => {
    try {
      await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
    } catch (error) {
      console.error('Error saving purchases:', error);
    }
  }, []);

  const addCoins = useCallback((amount: number) => {
    setState(prev => {
      const newCoins = prev.coins + amount;
      const newTotalEarned = prev.totalEarned + amount;
      
      saveCoins(newCoins, newTotalEarned);
      
      return {
        ...prev,
        coins: newCoins,
        totalEarned: newTotalEarned,
      };
    });
  }, [setState, saveCoins]);

  const spendCoins = useCallback((amount: number): boolean => {
    if (state.coins < amount) {
      return false;
    }

    setState(prev => {
      const newCoins = prev.coins - amount;
      saveCoins(newCoins, prev.totalEarned);
      
      return {
        ...prev,
        coins: newCoins,
      };
    });

    return true;
  }, [state.coins, setState, saveCoins]);

  const purchaseItem = useCallback((itemId: string): boolean => {
    const item = state.purchases.find(p => p.id === itemId);
    if (!item || item.purchased || state.coins < item.cost) {
      return false;
    }

    const success = spendCoins(item.cost);
    if (!success) return false;

    setState(prev => {
      const updatedPurchases = prev.purchases.map(p =>
        p.id === itemId ? { ...p, purchased: true } : p
      );
      
      savePurchases(updatedPurchases);
      
      return {
        ...prev,
        purchases: updatedPurchases,
      };
    });

    return true;
  }, [state.purchases, state.coins, spendCoins, setState, savePurchases]);

  return {
    coins: state.coins,
    totalEarned: state.totalEarned,
    purchases: state.purchases,
    addCoins,
    spendCoins,
    purchaseItem,
  };
}