# Database Tests Guide

This document explains how to run database-related tests for the IndiCab backend.

## Prerequisites

- MySQL 8.0+ running and accessible
- Maven 3.6+ installed
- Java 17+ installed
- Test database credentials configured

## Default Credentials

The tests use the following default credentials (matching docker-compose.yml):

```
Database Host: localhost
Database Port: 3307 (or 3306 for local MySQL)
Root User: root
Root Password: root_password
Test Database: indicab_website_test
```

## Test Categories

### 1. Service Layer Tests
Unit tests for business logic layer:
- `UserServiceImplTest` - User service operations
- `BookingServiceImplTest` - Booking service operations
- `DriverServiceImplTest` - Driver service operations
- `EmailServiceTest` - Email service operations
- `FareCalculationServiceTest` - Fare calculation logic

**Database Impact:** These tests use Mockito and do NOT connect to a real database.

### 2. Integration Tests
Full integration tests with HTTP endpoints and database:
- `AuthControllerIntegrationTest` - Authentication endpoints
- `BookingControllerIntegrationTest` - Booking API endpoints
- `DriverControllerIntegrationTest` - Driver API endpoints

**Database Impact:** These tests require a running MySQL instance and will:
- Create tables automatically (ddl-auto: create-drop)
- Insert test data
- Verify database operations
- Clean up after execution

### 3. Utility Tests
Specification and utility tests:
- `SearchSpecificationTest` - Search and filter logic

**Database Impact:** No database required.

## Running Tests

### Quick Start (Recommended)

#### Linux/Mac:
```bash
cd indicab-backend
chmod +x run-tests.sh
./run-tests.sh
```

#### Windows:
```cmd
cd indicab-backend
run-tests.bat
```

### Custom Credentials

Override default credentials via environment variables:

#### Linux/Mac:
```bash
export DB_HOST=localhost
export DB_PORT=3307
export DB_ROOT_PASSWORD=your_password
export DB_NAME_TEST=indicab_website_test
./run-tests.sh
```

#### Windows:
```cmd
set DB_HOST=localhost
set DB_PORT=3307
set DB_ROOT_PASSWORD=your_password
set DB_NAME_TEST=indicab_website_test
run-tests.bat
```

### Run Specific Test Categories

#### Service Layer Only:
```bash
mvn test -Dtest=*ServiceImplTest
```

#### Integration Tests Only:
```bash
mvn test -Dtest=*IntegrationTest
```

#### Single Test Class:
```bash
mvn test -Dtest=BookingServiceImplTest
```

#### Single Test Method:
```bash
mvn test -Dtest=BookingServiceImplTest#testCreateBooking
```

### Advanced Maven Options

#### Skip Tests:
```bash
mvn clean package -DskipTests
```

#### Run with Debug Output:
```bash
mvn test -X -Dtest=*IntegrationTest
```

#### Run with Coverage Report:
```bash
mvn clean test jacoco:report
# Report generated in: target/site/jacoco/index.html
```

#### Run Tests in Parallel:
```bash
mvn test -DforkCount=4
```

## Database Configuration

### Test Database Setup

The integration tests automatically:
1. Create `indicab_website_test` database if it doesn't exist
2. Create tables via Hibernate (ddl-auto: create-drop)
3. Apply Flyway migrations (if enabled)
4. Populate test data from `@BeforeEach` methods
5. Drop all tables after tests complete (isolation)

### Custom Test Configuration

Edit `src/test/resources/application-test.properties` to override test settings:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3307/indicab_website_test
spring.datasource.username=root
spring.datasource.password=root_password

# Hibernate
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# Flyway
spring.flyway.enabled=true
spring.flyway.repair-on-migrate=true
```

## Troubleshooting

### MySQL Connection Error
```
ERROR: Cannot connect to MySQL at localhost:3307
```

**Solution:**
1. Verify MySQL is running: `mysql --version`
2. Check connection: `mysql -h localhost -P 3307 -u root -p`
3. Update `DB_HOST` and `DB_PORT` environment variables

### Test Database Already Exists
```
ERROR: Can't create database 'indicab_website_test'; database exists
```

**Solution:** The test will use the existing database. Ensure it's empty:
```bash
mysql -u root -p -e "DROP DATABASE indicab_website_test;"
```

### Flyway Migration Error
```
ERROR: Schema 'indicab_website_test' contains a failed migration
```

**Solution:** Repair migrations in test configuration:
```properties
spring.flyway.repair-on-migrate=true
```

### Connection Timeout
```
ERROR: Communications link failure - connection timeout
```

**Solution:** Increase timeout in connection string:
```properties
spring.datasource.url=jdbc:mysql://localhost:3307/indicab_website_test?connectTimeout=30000
```

## Test Results

### View Test Report
After running tests, view the HTML report:
```bash
# Linux/Mac
open target/surefire-reports/index.html

# Windows
start target\surefire-reports\index.html

# Direct path
target/surefire-reports/com.indicab.[ClassName]Test.html
```

### Test Statistics
```
Tests run: 67
Failures: 0
Errors: 0
Skipped: 0
Success Rate: 100%
```

## Continuous Integration

For CI/CD pipelines, use:
```bash
mvn clean verify -DskipIntegrationTests=false
```

## Performance

### Expected Execution Time
- Service Layer Tests: ~5-10 seconds
- Integration Tests: ~30-45 seconds
- All Tests: ~1-2 minutes

### Optimization Tips
- Run tests in parallel: `mvn test -DforkCount=4`
- Skip expensive tests: `mvn test -Dtest=!*ControllerIntegrationTest`
- Use test profiles: `mvn test -Dspring.profiles.active=test`

## Credentials

### Using Docker Compose Credentials
If running with docker-compose, credentials are already set:
```yaml
# docker-compose.yml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: root_password
    MYSQL_DATABASE: indicab_website
```

For tests, the same credentials apply to `indicab_website_test` database.

### Security Notes
⚠️ **IMPORTANT:**
- Never commit test credentials to version control
- Use environment variables for sensitive data
- Test credentials should differ from production
- Rotate production database passwords regularly

## See Also
- [Backend Architecture](../docs/ARCHITECTURE.md)
- [Database Schema](../docs/DATABASE_SCHEMA.md)
- [API Reference](../docs/API_REFERENCE.md)
