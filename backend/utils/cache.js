class MemoryCache {
    constructor(maxSize = 1000, defaultTTL = 300000) { // 5 minutes default TTL
        this.cache = new Map();
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
    }

    set(key, value, ttl = this.defaultTTL) {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const expiresAt = Date.now() + ttl;
        this.cache.set(key, {
            value,
            expiresAt,
            createdAt: Date.now(),
            hitCount: 0
        });

        this.stats.sets++;
        return true;
    }

    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            this.stats.misses++;
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }

        // Update hit count and move to end (LRU)
        entry.hitCount++;
        this.cache.delete(key);
        this.cache.set(key, entry);
        this.stats.hits++;

        return entry.value;
    }

    has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.deletes++;
        }
        return deleted;
    }

    clear() {
        this.cache.clear();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
    }

    size() {
        return this.cache.size;
    }

    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;

        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            size: this.cache.size,
            maxSize: this.maxSize
        };
    }

    // Clean expired entries
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        return cleaned;
    }
}

// Create cache instances for different data types
const productCache = new MemoryCache(500, 300000); // 5 minutes TTL, 500 items max
const categoryCache = new MemoryCache(100, 600000); // 10 minutes TTL, 100 items max
const searchCache = new MemoryCache(200, 180000); // 3 minutes TTL, 200 items max

// Cache middleware factory
const createCacheMiddleware = (cache, keyGenerator, ttl) => {
    return (req, res, next) => {
        const key = keyGenerator(req);
        const cachedData = cache.get(key);

        if (cachedData) {
            res.set('X-Cache', 'HIT');
            return res.json(cachedData);
        }

        // Store original res.json
        const originalJson = res.json;

        // Override res.json to cache the response
        res.json = function (data) {
            cache.set(key, data, ttl);
            res.set('X-Cache', 'MISS');
            return originalJson.call(this, data);
        };

        next();
    };
};

// Predefined cache middleware for common use cases
const productCacheMiddleware = createCacheMiddleware(
    productCache,
    (req) => `products:${JSON.stringify(req.query)}`,
    300000 // 5 minutes
);

const categoryCacheMiddleware = createCacheMiddleware(
    categoryCache,
    (req) => `categories:${JSON.stringify(req.query)}`,
    600000 // 10 minutes
);

const searchCacheMiddleware = createCacheMiddleware(
    searchCache,
    (req) => `search:${JSON.stringify(req.query)}`,
    180000 // 3 minutes
);

// Cache invalidation helpers
const invalidateProductCache = () => {
    productCache.clear();
    console.log('🗑️ Product cache invalidated');
};

const invalidateCategoryCache = () => {
    categoryCache.clear();
    console.log('🗑️ Category cache invalidated');
};

const invalidateSearchCache = () => {
    searchCache.clear();
    console.log('🗑️ Search cache invalidated');
};

// Periodic cleanup (run every 5 minutes)
setInterval(() => {
    const productCleaned = productCache.cleanup();
    const categoryCleaned = categoryCache.cleanup();
    const searchCleaned = searchCache.cleanup();

    if (productCleaned + categoryCleaned + searchCleaned > 0) {
        console.log(`🧹 Cache cleanup: ${productCleaned + categoryCleaned + searchCleaned} expired entries removed`);
    }
}, 300000);

module.exports = {
    MemoryCache,
    productCache,
    categoryCache,
    searchCache,
    createCacheMiddleware,
    productCacheMiddleware,
    categoryCacheMiddleware,
    searchCacheMiddleware,
    invalidateProductCache,
    invalidateCategoryCache,
    invalidateSearchCache
};