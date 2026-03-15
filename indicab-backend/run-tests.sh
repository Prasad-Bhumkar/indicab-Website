#!/bin/bash
# Database Tests Runner Script
# This script runs all database-related tests for the IndiCab backend
# Credentials are configured from environment variables

set -e

echo "=========================================="
echo "IndiCab Backend - Database Tests Runner"
echo "=========================================="
echo ""

# Default database credentials (matches docker-compose.yml)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3307}
DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD:-root_password}
DB_NAME_TEST=${DB_NAME_TEST:-indicab_website_test}

echo "Configuration:"
echo "  - Database Host: $DB_HOST"
echo "  - Database Port: $DB_PORT"
echo "  - Test Database: $DB_NAME_TEST"
echo "  - Root Password: (hidden)"
echo ""

# Check if MySQL is running
echo "Checking MySQL connection..."
if ! mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" > /dev/null 2>&1; then
    echo "ERROR: Cannot connect to MySQL at $DB_HOST:$DB_PORT"
    echo "Please ensure MySQL is running and accessible"
    exit 1
fi
echo "✓ MySQL connection successful"
echo ""

# Create test database if it doesn't exist
echo "Setting up test database..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME_TEST CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "✓ Test database ready"
echo ""

# Run unit tests for services
echo "=========================================="
echo "Running Service Layer Tests"
echo "=========================================="
mvn test -Dtest=*Service*Test,UserServiceImplTest,BookingServiceImplTest,DriverServiceImplTest,EmailServiceTest,FareCalculationServiceTest \
  -DDB_HOST="$DB_HOST" \
  -DDB_PORT="$DB_PORT" \
  -DDB_ROOT_PASSWORD="$DB_ROOT_PASSWORD" \
  -Dspring.datasource.url="jdbc:mysql://$DB_HOST:$DB_PORT/$DB_NAME_TEST" \
  -Dspring.datasource.username=root \
  -Dspring.datasource.password="$DB_ROOT_PASSWORD"

if [ $? -ne 0 ]; then
    echo "ERROR: Service layer tests failed"
    exit 1
fi
echo ""

# Run integration tests
echo "=========================================="
echo "Running Integration Tests (API + Database)"
echo "=========================================="
mvn test -Dtest=*IntegrationTest,AuthControllerIntegrationTest,BookingControllerIntegrationTest,DriverControllerIntegrationTest \
  -DDB_HOST="$DB_HOST" \
  -DDB_PORT="$DB_PORT" \
  -DDB_ROOT_PASSWORD="$DB_ROOT_PASSWORD" \
  -Dspring.datasource.url="jdbc:mysql://$DB_HOST:$DB_PORT/$DB_NAME_TEST" \
  -Dspring.datasource.username=root \
  -Dspring.datasource.password="$DB_ROOT_PASSWORD"

if [ $? -ne 0 ]; then
    echo "ERROR: Integration tests failed"
    exit 1
fi
echo ""

# Run utility/specification tests
echo "=========================================="
echo "Running Utility Tests"
echo "=========================================="
mvn test -Dtest=SearchSpecificationTest

if [ $? -ne 0 ]; then
    echo "ERROR: Utility tests failed"
    exit 1
fi
echo ""

echo "=========================================="
echo "✓ All Database Tests Completed Successfully!"
echo "=========================================="
echo ""
echo "Test Summary:"
echo "  - Service Layer Tests: PASSED"
echo "  - Integration Tests: PASSED"
echo "  - Utility Tests: PASSED"
echo ""
echo "For detailed test reports, check: target/surefire-reports/"
