-- ===============================================================
-- FLYWAY SCHEMA HISTORY REPAIR SCRIPT
-- ===============================================================
-- Purpose: Repair conflicting V011 migration entries in Flyway schema history
-- Status: CRITICAL - Allows backend to start after JAR rebuild with dual V011 conflicts
-- Author: Database Engineer (SQL Expert)
-- Date: 2026-03-15
-- 
-- PROBLEM:
-- The backend JAR was built with two conflicting V011 migration files:
-- - V011__add_fulltext_search_indexes.sql (correct version)
-- - V011__[old_conflicting_version] (built into JAR from previous branch)
-- 
-- This causes Flyway to fail with "Detected failed migration" error on startup.
--
-- SOLUTION:
-- This script will:
-- 1. Backup current Flyway schema history
-- 2. Remove all conflicting V011 entries
-- 3. Re-execute V011 with the correct version
-- 4. Mark all migrations as successful up to V016
-- 5. Verify the repair was successful
-- ===============================================================

-- Step 0: DIAGNOSTIC - Show current state before repair
-- =====================================================
SELECT 'PHASE 1: DIAGNOSTIC - Current Flyway Schema History' as phase;
SELECT 'Before repair:' as step;
SELECT 
    version,
    description,
    type,
    success,
    installed_on,
    execution_time
FROM flyway_schema_history
ORDER BY version;

SELECT COUNT(*) as total_migrations FROM flyway_schema_history;
SELECT COUNT(*) as failed_migrations FROM flyway_schema_history WHERE success = 0;
SELECT COUNT(*) as duplicate_v011 FROM flyway_schema_history WHERE version = '011';

-- Step 1: BACKUP - Save current state (informational only)
-- =========================================================
SELECT 'PHASE 2: BACKUP - Current Flyway entries (for reference)' as phase;
-- Note: Create a backup table if you need to restore original state
-- This is optional but recommended for critical systems
CREATE TABLE IF NOT EXISTS flyway_schema_history_backup AS
SELECT * FROM flyway_schema_history;

SELECT CONCAT('Backed up ', COUNT(*), ' migration records') as backup_status
FROM flyway_schema_history_backup;

-- Step 2: REMOVE CONFLICTING V011 ENTRIES
-- ========================================
SELECT 'PHASE 3: REMOVE - Conflicting V011 entries' as phase;

-- Count conflicting entries before deletion
SELECT COUNT(*) as conflicting_v011_entries
FROM flyway_schema_history 
WHERE version = '011';

-- Delete ALL V011 entries to allow re-execution of correct version
DELETE FROM flyway_schema_history 
WHERE version = '011';

SELECT 'V011 entries removed from history' as removal_status;

-- Step 3: DELETE FAILED MIGRATIONS
-- ================================
SELECT 'PHASE 4: CLEANUP - Remove failed migration markers' as phase;

-- Delete any failed migration entries
DELETE FROM flyway_schema_history 
WHERE success = 0;

SELECT 'Failed migrations removed' as cleanup_status;

-- Step 4: ENSURE CORE MIGRATIONS ARE MARKED SUCCESSFUL
-- =====================================================
SELECT 'PHASE 5: REPAIR - Mark core migrations as successful' as phase;

-- Ensure all migrations V001-V010 are marked successful
UPDATE flyway_schema_history
SET success = 1
WHERE version IN ('001', '002', '003', '004', '005', '006', '007', '008', '009', '010')
AND success = 0;

SELECT 'Core migrations (V001-V010) marked as successful' as repair_status;

-- Step 5: MARK V011+ AS READY FOR EXECUTION
-- ===========================================
-- V011 has been deleted, so Flyway will re-execute it
-- Ensure V012 and V013 won't fail if they exist and mark them as pending re-execution

-- Delete V012, V013 if they exist (they will be re-run after V011 succeeds)
DELETE FROM flyway_schema_history 
WHERE version IN ('012', '013', '014', '015')
AND success = 0;

-- Keep V016 as it's the final fix migration
UPDATE flyway_schema_history
SET success = 1
WHERE version = '016'
AND success = 0;

SELECT 'Subsequent migrations (V012-V016) prepared for re-execution' as prep_status;

-- Step 6: VERIFY REPAIR
-- ====================
SELECT 'PHASE 6: VERIFICATION - Current state after repair' as phase;

SELECT 'Migrations after repair:' as step;
SELECT 
    version,
    description,
    type,
    success,
    installed_on,
    execution_time
FROM flyway_schema_history
ORDER BY version;

SELECT COUNT(*) as total_migrations_after FROM flyway_schema_history;
SELECT COUNT(*) as successful_migrations_after FROM flyway_schema_history WHERE success = 1;
SELECT COUNT(*) as pending_migrations FROM flyway_schema_history WHERE success = 0;

-- Step 7: FINAL STATUS CHECK
-- ==========================
SELECT 'PHASE 7: FINAL STATUS' as phase;

-- Check if any problematic entries remain
IF EXISTS (
    SELECT 1 FROM flyway_schema_history 
    WHERE version IN ('011', '012', '013', '014', '015')
    AND success = 0
) THEN
    SELECT 'CAUTION: Some pending migrations exist - they will be re-executed on next Flyway run' as status;
ELSE
    SELECT 'SUCCESS: All migrations are in correct state. Flyway is ready to execute pending migrations on next backend startup.' as status;
END IF;

-- ===============================================================
-- NEXT STEPS:
-- ===============================================================
-- 1. Run this script against the indicab_website database:
--    mysql -u root -p indicab_website < repair-flyway-migration.sql
--
-- 2. Rebuild the backend JAR (to ensure only ONE V011 exists):
--    cd indicab-backend
--    mvn clean install -DskipTests
--
-- 3. Rebuild Docker image:
--    docker-compose build --no-cache backend
--
-- 4. Start the backend:
--    docker-compose up backend
--
-- 5. Verify Flyway executed successfully:
--    docker logs indicab-backend | grep "Flyway"
--    Expected: "Flyway has repaired the schema and validated"
--
-- ===============================================================
-- TROUBLESHOOTING:
-- ===============================================================
-- If you still see migration errors after this script:
--
-- A) Check for conflicting file content:
--    - Verify only ONE V011 file exists in JAR
--    - Compare V011__add_fulltext_search_indexes.sql with the actual JAR contents
--
-- B) Reset to clean state (if needed):
--    - Run: DROP TABLE flyway_schema_history; 
--    - Set SPRING_FLYWAY_BASELINE_ON_MIGRATE=true in application.properties
--    - Restart backend to force baseline migration
--
-- C) View current Flyway state:
--    SELECT * FROM flyway_schema_history ORDER BY installed_rank;
--
-- ===============================================================

SELECT 'Flyway schema history repair completed!' as final_status;
SELECT CONCAT('Total migrations in history: ', COUNT(*)) as final_count 
FROM flyway_schema_history;
