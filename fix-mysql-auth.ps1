# IndiCab MySQL Authentication Fix
param([switch]$SkipConfirm = $false)

Write-Host "IndiCab MySQL Authentication Fix" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check docker-compose
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker Compose not found" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Docker Compose found" -ForegroundColor Green

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found" -ForegroundColor Red
    exit 1
}
Write-Host "OK: .env file found" -ForegroundColor Green

# Get password
$envContent = Get-Content ".env"
$dbPassword = ""
foreach ($line in $envContent) {
    if ($line.StartsWith("DB_PASSWORD=")) {
        $dbPassword = $line.Substring(12)
        break
    }
}

if ($dbPassword.Length -eq 0) {
    Write-Host "ERROR: Could not find DB_PASSWORD in .env" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Found DB_PASSWORD" -ForegroundColor Green
Write-Host ""
Write-Host "Will:" -ForegroundColor Yellow
Write-Host "1. Stop containers"
Write-Host "2. Update .env.production"
Write-Host "3. Remove MySQL volume"
Write-Host "4. Restart docker-compose"
Write-Host ""

if (-not $SkipConfirm) {
    $response = Read-Host "Continue? (yes/no)"
    if ($response -ne "yes") {
        exit 0
    }
}

Write-Host ""
Write-Host "Step 1: Stopping containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Start-Sleep -Seconds 3
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Updating .env.production..." -ForegroundColor Yellow
if (Test-Path ".env.production") {
    $prodContent = Get-Content ".env.production"
    $newLines = @()
    
    foreach ($line in $prodContent) {
        $newLine = $line
        if ($line.StartsWith("MYSQL_PASSWORD=")) { $newLine = "MYSQL_PASSWORD=$dbPassword" }
        if ($line.StartsWith("DB_PASSWORD=")) { $newLine = "DB_PASSWORD=$dbPassword" }
        if ($line.StartsWith("DATABASE_PASSWORD=")) { $newLine = "DATABASE_PASSWORD=$dbPassword" }
        if ($line.StartsWith("SPRING_DATASOURCE_PASSWORD=")) { $newLine = "SPRING_DATASOURCE_PASSWORD=$dbPassword" }
        $newLines += $newLine
    }
    
    $newLines | Set-Content ".env.production" -Encoding UTF8
    Write-Host "Done" -ForegroundColor Green
}
Write-Host ""

Write-Host "Step 3: Removing MySQL volume..." -ForegroundColor Yellow
$volName = "indicab_mysql_data_fresh"
docker volume rm $volName 2>&1 | Out-Null
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Starting containers..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "Completed!" -ForegroundColor Green
