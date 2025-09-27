export const APP_CONFIG = {
  // App Information
  APP_NAME: 'RiseUp',
  APP_VERSION: '2.0.0',
  BUILD_NUMBER: '1',
  
  // Firebase Configuration
  FIREBASE_ENABLED: true,
  OFFLINE_SUPPORT: true,
  
  // Performance Settings
  MAX_SYNC_RETRIES: 3,
  SYNC_TIMEOUT: 10000, // 10 seconds
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  
  // Feature Flags
  FEATURES: {
    ANALYTICS: true,
    INSIGHTS: true,
    BACKUP_RESTORE: true,
    BONUSES_SYSTEM: true,
    DAILY_BONUSES: true,
    STREAK_BONUSES: true,
    PERFORMANCE_MONITOR: __DEV__,
    PUSH_NOTIFICATIONS: false, // Will be enabled in future versions
    SOCIAL_FEATURES: false,
    PREMIUM_FEATURES: false,
  },
  
  // UI Configuration
  UI: {
    ANIMATION_DURATION: 300,
    HAPTIC_FEEDBACK: true,
    DARK_MODE_SUPPORT: true,
    ACCESSIBILITY_SUPPORT: true,
  },
  
  // Data Limits
  LIMITS: {
    MAX_CUSTOM_HABITS: 50,
    MAX_DAILY_RECORDS: 365,
    MAX_BACKUP_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_SYNC_QUEUE_SIZE: 100,
  },
  
  // Error Handling
  ERROR_REPORTING: {
    ENABLED: !__DEV__,
    CRASH_REPORTING: !__DEV__,
    PERFORMANCE_MONITORING: !__DEV__,
  },
  
  // Security
  SECURITY: {
    ENCRYPT_LOCAL_DATA: false, // Can be enabled for sensitive data
    SECURE_STORAGE: false,
    BIOMETRIC_AUTH: false,
  },
  
  // Localization
  SUPPORTED_LANGUAGES: ['uk', 'en'],
  DEFAULT_LANGUAGE: 'uk',
  
  // API Configuration
  API: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
};

export const STORAGE_KEYS = {
  AUTH: '@riseup_auth',
  SETTINGS: '@riseup_settings',
  HABITS: '@riseup_habits',
  CUSTOM_HABITS: '@riseup_custom_habits',
  CHARACTER: '@riseup_character',
  ACHIEVEMENTS: '@riseup_achievements',
  BONUSES: '@riseup_bonuses',
  STATISTICS: '@riseup_statistics',
  DAILY_HISTORY: '@riseup_daily_history',
  COINS: '@riseup_coins',
  PURCHASES: '@riseup_purchases',
  TOTAL_COMPLETIONS: '@riseup_total_completions',
  OFFLINE_QUEUE: '@riseup_offline_queue',
  LAST_SYNC: '@riseup_last_sync',
};

export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  USER_HABITS: 'user_habits',
  CUSTOM_HABITS: 'custom_habits',
  CHARACTER_STATES: 'character_states',
  USER_ACHIEVEMENTS: 'user_achievements',
  USER_BONUSES: 'user_bonuses',
  DAILY_RECORDS: 'daily_records',
  USER_ANALYTICS: 'user_analytics',
  APP_FEEDBACK: 'app_feedback',
  ERROR_LOGS: 'error_logs',
};

export const NOTIFICATION_TYPES = {
  HABIT_REMINDER: 'habit_reminder',
  STREAK_MILESTONE: 'streak_milestone',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  DAILY_SUMMARY: 'daily_summary',
  WEEKLY_REPORT: 'weekly_report',
};

export const ANALYTICS_EVENTS = {
  HABIT_COMPLETED: 'habit_completed',
  HABIT_SKIPPED: 'habit_skipped',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  LEVEL_UP: 'level_up',
  BACKUP_CREATED: 'backup_created',
  DATA_RESTORED: 'data_restored',
  SETTINGS_CHANGED: 'settings_changed',
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
};