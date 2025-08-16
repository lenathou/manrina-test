import { kv } from '@vercel/kv';

type CacheOptions = {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
};

/**
 * Higher-order function that adds KV caching to any async function
 * Uses Vercel KV for serverless-compatible caching
 */
export function withKvCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: CacheOptions = {}
) {
  const { ttl = 300, key: customKey } = options; // Default 5 minutes TTL

  return async (...args: T): Promise<R> => {
    // Generate cache key from function name and arguments
    const cacheKey = customKey || `${fn.name}:${JSON.stringify(args)}`;
    
    try {
      // Try to get from cache first
      const cached = await kv.get<R>(cacheKey);
      if (cached !== null) {
        console.log(`[KV Cache] HIT for key: ${cacheKey}`);
        return cached;
      }
      
      console.log(`[KV Cache] MISS for key: ${cacheKey}`);
      
      // Execute the function
      const result = await fn(...args);
      
      // Store in cache with TTL
      await kv.setex(cacheKey, ttl, result);
      console.log(`[KV Cache] SET for key: ${cacheKey} (TTL: ${ttl}s)`);
      
      return result;
    } catch (error) {
      console.error(`[KV Cache] ERROR for key: ${cacheKey}:`, error);
      // Fallback to executing the function without cache
      return await fn(...args);
    }
  };
}

/**
 * Utility to manually clear cache entries
 */
export async function clearKvCache(pattern: string) {
  try {
    // Note: Vercel KV doesn't support pattern deletion
    // This would need to be implemented with a key tracking system
    console.log(`[KV Cache] Clear requested for pattern: ${pattern}`);
    // For now, we'll just log the request
  } catch (error) {
    console.error(`[KV Cache] Clear error:`, error);
  }
}