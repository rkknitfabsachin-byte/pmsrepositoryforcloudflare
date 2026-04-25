// ============================
// In-Memory Cache (30-second TTL)
// ============================

import { SHEET_CONFIG } from './types';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/** Get cached value if not expired */
export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/** Set cache value with TTL */
export function setCache<T>(key: string, data: T | null, ttl?: number): void {
  if (data === null) {
    cache.delete(key);
    return;
  }
  cache.set(key, {
    data,
    expiry: Date.now() + (ttl || SHEET_CONFIG.CACHE_TTL),
  });
}

/** Invalidate all cache */
export function clearCache(): void {
  cache.clear();
}

/** Invalidate specific cache key */
export function invalidateCache(key: string): void {
  cache.delete(key);
}
