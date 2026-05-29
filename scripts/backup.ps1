# backup.ps1 - Exports local MySQL database schema and records
$ErrorActionPreference = "Stop"

$BackupDir = Resolve-Path (Join-Path $PSScriptRoot "../database/backup") -ErrorAction SilentlyContinue
if (-not $BackupDir) {
    $ParentDir = Resolve-Path (Join-Path $PSScriptRoot "..")
    $BackupDir = Join-Path $ParentDir "database/backup"
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "stock_backup_$Timestamp.sql"

Write-Host "=========================================================="
Write-Host "Initializing MySQL Database backup snapshot..."
Write-Host "=========================================================="

# Default fallbacks
$DbHost = "localhost"
$DbUser = "root"
$DbName = "stock_prediction"
$DbPassword = "Tarun@2004"

# Load variables from backend/.env if it exists
$EnvPath = Join-Path $PSScriptRoot "../backend/.env"
if (Test-Path $EnvPath) {
    $EnvLines = Get-Content $EnvPath
    foreach ($line in $EnvLines) {
        $trimmedLine = $line.Trim()
        if ($trimmedLine -and -not $trimmedLine.StartsWith("#") -and $trimmedLine.Contains("=")) {
            $key, $value = $trimmedLine.Split("=", 2)
            $key = $key.Trim()
            $value = $value.Trim()
            if ($key -eq "DB_HOST") { $DbHost = $value }
            elseif ($key -eq "DB_USER") { $DbUser = $value }
            elseif ($key -eq "DB_NAME") { $DbName = $value }
            elseif ($key -eq "DB_PASSWORD" -and $value -ne "your_local_db_password_here" -and $value -ne "") { $DbPassword = $value }
        }
    }
}

Write-Host "Database Host: $DbHost"
Write-Host "Database User: $DbUser"
Write-Host "Database Name: $DbName"

# Execute mysqldump
try {
    # Check if mysqldump is in PATH
    if (-not (Get-Command mysqldump -ErrorAction SilentlyContinue)) {
        throw "mysqldump utility not found in PATH. Please install MySQL client tools."
    }
    
    $DumpArgs = @("-h", $DbHost, "-u", $DbUser)
    if ($DbPassword) {
        $DumpArgs += "-p$DbPassword"
    }
    $DumpArgs += $DbName

    # Run mysqldump and redirect output to file
    & mysqldump $DumpArgs > $BackupFile
    
    # Check execution status
    if ($LASTEXITCODE -eq 0 -or $?) {
        Write-Host "Backup successfully exported to $BackupFile"
    } else {
        throw "mysqldump failed"
    }
} catch {
    Write-Error "Error occurred during MySQL database backup: $_"
    exit 1
}
