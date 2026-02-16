package com.indicab.config;

/**
 * DEPRECATED: This configuration is no longer used.
 * 
 * CORS configuration has been consolidated into SecurityConfig.java to follow the single responsibility principle
 * and avoid configuration conflicts.
 * 
 * The corsConfigurationSource() bean in SecurityConfig.java now handles all CORS configuration using the
 * cors.allowed-origins environment variable for proper environment-specific configuration.
 * 
 * This class is kept only for reference and should be deleted in a future cleanup.
 * 
 * @see com.indicab.config.SecurityConfig#corsConfigurationSource()
 * @deprecated Use SecurityConfig instead
 */
@Deprecated(since = "1.2", forRemoval = true)
public class CorsConfig {
    // This class is deprecated. See SecurityConfig for active CORS configuration.
}
