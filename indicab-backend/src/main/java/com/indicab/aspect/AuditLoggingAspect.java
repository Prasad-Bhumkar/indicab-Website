package com.indicab.aspect;

import com.indicab.service.AuditLoggingService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Aspect for audit logging of admin operations
 * Automatically logs CREATE, UPDATE, DELETE operations on admin endpoints
 */
@Aspect
@Component
public class AuditLoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditLoggingAspect.class);

    @Autowired
    private AuditLoggingService auditLoggingService;

    /**
     * Log successful admin operations
     * Targets all methods in Admin controllers
     */
    @AfterReturning(pointcut = "execution(* com.indicab.controller.Admin*Controller.*(..)) && !execution(* com.indicab.controller.AdminWebSocketController.*(..))", returning = "result")
    public void logAdminOperation(JoinPoint joinPoint, Object result) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();

            // Extract operation type from method name
            String operation = extractOperation(methodName);
            String resourceType = extractResourceType(className);

            // Get authenticated user ID
            Long userId = getUserId();
            if (userId == null) return; // Skip if not authenticated

            // Get HTTP request details
            HttpServletRequest request = getHttpRequest();
            String ipAddress = getClientIp(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : "Unknown";

            // Get resource ID from method arguments if available
            Long resourceId = extractResourceId(joinPoint.getArgs(), methodName);

            // Log the operation
            String details = String.format("Method: %s, ClassName: %s", methodName, className);
            auditLoggingService.logOperation(userId, operation, resourceType, resourceId, 
                                            details, ipAddress, userAgent);

            logger.info("Audit log recorded - Operation: {}, Resource: {}, User: {}, IP: {}",
                       operation, resourceType, userId, ipAddress);

        } catch (Exception e) {
            logger.error("Error in audit logging aspect", e);
            // Don't throw exception to avoid disrupting business logic
        }
    }

    /**
     * Log failed admin operations
     */
    @AfterThrowing(pointcut = "execution(* com.indicab.controller.Admin*Controller.*(..)) && !execution(* com.indicab.controller.AdminWebSocketController.*(..))", throwing = "exception")
    public void logAdminOperationError(JoinPoint joinPoint, Throwable exception) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();

            // Extract operation type from method name
            String operation = extractOperation(methodName);
            String resourceType = extractResourceType(className);

            // Get authenticated user ID
            Long userId = getUserId();
            if (userId == null) return; // Skip if not authenticated

            // Get HTTP request details
            HttpServletRequest request = getHttpRequest();
            String ipAddress = getClientIp(request);

            // Log the failed operation
            auditLoggingService.logFailedOperation(userId, operation, resourceType, 
                                                   ipAddress, exception.getMessage());

            logger.warn("Failed audit log recorded - Operation: {}, Resource: {}, User: {}, Error: {}",
                       operation, resourceType, userId, exception.getMessage());

        } catch (Exception e) {
            logger.error("Error in audit logging aspect exception handler", e);
        }
    }

    /**
     * Extract operation type from method name
     * Examples: createUser -> CREATE, updateUser -> UPDATE, deleteUser -> DELETE
     */
    private String extractOperation(String methodName) {
        if (methodName.startsWith("create") || methodName.startsWith("add")) {
            return "CREATE";
        } else if (methodName.startsWith("update") || methodName.startsWith("edit")) {
            return "UPDATE";
        } else if (methodName.startsWith("delete") || methodName.startsWith("remove")) {
            return "DELETE";
        } else if (methodName.startsWith("get") || methodName.startsWith("fetch")) {
            return "READ";
        } else if (methodName.contains("bulk")) {
            return "BULK_OPERATION";
        }
        return "UNKNOWN";
    }

    /**
     * Extract resource type from controller class name
     * Examples: AdminUserController -> User, AdminBookingController -> Booking
     */
    private String extractResourceType(String className) {
        if (className.contains("Admin")) {
            // Remove "AdminController" and extract resource name
            String resourceName = className
                    .replace("Admin", "")
                    .replace("Controller", "")
                    .replaceAll("([a-z])([A-Z])", "$1_$2")
                    .toUpperCase();
            return resourceName.isEmpty() ? "ADMIN" : resourceName;
        }
        return "UNKNOWN";
    }

    /**
     * Extract resource ID from method arguments if available
     */
    private Long extractResourceId(Object[] args, String methodName) {
        if (args == null || args.length == 0) return null;

        // Check if first argument is Long (usually resource ID)
        if (args[0] instanceof Long) {
            return (Long) args[0];
        }

        // Check if any argument is Long (for methods with multiple parameters)
        for (Object arg : args) {
            if (arg instanceof Long) {
                return (Long) arg;
            }
        }

        return null;
    }

    /**
     * Get current authenticated user ID
     */
    private Long getUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                Object principal = authentication.getPrincipal();

                if (principal instanceof com.indicab.config.CustomUserDetails) {
                    return ((com.indicab.config.CustomUserDetails) principal).getId();
                }
            }
        } catch (Exception e) {
            logger.debug("Could not extract user ID from authentication", e);
        }
        return null;
    }

    /**
     * Get HTTP servlet request from current request context
     */
    private HttpServletRequest getHttpRequest() {
        try {
            ServletRequestAttributes requestAttributes = 
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (requestAttributes != null) {
                return requestAttributes.getRequest();
            }
        } catch (Exception e) {
            logger.debug("Could not get HTTP request from context", e);
        }
        return null;
    }

    /**
     * Get client IP address from HTTP request
     */
    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "Unknown";

        // Check X-Forwarded-For header for proxy
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return xForwardedFor.split(",")[0].trim();
        }

        // Check X-Real-IP header
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        // Fall back to remote address
        return request.getRemoteAddr();
    }
}
