package com.indicab.service.impl;

import com.indicab.controller.AdminWebSocketController;
import com.indicab.entity.AuditLog;
import com.indicab.repository.AuditLogRepository;
import com.indicab.service.EncryptionService;
import com.indicab.util.MetricsHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuditLoggingServiceImpl Tests")
class AuditLoggingServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private AdminWebSocketController adminWebSocketController;

    @Mock
    private EncryptionService encryptionService;

    @Mock
    private MetricsHelper metricsHelper;

    @InjectMocks
    private AuditLoggingServiceImpl auditLoggingService;

    private AuditLog testAuditLog;

    @BeforeEach
    void setUp() {
        testAuditLog = new AuditLog();
        testAuditLog.setId(1L);
        testAuditLog.setUserId(10L);
        testAuditLog.setOperation("CREATE");
        testAuditLog.setResourceType("USER");
        testAuditLog.setResourceId(100L);
        testAuditLog.setDetails("encrypted-details");
        testAuditLog.setIpAddress("192.168.1.1");
        testAuditLog.setUserAgent("Mozilla/5.0");
        testAuditLog.setStatus("SUCCESS");
        testAuditLog.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should log operation with all details")
    void testLogOperationFull() {
        when(encryptionService.encrypt(anyString())).thenAnswer(i -> "encrypted-" + i.getArgument(0));
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        auditLoggingService.logOperation(10L, "CREATE", "USER", 100L, "Created new user", "192.168.1.1", "Mozilla/5.0");

        verify(auditLogRepository).save(any(AuditLog.class));
        verify(encryptionService).encrypt("Created new user");
        verify(adminWebSocketController).broadcastNewAuditLog(any(AuditLog.class));
    }

    @Test
    @DisplayName("Should log operation without details")
    void testLogOperationMinimal() {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        auditLoggingService.logOperation(10L, "UPDATE", "BOOKING", "192.168.1.1");

        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Should log operation with resource ID")
    void testLogOperationWithResourceId() {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        auditLoggingService.logOperation(10L, "DELETE", "DRIVER", 200L, "192.168.1.1");

        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Should log failed operation")
    void testLogFailedOperation() {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        auditLoggingService.logFailedOperation(10L, "CREATE", "USER", "192.168.1.1", "Validation failed");

        verify(auditLogRepository).save(any(AuditLog.class));
        verify(adminWebSocketController).broadcastNewAuditLog(any(AuditLog.class));
    }

    @Test
    @DisplayName("Should handle exception in logOperation gracefully")
    void testLogOperationException() {
        when(encryptionService.encrypt(anyString())).thenReturn("encrypted-details");
        when(auditLogRepository.save(any(AuditLog.class))).thenThrow(new RuntimeException("DB error"));

        auditLoggingService.logOperation(10L, "CREATE", "USER", 100L, "details", "192.168.1.1", "agent");

        verify(metricsHelper).recordError(eq("AuditLoggingService"), any(RuntimeException.class), eq("logOperation"));
    }

    @Test
    @DisplayName("Should handle exception in logFailedOperation gracefully")
    void testLogFailedOperationException() {
        when(auditLogRepository.save(any(AuditLog.class))).thenThrow(new RuntimeException("DB error"));

        auditLoggingService.logFailedOperation(10L, "CREATE", "USER", "192.168.1.1", "failure");

        verify(metricsHelper).recordError(eq("AuditLoggingService"), any(RuntimeException.class), eq("logFailedOperation"));
    }

    @Test
    @DisplayName("Should get user audit logs")
    void testGetUserAuditLogs() {
        Pageable pageable = PageRequest.of(0, 10);
        List<AuditLog> logList = new ArrayList<>();
        logList.add(testAuditLog);
        Page<AuditLog> auditPage = new PageImpl<>(logList, pageable, logList.size());

        when(auditLogRepository.findByUserId(10L, pageable)).thenReturn(auditPage);

        Page<AuditLog> result = auditLoggingService.getUserAuditLogs(10L, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getUserId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("Should get operation audit logs")
    void testGetOperationAuditLogs() {
        Pageable pageable = PageRequest.of(0, 10);
        List<AuditLog> logList = new ArrayList<>();
        logList.add(testAuditLog);
        Page<AuditLog> auditPage = new PageImpl<>(logList, pageable, logList.size());

        when(auditLogRepository.findByOperation("CREATE", pageable)).thenReturn(auditPage);

        Page<AuditLog> result = auditLoggingService.getOperationAuditLogs("CREATE", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get resource audit logs")
    void testGetResourceAuditLogs() {
        Pageable pageable = PageRequest.of(0, 10);
        List<AuditLog> logList = new ArrayList<>();
        logList.add(testAuditLog);
        Page<AuditLog> auditPage = new PageImpl<>(logList, pageable, logList.size());

        when(auditLogRepository.findByResourceType("USER", pageable)).thenReturn(auditPage);

        Page<AuditLog> result = auditLoggingService.getResourceAuditLogs("USER", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get audit logs by date range")
    void testGetAuditLogsByDateRange() {
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();
        List<AuditLog> logList = new ArrayList<>();
        logList.add(testAuditLog);

        when(auditLogRepository.findByCreatedAtBetween(start, end)).thenReturn(logList);

        List<AuditLog> result = auditLoggingService.getAuditLogsByDateRange(start, end);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should get failed operations")
    void testGetFailedOperations() {
        Pageable pageable = PageRequest.of(0, 10);
        testAuditLog.setStatus("FAILED");
        List<AuditLog> logList = new ArrayList<>();
        logList.add(testAuditLog);
        Page<AuditLog> auditPage = new PageImpl<>(logList, pageable, logList.size());

        when(auditLogRepository.findByStatus("FAILED", pageable)).thenReturn(auditPage);

        Page<AuditLog> result = auditLoggingService.getFailedOperations(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get audit statistics")
    void testGetAuditStatistics() {
        when(auditLogRepository.count()).thenReturn(10L);

        String stats = auditLoggingService.getAuditStatistics();

        assertThat(stats).isNotNull();
        assertThat(stats).contains("Total Operations: 10");
        assertThat(stats).contains("Failed Operations: 0");
    }

    @Test
    @DisplayName("Should reset statistics")
    void testResetStatistics() {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);
        auditLoggingService.logOperation(10L, "CREATE", "USER", "192.168.1.1");

        auditLoggingService.resetStatistics();

        assertThat(auditLoggingService.getTotalOperationsCount()).isZero();
        assertThat(auditLoggingService.getFailedOperationsCount()).isZero();
    }

    @Test
    @DisplayName("Should log bulk operation")
    void testLogBulkOperation() {
        when(encryptionService.encrypt(anyString())).thenReturn("encrypted-bulk");
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        ids.add(2L);

        auditLoggingService.logBulkOperation(10L, "DELETE", "USER", ids, "192.168.1.1", "Bulk delete");

        verify(auditLogRepository).save(any(AuditLog.class));
        verify(adminWebSocketController).broadcastBulkOperationComplete(eq("USER"), eq("DELETE"), eq(2), eq(true), anyString());
    }

    @Test
    @DisplayName("Should log failed bulk operation")
    void testLogFailedBulkOperation() {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        List<Long> ids = new ArrayList<>();
        ids.add(1L);

        auditLoggingService.logFailedBulkOperation(10L, "DELETE", "USER", ids, "192.168.1.1", "DB error");

        verify(auditLogRepository).save(any(AuditLog.class));
        verify(adminWebSocketController).broadcastBulkOperationComplete(eq("USER"), eq("DELETE"), eq(1), eq(false), eq("DB error"));
    }

    @Test
    @DisplayName("Should get total operations count")
    void testGetTotalOperationsCount() {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);
        auditLoggingService.logOperation(10L, "CREATE", "USER", "192.168.1.1");

        assertThat(auditLoggingService.getTotalOperationsCount()).isOne();
    }

    @Test
    @DisplayName("Should get failed operations count")
    void testGetFailedOperationsCount() {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);
        auditLoggingService.logFailedOperation(10L, "CREATE", "USER", "192.168.1.1", "error");

        assertThat(auditLoggingService.getFailedOperationsCount()).isOne();
    }

    @Test
    @DisplayName("Should get audit logs with specification")
    void testGetAuditLogsWithSpecification() {
        Pageable pageable = PageRequest.of(0, 10);
        List<AuditLog> logList = new ArrayList<>();
        logList.add(testAuditLog);
        Page<AuditLog> auditPage = new PageImpl<>(logList, pageable, logList.size());

        when(auditLogRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(auditPage);

        Specification<AuditLog> spec = (root, query, cb) -> cb.equal(root.get("status"), "SUCCESS");
        Page<AuditLog> result = auditLoggingService.getAuditLogs(pageable, spec);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }
}
