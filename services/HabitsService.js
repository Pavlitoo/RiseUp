// services/HabitsService.js
import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { COLLECTIONS, db } from '../config/firebase.js';

export class HabitsService {
  
  // Додати нову звичку
  static async addHabit(habitData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.HABITS), {
        ...habitData,
        createdAt: serverTimestamp(),
        userId: 'user1',
        isActive: true,
        completedDays: 0
      });
      
      console.log('✅ Habit added with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding habit: ', error);
      throw error;
    }
  }

  // Отримати всі звички
  static async getUserHabits(userId = 'user1') {
    try {
      const q = query(
        collection(db, COLLECTIONS.HABITS),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const habits = [];
      
      querySnapshot.forEach((doc) => {
        habits.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('📋 Found habits:', habits.length);
      return habits;
    } catch (error) {
      console.error('❌ Error getting habits: ', error);
      throw error;
    }
  }
}