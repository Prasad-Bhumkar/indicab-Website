package com.indicab.util;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Utility for tracking error metrics across services
 * Integrates with Micrometer for Prometheus-compatible monitoring
 */
@Component
public class MetricsHelper {

    private static final Logger logger = LoggerFactory.getLogger(MetricsHelper.class);
    private final MeterRegistry meterRegistry;

    public MetricsHelper(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    /**
     * Record an error occurrence with service and exception type
     * 
     * @param serviceName The name of the service where error occurred (e.g., "BookingService")
     * @param exception The exception that occurred
     */
    public void recordError(String serviceName, Exception exception) {
        if (exception == null) {
            return;
        }

        String errorType = exception.getClass().getSimpleName();
        
        // Increment counter with tags for service and error type
        Counter.builder("service.errors")
                .tag("service", serviceName)
                .tag("error_type", errorType)
                .description("Total count of errors by service and type")
                .register(meterRegistry)
                .increment();

        logger.debug("Recorded error metric - service: {}, errorType: {}", serviceName, errorType);
    }

    /**
     * Record an error with additional context
     * 
     * @param serviceName The name of the service where error occurred
     * @param exception The exception that occurred
     * @param methodName The method name where error occurred
     */
    public void recordError(String serviceName, Exception exception, String methodName) {
        if (exception == null) {
            return;
        }

        String errorType = exception.getClass().getSimpleName();
        
        // Increment counter with tags for service, error type, and method
        Counter.builder("service.errors")
                .tag("service", serviceName)
                .tag("error_type", errorType)
                .tag("method", methodName)
                .description("Total count of errors by service, error type, and method")
                .register(meterRegistry)
                .increment();

        logger.debug("Recorded error metric - service: {}, method: {}, errorType: {}", 
                serviceName, methodName, errorType);
    }

    /**
     * Record a validation error
     * 
     * @param serviceName The name of the service
     * @param validationFailureType The type of validation failure (e.g., "INVALID_EMAIL", "DUPLICATE_USER")
     */
    public void recordValidationError(String serviceName, String validationFailureType) {
        Counter.builder("validation.errors")
                .tag("service", serviceName)
                .tag("failure_type", validationFailureType)
                .description("Total count of validation errors by service and type")
                .register(meterRegistry)
                .increment();

        logger.debug("Recorded validation error metric - service: {}, failureType: {}", 
                serviceName, validationFailureType);
    }

    /**
     * Record a business logic error
     * 
     * @param serviceName The name of the service
     * @param errorCode The business error code/reason
     */
    public void recordBusinessError(String serviceName, String errorCode) {
        Counter.builder("business.errors")
                .tag("service", serviceName)
                .tag("error_code", errorCode)
                .description("Total count of business logic errors by service and code")
                .register(meterRegistry)
                .increment();

        logger.debug("Recorded business error metric - service: {}, errorCode: {}", 
                serviceName, errorCode);
    }
}
