type Options = {
    ttl?: number;
    cleanupInterval?: number;
};

type CacheKeyFn<K, U extends unknown[]> = (...args: U) => K;

type CacheItem<V> = {
    value: V;
    expiresAt: number;
};

export class TtlCache<K, V> {
    private cache: Map<K, CacheItem<V>> = new Map();
    private ttl: number; // Time-to-live in milliseconds
    private cleanupInterval: number;
    private timeoutId?: NodeJS.Timeout;

    constructor({ ttl = 10_000, cleanupInterval = 5000 }: Options = {}) {
        this.ttl = ttl;
        this.cleanupInterval = cleanupInterval;
        this.scheduleCleanup();
    }

    // Set a value with expiration
    public set(key: K, value: V): void {
        this.cache.set(key, { value, expiresAt: Date.now() + this.ttl });
    }

    public get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;
        return entry.value;
    }

    public wrap<T extends (...args: any[]) => any>(
        fn: T,
        cacheKeyFn: CacheKeyFn<K, Parameters<T>>,
    ): (...args: Parameters<T>) => ReturnType<T> {
        return (...args: Parameters<T>) => {
            const cacheKey = cacheKeyFn(...args);
            const cachedValue = this.get(cacheKey);
            if (cachedValue !== undefined) {
                return cachedValue;
            } else {
                const value = fn(...args);
                this.set(cacheKey, value);
                return value;
            }
        };
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            if (entry.expiresAt <= now) {
                this.cache.delete(key);
            }
        }
        this.scheduleCleanup();
    }

    private scheduleCleanup(): void {
        /**
         * Required due to source code evaluation in vm context compatibility
         * Temporary workaround until for internal needs
         * Should be removed soon
         */
        if (typeof setTimeout !== 'function') {
            return;
        }
        this.timeoutId = setTimeout(() => this.cleanup(), this.cleanupInterval);
        this.timeoutId.unref?.();
    }

    // Clear the entire cache and stop the cleanup interval
    public clear(): void {
        this.cache.clear();
    }

    public destroy(): void {
        this.clear();
        clearTimeout(this.timeoutId);
    }
}
