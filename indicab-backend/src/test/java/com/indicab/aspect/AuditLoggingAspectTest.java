package com.indicab.aspect;

import com.indicab.config.CustomUserDetails;
import com.indicab.entity.User;
import com.indicab.service.AuditLoggingService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.Signature;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("AuditLoggingAspect Tests")
class AuditLoggingAspectTest {

    @Mock
    private AuditLoggingService auditLoggingService;

    @Mock
    private JoinPoint joinPoint;

    @Mock
    private Signature signature;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private AuditLoggingAspect aspect;

    private static final Long USER_ID = 42L;
    private static final String USER_AGENT = "TestAgent/1.0";

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    private void setupAuthentication() {
        User user = new User();
        user.setId(USER_ID);
        user.setEmail("admin@test.com");
        user.setRole("ADMIN");
        CustomUserDetails customUserDetails = new CustomUserDetails(user);

        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(customUserDetails);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private void setupJoinPoint(String methodName, Class<?> controllerClass, Object[] args) {
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getName()).thenReturn(methodName);
        when(joinPoint.getTarget()).thenReturn(createStubInstance(controllerClass));
        when(joinPoint.getArgs()).thenReturn(args);
    }

    private Object createStubInstance(Class<?> clazz) {
        try {
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setupRequest(String clientIp) {
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(request.getHeader("User-Agent")).thenReturn(USER_AGENT);
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn(clientIp);
    }

    // ===================== Successful operation tests =====================

    @Test
    @DisplayName("Should log audit on successful CREATE operation")
    void testLogAdminOperationCreate() {
        setupAuthentication();
        setupJoinPoint("createUser", AdminUserTestController.class, new Object[]{1L});
        setupRequest("192.168.1.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("CREATE"), eq("USER_TEST"), eq(1L),
                contains("createUser"), eq("192.168.1.1"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should log audit on successful UPDATE operation")
    void testLogAdminOperationUpdate() {
        setupAuthentication();
        setupJoinPoint("updateDriver", AdminDriverTestController.class, new Object[]{2L});
        setupRequest("10.0.0.1");

        aspect.logAdminOperation(joinPoint, null);

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("UPDATE"), eq("DRIVER_TEST"), eq(2L),
                contains("updateDriver"), eq("10.0.0.1"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should log audit on successful DELETE operation")
    void testLogAdminOperationDelete() {
        setupAuthentication();
        setupJoinPoint("deleteBooking", AdminBookingTestController.class, new Object[]{3L});
        setupRequest("10.0.0.5");
        when(request.getHeader("X-Real-IP")).thenReturn("10.0.0.5");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("DELETE"), eq("BOOKING_TEST"), eq(3L),
                contains("deleteBooking"), eq("10.0.0.5"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should log audit on successful READ operation")
    void testLogAdminOperationRead() {
        setupAuthentication();
        setupJoinPoint("getAllUsers", AdminUserTestController.class, new Object[]{});
        setupRequest("10.0.0.99");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("READ"), eq("USER_TEST"), isNull(),
                contains("getAllUsers"), eq("10.0.0.99"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should log audit on bulk operation")
    void testLogAdminOperationBulk() {
        setupAuthentication();
        setupJoinPoint("bulkDeleteUsers", AdminUserTestController.class, new Object[]{new Long[]{1L, 2L, 3L}});
        setupRequest("10.0.0.99");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("BULK_OPERATION"), eq("USER_TEST"), isNull(),
                contains("bulkDeleteUsers"), eq("10.0.0.99"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should log audit on add operation as CREATE")
    void testLogAdminOperationAdd() {
        setupAuthentication();
        setupJoinPoint("addPackage", AdminPackageTestController.class, new Object[]{});
        setupRequest("10.0.0.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("CREATE"), eq("PACKAGE_TEST"), isNull(),
                contains("addPackage"), eq("10.0.0.1"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should log audit on edit method as UPDATE")
    void testLogAdminOperationEdit() {
        setupAuthentication();
        setupJoinPoint("editVehicle", AdminUserTestController.class, new Object[]{5L});
        setupRequest("10.0.0.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("UPDATE"), eq("USER_TEST"), eq(5L),
                contains("editVehicle"), eq("10.0.0.1"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should log audit on remove method as DELETE")
    void testLogAdminOperationRemove() {
        setupAuthentication();
        setupJoinPoint("removeDriver", AdminUserTestController.class, new Object[]{7L});
        setupRequest("10.0.0.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("DELETE"), eq("USER_TEST"), eq(7L),
                contains("removeDriver"), eq("10.0.0.1"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should log audit on fetch method as READ")
    void testLogAdminOperationFetch() {
        setupAuthentication();
        setupJoinPoint("fetchUser", AdminUserTestController.class, new Object[]{});
        setupRequest("10.0.0.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("READ"), eq("USER_TEST"), isNull(),
                contains("fetchUser"), eq("10.0.0.1"), eq(USER_AGENT)
        );
    }

    // ===================== Error operation tests =====================

    @Test
    @DisplayName("Should log audit on failed (throws) operation")
    void testLogAdminOperationError() {
        setupAuthentication();
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getName()).thenReturn("deleteUser");
        when(joinPoint.getTarget()).thenReturn(createStubInstance(AdminUserTestController.class));

        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");

        Throwable exception = new RuntimeException("User has active bookings");
        aspect.logAdminOperationError(joinPoint, exception);

        verify(auditLoggingService).logFailedOperation(
                eq(USER_ID), eq("DELETE"), eq("USER_TEST"),
                eq("10.0.0.1"), eq("User has active bookings")
        );
    }

    // ===================== Unauthenticated tests =====================

    @Test
    @DisplayName("Should not log audit when user is not authenticated")
    void testLogAdminOperationUnauthenticated() {
        when(joinPoint.getSignature()).thenReturn(signature);

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService, never()).logOperation(anyLong(), anyString(), anyString(), anyLong(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should not log audit on error when user is not authenticated")
    void testLogAdminOperationErrorUnauthenticated() {
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getName()).thenReturn("deleteUser");

        Throwable exception = new RuntimeException("Database error");
        aspect.logAdminOperationError(joinPoint, exception);

        verify(auditLoggingService, never()).logFailedOperation(anyLong(), anyString(), anyString(), anyString(), anyString());
    }

    // ===================== Proxy / IP resolution tests =====================

    @Test
    @DisplayName("Should use X-Forwarded-For when present")
    void testLogAdminOperationXForwardedFor() {
        setupAuthentication();
        setupJoinPoint("createUser", AdminUserTestController.class, new Object[]{1L});

        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(request.getHeader("User-Agent")).thenReturn(USER_AGENT);
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.5, 10.0.0.1");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("CREATE"), eq("USER_TEST"), eq(1L),
                contains("createUser"), eq("203.0.113.5"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should use X-Real-IP when X-Forwarded-For is absent")
    void testLogAdminOperationXRealIp() {
        setupAuthentication();
        setupJoinPoint("createUser", AdminUserTestController.class, new Object[]{1L});

        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(request.getHeader("User-Agent")).thenReturn(USER_AGENT);
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn("10.0.0.5");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("CREATE"), eq("USER_TEST"), eq(1L),
                contains("createUser"), eq("10.0.0.5"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should fallback to remote address when no proxy headers")
    void testLogAdminOperationNoProxyHeaders() {
        setupAuthentication();
        setupJoinPoint("createUser", AdminUserTestController.class, new Object[]{1L});

        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(request.getHeader("User-Agent")).thenReturn(USER_AGENT);
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("172.16.0.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("CREATE"), eq("USER_TEST"), eq(1L),
                contains("createUser"), eq("172.16.0.1"), eq(USER_AGENT)
        );
    }

    // ===================== Edge case tests =====================

    @Test
    @DisplayName("Should handle missing HttpServletRequest gracefully")
    void testLogAdminOperationNoRequest() {
        setupAuthentication();
        setupJoinPoint("updateUser", AdminUserTestController.class, new Object[]{1L});

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("UPDATE"), eq("USER_TEST"), eq(1L),
                contains("updateUser"), eq("Unknown"), eq("Unknown")
        );
    }

    @Test
    @DisplayName("Should not throw when auditLoggingService throws")
    void testLogAdminOperationServiceException() {
        setupAuthentication();
        setupJoinPoint("createUser", AdminUserTestController.class, new Object[]{1L});

        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(request.getHeader("User-Agent")).thenReturn(USER_AGENT);
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");

        doThrow(new RuntimeException("Audit service unavailable"))
                .when(auditLoggingService).logOperation(anyLong(), anyString(), anyString(), anyLong(), anyString(), anyString(), anyString());

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(anyLong(), anyString(), anyString(), anyLong(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should not throw when auditLoggingService throws on error logging")
    void testLogAdminOperationErrorServiceException() {
        setupAuthentication();
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getName()).thenReturn("deleteUser");
        when(joinPoint.getTarget()).thenReturn(createStubInstance(AdminUserTestController.class));

        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");

        doThrow(new RuntimeException("Audit service unavailable"))
                .when(auditLoggingService).logFailedOperation(anyLong(), anyString(), anyString(), anyString(), anyString());

        Throwable exception = new RuntimeException("Original error");
        aspect.logAdminOperationError(joinPoint, exception);

        verify(auditLoggingService).logFailedOperation(eq(42L), eq("DELETE"), eq("USER_TEST"),
                eq("10.0.0.1"), eq("Original error"));
    }

    @Test
    @DisplayName("Should handle no arguments gracefully")
    void testLogAdminOperationNoArgs() {
        setupAuthentication();
        setupJoinPoint("getUser", AdminUserTestController.class, new Object[]{});
        setupRequest("10.0.0.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("READ"), eq("USER_TEST"), isNull(),
                contains("getUser"), eq("10.0.0.1"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should extract resource ID from Long arguments")
    void testExtractResourceIdFromArgs() {
        setupAuthentication();
        setupJoinPoint("updateUser", AdminUserTestController.class, new Object[]{99L, "updatedName"});
        setupRequest("10.0.0.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("UPDATE"), eq("USER_TEST"), eq(99L),
                anyString(), eq("10.0.0.1"), eq(USER_AGENT)
        );
    }

    @Test
    @DisplayName("Should return UNKNOWN operation for unrecognized method names")
    void testLogAdminOperationUnknownAction() {
        setupAuthentication();
        setupJoinPoint("processData", AdminUserTestController.class, new Object[]{1L});
        setupRequest("10.0.0.1");

        aspect.logAdminOperation(joinPoint, new Object());

        verify(auditLoggingService).logOperation(
                eq(USER_ID), eq("UNKNOWN"), eq("USER_TEST"), eq(1L),
                contains("processData"), eq("10.0.0.1"), eq(USER_AGENT)
        );
    }

    // ===================== Error logging edge cases =====================

    @Test
    @DisplayName("Should handle null exception message in error logging")
    void testLogAdminOperationErrorNullMessage() {
        setupAuthentication();
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getName()).thenReturn("deleteUser");
        when(joinPoint.getTarget()).thenReturn(createStubInstance(AdminUserTestController.class));

        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");

        Throwable exception = new RuntimeException();
        aspect.logAdminOperationError(joinPoint, exception);

        verify(auditLoggingService).logFailedOperation(
                eq(USER_ID), eq("DELETE"), eq("USER_TEST"),
                eq("10.0.0.1"), isNull()
        );
    }

    // --- Stub controller classes used to simulate pointcut matching ---

    static class AdminUserTestController {}
    static class AdminDriverTestController {}
    static class AdminBookingTestController {}
    static class AdminPackageTestController {}
}
