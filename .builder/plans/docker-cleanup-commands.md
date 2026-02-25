# Docker Cleanup and Database Reset Commands

This document provides comprehensive Docker commands for cleaning up failed builds, removing volumes, and resetting the database for the Indicab project.

## Overview

These commands are useful for:
- Removing failed Docker builds
- Cleaning up dangling images and build cache
- Resetting the MySQL database volume
- Cleaning up unused containers, networks, and volumes
- Recovering from Flyway migration failures

---

## 1. Remove Dangling Images (Failed Builds)

Dangling images are untagged images that are not referenced by any container.

### Simple cleanup (recommended)
```bash
docker image prune -f
```
**What it does:** Removes all dangling images without prompting

### Remove all images with `<none>` tag
```bash
docker images -f "dangling=true" -q | xargs -r docker rmi
```
**What it does:** Lists all dangling images and removes them by ID

### Remove images matching a pattern
```bash
docker images | grep '<none>' | awk '{print $3}' | xargs -r docker rmi
```
**What it does:** Finds images with `<none>` tag and removes them

---

## 2. Clean Up Build Cache

Build cache accumulates over time and can consume significant disk space.

### Remove all build cache
```bash
docker builder prune -f
```
**What it does:** Removes all builder cache without prompting

### Remove buildx cache (for multi-platform builds)
```bash
docker buildx prune -f
```
**What it does:** Removes buildx build cache

---

## 3. Complete Docker Cleanup (Most Aggressive)

This removes everything unused in one command.

```bash
docker system prune -a --volumes -f
```

**What it removes:**
- All stopped containers
- All networks not used by at least one container
- All dangling images
- All dangling build cache
- All volumes not used by at least one container

**Warning:** This is destructive. Use only if you're sure you don't need any of these resources.

---

## 4. Indicab-Specific Database Reset (Full Procedure)

This is the recommended procedure for fixing Flyway migration failures.

### Step 1: Stop containers and remove MySQL volume
```bash
# Stop all containers defined in docker-compose.yml
docker-compose down

# List MySQL volumes to verify mysql_data_fresh exists
docker volume ls | grep mysql

# Remove the specific MySQL data volume
docker volume rm mysql_data_fresh

# Verify it's been deleted
docker volume ls | grep mysql
```

### Step 2: Remove dangling images and build cache
```bash
# Remove all dangling images
docker image prune -f

# Remove build cache
docker builder prune -f
```

### Step 3: Restart containers with fresh database
```bash
# Navigate to your project directory (where docker-compose.yml is)
cd /path/to/indicab-backend

# Start the containers fresh
docker-compose up
```

**What happens during restart:**
1. MySQL container initializes with empty data directory
2. Docker entrypoint scripts run automatically
3. `init-db.sql` script executes and repairs Flyway migration history
4. All migrations (V001-V009) run cleanly in sequence
5. Backend (Spring Boot) starts successfully
6. Tomcat binds to port 8000

---

## 5. View Resources Before Deleting

Preview what will be deleted without actually deleting anything.

### View dangling images
```bash
docker images -f "dangling=true"
```
**Shows:** List of images with `<none>` tag (not used by any container)

### View unused volumes
```bash
docker volume ls -f "dangling=true"
```
**Shows:** Volumes not used by any container

### View unused networks
```bash
docker network ls --filter dangling=true
```
**Shows:** Networks not connected to any container

### View all containers (running and stopped)
```bash
docker ps -a
```
**Shows:** All containers with their status

### View all volumes
```bash
docker volume ls
```
**Shows:** All Docker volumes

---

## 6. Troubleshooting Commands

### Check Docker disk usage
```bash
docker system df
```
**Shows:** Breakdown of disk space used by images, containers, and volumes

### View detailed container logs
```bash
docker-compose logs -f indicab-backend
```
**Shows:** Real-time logs from the backend service

### Check MySQL container status
```bash
docker ps | grep mysql
```
**Shows:** MySQL container if running

### Access MySQL container shell
```bash
docker-compose exec mysql bash
```
**Use for:** Manual database inspection or repair

---

## 7. Complete Docker Uninstall (If Needed)

