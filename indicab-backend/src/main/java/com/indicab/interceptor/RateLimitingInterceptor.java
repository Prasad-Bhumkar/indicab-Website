package com.indicab.interceptor;

import com.indicab.service.CacheService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Interceptor for rate limiting API requests with distributed support
 *
 * Rate Limiting Strategy:
 * - Single Instance: Uses in-memory token bucket cache (fast, per-process)
 * - Multi-Instance with Redis: Uses Redis-backed state (slower but synchronized across instances)
 * - Fallback: Falls back to in-memory if Redis unavailable
 *
 * Configuration:
 * - redis.enabled: Set to 'true' to enable distributed rate limiting (default: true)
 * - Override rate limits via properties: rate-limit.login.attempts, rate-limit.payment.requests, etc.
 */
@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingInterceptor.class);

    // Per-user rate limits (key = user IP or user ID)
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Autowired(required = false)
    private CacheService cacheService;

    // Rate limiting configurations
    private static final long REQUESTS_PER_MINUTE = 60;
    private static final long LOGIN_ATTEMPTS_PER_15MIN = 5;
    private static final long PAYMENT_REQUESTS_PER_10SEC = 1;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientId = getClientId(request);
        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        try {
            // Use Redis-backed distributed rate limiting if available
            if (cacheService != null) {
                return handleDistributedRateLimit(clientId, requestPath, method, response);
            } else {
                // Fall back to in-memory rate limiting
                return handleLocalRateLimit(clientId, requestPath, method, response);
            }
        } catch (Exception e) {
            logger.error("Error in rate limiting interceptor for client: {}", clientId, e);
            // Allow request if rate limiting fails (fail open)
            return true;
        }
    }

    /**
     * Handle distributed rate limiting using Redis
     * Maintains state across multiple instances
     */
    private boolean handleDistributedRateLimit(String clientId, String requestPath, String method, HttpServletResponse response) {
        String rateLimitKey = "rate_limit:" + clientId + ":" + requestPath;
        RateLimitConfig config = getRateLimitConfig(requestPath);

        // Get current request count from Redis
        AtomicLong requestCount = cacheService.get(rateLimitKey, AtomicLong.class);
        if (requestCount == null) {
            requestCount = new AtomicLong(0);
        }

        long currentCount = requestCount.get();

        // Check if limit exceeded
        if (currentCount >= config.maxRequests) {
            long waitSeconds = config.windowDurationSeconds - (System.currentTimeMillis() / 1000) % config.windowDurationSeconds;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.addHeader("X-Rate-Limit-Limit", String.valueOf(config.maxRequests));
            response.addHeader("X-Rate-Limit-Remaining", "0");
            response.addHeader("X-Rate-Limit-Reset-After", String.valueOf(Math.max(1, waitSeconds)));
            response.addHeader("X-Rate-Limit-Storage", "redis");
            response.setContentType("application/json");
            try {
                response.getWriter().write("{\"error\": \"Rate limit exceeded. Please retry after " + waitSeconds + " seconds.\"}");
            } catch (IOException ioException) {
                logger.error("Error writing rate limit response", ioException);
            }

            logger.warn("Distributed rate limit exceeded for client: {} on path: {} ({}). Requests: {}/{}, Wait: {} seconds",
                       clientId, requestPath, method, currentCount, config.maxRequests, waitSeconds);
            return false;
        }

        // Increment counter and reset TTL
        requestCount.incrementAndGet();
        cacheService.set(rateLimitKey, requestCount, config.windowDurationSeconds);

        response.addHeader("X-Rate-Limit-Limit", String.valueOf(config.maxRequests));
        response.addHeader("X-Rate-Limit-Remaining", String.valueOf(config.maxRequests - currentCount - 1));
        response.addHeader("X-Rate-Limit-Storage", "redis");
        logger.debug("Distributed rate limit check passed for client: {} on path: {} (Count: {}/{})",
                    clientId, requestPath, currentCount + 1, config.maxRequests);
        return true;
    }

    /**
     * Handle local in-memory rate limiting (single instance)
     */
    private boolean handleLocalRateLimit(String clientId, String requestPath, String method, HttpServletResponse response) {
        // Get or create bucket for this client
        Bucket bucket = resolveBucket(clientId, requestPath);

        // Try to consume a token
        if (bucket.tryConsume(1)) {
            // Token consumed, request allowed
            long remainingTokens = bucket.estimateAbilityToConsume(1).getNanosToWaitForRefill() / 1_000_000_000L;
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(Math.max(0, remainingTokens)));
            response.addHeader("X-Rate-Limit-Storage", "memory");
            logger.debug("In-memory rate limit check passed for client: {} on path: {}", clientId, requestPath);
            return true;
        } else {
            // No tokens available, request rejected
            long waitSeconds = bucket.estimateAbilityToConsume(1).getNanosToWaitForRefill() / 1_000_000_000L;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.addHeader("X-Rate-Limit-Reset-After", String.valueOf(waitSeconds));
            response.addHeader("X-Rate-Limit-Storage", "memory");
            response.setContentType("application/json");
            try {
                response.getWriter().write("{\"error\": \"Rate limit exceeded. Please retry after " + waitSeconds + " seconds.\"}");
            } catch (IOException ioException) {
                logger.error("Error writing rate limit response", ioException);
            }

            logger.warn("In-memory rate limit exceeded for client: {} on path: {} ({}). Must wait: {} seconds",
                       clientId, requestPath, method, waitSeconds);
            return false;
        }
    }

    /**
     * Get rate limit configuration for a given path
     */
    private RateLimitConfig getRateLimitConfig(String path) {
        if (path.contains("/auth/login")) {
            // Strict limit on login attempts (5 per 15 minutes)
            return new RateLimitConfig(LOGIN_ATTEMPTS_PER_15MIN, 15 * 60);
        } else if (path.contains("/payments/create")) {
            // Very strict limit on payment creation (1 per 10 seconds)
            return new RateLimitConfig(PAYMENT_REQUESTS_PER_10SEC, 10);
        } else if (path.contains("/auth/register")) {
            // Moderate limit on registration (10 per hour)
            return new RateLimitConfig(10, 60 * 60);
        } else {
            // Default: 60 requests per minute
            return new RateLimitConfig(REQUESTS_PER_MINUTE, 60);
        }
    }

    /**
     * Get or create rate limit bucket for client based on endpoint
     * Different endpoints have different rate limits
     * Used for in-memory rate limiting (fallback)
     */
    @SuppressWarnings("deprecation")
    private Bucket resolveBucket(String clientId, String path) {
        String bucketKey = clientId + ":" + path;

        return cache.computeIfAbsent(bucketKey, key -> {
            RateLimitConfig config = getRateLimitConfig(path);

            Bandwidth limit = Bandwidth.classic(config.maxRequests,
                Refill.intervally(config.maxRequests, Duration.ofSeconds(config.windowDurationSeconds)));

            return Bucket4j.builder().addLimit(limit).build();
        });
    }

    /**
     * Configuration for rate limiting a specific endpoint
     */
    private static class RateLimitConfig {
        final long maxRequests;
        final long windowDurationSeconds;

        RateLimitConfig(long maxRequests, long windowDurationSeconds) {
            this.maxRequests = maxRequests;
            this.windowDurationSeconds = windowDurationSeconds;
        }
    }

    /**
     * Get client identifier (IP address or user ID)
     */
    private String getClientId(HttpServletRequest request) {
        // Try to get from X-Forwarded-For header (behind proxy)
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        return clientIp;
    }

    /**
     * Get current bucket usage for monitoring
     */
    public Map<String, Bucket> getBuckets() {
        return cache;
    }

    /**
     * Clear all buckets (useful for testing or admin operations)
     */
    public void clearAllBuckets() {
        logger.warn("Clearing all rate limit buckets");
        cache.clear();
    }

    /**
     * Get rate limit statistics
     */
    public String getStatistics() {
        return String.format("Active rate limit buckets: %d", cache.size());
    }
}
