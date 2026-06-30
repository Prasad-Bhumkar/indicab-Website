package com.indicab.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CacheServiceImpl Tests")
class CacheServiceImplTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private RedisConnectionFactory connectionFactory;

    @Mock
    private RedisConnection redisConnection;

    @InjectMocks
    private CacheServiceImpl cacheService;

    private static final String TEST_KEY = "test:key";
    private static final String TEST_VALUE = "test-value";

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(redisTemplate.getConnectionFactory()).thenReturn(connectionFactory);
        lenient().when(connectionFactory.getConnection()).thenReturn(redisConnection);
    }

    @Test
    @DisplayName("Should store value in cache")
    void testSet() {
        cacheService.set(TEST_KEY, TEST_VALUE);

        verify(valueOperations).set(eq(TEST_KEY), eq(TEST_VALUE), anyLong(), any());
    }

    @Test
    @DisplayName("Should store value in cache with custom TTL")
    void testSetWithTtl() {
        cacheService.set(TEST_KEY, TEST_VALUE, 600L);

        verify(valueOperations).set(eq(TEST_KEY), eq(TEST_VALUE), eq(600L), any());
    }

    @Test
    @DisplayName("Should retrieve value from cache")
    void testGet() {
        when(valueOperations.get(TEST_KEY)).thenReturn(TEST_VALUE);

        String result = cacheService.get(TEST_KEY, String.class);

        assertThat(result).isEqualTo(TEST_VALUE);
        assertThat(cacheService.getCacheHits()).isOne();
        assertThat(cacheService.getCacheMisses()).isZero();
    }

    @Test
    @DisplayName("Should return null when key not in cache")
    void testGetNotFound() {
        when(valueOperations.get("nonexistent:key")).thenReturn(null);

        String result = cacheService.get("nonexistent:key", String.class);

        assertThat(result).isNull();
        assertThat(cacheService.getCacheMisses()).isOne();
    }

    @Test
    @DisplayName("Should return null when Redis throws exception")
    void testGetRedisException() {
        when(valueOperations.get(TEST_KEY)).thenThrow(new RuntimeException("Redis unavailable"));

        String result = cacheService.get(TEST_KEY, String.class);

        assertThat(result).isNull();
        assertThat(cacheService.getCacheMisses()).isOne();
    }

    @Test
    @DisplayName("Should evict key from cache")
    void testRemove() {
        cacheService.set(TEST_KEY, TEST_VALUE);

        cacheService.remove(TEST_KEY);

        verify(redisTemplate).delete(TEST_KEY);
    }

    @Test
    @DisplayName("Should clear all cache")
    void testClear() {
        cacheService.set(TEST_KEY, TEST_VALUE);
        cacheService.set("another:key", "another-value");

        cacheService.clear();

        verify(redisConnection).flushDb();
        assertThat(cacheService.getCacheHits()).isZero();
    }

    @Test
    @DisplayName("Should check if key exists in cache")
    void testHasKey() {
        when(redisTemplate.hasKey(TEST_KEY)).thenReturn(true);

        boolean result = cacheService.hasKey(TEST_KEY);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should return false when key does not exist")
    void testHasKeyNotFound() {
        when(redisTemplate.hasKey("nonexistent:key")).thenReturn(false);

        boolean result = cacheService.hasKey("nonexistent:key");

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should return false when Redis throws exception on hasKey")
    void testHasKeyException() {
        when(redisTemplate.hasKey(TEST_KEY)).thenThrow(new RuntimeException("Redis error"));

        boolean result = cacheService.hasKey(TEST_KEY);

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should get cache hits count")
    void testGetCacheHits() {
        cacheService.get("test:key", String.class);

        assertThat(cacheService.getCacheHits()).isZero();

        when(valueOperations.get("test:key")).thenReturn("value");
        cacheService.get("test:key", String.class);

        assertThat(cacheService.getCacheHits()).isOne();
    }

    @Test
    @DisplayName("Should get cache misses count")
    void testGetCacheMisses() {
        cacheService.get(TEST_KEY, String.class);
        cacheService.get(TEST_KEY + "2", String.class);

        assertThat(cacheService.getCacheMisses()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Should reset statistics")
    void testResetStats() {
        cacheService.get(TEST_KEY, String.class);
        assertThat(cacheService.getCacheMisses()).isOne();

        cacheService.resetStats();

        assertThat(cacheService.getCacheHits()).isZero();
        assertThat(cacheService.getCacheMisses()).isZero();
    }

    @Test
    @DisplayName("Should get hit rate")
    void testGetHitRate() {
        assertThat(cacheService.getHitRate()).isZero();

        when(valueOperations.get(TEST_KEY)).thenReturn(TEST_VALUE);
        cacheService.get(TEST_KEY, String.class);

        assertThat(cacheService.getHitRate()).isEqualTo(100.0);
    }

    @Test
    @DisplayName("Should get cache status")
    void testGetCacheStatus() {
        String status = cacheService.getCacheStatus();

        assertThat(status).isNotNull();
        assertThat(status).contains("Hits: 0");
        assertThat(status).contains("Misses: 0");
        assertThat(status).contains("Local Cache Size: 0");
    }

    @Test
    @DisplayName("Should handle missing Redis gracefully (redisTemplate null)")
    void testSetWithoutRedis() {
        CacheServiceImpl localOnlyService = new CacheServiceImpl();

        localOnlyService.set(TEST_KEY, TEST_VALUE);

        String result = localOnlyService.get(TEST_KEY, String.class);
        assertThat(result).isEqualTo(TEST_VALUE); // falls back to local cache
    }

    @Test
    @DisplayName("Should store integer values in cache")
    void testSetAndGetInteger() {
        when(valueOperations.get("int:key")).thenReturn(42);

        cacheService.set("int:key", 42);
        Integer result = cacheService.get("int:key", Integer.class);

        assertThat(result).isEqualTo(42); // retrieved from Redis and converted
    }

    @Test
    @DisplayName("Should handle set operation when Redis is unavailable")
    void testSetRedisException() {
        doThrow(new RuntimeException("Redis unavailable"))
                .when(valueOperations).set(anyString(), any(), anyLong(), any());

        cacheService.set(TEST_KEY, TEST_VALUE);

        // Should not throw; exception caught internally
        verify(valueOperations).set(anyString(), any(), anyLong(), any());
    }

    @Test
    @DisplayName("Should handle remove operation when Redis is unavailable")
    void testRemoveRedisException() {
        doThrow(new RuntimeException("Redis unavailable")).when(redisTemplate).delete(TEST_KEY);

        cacheService.remove(TEST_KEY);

        // Should not throw; exception caught internally
        verify(redisTemplate).delete(TEST_KEY);
    }
}