**Warning:** This removes everything Docker-related. Use only as last resort.

```bash
# Stop all containers
docker-compose down

# Remove all containers
docker container prune -a -f

# Remove all images
docker image prune -a -f

# Remove all volumes
docker volume prune -a -f

# Remove all networks
docker network prune -f

# Full system cleanup
docker system prune -a --volumes -f
```

---

## 8. Docker Compose Commands

### Start services
```bash
docker-compose up
```
**Starts:** All services defined in docker-compose.yml

### Start in background
```bash
docker-compose up -d
```
**Starts:** Services as background daemons

### Stop services
```bash
docker-compose stop
```
**Stops:** Running services (containers still exist)

### Stop and remove services
```bash
docker-compose down
```
**Removes:** Stopped containers and networks (volumes persist)

### Stop, remove everything including volumes
```bash
docker-compose down -v
```
**Removes:** Containers, networks, and volumes

### Restart services
```bash
docker-compose restart
```
**Restarts:** Running services

### View logs
```bash
docker-compose logs -f
```
**Shows:** Real-time logs from all services

---

## 9. Force Remove Docker Images

When Docker won't overwrite an existing image:

### Remove specific images
```bash
# Remove specific image by tag
docker rmi indicab-backend:latest

# Remove specific image by ID
docker rmi <image-id>

# Force remove (even if in use)
docker rmi -f indicab-backend:latest
docker rmi -f indicab-frontend:latest
```

### Remove all images
```bash
# Remove all images (keep dependencies)
docker rmi $(docker images -q)

# Force remove all images
docker rmi -f $(docker images -q)
```

---

## 10. Reference: Indicab Project Structure

When running these commands, note:
- **Backend:** `indicab-backend/` (Spring Boot application)
- **Frontend:** `indicab-frontend/` (Nginx + Next.js)
- **MySQL:** Separate container with `mysql_data_fresh` volume
- **Docker Compose file:** `docker-compose.yml` in project root

---

## 11. Common Scenarios

### Scenario: Flyway migration failed (V004 error)
```bash
docker-compose down
docker volume rm mysql_data_fresh
docker image prune -f
docker builder prune -f
docker-compose up
```

### Scenario: Out of disk space
```bash
docker system df
docker system prune -a --volumes -f
```

### Scenario: Want to start completely fresh
```bash
docker-compose down -v
docker image prune -a -f
docker volume prune -a -f
docker-compose up
```

### Scenario: Just want to reset database, keep images
```bash
docker-compose down
docker volume rm mysql_data_fresh
docker-compose up
```

### Scenario: Image already exists error
If you get error: `ERROR: image "docker.io/library/indicab-backend:latest": already exists`
```bash
# Remove the conflicting images
docker rmi indicab-backend:latest
docker rmi indicab-frontend:latest

# Then restart
docker-compose down
docker-compose up
```

---

## 12. Safety Tips

✅ **Do this:**
- Preview changes before running with `docker images`, `docker volume ls`, etc.
- Use `-f` flag only if you're sure
- Keep backups of important data
- Test on dev/test environment first

❌ **Don't do this:**
- Run `docker system prune -a --volumes -f` without understanding what it removes
- Delete volumes if production data is in them
- Run these commands during active development without stopping services first

---

## 13. Monitoring After Cleanup

After running cleanup and restart commands, verify success:

```bash
# Check if all containers are running
docker-compose ps

# Check backend logs for successful startup
docker-compose logs indicab-backend | grep "Started IndicabApplication"

# Verify MySQL is running
docker-compose logs mysql | grep "ready for connections"

# Check if Flyway migrations completed
docker-compose logs indicab-backend | grep "successfully applied"
```

---

## Summary

For the Indicab project's Flyway V004 migration failure, use this command sequence:

```bash
docker-compose down
docker volume rm mysql_data_fresh
docker image prune -f
docker builder prune -f
docker-compose up
```

This will:
1. Stop all containers gracefully
2. Delete the corrupted database volume
3. Remove unused images and cache
4. Start fresh with clean initialization
5. Allow Flyway to run all migrations cleanly
