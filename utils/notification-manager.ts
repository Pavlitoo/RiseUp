import { APP_CONFIG } from '@/constants/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  scheduledFor: Date;
  type: 'habit_reminder' | 'daily_summary' | 'streak_milestone' | 'achievement';
  data?: any;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    time?: string; // HH:MM format
  };
}

class NotificationManager {
  private static instance: NotificationManager;
  private isEnabled: boolean;
  private scheduledNotifications: NotificationSchedule[] = [];

  private constructor() {
    this.isEnabled = APP_CONFIG.FEATURES.PUSH_NOTIFICATIONS;
    this.loadScheduledNotifications();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private async loadScheduledNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@riseup_scheduled_notifications');
      if (stored) {
        this.scheduledNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          scheduledFor: new Date(n.scheduledFor),
        }));
      }
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error);
    }
  }

  private async saveScheduledNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        '@riseup_scheduled_notifications',
        JSON.stringify(this.scheduledNotifications)
      );
    } catch (error) {
      console.error('Failed to save scheduled notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      // In a real implementation, you would request notification permissions here
      // For now, we'll simulate permission granted
      console.log('Notification permissions requested');
      return true;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  async scheduleNotification(notification: Omit<NotificationSchedule, 'id'>): Promise<string> {
    if (!this.isEnabled) return '';

    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const scheduledNotification: NotificationSchedule = {
      ...notification,
      id,
    };

    this.scheduledNotifications.push(scheduledNotification);
    await this.saveScheduledNotifications();

    // In a real implementation, you would schedule the actual notification here
    console.log('Notification scheduled:', scheduledNotification);

    return id;
  }

  async cancelNotification(id: string): Promise<void> {
    this.scheduledNotifications = this.scheduledNotifications.filter(n => n.id !== id);
    await this.saveScheduledNotifications();

    // In a real implementation, you would cancel the actual notification here
    console.log('Notification cancelled:', id);
  }

  async cancelAllNotifications(): Promise<void> {
    this.scheduledNotifications = [];
    await this.saveScheduledNotifications();

    // In a real implementation, you would cancel all actual notifications here
    console.log('All notifications cancelled');
  }

  async scheduleHabitReminder(
    habitName: string,
    time: string, // HH:MM format
    daysOfWeek: number[] = [1, 2, 3, 4, 5, 6, 0] // All days by default
  ): Promise<string> {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledFor = new Date();
    scheduledFor.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledFor <= new Date()) {
      scheduledFor.setDate(scheduledFor.getDate() + 1);
    }

    return this.scheduleNotification({
      title: 'Нагадування про звичку',
      body: `Час виконати звичку: ${habitName}`,
      scheduledFor,
      type: 'habit_reminder',
      data: { habitName },
      recurring: {
        frequency: 'daily',
        daysOfWeek,
        time,
      },
    });
  }

  async scheduleDailySummary(time: string = '21:00'): Promise<string> {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledFor = new Date();
    scheduledFor.setHours(hours, minutes, 0, 0);

    if (scheduledFor <= new Date()) {
      scheduledFor.setDate(scheduledFor.getDate() + 1);
    }

    return this.scheduleNotification({
      title: 'Підсумок дня',
      body: 'Подивіться на свій прогрес за сьогодні!',
      scheduledFor,
      type: 'daily_summary',
      recurring: {
        frequency: 'daily',
        time,
      },
    });
  }

  async scheduleStreakMilestone(habitName: string, streak: number): Promise<string> {
    return this.scheduleNotification({
      title: 'Досягнення серії!',
      body: `Вітаємо! Ви підтримуєте звичку "${habitName}" вже ${streak} днів поспіль!`,
      scheduledFor: new Date(),
      type: 'streak_milestone',
      data: { habitName, streak },
    });
  }

  async scheduleAchievementNotification(achievementName: string): Promise<string> {
    return this.scheduleNotification({
      title: 'Нове досягнення!',
      body: `Ви розблокували досягнення: ${achievementName}`,
      scheduledFor: new Date(),
      type: 'achievement',
      data: { achievementName },
    });
  }

  getScheduledNotifications(): NotificationSchedule[] {
    return [...this.scheduledNotifications];
  }

  async cleanupExpiredNotifications(): Promise<void> {
    const now = new Date();
    const activeNotifications = this.scheduledNotifications.filter(notification => {
      // Keep recurring notifications and future notifications
      return notification.recurring || notification.scheduledFor > now;
    });

    if (activeNotifications.length !== this.scheduledNotifications.length) {
      this.scheduledNotifications = activeNotifications;
      await this.saveScheduledNotifications();
    }
  }

  // Process recurring notifications (should be called daily)
  async processRecurringNotifications(): Promise<void> {
    const now = new Date();
    const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    for (const notification of this.scheduledNotifications) {
      if (!notification.recurring) continue;

      const shouldScheduleToday = 
        !notification.recurring.daysOfWeek || 
        notification.recurring.daysOfWeek.includes(today);

      if (shouldScheduleToday && notification.recurring.time) {
        const [hours, minutes] = notification.recurring.time.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Only schedule if the time hasn't passed yet today
        if (scheduledTime > now) {
          // In a real implementation, you would schedule the actual notification here
          console.log('Recurring notification processed:', notification.title);
        }
      }
    }
  }

  // Get notification statistics
  getNotificationStats(): {
    total: number;
    byType: Record<string, number>;
    upcoming: number;
    recurring: number;
  } {
    const stats = {
      total: this.scheduledNotifications.length,
      byType: {} as Record<string, number>,
      upcoming: 0,
      recurring: 0,
    };

    const now = new Date();

    this.scheduledNotifications.forEach(notification => {
      // Count by type
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;

      // Count upcoming
      if (notification.scheduledFor > now) {
        stats.upcoming++;
      }

      // Count recurring
      if (notification.recurring) {
        stats.recurring++;
      }
    });

    return stats;
  }
}

export const notificationManager = NotificationManager.getInstance();

// Utility functions
export const scheduleHabitReminder = (habitName: string, time: string, daysOfWeek?: number[]) =>
  notificationManager.scheduleHabitReminder(habitName, time, daysOfWeek);

export const scheduleDailySummary = (time?: string) =>
  notificationManager.scheduleDailySummary(time);

export const scheduleStreakMilestone = (habitName: string, streak: number) =>
  notificationManager.scheduleStreakMilestone(habitName, streak);

export const scheduleAchievementNotification = (achievementName: string) =>
  notificationManager.scheduleAchievementNotification(achievementName);