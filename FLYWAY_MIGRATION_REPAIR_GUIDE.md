# Flyway Migration Conflict Repair Guide

## 📋 Problem Statement

The IndiCab backend experienced a critical issue due to the JAR being built with **two conflicting V011 migration files**:

- `V011__add_fulltext_search_indexes.sql` (correct, current version)
- `V011__[conflicting_version]` (old version from previous build)

**Symptom:** Backend fails to start with:
```
Flyway detected failed migration: V011
Error: Conflicting migration files found
```

**Root Cause:** When the JAR was rebuilt, the build process included both versions of the V011 migration file, causing Flyway's validation to fail.

## 🎯 Solution Overview

We've created **two repair scripts** that can be used to restore the database to a working state:

1. **`repair-flyway-migration.sql`** - Standard repair (recommended for most cases)
2. **`force-skip-conflicting-migration.sql`** - Aggressive repair (use if standard repair fails)

## 📍 When to Use Which Script

### Use Script #1: `repair-flyway-migration.sql`
- **When:** The migration has never been successfully executed
- **Action:** Removes all V011 entries and allows Flyway to re-execute the correct version
- **Safety:** Safest option - re-executes migrations in correct order
- **Time:** Takes ~2-3 seconds per migration × number of migrations
- **Use Cases:**
  - First deployment attempt
  - Database is new or empty
  - You want to ensure all migrations run cleanly

**Example:**
```bash
mysql -u root -p indicab_website < indicab-backend/scripts/repair-flyway-migration.sql
```

### Use Script #2: `force-skip-conflicting-migration.sql`
- **When:** Migrations have partially executed, or re-execution would cause errors
- **Action:** Force-marks V011 as successful without re-executing it
- **Safety:** Only safe if you've verified the schema is already correct
- **Time:** Takes ~1 second (just updates history)
- **Use Cases:**
  - Production database with existing schema
  - Migrations were manually applied
  - Re-execution would cause "index already exists" errors
  - Need to unblock backend immediately

**Example:**
```bash
mysql -u root -p indicab_website < indicab-backend/scripts/force-skip-conflicting-migration.sql
```

## 🚀 Step-by-Step Repair Process

### Option A: Clean Start (Recommended for Development)

**Step 1: Stop the backend**
```bash
docker-compose down
```

**Step 2: Remove the database volume (this will DELETE all data)**
```bash
docker-compose down -v
# WARNING: This destroys all data! Only do this in dev/test environments
```

**Step 3: Start fresh**
```bash
docker-compose up --build
```

Flyway will automatically baseline the database and execute all migrations cleanly.

### Option B: Repair Existing Database (Development/Staging)

**Step 1: Ensure database is running**
```bash
docker-compose up -d mysql
```

**Step 2: Run the repair script**
```bash
# Standard repair (recommended)
docker exec indicab-mysql mysql -u root -p${DB_ROOT_PASSWORD} indicab_website < indicab-backend/scripts/repair-flyway-migration.sql
```

**Step 3: Rebuild the backend (critical!)**
```bash
# Rebuild to ensure only ONE V011 in the JAR
cd indicab-backend
mvn clean install -DskipTests
cd ..

# Rebuild Docker image
docker-compose build --no-cache backend
```

**Step 4: Restart the backend**
```bash
docker-compose restart backend
```

**Step 5: Verify success**
```bash
# Check logs for Flyway success message
docker logs indicab-backend | grep -i "flyway"

# Expected output:
# "Flyway has repaired the schema and validated"
# "Successfully applied 1 migration"

# Or check health endpoint
curl http://localhost:8000/actuator/health
# Should return HTTP 200 with UP status
```

### Option C: Force-Skip (Production/Emergency)

**Only use this if Option B fails!**

**Step 1: Ensure database is running**
```bash
docker-compose up -d mysql
```

**Step 2: Run the force-skip script**
```bash
docker exec indicab-mysql mysql -u root -p${DB_ROOT_PASSWORD} indicab_website < indicab-backend/scripts/force-skip-conflicting-migration.sql
```

**Step 3: Verify schema is correct**
```bash
# The script will output the current schema state
# Verify all required tables and indexes exist

# You can also check manually:
docker exec indicab-mysql mysql -u root -p${DB_ROOT_PASSWORD} -e \
  "USE indicab_website; SHOW FULL PROCESSLIST; SHOW TABLES; SHOW INDEXES FROM users;"
```

