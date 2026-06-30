package com.indicab.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Component
public class DatabaseIndexInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseIndexInitializer.class);

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) {
        createIndex("idx_users_search", "CREATE FULLTEXT INDEX idx_users_search ON users(name, email)");
        createIndex("idx_booking_user_status", "CREATE INDEX idx_booking_user_status ON bookings(user_id, status)");
        createIndex("idx_audit_log_created", "CREATE INDEX idx_audit_log_created ON audit_logs(created_at)");
    }

    private void createIndex(String indexName, String sql) {
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            logger.info("Index created: {}", indexName);
        } catch (SQLException e) {
            if (e.getErrorCode() == 1061) {
                logger.debug("Index already exists: {}", indexName);
            } else {
                logger.warn("Could not create index {}: {} (error code: {})",
                    indexName, e.getMessage(), e.getErrorCode());
            }
        }
    }
}
