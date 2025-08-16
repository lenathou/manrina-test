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
 * In-memory cache implementation for serverless environments
 */
class MemoryCache {
    private cache = new Map<string, CacheData<unknown>>();
    private defaultMaxAge: number;

    constructor(maxAge: number = 60 * 60 * 1000) {
        this.defaultMaxAge = maxAge;
    }

    get<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (!cached) {
            return null;
        }

        if (Date.now() > cached.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return cached.data as T;
    }

    set<T>(key: string, data: T, maxAge?: number): void {
        const ttl = maxAge || this.defaultMaxAge;
        const expiresAt = Date.now() + ttl;
        
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt
        });
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    async withCache<T>(key: string, fn: () => Promise<T>, maxAge?: number): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const result = await fn();
        this.set(key, result, maxAge);
        return result;
    }
}

export class FileCache {
    private cacheDir: string;
    private defaultMaxAge: number;
    private isServerless: boolean;

    constructor(options: CacheOptions = {}) {
        // Detect serverless environment (Vercel, AWS Lambda, etc.)
        this.isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT ? true : false;
        
        // Use /tmp in serverless environments, .cache locally
        const defaultCacheDir = this.isServerless ? '/tmp/.cache' : path.join(process.cwd(), '.cache');
        this.cacheDir = options.cacheDir || defaultCacheDir;
        
        this.defaultMaxAge = options.maxAge || 60 * 60 * 1000; // 1 hour default
        this.ensureCacheDir();
    }

    private ensureCacheDir(): void {
        try {
            if (!fs.existsSync(this.cacheDir)) {
                fs.mkdirSync(this.cacheDir, { recursive: true });
            }
        } catch (error) {
            // In serverless environments, if we can't create cache dir, disable caching
            if (this.isServerless) {
                console.warn('Cache directory creation failed in serverless environment, disabling file cache:', error);
                this.cacheDir = '';
            } else {
                throw error;
            }
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
        // If cache is disabled (empty cacheDir), return null
        if (!this.cacheDir) {
            return null;
        }
        
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
     * Stores data in cache with optional custom expiration
     */
    set<T>(key: string, data: T, maxAge?: number): void {
        // If cache is disabled (empty cacheDir), do nothing
        if (!this.cacheDir) {
            return;
        }
        
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
        // If cache is disabled (empty cacheDir), do nothing
        if (!this.cacheDir) {
            return;
        }
        
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
     * Clears all cache entries
     */
    clear(): void {
        // If cache is disabled (empty cacheDir), do nothing
        if (!this.cacheDir) {
            return;
        }
        
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

// Default cache instance - uses MemoryCache in serverless, FileCache locally
const isServerlessEnv = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT;
export const defaultCache = isServerlessEnv ? new MemoryCache() : new FileCache();

/**
 * Decorator-like function to make any async function cacheable
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