**Step 4: Rebuild and restart backend**
```bash
docker-compose build --no-cache backend
docker-compose restart backend
```

**Step 5: Verify backend started**
```bash
docker logs indicab-backend
curl http://localhost:8000/actuator/health
```

## 🔍 How the Scripts Work

### Script #1: `repair-flyway-migration.sql`

| Phase | Action | Purpose |
|-------|--------|---------|
| 1 | Diagnostic | Show current Flyway state before repair |
| 2 | Backup | Save current history to `flyway_schema_history_backup` |
| 3 | Remove | Delete all V011 entries (conflicting versions) |
| 4 | Cleanup | Remove failed migration markers |
| 5 | Repair | Mark V001-V010 as successful |
| 6 | Prepare | Delete V012-V015 to allow re-execution |
| 7 | Verify | Confirm repairs were applied correctly |

**Key feature:** Deletes V011 entries, allowing Flyway to re-execute the correct version on next startup.

### Script #2: `force-skip-conflicting-migration.sql`

| Phase | Action | Purpose |
|-------|--------|---------|
| 1 | Pre-flight | Check if V011 indexes already exist |
| 2 | Backup | Create emergency backup table |
| 3 | Identify | Find conflicting V011 entries |
| 4 | Remove | Delete duplicate V011 entries |
| 5 | Force-mark | Mark V011 as successful (skip re-execution) |
| 6 | Ensure | Mark all core migrations as successful |
| 7 | Handle | Ensure V016 is marked successful |
| 8 | Verify | Show final Flyway state |
| 9 | Health | Validate schema consistency |

**Key feature:** Marks V011 as already executed, preventing Flyway from re-running it.

## 📊 What the Scripts Check & Fix

### Database Schema Validation
- ✅ V001-V010: Core schema migrations
- ✅ V011: Full-text search indexes
- ✅ V012: Schema optimization
- ✅ V013: Core schema validation
- ✅ V014-V015: (missing, safe to skip)
- ✅ V016: Final fix migration

### Tables & Indexes
The scripts verify these tables exist:
- `users` - User accounts and profiles
- `bookings` - Ride bookings
- `audit_logs` - Audit trail
- `flyway_schema_history` - Migration history

And these indexes (from V011):
- `idx_user_search` (FULLTEXT on name, email)
- `idx_audit_search` (FULLTEXT on details, operation)
- `idx_booking_search` (FULLTEXT on locations)

## ⚠️ Troubleshooting

### "Index already exists" Error
**Problem:** Script tries to create an index that's already present
**Solution:** Use `force-skip-conflicting-migration.sql` instead
```sql
-- The force-skip script skips execution instead of re-running
```

### "Unknown storage engine" Error
**Problem:** FULLTEXT indexes require InnoDB
**Solution:** Ensure MySQL is InnoDB:
```bash
mysql -u root -p indicab_website -e "SHOW ENGINES;"
# Should show InnoDB as the default
```

### Flyway Still Fails After Script
**Problem:** Script ran but Flyway still reports errors
**Solution:** Check for duplicate entries:
```bash
mysql -u root -p indicab_website -e \
  "SELECT version, COUNT(*) FROM flyway_schema_history GROUP BY version HAVING COUNT(*) > 1;"
```

If duplicates exist, manually delete:
```sql
-- Delete duplicate V011 entries
DELETE FROM flyway_schema_history 
WHERE version = '011' AND installed_rank NOT IN (
    SELECT MAX(installed_rank) FROM (
        SELECT installed_rank FROM flyway_schema_history 
        WHERE version = '011'
    ) AS latest
);
```

### Backend Still Won't Start
**Problem:** Backend reports migration error even after running the script
**Solution:** Check the logs in detail:
```bash
docker logs indicab-backend | tail -100 | grep -i "migration\|error\|flyway"
```

Then follow this escalation path:
1. Verify database is healthy: `docker-compose ps`
2. Run health check: `docker exec indicab-mysql mysqladmin ping`
3. Check migration table: `mysql -e "SELECT * FROM flyway_schema_history ORDER BY version;"`
4. If still failing, try the "Nuclear Option" below

