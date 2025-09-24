import { APP_CONFIG } from '@/constants/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ErrorLog {
  id: string;
  timestamp: string;
  error: string;
  stack?: string;
  context?: any;
  userId?: string;
  appVersion: string;
  platform: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorLog[] = [];

  private constructor() {
    this.setupGlobalErrorHandler();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalErrorHandler() {
    if (!APP_CONFIG.ERROR_REPORTING.ENABLED) return;

    // Handle unhandled promise rejections
    const originalHandler = (global as any).onunhandledrejection;
    (global as any).onunhandledrejection = (event: any) => {
      this.logError(event.reason, 'Unhandled Promise Rejection', {
        promise: event.promise,
      });
      
      if (originalHandler) {
        originalHandler(event);
      }
    };

    // Handle JavaScript errors
    const originalErrorHandler = (global as any).ErrorUtils?.setGlobalHandler;
    if (originalErrorHandler) {
      originalErrorHandler((error: Error, isFatal: boolean) => {
        this.logError(error, isFatal ? 'Fatal Error' : 'JavaScript Error');
      });
    }
  }

  async logError(
    error: Error | string,
    context: string = 'Unknown',
    additionalData?: any,
    userId?: string
  ): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: {
          ...additionalData,
          contextType: context,
        },
        userId,
        appVersion: APP_CONFIG.APP_VERSION,
        platform: process.env.EXPO_OS || 'unknown',
      };

      // Add to queue for batch processing
      this.errorQueue.push(errorLog);

      // Store locally for offline support
      await this.storeErrorLocally(errorLog);

      // Process queue if online
      this.processErrorQueue();

      // Log to console in development
      if (__DEV__) {
        console.error(`[${context}]`, error);
        if (additionalData) {
          console.error('Additional data:', additionalData);
        }
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private async storeErrorLocally(errorLog: ErrorLog): Promise<void> {
    try {
      const existingErrors = await AsyncStorage.getItem('@riseup_error_logs');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];
      
      errors.push(errorLog);
      
      // Keep only last 50 errors to prevent storage bloat
      const recentErrors = errors.slice(-50);
      
      await AsyncStorage.setItem('@riseup_error_logs', JSON.stringify(recentErrors));
    } catch (error) {
      console.error('Failed to store error locally:', error);
    }
  }

  private async processErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    try {
      // In a real app, you would send these to your error reporting service
      // For now, we'll just clear the queue
      console.log(`Processing ${this.errorQueue.length} error logs`);
      this.errorQueue = [];
    } catch (error) {
      console.error('Failed to process error queue:', error);
    }
  }

  async getStoredErrors(): Promise<ErrorLog[]> {
    try {
      const storedErrors = await AsyncStorage.getItem('@riseup_error_logs');
      return storedErrors ? JSON.parse(storedErrors) : [];
    } catch (error) {
      console.error('Failed to get stored errors:', error);
      return [];
    }
  }

  async clearStoredErrors(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@riseup_error_logs');
    } catch (error) {
      console.error('Failed to clear stored errors:', error);
    }
  }

  // Utility methods for common error scenarios
  logNetworkError(error: Error, endpoint: string, method: string = 'GET'): Promise<void> {
    return this.logError(error, 'Network Error', {
      endpoint,
      method,
      timestamp: new Date().toISOString(),
    });
  }

  logDatabaseError(error: Error, operation: string, collection?: string): Promise<void> {
    return this.logError(error, 'Database Error', {
      operation,
      collection,
      timestamp: new Date().toISOString(),
    });
  }

  logUserActionError(error: Error, action: string, userId?: string): Promise<void> {
    return this.logError(error, 'User Action Error', {
      action,
      timestamp: new Date().toISOString(),
    }, userId);
  }

  logPerformanceIssue(metric: string, value: number, threshold: number): Promise<void> {
    if (value > threshold) {
      return this.logError(
        new Error(`Performance threshold exceeded: ${metric}`),
        'Performance Issue',
        {
          metric,
          value,
          threshold,
          timestamp: new Date().toISOString(),
        }
      );
    }
    return Promise.resolve();
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Utility function for wrapping async functions with error handling
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string = 'Unknown Function'
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      await errorHandler.logError(error as Error, context, { args });
      return null;
    }
  };
}

// Utility function for wrapping sync functions with error handling
export function withSyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  context: string = 'Unknown Function'
): (...args: T) => R | null {
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler.logError(error as Error, context, { args }).catch(console.error);
      return null;
    }
  };
}