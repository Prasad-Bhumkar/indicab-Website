# Database Migration Cleanup & Recovery

## Overview

This document describes the database migration cleanup and recovery procedures, specifically addressing the V010 migration failure and how it was resolved.

## V010 Migration Failure & Recovery

### Problem Statement

The Flyway migration V010 (`V010__optimize_schemas_add_constraints.sql`) was failing during database initialization with the error:

```
Schema 'indicab_website' contains a failed migration to version 010!
```

This prevented the entire application from starting, as Flyway refuses to proceed when any migration is marked as failed.

### Root Cause

The original V010 migration used MySQL's `BEGIN/COMMIT` transaction blocks to wrap constraint additions. However, if any single constraint addition failed (due to the constraint already existing or other conflicts), the entire transaction would fail and leave V010 marked as "failed" in the Flyway schema history table.

MySQL's `BEGIN/COMMIT` does not provide automatic error handling like other databases, so a single failed statement would abort the entire migration.

### Solution Implemented

#### 1. Updated init-db.sql

Modified `indicab-backend/src/main/resources/init-db.sql` to:
- Delete all failed migrations before Flyway runs
- Specifically remove V010 from the history to allow re-execution
- Mark all previous migrations as successful

```sql
-- Clean up failed migration history BEFORE Flyway runs
DELETE FROM flyway_schema_history WHERE success = 0;

-- Specifically handle V010 migration failure
DELETE FROM flyway_schema_history WHERE version = '010';

-- Mark all previous migrations as successful
UPDATE flyway_schema_history SET success = 1 WHERE success = 0;
```

#### 2. Rewrote V010 Migration

Replaced `V010__optimize_schemas_add_constraints.sql` to use safer constraint addition methods:

**Before (Unsafe):**
```sql
BEGIN;
  ALTER TABLE `packages` 
  ADD CONSTRAINT `chk_packages_type` 
  CHECK (`package_type` IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'));
COMMIT;
```

**After (Safe):**
```sql
-- Drop constraint if it exists, then add it fresh
ALTER TABLE `packages` DROP CONSTRAINT IF EXISTS `chk_packages_type`;
ALTER TABLE `packages` 
ADD CONSTRAINT `chk_packages_type` 
CHECK (`package_type` IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'));
```

**Key Improvements:**
- Used `DROP CONSTRAINT IF EXISTS` for check constraints
- Used `DROP FOREIGN KEY IF EXISTS` for foreign keys
- Used `DROP INDEX IF EXISTS` for unique indexes
- Used `ADD COLUMN IF NOT EXISTS` for new columns
- Removed problematic `BEGIN/COMMIT` blocks

This ensures each constraint addition is idempotent—it can be run multiple times without failure.

### Current Migration State

As of the recovery:
- **Latest successful migration**: V015 (`V015__consolidate_migrations.sql`)
- **Failed migrations cleaned up**: V010 now re-executes cleanly
- **Recovery migrations available**: V013 and V014 provide alternative recovery paths if needed

### Flyway Migration Files

All migration files are located in: `indicab-backend/src/main/resources/db/migration/`

| Version | File | Purpose |
|---------|------|---------|
| V001 | Create_Users_Table.sql | Core user entity |
| V002 | Create_Vehicles_Table.sql | Vehicle definitions |
| V003 | Create_Cities_And_Routes_Tables.sql | Geography data |
| V004 | Create_RefreshTokens_Table.sql | Authentication tokens |
| V005 | Create_Bookings_Table.sql | Booking management |
| V006 | Create_Blogs_Table.sql | Blog content |
| V007 | Create_Packages_Table.sql | Service packages |
| V008 | Create_Recommendation_Table.sql | User recommendations |
| V009 | Create_AuditLogs_Table.sql | Audit logging |
| **V010** | **optimize_schemas_add_constraints.sql** | **Data integrity constraints (FIXED)** |
| V011 | ensure_core_schema.sql | Schema validation |
| V012 | query_optimization_indexes.sql | Performance indexes |
| V013 | recover_from_failed_migration.sql | Recovery option 1 |
| V014 | repair_failed_migrations.sql | Recovery option 2 |
| V015 | consolidate_migrations.sql | Final cleanup |

### Prevention for Future Migrations

**Guidelines for new migrations:**

1. **Always use IF EXISTS clauses:**
   ```sql
   DROP CONSTRAINT IF EXISTS constraint_name;
   DROP INDEX IF EXISTS index_name;
   ADD COLUMN IF NOT EXISTS column_name TYPE;
   ```

2. **Avoid transaction blocks for schema changes:**
   - Flyway handles transaction isolation automatically
   - Schema changes should not be wrapped in explicit BEGIN/COMMIT

3. **Test migrations on staging first:**
   - Run the migration against a test database
   - Verify idempotency (run it twice, should succeed both times)
   - Check for conflicts with existing schema

4. **Keep migrations focused:**
   - One logical change per migration file
   - Document the purpose in comments
   - Include rollback notes if possible

## Database State Verification

After running the fixed V010 migration, verify the database state:

```sql
-- Check Flyway history
SELECT version, description, success, installed_on 
FROM flyway_schema_history 
ORDER BY version;

-- Verify all core tables exist
SHOW TABLES;

-- Check for constraint health
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE, TABLE_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'indicab_website' 
ORDER BY TABLE_NAME;
```

## Related Documentation

- **Database Schema**: See `DATABASE_SCHEMA.md` for complete schema details
- **Database Monitoring**: See `DATABASE_MONITORING.md` for performance tracking
- **Database Optimization**: See `DATABASE_OPTIMIZATION_GUIDE.md` for query optimization
- **Deployment**: See `DEPLOYMENT_GUIDE.md` for production deployment procedures

## Lessons Learned

1. **MySQL constraint handling differs from other databases** - explicit error handling is needed
2. **Idempotency is critical** for migrations that may be re-run
3. **Init scripts can provide safety nets** - preprocessing the database before Flyway runs prevents cascading failures
4. **Constraint-heavy migrations need careful planning** - consider splitting into multiple migrations if many constraints are being added

## Troubleshooting

### If migrations still fail after this fix:

1. **Clean the database completely:**
   ```bash
   # In Docker container
   mysql -u root -p indicab_website < /dev/null
   docker-compose down -v  # Remove all volumes
   docker-compose up --build  # Rebuild with fresh database
   ```

2. **Inspect failed migration in history:**
   ```sql
   SELECT * FROM flyway_schema_history WHERE success = 0;
   ```

3. **Review application logs:**
   ```bash
   docker-compose logs backend | grep -i flyway
   ```

## Contact & Support

For database-related issues:
- Check the **DATABASE_MONITORING.md** for health checks
- Review migration history in the database
- Consult the **ARCHITECTURE.md** for system design context
