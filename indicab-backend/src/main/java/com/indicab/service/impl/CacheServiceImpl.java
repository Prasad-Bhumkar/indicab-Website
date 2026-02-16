package com.indicab.service.impl;

import com.indicab.service.CacheService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Implementation of CacheService using Redis with automatic fallback to in-memory cache
 *
 * This service provides caching with the following behavior:
 * - If Redis is enabled and available: Uses Redis for distributed caching + in-memory cache as L2
 * - If Redis is disabled or unavailable: Falls back to in-memory cache only
 *
 * Configuration:
 * - redis.enabled: Set to 'false' to disable Redis entirely (default: true)
 * - spring.redis.host, spring.redis.port: Redis connection details
 *
 * Cache Statistics:
 * - Tracks cache hits and misses for monitoring and debugging
 * - Available via getCacheHits(), getCacheMisses(), getHitRate()
 */
@Service
public class CacheServiceImpl implements CacheService {

    private static final Logger logger = LoggerFactory.getLogger(CacheServiceImpl.class);
    private static final long DEFAULT_TTL_SECONDS = 300; // 5 minutes

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    private final ConcurrentHashMap<String, CacheEntry<?>> localCache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AtomicLong cacheHits = new AtomicLong(0);
    private final AtomicLong cacheMisses = new AtomicLong(0);

    /**
     * Internal class to store cache entries with TTL
     */
    private static class CacheEntry<T> {
        private final T value;
        private final long expiryTime;

        public CacheEntry(T value, long ttlSeconds) {
            this.value = value;
            this.expiryTime = System.currentTimeMillis() + (ttlSeconds * 1000);
        }

        public boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }

    @Override
    public <T> T get(String key, Class<T> type) {
        logger.debug("Cache get attempt for key: {}", key);

        try {
            // Try Redis first if available
            if (redisTemplate != null) {
                Object value = redisTemplate.opsForValue().get(key);
                if (value != null) {
                    logger.debug("Cache hit in Redis for key: {}", key);
                    cacheHits.incrementAndGet();
                    return objectMapper.convertValue(value, type);
                }
            }

            // Fall back to local cache
            @SuppressWarnings("unchecked")
            CacheEntry<T> entry = (CacheEntry<T>) localCache.get(key);
            if (entry != null) {
                if (!entry.isExpired()) {
                    logger.debug("Cache hit in local cache for key: {}", key);
                    cacheHits.incrementAndGet();
                    return entry.value;
                } else {
                    // Remove expired entry
                    localCache.remove(key);
                    logger.debug("Expired cache entry removed for key: {}", key);
                }
            }

            logger.debug("Cache miss for key: {}", key);
            cacheMisses.incrementAndGet();
            return null;

        } catch (Exception e) {
            logger.error("Error retrieving cache for key: {}", key, e);
            cacheMisses.incrementAndGet();
            return null;
        }
    }

    @Override
    public <T> void set(String key, T value) {
        set(key, value, DEFAULT_TTL_SECONDS);
    }

    @Override
    public <T> void set(String key, T value, long ttlSeconds) {
        logger.debug("Cache set for key: {}, TTL: {} seconds", key, ttlSeconds);

        try {
            // Store in Redis if available
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(key, value, ttlSeconds, TimeUnit.SECONDS);
                logger.debug("Value cached in Redis for key: {}", key);
            }

            // Also store in local cache
            localCache.put(key, new CacheEntry<>(value, ttlSeconds));
            logger.debug("Value cached in local cache for key: {}", key);

        } catch (Exception e) {
            logger.error("Error setting cache for key: {}", key, e);
        }
    }

    @Override
    public void remove(String key) {
        logger.debug("Cache invalidation for key: {}", key);

        try {
            // Remove from Redis
            if (redisTemplate != null) {
                redisTemplate.delete(key);
                logger.debug("Cache entry removed from Redis for key: {}", key);
            }

            // Remove from local cache
            localCache.remove(key);
            logger.debug("Cache entry removed from local cache for key: {}", key);

        } catch (Exception e) {
            logger.error("Error removing cache for key: {}", key, e);
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void clear() {
        logger.warn("Clearing all cache entries");

        try {
            // Clear Redis
            if (redisTemplate != null) {
                var connection = redisTemplate.getConnectionFactory().getConnection();
                connection.flushDb();
                logger.debug("Redis cache cleared");
            }

            // Clear local cache
            localCache.clear();
            logger.debug("Local cache cleared");

            // Reset statistics
            resetStats();
            logger.info("All caches cleared and statistics reset");

        } catch (Exception e) {
            logger.error("Error clearing cache", e);
        }
    }

    @Override
    public boolean hasKey(String key) {
        try {
            // Check Redis first
            if (redisTemplate != null) {
                Boolean exists = redisTemplate.hasKey(key);
                if (exists != null && exists) {
                    return true;
                }
            }

            // Check local cache
            CacheEntry<?> entry = localCache.get(key);
            if (entry != null && !entry.isExpired()) {
                return true;
            }

            return false;
        } catch (Exception e) {
            logger.error("Error checking cache key existence: {}", key, e);
            return false;
        }
    }

    @Override
    public long getCacheHits() {
        return cacheHits.get();
    }

    @Override
    public long getCacheMisses() {
        return cacheMisses.get();
    }

    @Override
    public void resetStats() {
        cacheHits.set(0);
        cacheMisses.set(0);
        logger.info("Cache statistics reset");
    }

    /**
     * Get cache hit rate (percentage)
     */
    public double getHitRate() {
        long hits = cacheHits.get();
        long misses = cacheMisses.get();
        long total = hits + misses;

        if (total == 0) {
            return 0.0;
        }

        return (double) hits / total * 100;
    }

    /**
     * Get cache status (for monitoring)
     */
    public String getCacheStatus() {
        return String.format("Hits: %d, Misses: %d, Hit Rate: %.2f%%, Local Cache Size: %d",
                getCacheHits(), getCacheMisses(), getHitRate(), localCache.size());
    }
}
