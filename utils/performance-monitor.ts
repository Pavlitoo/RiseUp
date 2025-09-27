import { APP_CONFIG } from '@/constants/app-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'memory' | 'network' | 'render' | 'storage' | 'user_interaction';
}

interface PerformanceReport {
  sessionId: string;
  startTime: string;
  endTime?: string;
  metrics: PerformanceMetric[];
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private sessionId: string;
  private startTime: number;
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean;

  private constructor() {
    this.sessionId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
    this.isEnabled = APP_CONFIG.FEATURES.PERFORMANCE_MONITOR;
    
    if (this.isEnabled) {
      this.initializeMonitoring();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMonitoring() {
    // Monitor memory usage periodically
    setInterval(() => {
      this.recordMemoryUsage();
    }, 30000); // Every 30 seconds

    // Monitor app lifecycle
    this.recordMetric('app_start', Date.now() - this.startTime, 'ms', 'user_interaction');
  }

  recordMetric(name: string, value: number, unit: string = 'ms', category: PerformanceMetric['category'] = 'render') {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      category,
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory bloat
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance issues
    this.checkPerformanceThresholds(metric);
  }

  private checkPerformanceThresholds(metric: PerformanceMetric) {
    const thresholds = {
      render_time: 16, // 60fps = 16ms per frame
      network_request: 5000, // 5 seconds
      storage_operation: 1000, // 1 second
      memory_usage: 100 * 1024 * 1024, // 100MB
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold}${metric.unit})`);
      
      // Record performance issue
      this.recordMetric(`${metric.name}_threshold_exceeded`, metric.value, metric.unit, 'render');
    }
  }

  private async recordMemoryUsage() {
    try {
      // This is a simplified memory monitoring
      // In a real app, you might use native modules for more accurate memory info
      const memoryInfo = (performance as any)?.memory;
      if (memoryInfo) {
        this.recordMetric('memory_used', memoryInfo.usedJSHeapSize, 'bytes', 'memory');
        this.recordMetric('memory_total', memoryInfo.totalJSHeapSize, 'bytes', 'memory');
      }
    } catch (error) {
      console.error('Failed to record memory usage:', error);
    }
  }

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    if (!this.isEnabled) return fn();

    const startTime = Date.now();
    const result = fn();
    const endTime = Date.now();
    
    this.recordMetric(name, endTime - startTime, 'ms', 'render');
    
    return result;
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return fn();

    const startTime = Date.now();
    const result = await fn();
    const endTime = Date.now();
    
    this.recordMetric(name, endTime - startTime, 'ms', 'network');
    
    return result;
  }

  // Get performance report
  getPerformanceReport(): PerformanceReport {
    return {
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date().toISOString(),
      metrics: [...this.metrics],
      deviceInfo: {
        platform: process.env.EXPO_OS || 'unknown',
        version: APP_CONFIG.APP_VERSION,
      },
    };
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      totalMetrics: this.metrics.length,
      categories: {} as Record<string, number>,
      averages: {} as Record<string, number>,
      issues: [] as string[],
    };

    // Group by category
    this.metrics.forEach(metric => {
      summary.categories[metric.category] = (summary.categories[metric.category] || 0) + 1;
    });

    // Calculate averages for common metrics
    const metricGroups = this.metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) groups[metric.name] = [];
      groups[metric.name].push(metric.value);
      return groups;
    }, {} as Record<string, number[]>);

    Object.keys(metricGroups).forEach(metricName => {
      const values = metricGroups[metricName];
      summary.averages[metricName] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Identify performance issues
    Object.keys(summary.averages).forEach(metricName => {
      const avg = summary.averages[metricName];
      if (metricName.includes('render') && avg > 16) {
        summary.issues.push(`Slow rendering: ${metricName} averages ${avg.toFixed(2)}ms`);
      }
      if (metricName.includes('network') && avg > 3000) {
        summary.issues.push(`Slow network: ${metricName} averages ${avg.toFixed(2)}ms`);
      }
    });

    return summary;
  }

  // Save performance data locally
  async savePerformanceData(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const report = this.getPerformanceReport();
      const key = `@riseup_performance_${this.sessionId}`;
      await AsyncStorage.setItem(key, JSON.stringify(report));
    } catch (error) {
      console.error('Failed to save performance data:', error);
    }
  }

  // Clear old performance data
  async clearOldPerformanceData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const performanceKeys = keys.filter(key => key.startsWith('@riseup_performance_'));
      
      // Keep only last 5 sessions
      if (performanceKeys.length > 5) {
        const keysToRemove = performanceKeys.slice(0, performanceKeys.length - 5);
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.error('Failed to clear old performance data:', error);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility functions for easy performance monitoring
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  return performanceMonitor.measureFunction(name, fn);
};

export const measureAsyncPerformance = <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  return performanceMonitor.measureAsyncFunction(name, fn);
};

export const recordMetric = (name: string, value: number, unit?: string, category?: PerformanceMetric['category']) => {
  performanceMonitor.recordMetric(name, value, unit, category);
};