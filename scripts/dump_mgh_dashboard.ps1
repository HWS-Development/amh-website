# ============================================================================
# dump_mgh_dashboard.ps1
# Exports the local MySQL database `mgh_dashboard` to a single SQL file ready
# to import into the remote Hostinger database `u877729207_mgh_dashboard`
# via phpMyAdmin (hPanel -> Databases -> phpMyAdmin -> Import).
#
# Usage (from PowerShell, in this folder):
#   .\dump_mgh_dashboard.ps1
#
# Output: scripts\mgh_dashboard_dump.sql  (+ optional .zip if > 50 MB)
# ============================================================================

$ErrorActionPreference = "Stop"

# ── Config ──────────────────────────────────────────────────────────────────
$LocalDb       = "mgh_dashboard"
$LocalUser     = "root"
$LocalPassword = "root"
$LocalHost     = "127.0.0.1"
$LocalPort     = 3306

$OutDir  = Join-Path $PSScriptRoot "."        # script lives in scripts\
$OutFile = Join-Path $OutDir "mgh_dashboard_dump.sql"

# ── Locate mysqldump.exe ────────────────────────────────────────────────────
$candidates = @(
  "C:\xampp\mysql\bin\mysqldump.exe",
  "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysqldump.exe",
  "C:\wamp64\bin\mysql\mysql5.7.40\bin\mysqldump.exe",
  "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
  "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe",
  "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe",
  "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe"
)

$mysqldump = $null
foreach ($c in $candidates) {
  if (Test-Path -LiteralPath $c) { $mysqldump = $c; break }
}
if (-not $mysqldump) {
  $cmd = Get-Command mysqldump.exe -ErrorAction SilentlyContinue
  if ($cmd) { $mysqldump = $cmd.Path }
}
if (-not $mysqldump) {
  Write-Error "mysqldump.exe not found. Edit `$candidates in this script with the correct path."
  exit 1
}
Write-Host "Using: $mysqldump" -ForegroundColor Cyan

# ── Run the dump ────────────────────────────────────────────────────────────
# Flags chosen for Hostinger shared hosting / phpMyAdmin import:
#   --no-tablespaces       : avoid PROCESS privilege requirement
#   --single-transaction   : consistent snapshot, no table locks (InnoDB)
#   --default-character-set=utf8mb4 : preserve French / Arabic accents
#   --add-drop-table       : drops existing tables on the remote before recreating
#   --routines --triggers  : include stored procs and triggers if any
#   --complete-insert      : column-qualified INSERTs (safer across versions)
#   --skip-extended-insert : one INSERT per row (easier to split if too large)
# NOTE: no --databases flag => no CREATE DATABASE / USE, so the dump can be
# imported into the differently-named remote db (u877729207_mgh_dashboard).

Write-Host "Dumping $LocalDb -> $OutFile ..." -ForegroundColor Cyan

$dumpArgs = @(
  "--host=$LocalHost",
  "--port=$LocalPort",
  "--user=$LocalUser",
  "--password=$LocalPassword",
  "--no-tablespaces",
  "--single-transaction",
  "--default-character-set=utf8mb4",
  "--set-charset",
  "--add-drop-table",
  "--routines",
  "--triggers",
  "--complete-insert",
  "--skip-extended-insert",
  "--hex-blob",
  "--result-file=$OutFile",
  $LocalDb
)

# Use --result-file (writes UTF-8 directly) and swallow the harmless
# "Using a password on the command line is insecure" stderr warning.
$ErrorActionPreference = "Continue"
& $mysqldump @dumpArgs 2>$null
$exit = $LASTEXITCODE
$ErrorActionPreference = "Stop"

if ($exit -ne 0) {
  Write-Error "mysqldump exited with code $exit"
  exit $exit
}

if (-not (Test-Path -LiteralPath $OutFile) -or (Get-Item $OutFile).Length -eq 0) {
  Write-Error "Dump produced an empty file."
  exit 1
}

$size = (Get-Item $OutFile).Length
$sizeMb = [Math]::Round($size / 1MB, 2)
Write-Host "Dump complete: $OutFile (${sizeMb} MB)" -ForegroundColor Green

# ── If big, also produce a .zip (phpMyAdmin accepts gz/bz2/zip if enabled) ──
if ($size -gt 30MB) {
  $zip = "$OutFile.zip"
  Write-Host "File > 30 MB - also creating $zip for upload ..." -ForegroundColor Yellow
  if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip }
  Compress-Archive -LiteralPath $OutFile -DestinationPath $zip
  $zipMb = [Math]::Round((Get-Item $zip).Length / 1MB, 2)
  Write-Host "Created: $zip (${zipMb} MB)" -ForegroundColor Green
}

Write-Host ""
Write-Host "===== NEXT STEPS =====" -ForegroundColor Magenta
Write-Host "1. Log in to Hostinger hPanel"
Write-Host "2. Databases -> u877729207_mgh_dashboard -> Enter phpMyAdmin"
Write-Host "3. Click 'Import' tab"
Write-Host "4. Choose file: $OutFile"
Write-Host "   (or the .zip if > 30 MB)"
Write-Host "5. Format: SQL  |  Character set: utf-8"
Write-Host "6. Click 'Import' at the bottom"
Write-Host ""
Write-Host "If phpMyAdmin rejects the file size, use the split script:"
Write-Host "   .\split_dump.ps1"
