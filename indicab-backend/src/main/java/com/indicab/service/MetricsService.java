package com.indicab.service;

/**
 * Service interface for tracking application metrics
 * Records operational metrics for monitoring and analysis
 */
public interface MetricsService {
    
    /**
     * Record a successful booking operation
     */
    void recordBookingCreated();
    
    /**
     * Record a successful booking confirmation
     */
    void recordBookingConfirmed();
    
    /**
     * Record a booking cancellation
     */
    void recordBookingCancelled();
    
    /**
     * Record a booking error
     * @param errorType the type of error
     */
    void recordBookingError(String errorType);
    
    /**
     * Record an authentication attempt
     */
    void recordAuthenticationAttempt();
    
    /**
     * Record a failed authentication attempt
     */
    void recordAuthenticationFailure(String reason);
    
    /**
     * Record an audit log operation
     */
    void recordAuditLogCreated();
    
    /**
     * Record an API request
     * @param endpoint the API endpoint
     * @param method the HTTP method
     * @param statusCode the HTTP response status code
     */
    void recordApiRequest(String endpoint, String method, int statusCode);
    
    /**
     * Record a database query
     * @param operation the database operation type (SELECT, INSERT, UPDATE, DELETE)
     * @param executionTimeMs the execution time in milliseconds
     */
    void recordDatabaseQuery(String operation, long executionTimeMs);
    
    /**
     * Record a cache hit
     */
    void recordCacheHit();
    
    /**
     * Record a cache miss
     */
    void recordCacheMiss();
}
