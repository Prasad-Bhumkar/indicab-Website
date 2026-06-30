package com.indicab.interceptor;

import com.indicab.service.CacheService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RateLimitingInterceptor Tests")
class RateLimitingInterceptorTest {

    @Mock
    private CacheService cacheService;

    @InjectMocks
    private RateLimitingInterceptor interceptor;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private Object handler;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        handler = new Object();
    }

    // ========== In-Memory (Local) Rate Limiting Tests ==========

    @Test
    @DisplayName("Should allow request within default rate limit (local mode)")
    void testLocalRateLimitAllowed() throws Exception {
        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("10.0.0.1");

        // cacheService is null in this scenario — triggers local path
        interceptor = new RateLimitingInterceptor();

        boolean result = interceptor.preHandle(request, response, handler);

        assertThat(result).isTrue();
        assertThat(response.getHeader("X-Rate-Limit-Storage")).isEqualTo("memory");
    }

    @Test
    @DisplayName("Should reject request when rate limit exceeded (local mode)")
    void testLocalRateLimitExceeded() throws Exception {
        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("10.0.0.1");

        interceptor = new RateLimitingInterceptor();

        // Exhaust the 300 requests per minute
        for (int i = 0; i < 300; i++) {
            interceptor.preHandle(request, response, handler);
        }

        // 61st request should be blocked
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        boolean result = interceptor.preHandle(request, blockedResponse, handler);

        assertThat(result).isFalse();
        assertThat(blockedResponse.getStatus()).isEqualTo(429);
        assertThat(blockedResponse.getHeader("X-Rate-Limit-Storage")).isEqualTo("memory");
        assertThat(blockedResponse.getContentType()).isEqualTo("application/json");
    }

    @Test
    @DisplayName("Should apply stricter rate limit for login endpoint (local mode)")
    void testLocalRateLimitLogin() throws Exception {
        request.setRequestURI("/api/v1/auth/login");
        request.setRemoteAddr("10.0.0.1");

        interceptor = new RateLimitingInterceptor();

        // 100 attempts allowed per 15 minutes
        for (int i = 0; i < 100; i++) {
            boolean result = interceptor.preHandle(request, response, handler);
            assertThat(result).as("Attempt %d should be allowed", i + 1).isTrue();
        }

        // 6th attempt should be blocked
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        boolean result = interceptor.preHandle(request, blockedResponse, handler);

        assertThat(result).isFalse();
        assertThat(blockedResponse.getStatus()).isEqualTo(429);
    }

    @Test
    @DisplayName("Should apply very strict rate limit for payment endpoint (local mode)")
    void testLocalRateLimitPayment() throws Exception {
        request.setRequestURI("/api/v1/payments/create");
        request.setRemoteAddr("10.0.0.1");

        interceptor = new RateLimitingInterceptor();

        // 10 attempts allowed per 10 seconds
        boolean result;
        for (int i = 0; i < 10; i++) {
            result = interceptor.preHandle(request, new MockHttpServletResponse(), handler);
            assertThat(result).as("Attempt %d should be allowed", i + 1).isTrue();
        }

        // 11th attempt should be blocked
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        result = interceptor.preHandle(request, blockedResponse, handler);
        assertThat(result).isFalse();
        assertThat(blockedResponse.getStatus()).isEqualTo(429);
    }

    @Test
    @DisplayName("Should apply moderate rate limit for register endpoint (local mode)")
    void testLocalRateLimitRegister() throws Exception {
        request.setRequestURI("/api/v1/auth/register");
        request.setRemoteAddr("10.0.0.1");

        interceptor = new RateLimitingInterceptor();

        // 10 attempts allowed per hour
        for (int i = 0; i < 10; i++) {
            boolean result = interceptor.preHandle(request, response, handler);
            assertThat(result).as("Attempt %d should be allowed", i + 1).isTrue();
        }

        // 11th attempt should be blocked
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        boolean result = interceptor.preHandle(request, blockedResponse, handler);
        assertThat(result).isFalse();
        assertThat(blockedResponse.getStatus()).isEqualTo(429);
    }

    @Test
    @DisplayName("Should track different IPs separately (local mode)")
    void testLocalRateLimitSeparateIps() throws Exception {
        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("10.0.0.1");

        interceptor = new RateLimitingInterceptor();

        // Exhaust IP 10.0.0.1
        for (int i = 0; i < 60; i++) {
            interceptor.preHandle(request, response, handler);
        }

        // Different IP should still be allowed
        MockHttpServletRequest request2 = new MockHttpServletRequest();
        request2.setRequestURI("/api/v1/users");
        request2.setRemoteAddr("10.0.0.2");
        MockHttpServletResponse response2 = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(request2, response2, handler);
        assertThat(result).isTrue();
        assertThat(response2.getHeader("X-Rate-Limit-Storage")).isEqualTo("memory");
    }

    @Test
    @DisplayName("Should handle different endpoints with separate buckets (local mode)")
    void testLocalRateLimitDifferentEndpoints() throws Exception {
        interceptor = new RateLimitingInterceptor();

        // Exhaust users endpoint for IP 10.0.0.1
        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("10.0.0.1");
        for (int i = 0; i < 60; i++) {
            interceptor.preHandle(request, response, handler);
        }

        // Different endpoint from same IP should have its own bucket
        MockHttpServletRequest request2 = new MockHttpServletRequest();
        request2.setRequestURI("/api/v1/drivers");
        request2.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse response2 = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(request2, response2, handler);
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should include remaining tokens header on successful request (local mode)")
    void testLocalRateLimitRemainingHeader() throws Exception {
        request.setRequestURI("/api/v1/test");
        request.setRemoteAddr("10.0.0.1");

        interceptor = new RateLimitingInterceptor();

        interceptor.preHandle(request, response, handler);

        assertThat(response.getHeader("X-Rate-Limit-Remaining")).isNotNull();
        assertThat(response.getHeader("X-Rate-Limit-Storage")).isEqualTo("memory");
    }

    // ========== Distributed (Redis) Rate Limiting Tests ==========

    @Test
    @DisplayName("Should allow request within rate limit (distributed mode)")
    void testDistributedRateLimitAllowed() throws Exception {
        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("10.0.0.1");

        when(cacheService.get(anyString(), eq(AtomicLong.class))).thenReturn(null);

        boolean result = interceptor.preHandle(request, response, handler);

        assertThat(result).isTrue();
        assertThat(response.getHeader("X-Rate-Limit-Storage")).isEqualTo("redis");
        assertThat(response.getHeader("X-Rate-Limit-Limit")).isEqualTo("300");
        verify(cacheService).set(anyString(), any(AtomicLong.class), eq(60L));
    }

    @Test
    @DisplayName("Should reject request when distributed rate limit exceeded")
    void testDistributedRateLimitExceeded() throws Exception {
        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("10.0.0.1");

        AtomicLong counter = new AtomicLong(300);
        when(cacheService.get(anyString(), eq(AtomicLong.class))).thenReturn(counter);

        boolean result = interceptor.preHandle(request, response, handler);

        assertThat(result).isFalse();
        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("X-Rate-Limit-Storage")).isEqualTo("redis");
        assertThat(response.getHeader("X-Rate-Limit-Limit")).isEqualTo("300");
        assertThat(response.getHeader("X-Rate-Limit-Remaining")).isEqualTo("0");
        assertThat(response.getHeader("X-Rate-Limit-Reset-After")).isNotNull();
    }

    @Test
    @DisplayName("Should apply stricter distributed limit for login endpoint")
    void testDistributedRateLimitLogin() throws Exception {
        request.setRequestURI("/api/v1/auth/login");
        request.setRemoteAddr("10.0.0.1");

        when(cacheService.get(anyString(), eq(AtomicLong.class))).thenReturn(null);

        boolean result = interceptor.preHandle(request, response, handler);

        assertThat(result).isTrue();
        assertThat(response.getHeader("X-Rate-Limit-Limit")).isEqualTo("100");
        verify(cacheService).set(anyString(), any(AtomicLong.class), eq(900L));
    }

    @Test
    @DisplayName("Should apply strict distributed limit for payment endpoint")
    void testDistributedRateLimitPayment() throws Exception {
        request.setRequestURI("/api/v1/payments/create");
        request.setRemoteAddr("10.0.0.1");

        when(cacheService.get(anyString(), eq(AtomicLong.class))).thenReturn(null);

        boolean result = interceptor.preHandle(request, response, handler);

        assertThat(result).isTrue();
        assertThat(response.getHeader("X-Rate-Limit-Limit")).isEqualTo("10");
        verify(cacheService).set(anyString(), any(AtomicLong.class), eq(10L));
    }

    @Test
    @DisplayName("Should apply moderate distributed limit for register endpoint")
    void testDistributedRateLimitRegister() throws Exception {
        request.setRequestURI("/api/v1/auth/register");
        request.setRemoteAddr("10.0.0.1");

        when(cacheService.get(anyString(), eq(AtomicLong.class))).thenReturn(null);

        boolean result = interceptor.preHandle(request, response, handler);

        assertThat(result).isTrue();
        assertThat(response.getHeader("X-Rate-Limit-Limit")).isEqualTo("10");
        verify(cacheService).set(anyString(), any(AtomicLong.class), eq(3600L));
    }

    @Test
    @DisplayName("Should include distributed remaining header")
    void testDistributedRateLimitRemainingHeader() throws Exception {
        request.setRequestURI("/api/v1/test");
        request.setRemoteAddr("10.0.0.1");

        when(cacheService.get(anyString(), eq(AtomicLong.class))).thenReturn(null);

        interceptor.preHandle(request, response, handler);

        assertThat(response.getHeader("X-Rate-Limit-Remaining")).isEqualTo("299");
        assertThat(response.getHeader("X-Rate-Limit-Limit")).isEqualTo("300");
        assertThat(response.getHeader("X-Rate-Limit-Storage")).isEqualTo("redis");
    }

    // ========== Client ID Resolution Tests ==========

    @Test
    @DisplayName("Should use X-Forwarded-For header when present")
    void testClientIdFromXForwardedFor() throws Exception {
        request.setRequestURI("/api/v1/users");
        request.addHeader("X-Forwarded-For", "203.0.113.1");

        interceptor = new RateLimitingInterceptor();

        boolean result = interceptor.preHandle(request, response, handler);
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should use remote address when no X-Forwarded-For header")
    void testClientIdFromRemoteAddr() throws Exception {
        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("192.168.1.100");

        interceptor = new RateLimitingInterceptor();

        boolean result = interceptor.preHandle(request, response, handler);
        assertThat(result).isTrue();
    }

    // ========== Bucket Management Tests ==========

    @Test
    @DisplayName("Should clear all rate limit buckets")
    void testClearAllBuckets() {
        interceptor = new RateLimitingInterceptor();

        // Populate some buckets
        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("10.0.0.1");
        interceptor.getBuckets().put("10.0.0.1:/api/v1/users",
                io.github.bucket4j.Bucket4j.builder()
                        .addLimit(io.github.bucket4j.Bandwidth.simple(60, java.time.Duration.ofMinutes(1)))
                        .build());

        assertThat(interceptor.getBuckets()).isNotEmpty();

        interceptor.clearAllBuckets();
        assertThat(interceptor.getBuckets()).isEmpty();
    }

    @Test
    @DisplayName("Should return bucket statistics")
    void testGetStatistics() {
        interceptor = new RateLimitingInterceptor();

        String stats = interceptor.getStatistics();
        assertThat(stats).contains("Active rate limit buckets: 0");
    }

    @Test
    @DisplayName("Should fall back to local mode when cacheService is null")
    void testFallbackToLocalWhenNoCacheService() throws Exception {
        interceptor = new RateLimitingInterceptor();

        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("10.0.0.1");

        // cacheService is null (not injected)
        boolean result = interceptor.preHandle(request, response, handler);

        assertThat(result).isTrue();
        assertThat(response.getHeader("X-Rate-Limit-Storage")).isEqualTo("memory");
    }

    @Test
    @DisplayName("Should fail-open when rate limiting throws exception")
    void testFailOpenOnException() throws Exception {
        request.setRequestURI("/api/v1/users");
        request.setRemoteAddr("10.0.0.1");

        when(cacheService.get(anyString(), eq(AtomicLong.class))).thenThrow(new RuntimeException("Redis connection failed"));

        boolean result = interceptor.preHandle(request, response, handler);

        // Should allow the request (fail open)
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should use clientId based on X-Forwarded-For in distributed mode")
    void testDistributedClientIdXForwardedFor() throws Exception {
        request.setRequestURI("/api/v1/users");
        request.addHeader("X-Forwarded-For", "203.0.113.1");

        when(cacheService.get(contains("203.0.113.1"), eq(AtomicLong.class))).thenReturn(null);

        boolean result = interceptor.preHandle(request, response, handler);

        assertThat(result).isTrue();
        verify(cacheService).set(contains("203.0.113.1"), any(AtomicLong.class), eq(60L));
    }

    @Test
    @DisplayName("Should return 429 with JSON error body when rate limited")
    void testRateLimitResponseBody() throws Exception {
        request.setRequestURI("/api/v1/auth/login");
        request.setRemoteAddr("10.0.0.1");

        interceptor = new RateLimitingInterceptor();

        for (int i = 0; i < 100; i++) {
            interceptor.preHandle(request, response, handler);
        }

        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        interceptor.preHandle(request, blockedResponse, handler);

        assertThat(blockedResponse.getStatus()).isEqualTo(429);
        assertThat(blockedResponse.getContentAsString()).contains("Rate limit exceeded");
    }
}
