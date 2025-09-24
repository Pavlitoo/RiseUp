import { ANALYTICS_EVENTS, APP_CONFIG } from '@/constants/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnalyticsEvent {
  id: string;
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

class Analytics {
  private static instance: Analytics;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private sessionStartTime: number;

  private constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStartTime = Date.now();
    this.initializeSession();
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  private async initializeSession(): Promise<void> {
    if (!APP_CONFIG.FEATURES.ANALYTICS) return;

    await this.track(ANALYTICS_EVENTS.APP_OPENED, {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  async track(
    event: string,
    properties: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    if (!APP_CONFIG.FEATURES.ANALYTICS) return;

    try {
      const analyticsEvent: AnalyticsEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        event,
        properties: {
          ...properties,
          appVersion: APP_CONFIG.APP_VERSION,
          platform: process.env.EXPO_OS || 'unknown',
          sessionDuration: Date.now() - this.sessionStartTime,
        },
        timestamp: new Date().toISOString(),
        userId,
        sessionId: this.sessionId,
      };

      // Add to queue for batch processing
      this.eventQueue.push(analyticsEvent);

      // Store locally for offline support
      await this.storeEventLocally(analyticsEvent);

      // Process queue if we have enough events or it's been a while
      if (this.eventQueue.length >= 10) {
        this.processEventQueue();
      }

      // Log in development
      if (__DEV__) {
        console.log(`[Analytics] ${event}:`, properties);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  private async storeEventLocally(event: AnalyticsEvent): Promise<void> {
    try {
      const existingEvents = await AsyncStorage.getItem('@riseup_analytics_events');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      
      events.push(event);
      
      // Keep only last 100 events to prevent storage bloat
      const recentEvents = events.slice(-100);
      
      await AsyncStorage.setItem('@riseup_analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to store analytics event locally:', error);
    }
  }

  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      // In a real app, you would send these to your analytics service
      // For now, we'll just clear the queue
      console.log(`Processing ${this.eventQueue.length} analytics events`);
      this.eventQueue = [];
    } catch (error) {
      console.error('Failed to process analytics queue:', error);
    }
  }

  // Convenience methods for common events
  async trackHabitCompleted(habitId: string, habitName: string, userId?: string): Promise<void> {
    await this.track(ANALYTICS_EVENTS.HABIT_COMPLETED, {
      habitId,
      habitName,
      completedAt: new Date().toISOString(),
    }, userId);
  }

  async trackHabitSkipped(habitId: string, habitName: string, userId?: string): Promise<void> {
    await this.track(ANALYTICS_EVENTS.HABIT_SKIPPED, {
      habitId,
      habitName,
      skippedAt: new Date().toISOString(),
    }, userId);
  }

  async trackAchievementUnlocked(achievementId: string, achievementName: string, userId?: string): Promise<void> {
    await this.track(ANALYTICS_EVENTS.ACHIEVEMENT_UNLOCKED, {
      achievementId,
      achievementName,
      unlockedAt: new Date().toISOString(),
    }, userId);
  }

  async trackLevelUp(newLevel: number, userId?: string): Promise<void> {
    await this.track(ANALYTICS_EVENTS.LEVEL_UP, {
      newLevel,
      levelUpAt: new Date().toISOString(),
    }, userId);
  }

  async trackBackupCreated(userId?: string): Promise<void> {
    await this.track(ANALYTICS_EVENTS.BACKUP_CREATED, {
      createdAt: new Date().toISOString(),
    }, userId);
  }

  async trackDataRestored(userId?: string): Promise<void> {
    await this.track(ANALYTICS_EVENTS.DATA_RESTORED, {
      restoredAt: new Date().toISOString(),
    }, userId);
  }

  async trackSettingsChanged(setting: string, oldValue: any, newValue: any, userId?: string): Promise<void> {
    await this.track(ANALYTICS_EVENTS.SETTINGS_CHANGED, {
      setting,
      oldValue,
      newValue,
      changedAt: new Date().toISOString(),
    }, userId);
  }

  async trackAppBackgrounded(): Promise<void> {
    await this.track(ANALYTICS_EVENTS.APP_BACKGROUNDED, {
      sessionDuration: Date.now() - this.sessionStartTime,
      backgroundedAt: new Date().toISOString(),
    });
  }

  // Screen tracking
  async trackScreenView(screenName: string, userId?: string): Promise<void> {
    await this.track('screen_view', {
      screenName,
      viewedAt: new Date().toISOString(),
    }, userId);
  }

  // User journey tracking
  async trackUserJourney(step: string, properties: Record<string, any> = {}, userId?: string): Promise<void> {
    await this.track('user_journey', {
      step,
      ...properties,
      timestamp: new Date().toISOString(),
    }, userId);
  }

  // Performance tracking
  async trackPerformance(metric: string, value: number, unit: string = 'ms'): Promise<void> {
    await this.track('performance_metric', {
      metric,
      value,
      unit,
      measuredAt: new Date().toISOString(),
    });
  }

  // Error tracking (for analytics purposes, not error logging)
  async trackError(errorType: string, errorMessage: string, userId?: string): Promise<void> {
    await this.track('error_occurred', {
      errorType,
      errorMessage,
      occurredAt: new Date().toISOString(),
    }, userId);
  }

  // Feature usage tracking
  async trackFeatureUsage(feature: string, action: string, userId?: string): Promise<void> {
    await this.track('feature_usage', {
      feature,
      action,
      usedAt: new Date().toISOString(),
    }, userId);
  }

  // Get analytics summary
  async getAnalyticsSummary(): Promise<any> {
    try {
      const storedEvents = await AsyncStorage.getItem('@riseup_analytics_events');
      const events = storedEvents ? JSON.parse(storedEvents) : [];
      
      const summary = {
        totalEvents: events.length,
        sessionId: this.sessionId,
        sessionDuration: Date.now() - this.sessionStartTime,
        mostTrackedEvents: this.getMostTrackedEvents(events),
        recentEvents: events.slice(-10),
      };
      
      return summary;
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return null;
    }
  }

  private getMostTrackedEvents(events: AnalyticsEvent[]): Record<string, number> {
    const eventCounts: Record<string, number> = {};
    
    events.forEach(event => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    });
    
    return Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .reduce((acc, [event, count]) => {
        acc[event] = count;
        return acc;
      }, {} as Record<string, number>);
  }

  // Clean up old events
  async cleanupOldEvents(): Promise<void> {
    try {
      const storedEvents = await AsyncStorage.getItem('@riseup_analytics_events');
      const events = storedEvents ? JSON.parse(storedEvents) : [];
      
      // Keep only events from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentEvents = events.filter((event: AnalyticsEvent) => 
        new Date(event.timestamp) > thirtyDaysAgo
      );
      
      await AsyncStorage.setItem('@riseup_analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to cleanup old analytics events:', error);
    }
  }
}

export const analytics = Analytics.getInstance();