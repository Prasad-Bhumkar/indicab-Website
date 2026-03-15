package com.indicab.controller;

import com.indicab.dto.AuditLogDTO;
import com.indicab.dto.PagedResponseDTO;
import com.indicab.entity.AuditLog;
import com.indicab.service.AuditLoggingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin controller for audit log management
 * Provides endpoints to view and filter audit logs of admin operations
 * All endpoints require ADMIN role authorization
 */
@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@Tag(name = "Admin Audit Logs", description = "Audit log management and monitoring endpoints")
@SecurityRequirement(name = "Bearer Token")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {

    private static final Logger logger = LoggerFactory.getLogger(AdminAuditController.class);

    @Autowired
    private AuditLoggingService auditLoggingService;

    /**
     * Get all audit logs with pagination, sorting, and search
     */
    @GetMapping
    @Operation(summary = "Get all audit logs", description = "Retrieve all audit logs with pagination, sorting, and search filters")
    @ApiResponse(responseCode = "200", description = "Audit logs retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - Admin role required")
    public ResponseEntity<?> getAllAuditLogs(
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field and direction (e.g., createdAt,desc)")
            @RequestParam(required = false) String sort,
            @Parameter(description = "Search by operation type")
            @RequestParam(required = false) String operation,
            @Parameter(description = "Filter by status (SUCCESS/FAILED)")
            @RequestParam(required = false) String status) {
        logger.debug("Fetching all audit logs - page: {}, size: {}, operation: {}, status: {}", page, size, operation, status);

        try {
            Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                    org.springframework.data.domain.Sort.by("createdAt").descending());

            com.indicab.util.SearchSpecification.SpecificationBuilder<AuditLog> builder =
                new com.indicab.util.SearchSpecification.SpecificationBuilder<>();

            if (operation != null && !operation.isEmpty()) {
                builder.with("operation", operation, com.indicab.util.SearchSpecification.SearchOperator.EQUALS);
            }

            if (status != null && !status.isEmpty()) {
                builder.with("status", status, com.indicab.util.SearchSpecification.SearchOperator.EQUALS);
            }

            Page<AuditLog> allLogs = auditLoggingService.getAuditLogs(pageable, builder.build());

            List<AuditLogDTO> content = convertToDTO(allLogs.getContent());
            PagedResponseDTO<AuditLogDTO> response = new PagedResponseDTO<>(
                    content,
                    allLogs.getNumber(),
                    allLogs.getSize(),
                    allLogs.getTotalElements(),
                    allLogs.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching audit logs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve audit logs"));
        }
    }

    /**
     * Get audit logs for a specific user
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get audit logs by user", description = "Retrieve audit logs for a specific user")
    @ApiResponse(responseCode = "200", description = "User audit logs retrieved successfully")
    public ResponseEntity<?> getAuditLogsByUser(
            @Parameter(description = "User ID")
            @PathVariable Long userId,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {
        logger.debug("Fetching audit logs for user: {}", userId);

        try {
            Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                    org.springframework.data.domain.Sort.by("createdAt").descending());

            Page<AuditLog> auditLogs = auditLoggingService.getUserAuditLogs(userId, pageable);
            List<AuditLogDTO> content = convertToDTO(auditLogs.getContent());
            PagedResponseDTO<AuditLogDTO> response = new PagedResponseDTO<>(
                    content,
                    auditLogs.getNumber(),
                    auditLogs.getSize(),
                    auditLogs.getTotalElements(),
                    auditLogs.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching audit logs for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve user audit logs"));
        }
    }

    /**
     * Get audit logs for a specific operation type
     */
    @GetMapping("/operation/{operation}")
    @Operation(summary = "Get audit logs by operation", description = "Retrieve audit logs for a specific operation type")
    @ApiResponse(responseCode = "200", description = "Operation audit logs retrieved successfully")
    public ResponseEntity<?> getAuditLogsByOperation(
            @Parameter(description = "Operation type (e.g., CREATE, UPDATE, DELETE)")
            @PathVariable String operation,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {
        logger.debug("Fetching audit logs for operation: {}", operation);

        try {
            Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                    org.springframework.data.domain.Sort.by("createdAt").descending());

            Page<AuditLog> auditLogs = auditLoggingService.getOperationAuditLogs(operation, pageable);
            List<AuditLogDTO> content = convertToDTO(auditLogs.getContent());
            PagedResponseDTO<AuditLogDTO> response = new PagedResponseDTO<>(
                    content,
                    auditLogs.getNumber(),
                    auditLogs.getSize(),
                    auditLogs.getTotalElements(),
                    auditLogs.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching audit logs for operation: {}", operation, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve operation audit logs"));
        }
    }

    /**
     * Get audit logs for a specific resource type
     */
    @GetMapping("/resource/{resourceType}")
    @Operation(summary = "Get audit logs by resource type", description = "Retrieve audit logs for a specific resource type")
    @ApiResponse(responseCode = "200", description = "Resource audit logs retrieved successfully")
    public ResponseEntity<?> getAuditLogsByResourceType(
            @Parameter(description = "Resource type (e.g., User, Booking, Driver)")
            @PathVariable String resourceType,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {
        logger.debug("Fetching audit logs for resource type: {}", resourceType);

        try {
            Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                    org.springframework.data.domain.Sort.by("createdAt").descending());

            Page<AuditLog> auditLogs = auditLoggingService.getResourceAuditLogs(resourceType, pageable);
            List<AuditLogDTO> content = convertToDTO(auditLogs.getContent());
            PagedResponseDTO<AuditLogDTO> response = new PagedResponseDTO<>(
                    content,
                    auditLogs.getNumber(),
                    auditLogs.getSize(),
                    auditLogs.getTotalElements(),
                    auditLogs.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching audit logs for resource type: {}", resourceType, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve resource audit logs"));
        }
    }

    /**
     * Get failed audit logs (failed operations)
     */
    @GetMapping("/failed")
    @Operation(summary = "Get failed audit logs", description = "Retrieve audit logs for failed operations")
    @ApiResponse(responseCode = "200", description = "Failed audit logs retrieved successfully")
    public ResponseEntity<?> getFailedAuditLogs(
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {
        logger.debug("Fetching failed audit logs");

        try {
            Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                    org.springframework.data.domain.Sort.by("createdAt").descending());

            Page<AuditLog> auditLogs = auditLoggingService.getFailedOperations(pageable);
            List<AuditLogDTO> content = convertToDTO(auditLogs.getContent());
            PagedResponseDTO<AuditLogDTO> response = new PagedResponseDTO<>(
                    content,
                    auditLogs.getNumber(),
                    auditLogs.getSize(),
                    auditLogs.getTotalElements(),
                    auditLogs.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching failed audit logs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve failed audit logs"));
        }
    }

    /**
     * Get audit logs within a date range
     */
    @GetMapping("/date-range")
    @Operation(summary = "Get audit logs by date range", description = "Retrieve audit logs within a specific date range")
    @ApiResponse(responseCode = "200", description = "Date range audit logs retrieved successfully")
    public ResponseEntity<?> getAuditLogsByDateRange(
            @Parameter(description = "Start date (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        logger.debug("Fetching audit logs between {} and {}", startDate, endDate);

        try {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

            List<AuditLog> auditLogs = auditLoggingService.getAuditLogsByDateRange(startDateTime, endDateTime);
            List<AuditLogDTO> content = convertToDTO(auditLogs);

            Map<String, Object> response = new HashMap<>();
            response.put("content", content);
            response.put("totalElements", auditLogs.size());
            response.put("startDate", startDate);
            response.put("endDate", endDate);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching audit logs by date range", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve date range audit logs"));
        }
    }

    /**
     * Get audit log statistics
     */
    @GetMapping("/statistics")
    @Operation(summary = "Get audit log statistics", description = "Retrieve audit logging statistics")
    @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    public ResponseEntity<?> getAuditStatistics() {
        logger.debug("Fetching audit log statistics");

        try {
            String statistics = auditLoggingService.getAuditStatistics();
            return ResponseEntity.ok(Map.of("statistics", statistics));
        } catch (Exception e) {
            logger.error("Error fetching audit statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve statistics"));
        }
    }

    /**
     * Convert AuditLog entity to DTO
     */
    private AuditLogDTO convertToDTO(AuditLog auditLog) {
        return new AuditLogDTO(
                auditLog.getId(),
                auditLog.getUserId(),
                auditLog.getOperation(),
                auditLog.getResourceType(),
                auditLog.getResourceId(),
                auditLog.getDetails(),
                auditLog.getIpAddress(),
                auditLog.getUserAgent(),
                auditLog.getStatus(),
                auditLog.getFailureReason(),
                auditLog.getCreatedAt()
        );
    }

    /**
     * Convert list of AuditLog entities to DTOs
     */
    private List<AuditLogDTO> convertToDTO(List<AuditLog> auditLogs) {
        return auditLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
