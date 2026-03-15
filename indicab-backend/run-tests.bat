@echo off
REM Database Tests Runner Script for Windows
REM This script runs all database-related tests for the IndiCab backend
REM Credentials are configured from environment variables

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo IndiCab Backend - Database Tests Runner
echo ==========================================
echo.

REM Default database credentials (matches docker-compose.yml)
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=3307
if not defined DB_ROOT_PASSWORD set DB_ROOT_PASSWORD=root_password
if not defined DB_NAME_TEST set DB_NAME_TEST=indicab_website_test

echo Configuration:
echo   - Database Host: %DB_HOST%
echo   - Database Port: %DB_PORT%
echo   - Test Database: %DB_NAME_TEST%
echo   - Root Password: (hidden)
echo.

REM Check if MySQL is running
echo Checking MySQL connection...
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%DB_ROOT_PASSWORD% -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Cannot connect to MySQL at %DB_HOST%:%DB_PORT%
    echo Please ensure MySQL is running and accessible
    exit /b 1
)
echo [OK] MySQL connection successful
echo.

REM Create test database if it doesn't exist
echo Setting up test database...
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%DB_ROOT_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME_TEST% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (
    echo ERROR: Failed to create test database
    exit /b 1
)
echo [OK] Test database ready
echo.

REM Run unit tests for services
echo ==========================================
echo Running Service Layer Tests
echo ==========================================
call mvn test -Dtest=*Service*Test,UserServiceImplTest,BookingServiceImplTest,DriverServiceImplTest,EmailServiceTest,FareCalculationServiceTest ^
  -Dspring.datasource.url="jdbc:mysql://%DB_HOST%:%DB_PORT%/%DB_NAME_TEST%" ^
  -Dspring.datasource.username=root ^
  -Dspring.datasource.password="%DB_ROOT_PASSWORD%"

if errorlevel 1 (
    echo ERROR: Service layer tests failed
    exit /b 1
)
echo.

REM Run integration tests
echo ==========================================
echo Running Integration Tests (API + Database)
echo ==========================================
call mvn test -Dtest=*IntegrationTest,AuthControllerIntegrationTest,BookingControllerIntegrationTest,DriverControllerIntegrationTest ^
  -Dspring.datasource.url="jdbc:mysql://%DB_HOST%:%DB_PORT%/%DB_NAME_TEST%" ^
  -Dspring.datasource.username=root ^
  -Dspring.datasource.password="%DB_ROOT_PASSWORD%"

if errorlevel 1 (
    echo ERROR: Integration tests failed
    exit /b 1
)
echo.

REM Run utility/specification tests
echo ==========================================
echo Running Utility Tests
echo ==========================================
call mvn test -Dtest=SearchSpecificationTest

if errorlevel 1 (
    echo ERROR: Utility tests failed
    exit /b 1
)
echo.

echo ==========================================
echo [SUCCESS] All Database Tests Passed!
echo ==========================================
echo.
echo Test Summary:
echo   - Service Layer Tests: PASSED
echo   - Integration Tests: PASSED
echo   - Utility Tests: PASSED
echo.
echo For detailed test reports, check: target\surefire-reports\
echo.

endlocal
