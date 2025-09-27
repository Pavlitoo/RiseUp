import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Achievement } from '../types/achievement';
import { CustomHabit } from '../types/custom-habit';
import { CharacterState, Habit } from '../types/habit';
import { User } from '../types/user';

export class FirebaseService {
  private static instance: FirebaseService;
  private isOnline = true;
  private syncQueue: Array<() => Promise<void>> = [];

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  private async processSyncQueue() {
    while (this.syncQueue.length > 0 && this.isOnline) {
      const operation = this.syncQueue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error('Sync operation failed:', error);
          // Re-add to queue if failed
          this.syncQueue.unshift(operation);
          break;
        }
      }
    }
  }

  private async executeWithOfflineSupport<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    queueOperation?: () => Promise<void>
  ): Promise<T> {
    if (!this.isOnline) {
      if (queueOperation) {
        this.syncQueue.push(queueOperation);
      }
      return fallback();
    }

    try {
      return await operation();
    } catch (error) {
      console.error('Firebase operation failed:', error);
      if (queueOperation) {
        this.syncQueue.push(queueOperation);
      }
      return fallback();
    }
  }

  // User Management
  async createUser(user: { email: string; password: string; name: string }): Promise<string> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const userData = {
      id: userId,
      email: user.email,
      name: user.name,
      password: user.password, // В реальному додатку треба хешувати пароль
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      isActive: true,
      version: 1
    };

    return this.executeWithOfflineSupport(
      async () => {
        // Створюємо користувача в Firebase
        const docRef = await addDoc(collection(db, 'users'), userData);
        console.log('✅ User created in Firebase with ID:', docRef.id);
        return userId;
      },
      async () => {
        // Offline fallback - store in AsyncStorage
        const users = await this.getOfflineUsers();
        const userWithTimestamp = {
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        users.push(userWithTimestamp);
        await AsyncStorage.setItem('@riseup_offline_users', JSON.stringify(users));
        console.log('✅ User stored offline');
        return userId;
      },
      async () => {
        const docRef = await addDoc(collection(db, 'users'), userData);
        console.log('✅ User queued for Firebase sync');
      }
    );
  }

  async getUser(userId: string): Promise<User | null> {
    return this.executeWithOfflineSupport(
      async () => {
        // Шукаємо користувача за ID в колекції
        const usersQuery = query(
          collection(db, 'users'),
          where('id', '==', userId),
          limit(1)
        );
        const querySnapshot = await getDocs(usersQuery);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar,
            createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
          } as User;
        }
        return null;
      },
      async () => {
        const users = await this.getOfflineUsers();
        return users.find(u => u.id === userId) || null;
      }
    );
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
      version: increment(1)
    };

    return this.executeWithOfflineSupport(
      async () => {
        await updateDoc(doc(db, 'users', userId), updateData);
      },
      async () => {
        const users = await this.getOfflineUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
          await AsyncStorage.setItem('@riseup_offline_users', JSON.stringify(users));
        }
      },
      async () => {
        await updateDoc(doc(db, 'users', userId), updateData);
      }
    );
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    return this.executeWithOfflineSupport(
      async () => {
        const usersQuery = query(
          collection(db, 'users'),
          where('email', '==', email),
          where('password', '==', password),
          where('isActive', '==', true),
          limit(1)
        );
        
        const querySnapshot = await getDocs(usersQuery);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          const user = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar,
            createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
          } as User;
          
          // Update last login
          await updateDoc(userDoc.ref, {
            lastLoginAt: serverTimestamp(),
            version: increment(1)
          });
          
          console.log('✅ User authenticated via Firebase:', user.email);
          return user;
        }
        console.log('❌ User not found in Firebase');
        return null;
      },
      async () => {
        const users = await this.getOfflineUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          console.log('✅ User authenticated offline:', user.email);
          // Видаляємо пароль з відповіді
          const { password: _, ...userWithoutPassword } = user;
          return userWithoutPassword as User;
        }
        console.log('❌ User not found offline');
        return null;
      }
    );
  }

  // Habits Management
  async saveHabits(userId: string, habits: Habit[]): Promise<void> {
    const habitsData = {
      userId,
      habits,
      updatedAt: serverTimestamp(),
      version: increment(1)
    };

    return this.executeWithOfflineSupport(
      async () => {
        await setDoc(doc(db, 'user_habits', userId), habitsData);
      },
      async () => {
        await AsyncStorage.setItem(`@riseup_habits_${userId}`, JSON.stringify(habits));
      },
      async () => {
        await setDoc(doc(db, 'user_habits', userId), habitsData);
      }
    );
  }

  async getHabits(userId: string): Promise<Habit[]> {
    return this.executeWithOfflineSupport(
      async () => {
        const habitsDoc = await getDoc(doc(db, 'user_habits', userId));
        return habitsDoc.exists() ? habitsDoc.data().habits || [] : [];
      },
      async () => {
        const habitsData = await AsyncStorage.getItem(`@riseup_habits_${userId}`);
        return habitsData ? JSON.parse(habitsData) : [];
      }
    );
  }

  // Custom Habits Management
  async saveCustomHabits(userId: string, habits: CustomHabit[]): Promise<void> {
    const habitsData = {
      userId,
      habits,
      updatedAt: serverTimestamp(),
      version: increment(1)
    };

    return this.executeWithOfflineSupport(
      async () => {
        await setDoc(doc(db, 'custom_habits', userId), habitsData);
      },
      async () => {
        await AsyncStorage.setItem(`@riseup_custom_habits_${userId}`, JSON.stringify(habits));
      },
      async () => {
        await setDoc(doc(db, 'custom_habits', userId), habitsData);
      }
    );
  }

  async getCustomHabits(userId: string): Promise<CustomHabit[]> {
    return this.executeWithOfflineSupport(
      async () => {
        const habitsDoc = await getDoc(doc(db, 'custom_habits', userId));
        return habitsDoc.exists() ? habitsDoc.data().habits || [] : [];
      },
      async () => {
        const habitsData = await AsyncStorage.getItem(`@riseup_custom_habits_${userId}`);
        return habitsData ? JSON.parse(habitsData) : [];
      }
    );
  }

  // Character State Management
  async saveCharacterState(userId: string, character: CharacterState): Promise<void> {
    const characterData = {
      userId,
      character,
      updatedAt: serverTimestamp(),
      version: increment(1)
    };

    return this.executeWithOfflineSupport(
      async () => {
        await setDoc(doc(db, 'character_states', userId), characterData);
      },
      async () => {
        await AsyncStorage.setItem(`@riseup_character_${userId}`, JSON.stringify(character));
      },
      async () => {
        await setDoc(doc(db, 'character_states', userId), characterData);
      }
    );
  }

  async getCharacterState(userId: string): Promise<CharacterState | null> {
    return this.executeWithOfflineSupport(
      async () => {
        const characterDoc = await getDoc(doc(db, 'character_states', userId));
        return characterDoc.exists() ? characterDoc.data()?.character || null : null;
      },
      async () => {
        const characterData = await AsyncStorage.getItem(`@riseup_character_${userId}`);
        return characterData ? JSON.parse(characterData) : null;
      }
    );
  }

  // Statistics Management
  async saveDailyRecord(userId: string, date: string, record: any): Promise<void> {
    const recordData = {
      userId,
      date,
      ...record,
      updatedAt: serverTimestamp(),
      version: increment(1)
    };

    return this.executeWithOfflineSupport(
      async () => {
        await setDoc(doc(db, 'daily_records', `${userId}_${date}`), recordData);
      },
      async () => {
        const records = await this.getOfflineDailyRecords(userId);
        const existingIndex = records.findIndex(r => r.date === date);
        if (existingIndex !== -1) {
          records[existingIndex] = { ...recordData, updatedAt: new Date().toISOString() };
        } else {
          records.push({ ...recordData, updatedAt: new Date().toISOString() });
        }
        await AsyncStorage.setItem(`@riseup_daily_records_${userId}`, JSON.stringify(records));
      },
      async () => {
        await setDoc(doc(db, 'daily_records', `${userId}_${date}`), recordData);
      }
    );
  }

  async getDailyRecords(userId: string, recordLimit?: number): Promise<any[]> {
    return this.executeWithOfflineSupport(
      async () => {
        const baseConstraints = [
          where('userId', '==', userId),
          orderBy('date', 'desc'),
        ];
        const recordsQuery = recordLimit
          ? query(
              collection(db, 'daily_records'),
              ...baseConstraints,
              limit(recordLimit)
            )
          : query(
              collection(db, 'daily_records'),
              ...baseConstraints
            );
        
        const querySnapshot = await getDocs(recordsQuery);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      async () => {
        const records = await this.getOfflineDailyRecords(userId);
        return records.sort((a, b) => b.date.localeCompare(a.date)).slice(0, recordLimit);
      }
    );
  }

  // Achievements Management
  async saveAchievements(userId: string, achievements: Achievement[]): Promise<void> {
    const achievementsData = {
      userId,
      achievements,
      updatedAt: serverTimestamp(),
      version: increment(1)
    };

    return this.executeWithOfflineSupport(
      async () => {
        await setDoc(doc(db, 'user_achievements', userId), achievementsData);
      },
      async () => {
        await AsyncStorage.setItem(`@riseup_achievements_${userId}`, JSON.stringify(achievements));
      },
      async () => {
        await setDoc(doc(db, 'user_achievements', userId), achievementsData);
      }
    );
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return this.executeWithOfflineSupport(
      async () => {
        const achievementsDoc = await getDoc(doc(db, 'user_achievements', userId));
        return achievementsDoc.exists() ? achievementsDoc.data().achievements || [] : [];
      },
      async () => {
        const achievementsData = await AsyncStorage.getItem(`@riseup_achievements_${userId}`);
        return achievementsData ? JSON.parse(achievementsData) : [];
      }
    );
  }

  // Bonuses Management
  async saveBonuses(userId: string, bonuses: any): Promise<void> {
    const bonusesData = {
      userId,
      ...bonuses,
      updatedAt: serverTimestamp(),
      version: increment(1)
    };

    return this.executeWithOfflineSupport(
      async () => {
        await setDoc(doc(db, 'user_bonuses', userId), bonusesData);
      },
      async () => {
        await AsyncStorage.setItem(`@riseup_bonuses_${userId}`, JSON.stringify(bonuses));
      },
      async () => {
        await setDoc(doc(db, 'user_bonuses', userId), bonusesData);
      }
    );
  }

  async getBonuses(userId: string): Promise<any> {
    return this.executeWithOfflineSupport(
      async () => {
        const bonusesDoc = await getDoc(doc(db, 'user_bonuses', userId));
        if (bonusesDoc.exists()) {
          const data = bonusesDoc.data();
          return {
            bonuses: data.bonuses,
            dailyBonus: data.dailyBonus,
          };
        }
        return null;
      },
      async () => {
        const bonusesData = await AsyncStorage.getItem(`@riseup_bonuses_${userId}`);
        return bonusesData ? JSON.parse(bonusesData) : null;
      }
    );
  }

  // Coins Management
  async saveCoins(userId: string, coinsData: any): Promise<void> {
    const data = {
      userId,
      ...coinsData,
      updatedAt: serverTimestamp(),
      version: increment(1)
    };

    return this.executeWithOfflineSupport(
      async () => {
        await setDoc(doc(db, 'user_coins', userId), data);
      },
      async () => {
        await AsyncStorage.setItem(`@riseup_coins_${userId}`, JSON.stringify(coinsData));
      },
      async () => {
        await setDoc(doc(db, 'user_coins', userId), data);
      }
    );
  }

  async getCoins(userId: string): Promise<any> {
    return this.executeWithOfflineSupport(
      async () => {
        const coinsDoc = await getDoc(doc(db, 'user_coins', userId));
        return coinsDoc.exists() ? coinsDoc.data() : null;
      },
      async () => {
        const coinsData = await AsyncStorage.getItem(`@riseup_coins_${userId}`);
        return coinsData ? JSON.parse(coinsData) : null;
      }
    );
  }

  async savePurchases(userId: string, purchases: any[]): Promise<void> {
    return this.saveCoins(userId, { purchases });
  }

  // Analytics and Insights
  async saveUserAnalytics(userId: string, analytics: any): Promise<void> {
    const analyticsData = {
      userId,
      ...analytics,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    };

    if (this.isOnline) {
      try {
        await setDoc(doc(db, 'user_analytics', `${userId}_${analyticsData.date}`), analyticsData);
      } catch (error) {
        console.error('Failed to save analytics:', error);
      }
    }
  }

  async getUserInsights(userId: string): Promise<any> {
    if (!this.isOnline) return null;

    try {
      const insightsQuery = query(
        collection(db, 'user_analytics'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(30)
      );
      
      const querySnapshot = await getDocs(insightsQuery);
      const analytics = querySnapshot.docs.map(doc => doc.data());
      
      return this.generateInsights(analytics);
    } catch (error) {
      console.error('Failed to get insights:', error);
      return null;
    }
  }

  private generateInsights(analytics: any[]): any {
    if (analytics.length === 0) return null;

    const totalDays = analytics.length;
    const avgCompletion = analytics.reduce((sum, day) => sum + (day.completionRate || 0), 0) / totalDays;
    const bestStreak = Math.max(...analytics.map(day => day.currentStreak || 0));
    const mostActiveDay = this.getMostActiveDay(analytics);
    const improvementTrend = this.calculateTrend(analytics);

    return {
      totalDays,
      avgCompletion: Math.round(avgCompletion),
      bestStreak,
      mostActiveDay,
      improvementTrend,
      recommendations: this.generateRecommendations(analytics)
    };
  }

  private getMostActiveDay(analytics: any[]): string {
    const dayCount = analytics.reduce((acc, day) => {
      const dayOfWeek = new Date(day.date).toLocaleDateString('uk-UA', { weekday: 'long' });
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + (day.completedHabits || 0);
      return acc;
    }, {});

    return Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b);
  }

  private calculateTrend(analytics: any[]): 'improving' | 'stable' | 'declining' {
    if (analytics.length < 7) return 'stable';

    const recent = analytics.slice(0, 7).reduce((sum, day) => sum + (day.completionRate || 0), 0) / 7;
    const older = analytics.slice(7, 14).reduce((sum, day) => sum + (day.completionRate || 0), 0) / 7;

    if (recent > older + 5) return 'improving';
    if (recent < older - 5) return 'declining';
    return 'stable';
  }

  private generateRecommendations(analytics: any[]): string[] {
    const recommendations = [];
    const recent = analytics.slice(0, 7);
    const avgCompletion = recent.reduce((sum, day) => sum + (day.completionRate || 0), 0) / recent.length;

    if (avgCompletion < 50) {
      recommendations.push('Спробуйте почати з менших цілей');
      recommendations.push('Встановіть нагадування для звичок');
    } else if (avgCompletion > 80) {
      recommendations.push('Відмінна робота! Розгляньте додавання нових звичок');
      recommendations.push('Поділіться своїм успіхом з друзями');
    }

    const lowStreaks = recent.filter(day => (day.currentStreak || 0) < 3).length;
    if (lowStreaks > 4) {
      recommendations.push('Зосередьтеся на постійності замість кількості');
    }

    return recommendations;
  }

  // Offline support helpers
  private async getOfflineUsers(): Promise<any[]> {
    const usersData = await AsyncStorage.getItem('@riseup_offline_users');
    return usersData ? JSON.parse(usersData) : [];
  }

  private async getOfflineDailyRecords(userId: string): Promise<any[]> {
    const recordsData = await AsyncStorage.getItem(`@riseup_daily_records_${userId}`);
    return recordsData ? JSON.parse(recordsData) : [];
  }

  // Batch operations for better performance
  async batchUpdateUserData(userId: string, updates: {
    habits?: Habit[];
    customHabits?: CustomHabit[];
    character?: CharacterState;
    achievements?: Achievement[];
    bonuses?: any;
  }): Promise<void> {
    if (!this.isOnline) {
      // Handle offline batch updates
      const promises = [];
      if (updates.habits) promises.push(AsyncStorage.setItem(`@riseup_habits_${userId}`, JSON.stringify(updates.habits)));
      if (updates.customHabits) promises.push(AsyncStorage.setItem(`@riseup_custom_habits_${userId}`, JSON.stringify(updates.customHabits)));
      if (updates.character) promises.push(AsyncStorage.setItem(`@riseup_character_${userId}`, JSON.stringify(updates.character)));
      if (updates.achievements) promises.push(AsyncStorage.setItem(`@riseup_achievements_${userId}`, JSON.stringify(updates.achievements)));
      if (updates.bonuses) promises.push(AsyncStorage.setItem(`@riseup_bonuses_${userId}`, JSON.stringify(updates.bonuses)));
      
      await Promise.all(promises);
      return;
    }

    try {
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();

      if (updates.habits) {
        batch.set(doc(db, 'user_habits', userId), {
          userId,
          habits: updates.habits,
          updatedAt: timestamp,
          version: increment(1)
        });
      }

      if (updates.customHabits) {
        batch.set(doc(db, 'custom_habits', userId), {
          userId,
          habits: updates.customHabits,
          updatedAt: timestamp,
          version: increment(1)
        });
      }

      if (updates.character) {
        batch.set(doc(db, 'character_states', userId), {
          userId,
          character: updates.character,
          updatedAt: timestamp,
          version: increment(1)
        });
      }

      if (updates.achievements) {
        batch.set(doc(db, 'user_achievements', userId), {
          userId,
          achievements: updates.achievements,
          updatedAt: timestamp,
          version: increment(1)
        });
      }

      if (updates.bonuses) {
        batch.set(doc(db, 'user_bonuses', userId), {
          userId,
          bonuses: updates.bonuses,
          updatedAt: timestamp,
          version: increment(1)
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Batch update failed:', error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToUserData(userId: string, callback: (data: any) => void): () => void {
    if (!this.isOnline) return () => {};

    const unsubscribes: Array<() => void> = [];

    // Subscribe to custom habits
    unsubscribes.push(
      onSnapshot(doc(db, 'custom_habits', userId), (doc) => {
        if (doc.exists()) {
          callback({ type: 'customHabits', data: doc.data().habits });
        }
      })
    );

    // Subscribe to character state
    unsubscribes.push(
      onSnapshot(doc(db, 'character_states', userId), (doc) => {
        if (doc.exists()) {
          callback({ type: 'character', data: doc.data().character });
        }
      })
    );

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }

  // Data export/import for backup
  async exportUserData(userId: string): Promise<any> {
    const [habits, customHabits, character, achievements, bonuses, dailyRecords] = await Promise.all([
      this.getHabits(userId),
      this.getCustomHabits(userId),
      this.getCharacterState(userId),
      this.getAchievements(userId),
      this.getBonuses(userId),
      this.getDailyRecords(userId, 365)
    ]);

    return {
      userId,
      exportDate: new Date().toISOString(),
      version: '2.0.0',
      data: {
        habits,
        customHabits,
        character,
        achievements,
        bonuses,
        dailyRecords
      }
    };
  }

  async importUserData(userId: string, exportData: any): Promise<void> {
    const { data } = exportData;
    
    await this.batchUpdateUserData(userId, {
      habits: data.habits,
      customHabits: data.customHabits,
      character: data.character,
      achievements: data.achievements,
      bonuses: data.bonuses
    });

    // Import daily records
    if (data.dailyRecords && Array.isArray(data.dailyRecords)) {
      for (const record of data.dailyRecords) {
        await this.saveDailyRecord(userId, record.date, record);
      }
    }
  }
}

export const firebaseService = FirebaseService.getInstance();