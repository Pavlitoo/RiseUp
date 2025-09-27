import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

class CacheManager {
  private static instance: CacheManager;
  private defaultTTL = 24 * 60 * 60 * 1000; // 24 hours
  private maxCacheSize = 100;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private getCacheKey(key: string): string {
    return `@riseup_cache_${key}`;
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      await AsyncStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheItem));
      
      // Clean up old cache items if needed
      await this.cleanup(options.maxSize || this.maxCacheSize);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(this.getCacheKey(key));
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Check if cache item has expired
      if (Date.now() > cacheItem.expiresAt) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getCacheKey(key));
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('@riseup_cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, options);
    return data;
  }

  private async cleanup(maxSize: number): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('@riseup_cache_'));
      
      if (cacheKeys.length <= maxSize) return;

      // Get all cache items with timestamps
      const cacheItems = await Promise.all(
        cacheKeys.map(async (key) => {
          try {
            const item = await AsyncStorage.getItem(key);
            if (item) {
              const parsed: CacheItem<any> = JSON.parse(item);
              return { key, timestamp: parsed.timestamp };
            }
          } catch (error) {
            return { key, timestamp: 0 };
          }
          return null;
        })
      );

      // Sort by timestamp (oldest first) and remove excess items
      const validItems = cacheItems.filter(item => item !== null) as Array<{ key: string; timestamp: number }>;
      validItems.sort((a, b) => a.timestamp - b.timestamp);
      
      const itemsToRemove = validItems.slice(0, validItems.length - maxSize);
      const keysToRemove = itemsToRemove.map(item => item.key);
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  async getCacheInfo(): Promise<{
    totalItems: number;
    totalSize: number;
    oldestItem: string | null;
    newestItem: string | null;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('@riseup_cache_'));
      
      let totalSize = 0;
      let oldestTimestamp = Infinity;
      let newestTimestamp = 0;
      let oldestKey = null;
      let newestKey = null;

      for (const key of cacheKeys) {
        try {
          const item = await AsyncStorage.getItem(key);
          if (item) {
            totalSize += item.length;
            const parsed: CacheItem<any> = JSON.parse(item);
            
            if (parsed.timestamp < oldestTimestamp) {
              oldestTimestamp = parsed.timestamp;
              oldestKey = key.replace('@riseup_cache_', '');
            }
            
            if (parsed.timestamp > newestTimestamp) {
              newestTimestamp = parsed.timestamp;
              newestKey = key.replace('@riseup_cache_', '');
            }
          }
        } catch (error) {
          // Skip invalid cache items
        }
      }

      return {
        totalItems: cacheKeys.length,
        totalSize,
        oldestItem: oldestKey,
        newestItem: newestKey,
      };
    } catch (error) {
      console.error('Get cache info error:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        oldestItem: null,
        newestItem: null,
      };
    }
  }
}

export const cacheManager = CacheManager.getInstance();

// Utility functions
export const cache = {
  set: <T>(key: string, data: T, ttl?: number) => 
    cacheManager.set(key, data, { ttl }),
  
  get: <T>(key: string) => 
    cacheManager.get<T>(key),
  
  remove: (key: string) => 
    cacheManager.remove(key),
  
  clear: () => 
    cacheManager.clear(),
  
  has: (key: string) => 
    cacheManager.has(key),
  
  getOrSet: <T>(key: string, fetcher: () => Promise<T>, ttl?: number) =>
    cacheManager.getOrSet(key, fetcher, { ttl }),
};