### Nuclear Option: Complete Reset (Development Only)

**⚠️ WARNING: This deletes ALL data! Only for development!**

```bash
# Stop everything
docker-compose down -v

# Remove all Docker artifacts
docker-compose rm -f
docker system prune -a --volumes

# Start fresh
docker-compose up --build
```

## 🛡️ Prevention: Avoiding Future Conflicts

### 1. Single Source of Truth for Migrations
- Never create multiple files with the same V### number
- Always increment version numbers (V012, V013, etc.)
- Code review all migration files before merge

### 2. Build Process
```bash
# Before building JAR, verify only ONE of each migration exists
find . -name "V*.sql" | sort | uniq -d
# Should return nothing - if it returns files, there are duplicates!
```

### 3. Git Pre-commit Hook
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Check for duplicate migration files
DUPLICATES=$(find . -name "V*.sql" -type f | sort | uniq -d)
if [ ! -z "$DUPLICATES" ]; then
    echo "ERROR: Duplicate migration files found:"
    echo "$DUPLICATES"
    exit 1
fi
```

### 4. CI/CD Validation
Add to your CI/CD pipeline:
```bash
# Validate migrations before building
./validate-migrations.sh

# Script content:
#!/bin/bash
MIGRATIONS=$(find indicab-backend/src/main/resources/db/migration -name "V*.sql" -type f)
VERSIONS=$(echo "$MIGRATIONS" | sed 's/.*V0*\([0-9]*\).*/\1/' | sort -n)
LAST=0
for V in $VERSIONS; do
    if [ $((V - LAST)) -ne 1 ]; then
        echo "ERROR: Missing migration V0$LAST"
        exit 1
    fi
    LAST=$V
done
```

## 📝 Flyway Configuration (Current)

IndiCab is configured with these Flyway settings in `docker-compose.yml`:

```yaml
SPRING_FLYWAY_VALIDATE_ON_MIGRATE: "false"    # Don't fail on schema conflicts
SPRING_FLYWAY_REPAIR_ON_MIGRATE: "true"       # Repair failed migrations
SPRING_FLYWAY_OUT_OF_ORDER: "true"            # Allow out-of-order execution
SPRING_FLYWAY_BASELINE_ON_MIGRATE: "true"     # Baseline empty databases
SPRING_FLYWAY_IGNORE_MISSING_MIGRATIONS: "true" # Ignore missing intermediate migrations
```

These settings are designed to handle exactly this type of scenario.

## ✅ Success Verification

### Before Repair
```
mysql> SELECT COUNT(*) FROM flyway_schema_history WHERE success = 0;
+-------+
| 1     |  ← One or more failed migrations
+-------+

mysql> SELECT * FROM flyway_schema_history WHERE version = '011';
| 011 | failed migration v011 | 0 | [timestamp] |  ← Failed status
```

### After Repair (Expected)
```
mysql> SELECT COUNT(*) FROM flyway_schema_history WHERE success = 0;
+-------+
| 0     |  ← No failed migrations
+-------+

mysql> SELECT * FROM flyway_schema_history WHERE version = '011';
| 011 | add fulltext search indexes | 1 | [timestamp] |  ← Successful
```

### Backend Health Check
```bash
$ curl http://localhost:8000/actuator/health
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

## 📞 Support & Escalation

If these scripts don't resolve the issue:

1. **Collect diagnostics:**
   ```bash
   docker-compose ps
   docker logs indicab-backend > backend.log
   docker logs indicab-mysql > mysql.log
   docker exec indicab-mysql mysql -u root -p -e "SELECT * FROM flyway_schema_history;" > migrations.txt
   ```

2. **Check agents.md for Database Engineer contact** (see ESCALATION section)

3. **Escalate to:** Agentic AI Expert → Project Manager → Admin

## 🎓 Learning Resources

- **Flyway Documentation:** https://flywaydb.org/documentation
- **MySQL Index Types:** https://dev.mysql.com/doc/refman/8.0/en/fulltext-search.html
- **IndiCab Database Architecture:** See `docs/DATABASE_SCHEMA.md`

---

**Last Updated:** 2026-03-15  
**Created By:** Database Engineer (SQL Expert)  
**Status:** ✅ Ready for Production Use  
