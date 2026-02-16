package com.indicab.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * Redis Configuration with fallback support
 *
 * Redis is optional and can be disabled by setting redis.enabled=false
 * This allows the application to work in-memory cache only if Redis is unavailable.
 *
 * Spring Boot Auto-Configuration:
 * - When redis.enabled=true, Spring Boot will automatically:
 *   - Create RedisConnectionFactory (using Lettuce driver)
 *   - Create RedisTemplate bean with default serialization
 *   - Configure connection pooling from application.properties
 *
 * - When redis.enabled=false:
 *   - Redis auto-configuration is disabled
 *   - CacheServiceImpl falls back to in-memory cache only
 *
 * Environment Variables:
 * - spring.redis.host: Redis server host (default: localhost)
 * - spring.redis.port: Redis server port (default: 6379)
 * - spring.redis.password: Redis password (optional)
 * - spring.redis.timeout: Connection timeout (default: 2000ms)
 * - redis.enabled: Enable/disable Redis (default: true)
 */
@Configuration
@ConditionalOnProperty(name = "redis.enabled", havingValue = "true", matchIfMissing = true)
public class RedisConfig {

    private static final Logger logger = LoggerFactory.getLogger(RedisConfig.class);

    public RedisConfig() {
        logger.info("Redis auto-configuration enabled. Using Spring Boot defaults with Lettuce driver.");
    }
}
