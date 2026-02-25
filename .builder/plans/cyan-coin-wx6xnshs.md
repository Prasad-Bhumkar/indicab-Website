# Fix Flyway V004 Migration Failure - Database Reset Plan

## Problem Summary
The backend application is failing to start due to a Flyway database migration error:
- **Error**: `FlywayMigrateException: Schema 'indicab_website' contains a failed migration to version 004`
- **Impact**: Database migration for audit_logs table (V004) failed, preventing Spring Boot from initializing
- **Environment**: Dev/test environment, no production data to preserve

The error chain shows:
1. Flyway tries to run migration V004 (Create_Audit_Logs_Table.sql)
2. V004 fails, leaving dirty state in flyway_schema_history table
3. Subsequent migration attempts fail because history is in inconsistent state
4. Spring cannot create entity manager due to failed migrations
5. Application exits with code 1 and restarts continuously

## Root Cause Analysis
- **V004 migration file exists**: `indicab-backend/src/main/resources/db/migration/V004__Create_Audit_Logs_Table.sql`
- **Repair mechanism exists**: `indicab-backend/src/main/resources/init-db.sql` has SQL to repair V004 history
- **Why it's not working**: The database already has dirty migration history from failed runs, and the init-db.sql only runs on fresh MySQL initialization (empty data dir)
- **Current state**: The MySQL container has persistent data (`mysql_data_fresh` volume) with failed migration records

## Solution Approach
**Complete database reset** (selected by user for dev/test environment):
1. Delete the MySQL data volume to clear all persistent data
2. Restart the containers so MySQL initializes fresh
3. Let Flyway run migrations cleanly from the beginning
4. The init-db.sql will ensure audit_logs table exists and Flyway history is correct

This is the cleanest and most reliable approach for a development environment.

## Implementation Steps

### Step 1: Stop and clean up containers
- Stop the running docker-compose services
- Remove the MySQL data volume (`mysql_data_fresh`) to delete all persisted database files
- Verify volume is deleted

### Step 2: Restart containers with fresh database
- Start docker-compose again
- MySQL will initialize with empty data directory, triggering docker-entrypoint-initdb.d scripts
- The init-db.sql script will:
  - Ensure flyway_schema_history table exists
  - Repair any failed V004 records (DELETE failed ones, INSERT success record)
  - Ensure audit_logs table exists via CREATE TABLE IF NOT EXISTS

### Step 3: Monitor startup
- Check dev server logs for successful startup
- Verify backend is no longer restarting
- Confirm Flyway completes all migrations V001-V009 successfully
- Backend should bind to port 8000 and log "Started IndicabApplication"

### Step 4: Validate database state
- Verify tables created: blogs, packages, vehicles, audit_logs, routes, cities, etc.
- Confirm Flyway history shows all versions as successful (success=1)
- Test basic API endpoints to ensure backend is functioning

## Files Involved

### Migration Files (read-only, no changes needed)
- `indicab-backend/src/main/resources/db/migration/V004__Create_Audit_Logs_Table.sql` - Creates audit_logs table
- Other migrations V001-V009 in same directory - Will run in sequence

### Database Configuration (no changes needed)
- `docker-compose.yml` - Already has proper Flyway env variables and init-db.sql mounting
- `indicab-backend/src/main/resources/init-db.sql` - Repair script that will fix V004 on fresh init
- `indicab-backend/src/main/resources/application.properties` - Flyway config already set correctly

### Verification (post-fix)
- DevServerControl tool will show clean startup logs
- Backend should be accessible and responsive

## Why This Works
1. **init-db.sql will run**: MySQL container initialization scripts run when volume is empty
2. **Flyway history will be clean**: The DELETE statement removes failed records before INSERT
3. **Migrations run cleanly**: With clean history, Flyway can execute V001-V009 in order
4. **No manual DB commands needed**: Docker-compose handles everything automatically
5. **Quick recovery**: Simple volume deletion and restart - no code changes needed

## Risks & Mitigations
- **Risk**: Lose any development data in database
- **Mitigation**: This is explicitly a dev/test environment with no production data
- **Risk**: Volume doesn't actually get deleted
- **Mitigation**: Verify with `docker volume ls` before restart
- **Risk**: Containers don't restart properly
- **Mitigation**: Use `docker-compose restart` or `docker-compose down && docker-compose up`

## Success Criteria
- [ ] Docker volume `mysql_data_fresh` is deleted
- [ ] Containers restart and MySQL initializes from scratch
- [ ] Backend logs show "Started IndicabApplication" without errors
- [ ] Tomcat server initializes on port 8000
- [ ] No "FlywayMigrateException" errors in logs
- [ ] All migrations show as successful in flyway_schema_history
- [ ] App is no longer in restart loop
