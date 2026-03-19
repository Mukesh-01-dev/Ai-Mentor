# setup-db.ps1 - Database setup script for Windows

param(
    [string]$DBPassword = "Postgre@1904"
)

$DBName = "ai_mentor_db"
$DBUser = "postgres"
$DBHost = "localhost"

Write-Host "Database Setup Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Set password environment variable for psql
$env:PGPASSWORD = $DBPassword

Write-Host "Step 1: Dropping existing database (if exists)..." -ForegroundColor Yellow

try {
    & psql -h $DBHost -U $DBUser -c "DROP DATABASE IF EXISTS $DBName;" 2>&1 | Out-Null
    Write-Host "[OK] Dropped $DBName" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Could not drop database (may already be gone)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Creating new database..." -ForegroundColor Yellow

try {
    & psql -h $DBHost -U $DBUser -c "CREATE DATABASE $DBName;" 2>&1 | Out-Null
    Write-Host "[OK] Created $DBName" -ForegroundColor Green
} catch {
    Write-Host "[ERR] Failed to create database. Check your credentials." -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}

# Clear password
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "[OK] Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. cd backend"
Write-Host "2. npm run dev"
Write-Host "3. npm run seed  (in another terminal)"
