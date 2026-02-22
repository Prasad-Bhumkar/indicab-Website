# IndiCab - Local Development Setup Guide

**Last Updated:** February 22, 2026  
**Status:** Complete & Tested ✅

A comprehensive guide for setting up the IndiCab development environment on your local machine.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Environment Configuration](#environment-configuration)
4. [Running the Application](#running-the-application)
5. [Development Tools & IDEs](#development-tools--ides)
6. [Troubleshooting](#troubleshooting)
7. [Database Setup](#database-setup)
8. [Common Development Tasks](#common-development-tasks)

---

## System Requirements

### Minimum Requirements
- **OS:** Windows, macOS, or Linux
- **RAM:** 8GB minimum (16GB recommended)
- **Disk Space:** 20GB free

### Required Software

#### Backend Development
- **Java JDK 17+** - Required for Spring Boot backend
  - Download: https://www.oracle.com/java/technologies/downloads/#java17
  - Verify: `java -version` (should show 17.x.x)
  
- **Maven 3.8+** - Java build tool
  - Download: https://maven.apache.org/download.cgi
  - Verify: `mvn -version`

#### Frontend Development
- **Node.js 18+** - JavaScript runtime
  - Download: https://nodejs.org/en/ (LTS version)
  - Verify: `node --version` (should show 18.x.x or higher)
  
- **npm 9+** - Node package manager (comes with Node.js)
  - Verify: `npm --version`

#### Database & Cache
- **MySQL 8.0+** - Relational database
  - Download: https://dev.mysql.com/downloads/mysql/
  - Or use Docker: `docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0`

- **Redis 7.0+** (Optional, but recommended)
  - Download: https://redis.io/download
  - Or use Docker: `docker run -d -p 6379:6379 redis:7`

#### Development Tools
- **Git** - Version control
  - Download: https://git-scm.com/downloads
  - Verify: `git --version`

- **Docker & Docker Compose** (Optional, for containerized development)
  - Download: https://www.docker.com/products/docker-desktop
  - Verify: `docker --version` and `docker-compose --version`

- **Postman or Insomnia** - API testing tools (Optional but recommended)
  - Postman: https://www.postman.com/downloads/
  - Insomnia: https://insomnia.rest/download

---

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/indicab-Website.git
cd indicab-Website

# Verify directory structure
ls -la
# Should show: indicab-frontend/, indicab-backend/, docker-compose.yml, package.json, etc.
```

### 2. Install Backend Dependencies

```bash
# Navigate to backend directory
cd indicab-backend

# Install Maven dependencies
./mvnw clean install

# This downloads all Java dependencies (~200MB)
# Takes 2-5 minutes on first run

# Verify installation
./mvnw --version
```

### 3. Install Frontend Dependencies

```bash
# Navigate to frontend directory (from project root)
cd indicab-frontend

# Install npm dependencies
npm install

# This downloads all Node packages (~400MB)
# Takes 3-5 minutes on first run

# Verify installation
npm list react react-dom react-redux
```

### 4. Verify All Tools

```bash
# Run these from any directory to verify setup

# Java
java -version

# Maven
mvn --version

# Node & npm
node --version
npm --version

# Git
git --version

# Docker (optional)
docker --version
docker-compose --version
```

---

## Environment Configuration

### 1. Create Backend Environment File

```bash
# Navigate to backend directory
cd indicab-backend/src/main/resources/

# Create application-dev.properties file
touch application-dev.properties

# Add the following configuration:
```

**indicab-backend/src/main/resources/application-dev.properties:**

```properties
# ==================== DATABASE CONFIGURATION ====================
spring.datasource.url=jdbc:mysql://localhost:3306/indicab_dev
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ==================== JPA & HIBERNATE ====================
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# ==================== FLYWAY MIGRATIONS ====================
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# ==================== JWT CONFIGURATION ====================
jwt.secret=your-super-secret-dev-key-change-this-in-production
jwt.expiration=900
jwt.refresh-expiration=604800

# ==================== SERVER CONFIGURATION ====================
server.port=8000
server.servlet.context-path=/

# ==================== CORS CONFIGURATION ====================
cors.allowed-origins=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173

# ==================== REDIS CONFIGURATION (Optional) ====================
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.timeout=2000
spring.redis.password=

# ==================== LOGGING ====================
logging.level.root=INFO
logging.level.com.indicab=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# ==================== ACTUATOR ====================
management.endpoints.web.exposure.include=health,metrics,info
management.endpoint.health.show-details=always

# ==================== SWAGGER/SPRINGDOC ====================
springdoc.api-docs.path=/api/v1/api-docs
springdoc.swagger-ui.path=/api/v1/swagger-ui.html
springdoc.swagger-ui.enabled=true
```

### 2. Create Frontend Environment File

```bash
# Navigate to frontend directory
cd indicab-frontend

# Create .env.local file
touch .env.local

# Add the following:
```

**indicab-frontend/.env.local:**

```env
# ==================== API CONFIGURATION ====================
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# ==================== WEBSOCKET CONFIGURATION ====================
VITE_WS_URL=ws://localhost:8000/ws/ride
VITE_WS_ADMIN_URL=ws://localhost:8000/ws/admin

# ==================== ENVIRONMENT ====================
VITE_ENV=development
VITE_DEBUG=true

# ==================== FEATURE FLAGS ====================
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_ANALYTICS=false

# ==================== SENTRY (Error Tracking) ====================
VITE_SENTRY_DSN=

# ==================== GOOGLE MAPS (Optional) ====================
VITE_GOOGLE_MAPS_API_KEY=
```

### 3. Create MySQL Database

```bash
# Connect to MySQL
mysql -u root -p

# Enter your MySQL root password when prompted
# Then run:
```

```sql
-- Create development database
CREATE DATABASE indicab_dev;
USE indicab_dev;

-- Create application user
CREATE USER 'indicab_user'@'localhost' IDENTIFIED BY 'indicab_password';
GRANT ALL PRIVILEGES ON indicab_dev.* TO 'indicab_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
SELECT USER FROM mysql.user WHERE user='indicab_user';

-- Exit
EXIT;
```

Or use a single command:

```bash
mysql -u root -p -e "
CREATE DATABASE indicab_dev;
CREATE USER 'indicab_user'@'localhost' IDENTIFIED BY 'indicab_password';
GRANT ALL PRIVILEGES ON indicab_dev.* TO 'indicab_user'@'localhost';
FLUSH PRIVILEGES;
"
```

---

## Running the Application

### Option 1: Run Frontend & Backend Separately (Recommended for Development)

#### Terminal 1 - Backend (Spring Boot)

```bash
# Navigate to backend
cd indicab-backend

# Run with development profile
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Expected output:
# ==================== Spring Boot Started ====================
# Started IndicabApplication in X.XXX seconds
# Tomcat started on port(s): 8000
# ==================== http://localhost:8000 ====================
```

#### Terminal 2 - Frontend (React/Vite)

```bash
# Navigate to frontend
cd indicab-frontend

# Install dependencies if not done
npm install

# Start development server
npm run dev

# Expected output:
# ==================== VITE ====================
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

#### Terminal 3 - Mock API Server (Optional)

```bash
# Navigate to frontend
cd indicab-frontend

# Start JSON Server (for mock API during development)
npm run dev:mock

# Runs on http://localhost:8000
```

**Access Points:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/api/v1/swagger-ui.html
- **Database:** localhost:3306 (MySQL)

### Option 2: Run Everything with Docker (Easiest)

```bash
# From project root
docker-compose up -d

# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Access points same as above
```

### Option 3: Run Frontend & Backend Concurrently (npm script)

```bash
# From project root
npm run dev:all

# This starts:
# - Backend on http://localhost:8000
# - Frontend on http://localhost:5174 (note: port 5174, not 5173)
# - Both run in the same terminal with prefixed output
```

---

## Development Tools & IDEs

### Visual Studio Code (Recommended)

**Recommended Extensions:**
1. **ES7+ React/Redux/React-Native snippets** - dsznajder.es7-react-js-snippets
2. **Prettier - Code formatter** - esbenp.prettier-vscode
3. **ESLint** - dbaeumer.vscode-eslint
4. **Thunder Client or REST Client** - rangav.vscode-thunder-client
5. **MySQL** - cweijan.vscode-mysql
6. **Java Extension Pack** - vscjava.vscode-java-pack
7. **Spring Boot Extension Pack** - pivotal.vscode-spring-boot

**VS Code Settings (.vscode/settings.json):**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.profiles.windows": {
    "PowerShell": {
      "source": "PowerShell",
      "icon": "terminal-powershell"
    }
  }
}
```

### IntelliJ IDEA (Excellent for Java)

**Recommended Plugins:**
1. Spring Boot
2. Maven
3. Lombok
4. JPA
5. SQL
6. REST Client

**Run Configuration:**
- Right-click `IndicabApplication.java` → Run with Spring Boot active profile: `dev`

### JetBrains WebStorm (Great for Frontend)

**Recommended Plugins:**
1. React
2. Redux
3. ESLint
4. Prettier
5. REST Client

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
# macOS/Linux:
lsof -i :8000
lsof -i :5173

# Windows (PowerShell):
netstat -ano | findstr :8000

# Kill process
# macOS/Linux:
kill -9 <PID>

# Windows:
taskkill /PID <PID> /F

# Alternative: Use different ports in .env files
```

### MySQL Connection Issues

```bash
# Verify MySQL is running
mysql -u root -p

# If not running, start it:
# macOS (Homebrew):
brew services start mysql

# Windows:
net start MySQL80

# Docker:
docker-compose up -d mysql
```

### npm install Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still fails, try with legacy peer deps:
npm install --legacy-peer-deps
```

### Maven Build Fails

```bash
# Clear Maven cache
rm -rf ~/.m2/repository

# Rebuild
./mvnw clean install

# If Java version issue:
java -version
# Should be 17+
```

### Application Won't Start

```bash
# Check logs for errors
tail -f indicab-backend/target/application.log

# Verify database connection
mysql -u indicab_user -p
# Password: indicab_password
# SELECT 1;

# Verify port availability
netstat -tuln | grep 8000
```

### CORS Issues

```
Frontend → Backend requests failing with CORS error?

1. Check CORS config in application-dev.properties
2. Verify frontend URL is in cors.allowed-origins
3. Restart backend
4. Check browser console for specific error

Example fix:
cors.allowed-origins=http://localhost:5173,http://localhost:5174
```

### WebSocket Connection Issues

```
Real-time updates not working?

1. Verify WebSocket endpoint in frontend:
   VITE_WS_URL=ws://localhost:8000/ws/ride

2. Check backend WebSocket config:
   src/main/java/com/indicab/config/WebSocketConfig.java

3. Test with browser DevTools:
   Network → WS → look for /ws/ride connection

4. Restart both frontend and backend
```

---

## Database Setup

### Auto Migration (Flyway)

Flyway automatically runs database migrations on startup:

```
Location: indicab-backend/src/main/resources/db/migration/

Files are executed in order:
V1__initial_schema.sql
V2__add_audit_logs.sql
V3__add_new_tables.sql
...

No manual migration needed!
```

### Manual Database Check

```bash
# Connect to database
mysql -u indicab_user -p indicab_dev
# Password: indicab_password

# List tables
SHOW TABLES;

# View specific table structure
DESCRIBE users;
DESC bookings;

# Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM bookings;

# Exit
EXIT;
```

### Reset Database (Development Only)

```bash
# Method 1: Drop and recreate
mysql -u root -p -e "DROP DATABASE indicab_dev; CREATE DATABASE indicab_dev;"

# Method 2: Using Docker
docker-compose down -v
docker-compose up -d mysql

# Flyway will automatically recreate schema on next backend start
```

---

## Common Development Tasks

### Starting Fresh Development Session

```bash
# 1. Pull latest code
git pull origin main

# 2. Update dependencies
cd indicab-backend && ./mvnw clean install
cd ../indicab-frontend && npm install

# 3. Reset database (if needed)
mysql -u root -p -e "DROP DATABASE indicab_dev; CREATE DATABASE indicab_dev;"

# 4. Start services
npm run dev:all

# Access: http://localhost:5174
```

### Creating a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/new-feature-name

# 2. Create feature in frontend
# src/features/newFeature/newFeatureSlice.js (Redux)
# src/components/NewFeatureComponent.jsx (React)

# 3. Create API endpoint in backend
# src/main/java/com/indicab/controller/NewFeatureController.java
# src/main/java/com/indicab/service/NewFeatureService.java
# src/main/java/com/indicab/repository/NewFeatureRepository.java

# 4. Test locally
npm run test

# 5. Commit changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature-name
```

### Running Tests

```bash
# Frontend tests
cd indicab-frontend
npm test                    # Run all tests
npm run test:ui            # Run with UI
npm run test:coverage      # Generate coverage report

# Backend tests
cd indicab-backend
./mvnw test                           # Run all tests
./mvnw test -Dtest=UserServiceTest   # Run specific test
./mvnw clean test jacoco:report      # With coverage report
```

### Building for Production

```bash
# Frontend build
cd indicab-frontend
npm run build              # Creates dist/ folder
npm run preview            # Preview production build locally

# Backend build
cd indicab-backend
./mvnw clean package       # Creates JAR file
java -jar target/indicab-*.jar  # Run JAR
```

### Debugging

**Frontend Debugging:**
```
1. Open http://localhost:5173
2. Press F12 to open DevTools
3. Go to "Sources" or "Debugger" tab
4. Set breakpoints in code
5. Interact with app to trigger breakpoints
```

**Backend Debugging (IntelliJ):**
```
1. Right-click IndicabApplication.java
2. Select "Debug"
3. Set breakpoints by clicking line numbers
4. Make API request to trigger breakpoint
5. Use debugging controls to step through code
```

**API Testing:**
```
Use Postman or Insomnia to test:
1. Create new request
2. Set URL: http://localhost:8000/api/v1/bookings
3. Set method: GET
4. Add headers: Authorization: Bearer <your-jwt-token>
5. Send and inspect response
```

---

## Next Steps

1. **Read:** [QUICK_START.md](QUICK_START.md) for rapid overview
2. **Read:** [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. **Read:** [API_ENDPOINTS.md](indicab-frontend/API_ENDPOINTS.md) for API reference
4. **Run:** Start the application and explore
5. **Code:** Check out [ROADMAP_AND_NEXT_PHASES.md](ROADMAP_AND_NEXT_PHASES.md) for development priorities

---

**Questions?** Check [agents.md](agents.md) for detailed development tasks and current project status.

**Last Updated:** February 22, 2026
