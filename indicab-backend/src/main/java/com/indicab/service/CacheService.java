package com.indicab.service;

/**
 * Service interface for caching frequently accessed data
 * Supports both in-memory and Redis caching
 */
public interface CacheService {
    
    /**
     * Get value from cache
     */
    <T> T get(String key, Class<T> type);
    
    /**
     * Set value in cache with default TTL (5 minutes)
     */
    <T> void set(String key, T value);
    
    /**
     * Set value in cache with custom TTL (in seconds)
     */
    <T> void set(String key, T value, long ttlSeconds);
    
    /**
     * Remove value from cache
     */
    void remove(String key);
    
    /**
     * Clear all cache entries
     */
    void clear();
    
    /**
     * Check if key exists in cache
     */
    boolean hasKey(String key);
    
    /**
     * Get cache hit rate (for monitoring)
     */
    long getCacheHits();
    
    /**
     * Get cache miss count
     */
    long getCacheMisses();
    
    /**
     * Reset cache statistics
     */
    void resetStats();
}
