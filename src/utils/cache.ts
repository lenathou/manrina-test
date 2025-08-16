import fs from 'fs';
import path from 'path';

interface CacheOptions {
    /**
     * Cache duration in milliseconds. Default is 1 hour (3600000ms)
     */
    maxAge?: number;
    /**
     * Cache directory path. Default is '.cache' in project root
     */
    cacheDir?: string;
}

interface CacheData<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

/**
 * Memory-based cache for serverless environments
 */
export class MemoryCache {
    private cache: Map<string, CacheData<any>> = new Map();
    private defaultMaxAge: number;

    constructor(options: CacheOptions = {}) {
        this.defaultMaxAge = options.maxAge || 60 * 60 * 1000; // 1 hour default
    }

    /**
     * Gets cached data if it exists and is not expired
     */
    get<T>(key: string): T | null {
        try {
            const cacheData = this.cache.get(key);
            
            if (!cacheData) {
                console.log(`[MemoryCache] Cache miss for key "${key}"`);
                return null;
            }

            // Check if cache is expired
            if (Date.now() > cacheData.expiresAt) {
                console.log(`[MemoryCache] Cache expired for key "${key}"`);
                this.delete(key);
                return null;
            }

            console.log(`[MemoryCache] Cache hit for key "${key}"`);
            return cacheData.data;
        } catch (error) {
            console.error(`[MemoryCache] CRITICAL: Failed to read cache for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Sets data in cache with optional custom maxAge
     */
    set<T>(key: string, data: T, maxAge?: number): void {
        try {
            const timestamp = Date.now();
            const expiresAt = timestamp + (maxAge || this.defaultMaxAge);
            const ttl = Math.round((maxAge || this.defaultMaxAge) / 1000);

            const cacheData: CacheData<T> = {
                data,
                timestamp,
                expiresAt,
            };

            this.cache.set(key, cacheData);
            console.log(`[MemoryCache] Cached data for key "${key}" (TTL: ${ttl}s)`);
        } catch (error) {
            console.error(`[MemoryCache] CRITICAL: Failed to write cache for key "${key}":`, error);
        }
    }

    /**
     * Deletes a specific cache entry
     */
    delete(key: string): void {
        try {
            this.cache.delete(key);
        } catch (error) {
            console.warn(`Failed to delete cache for key "${key}":`, error);
        }
    }

    /**
     * Clears all cache entries
     */
    clear(): void {
        try {
            this.cache.clear();
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }

    /**
     * Wrapper function that caches the result of an async function
     */
    async withCache<T>(key: string, fn: () => Promise<T>, maxAge?: number): Promise<T> {
        // Try to get from cache first
        const cached = this.get<T>(key);
        if (cached !== null) {
            console.log(`Cache hit for "${key}"`);
            return cached;
        }

        // Cache miss - execute function and cache result
        console.log(`Cache miss for "${key}" - fetching fresh data`);
        const result = await fn();
        this.set(key, result, maxAge);
        return result;
    }
}

/**
 * File-based cache for traditional environments
 */
export class FileCache {
    private cacheDir: string;
    private defaultMaxAge: number;

    constructor(options: CacheOptions = {}) {
        this.cacheDir = options.cacheDir || path.join(process.cwd(), '.cache');
        this.defaultMaxAge = options.maxAge || 60 * 60 * 1000; // 1 hour default
        this.ensureCacheDir();
    }

    private ensureCacheDir(): void {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    private getCacheFilePath(key: string): string {
        const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');
        return path.join(this.cacheDir, `${safeKey}.json`);
    }

    /**
     * Gets cached data if it exists and is not expired
     */
    get<T>(key: string): T | null {
        try {
            const filePath = this.getCacheFilePath(key);

            if (!fs.existsSync(filePath)) {
                return null;
            }

            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const cacheData: CacheData<T> = JSON.parse(fileContent);

            // Check if cache is expired
            if (Date.now() > cacheData.expiresAt) {
                this.delete(key);
                return null;
            }

            return cacheData.data;
        } catch (error) {
            console.warn(`Failed to read cache for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Sets data in cache with optional custom maxAge
     */
    set<T>(key: string, data: T, maxAge?: number): void {
        try {
            const filePath = this.getCacheFilePath(key);
            const timestamp = Date.now();
            const expiresAt = timestamp + (maxAge || this.defaultMaxAge);

            const cacheData: CacheData<T> = {
                data,
                timestamp,
                expiresAt,
            };

            fs.writeFileSync(filePath, JSON.stringify(cacheData, null, 2), 'utf-8');
        } catch (error) {
            console.warn(`Failed to write cache for key "${key}":`, error);
        }
    }

    /**
     * Deletes a specific cache entry
     */
    delete(key: string): void {
        try {
            const filePath = this.getCacheFilePath(key);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.warn(`Failed to delete cache for key "${key}":`, error);
        }
    }

    /**
     * Clears all cache files
     */
    clear(): void {
        try {
            if (fs.existsSync(this.cacheDir)) {
                const files = fs.readdirSync(this.cacheDir);
                for (const file of files) {
                    fs.unlinkSync(path.join(this.cacheDir, file));
                }
            }
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }

    /**
     * Wrapper function that caches the result of an async function
     */
    async withCache<T>(key: string, fn: () => Promise<T>, maxAge?: number): Promise<T> {
        // Try to get from cache first
        const cached = this.get<T>(key);
        if (cached !== null) {
            console.log(`Cache hit for "${key}"`);
            return cached;
        }

        // Cache miss - execute function and cache result
        console.log(`Cache miss for "${key}" - fetching fresh data`);
        const result = await fn();
        this.set(key, result, maxAge);
        return result;
    }
}

/**
 * Detects if running in serverless environment (Vercel, AWS Lambda, etc.)
 */
function isServerlessEnvironment(): boolean {
    const serverlessIndicators = {
        VERCEL: process.env.VERCEL,
        AWS_LAMBDA: process.env.AWS_LAMBDA_FUNCTION_NAME,
        NETLIFY: process.env.NETLIFY,
        GOOGLE_CLOUD: process.env.FUNCTION_NAME
    };
    
    const detectedPlatforms = Object.entries(serverlessIndicators)
        .filter(([_, value]) => value)
        .map(([platform, _]) => platform);
    
    if (detectedPlatforms.length > 0) {
        console.log(`[Cache] Serverless platform detected: ${detectedPlatforms.join(', ')}`);
        return true;
    }
    
    return false;
}

/**
 * Creates appropriate cache instance based on environment
 */
function createCache(): FileCache | MemoryCache {
    const isServerless = isServerlessEnvironment();
    
    if (isServerless) {
        console.log('[Cache] SERVERLESS MODE: Using MemoryCache (file system read-only)');
        return new MemoryCache();
    } else {
        console.log('[Cache] TRADITIONAL MODE: Using FileCache (persistent storage)');
        return new FileCache();
    }
}

// Default cache instance - automatically selects appropriate implementation
export const defaultCache = createCache();

/**
 * Decorator-like function to make any async function cacheable
 * Automatically uses the appropriate cache type for the environment
 */
export function withFileCache<T extends unknown[], R>(
    key: string,
    fn: (...args: T) => Promise<R>,
    options: { maxAge?: number; cache?: FileCache | MemoryCache } = {},
) {
    const cache = options.cache || defaultCache;

    return async (...args: T): Promise<R> => {
        // Include function arguments in cache key for more specific caching
        const fullKey = args.length > 0 ? `${key}_${JSON.stringify(args)}` : key;

        return cache.withCache(fullKey, () => fn(...args), options.maxAge);
    };
}

/**
 * Export cache types for type checking
 */
export type CacheInstance = FileCache | MemoryCache;
