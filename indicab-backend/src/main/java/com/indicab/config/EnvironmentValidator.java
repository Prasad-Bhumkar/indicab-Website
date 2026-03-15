package com.indicab.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

/**
 * Validates that all critical environment variables are set at application startup.
 * Fails fast with clear error messages if any required configuration is missing.
 */
@Component
public class EnvironmentValidator {

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${DATABASE_USERNAME:}")
    private String databaseUsername;

    @Value("${DATABASE_PASSWORD:}")
    private String databasePassword;

    @Value("${spring.datasource.url:}")
    private String databaseUrl;

    /**
     * Validate all critical configuration on startup
     * Throws IllegalStateException if any required variable is missing or invalid
     */
    @PostConstruct
    public void validateConfiguration() {
        List<String> errors = new ArrayList<>();

        // Validate JWT Secret (CRITICAL)
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            errors.add("CRITICAL: Environment variable JWT_SECRET is not set!");
            errors.add("  → Add to docker-compose.yml: environment: JWT_SECRET=<your-secret-key>");
            errors.add("  → Minimum length: 32 characters");
            errors.add("  → Recommended: 64+ characters with high entropy");
        } else if (jwtSecret.length() < 32) {
            errors.add("CRITICAL: JWT_SECRET must be at least 32 characters long!");
            errors.add("  → Current length: " + jwtSecret.length());
        }

        // Validate Database Configuration
        if (databaseUrl == null || databaseUrl.trim().isEmpty()) {
            errors.add("WARNING: DATABASE_URL not explicitly set, using default (localhost:3306)");
        }

        // If any errors found, fail startup with detailed message
        if (!errors.isEmpty()) {
            StringBuilder errorMessage = new StringBuilder();
            errorMessage.append("\n========================================\n");
            errorMessage.append("CONFIGURATION VALIDATION FAILED\n");
            errorMessage.append("========================================\n\n");
            for (String error : errors) {
                errorMessage.append(error).append("\n");
            }
            errorMessage.append("\nFix the issues above and restart the application.\n");
            errorMessage.append("========================================\n");

            throw new IllegalStateException(errorMessage.toString());
        }
    }
}
