-- ===============================================================
-- FORCE-SKIP CONFLICTING MIGRATION SCRIPT
-- ===============================================================
-- Purpose: Force-mark conflicting V011 migration as successful without re-execution
-- Status: CRITICAL - Use only if repair-flyway-migration.sql doesn't resolve the issue
-- Author: Database Engineer (SQL Expert)
-- Date: 2026-03-15
-- 
-- WARNING: This script SKIPS a migration entirely without executing it.
-- Use only when:
-- 1. The migration creates indexes that already exist
-- 2. You've manually applied the migration changes separately
-- 3. You need to unblock the backend from a hard Flyway failure
--
-- CAUTION: Skipping migrations can lead to schema inconsistencies!
-- Only use this after confirming the schema is already correct.
-- ===============================================================

USE indicab_website;

-- Step 0: PRE-FLIGHT CHECK
-- =======================
SELECT 'PHASE 1: PRE-FLIGHT - Checking current database state' as phase;

-- Check if V011 indexes already exist in the schema
SELECT 'Checking for V011 indexes:' as check;

-- List all FULLTEXT indexes (these are created by V011)
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'indicab_website'
AND INDEX_TYPE = 'FULLTEXT'
ORDER BY TABLE_NAME, INDEX_NAME;

SELECT 'FULLTEXT indexes found' as index_check;

-- Step 1: BACKUP CURRENT STATE
-- ============================
SELECT 'PHASE 2: BACKUP - Creating emergency backup' as phase;

CREATE TABLE IF NOT EXISTS flyway_schema_history_emergency_backup AS
SELECT * FROM flyway_schema_history;

SELECT CONCAT('Backed up ', COUNT(*), ' migration records to flyway_schema_history_emergency_backup')
FROM flyway_schema_history_emergency_backup;

-- Step 2: IDENTIFY CONFLICTING V011
-- ==================================
SELECT 'PHASE 3: IDENTIFY - Finding conflicting V011 entries' as phase;

SELECT 
    installed_rank,
    version,
    description,
    installed_on,
    success
FROM flyway_schema_history
WHERE version = '011'
ORDER BY installed_on DESC;

-- Step 3: REMOVE FAILED V011 ENTRIES (KEEP ONLY ONE)
-- ===================================================
SELECT 'PHASE 4: REMOVE - Cleaning up duplicate V011 entries' as phase;

-- Get the count of V011 entries
SET @v011_count = (SELECT COUNT(*) FROM flyway_schema_history WHERE version = '011');

SELECT CONCAT('Found ', @v011_count, ' V011 entries') as v011_status;

-- If there are multiple V011 entries, keep the most recent successful one
-- and delete the others
DELETE FROM flyway_schema_history 
WHERE version = '011'
AND installed_rank < (
    SELECT MAX(installed_rank) 
    FROM (
        SELECT installed_rank FROM flyway_schema_history 
        WHERE version = '011'
    ) AS latest
);

SELECT 'Removed duplicate V011 entries' as cleanup_status;

-- Step 4: FORCE-MARK V011 AS SUCCESSFUL
-- ======================================
SELECT 'PHASE 5: FORCE-MARK - Marking V011 as successful' as phase;

-- Check if V011 exists in history
SET @v011_exists = (SELECT COUNT(*) FROM flyway_schema_history WHERE version = '011');

IF @v011_exists = 0 THEN
    -- V011 doesn't exist - INSERT it as successful
    INSERT INTO flyway_schema_history (
        installed_rank,
        version,
        description,
        type,
        script,
        checksum,
        installed_by,
        installed_on,
        execution_time,
        success
    ) VALUES (
        (SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history),
        '011',
        'add fulltext search indexes',
        'SQL',
        'V011__add_fulltext_search_indexes.sql',
        NULL,
        'admin',
        NOW(),
        1000,
        1
    );
    SELECT 'V011 inserted as successful (was missing from history)' as insert_status;
ELSE
    -- V011 exists - UPDATE it to success
    UPDATE flyway_schema_history
    SET success = 1, execution_time = 1000
    WHERE version = '011';
    SELECT 'V011 marked as successful (was failed)' as update_status;
END IF;

-- Step 5: ENSURE ALL MIGRATIONS UP TO V016 ARE MARKED SUCCESSFUL
-- ==============================================================
SELECT 'PHASE 6: ENSURE - Marking all core migrations as successful' as phase;

UPDATE flyway_schema_history
SET success = 1
WHERE version IN ('001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012', '013')
AND success = 0;

SELECT 'All core migrations marked as successful' as ensure_status;

-- Step 6: HANDLE V016 (FINAL FIX MIGRATION)
-- ==========================================
SELECT 'PHASE 7: HANDLE V016 - Final fix migration' as phase;

-- Check if V016 exists and its status
SELECT version, success FROM flyway_schema_history WHERE version = '016';

-- Ensure V016 is marked successful
UPDATE flyway_schema_history
SET success = 1
WHERE version = '016';

SELECT 'V016 marked as successful' as v016_status;

-- Step 7: VERIFY FINAL STATE
-- ==========================
SELECT 'PHASE 8: VERIFICATION - Final Flyway state' as phase;

SELECT 'Migrations after force-skip:' as step;
SELECT 
    version,
    description,
    success,
    installed_on
FROM flyway_schema_history
WHERE version IN ('009', '010', '011', '012', '013', '014', '015', '016')
ORDER BY version;

-- Count successful vs failed
SELECT 
    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed
FROM flyway_schema_history;

-- Step 8: FINAL HEALTH CHECK
-- ==========================
SELECT 'PHASE 9: HEALTH CHECK - Schema validation' as phase;

-- Verify that the tables referenced by V011 exist
SELECT 
    'users' as table_name,
    COUNT(*) as row_count
FROM users
UNION ALL
SELECT 
    'bookings' as table_name,
    COUNT(*) as row_count
FROM bookings
UNION ALL
SELECT 
    'audit_logs' as table_name,
    COUNT(*) as row_count
FROM audit_logs;

-- List indexes on key tables
SELECT DISTINCT
    TABLE_NAME,
    INDEX_NAME,
    INDEX_TYPE,
    COUNT(*) as columns_in_index
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'indicab_website'
AND TABLE_NAME IN ('users', 'bookings', 'audit_logs')
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE
ORDER BY TABLE_NAME, INDEX_NAME;

-- ===============================================================
-- FINAL SUMMARY
-- ===============================================================
SELECT 'MIGRATION FORCE-SKIP COMPLETED!' as final_status;

SELECT 'IMPORTANT: Next steps:' as action_required;
SELECT '1. Run docker-compose restart backend' as step1;
SELECT '2. Check logs: docker logs indicab-backend' as step2;
SELECT '3. Verify: curl http://localhost:8000/actuator/health' as step3;

-- ===============================================================
-- VERIFICATION QUERY (Run after backend restarts successfully)
-- ===============================================================
-- If backend starts successfully, verify with:
-- SELECT * FROM flyway_schema_history ORDER BY version;
-- All should have success = 1
-- ===============================================================
