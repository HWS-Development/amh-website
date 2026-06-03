# ============================================================================
# split_dump.ps1
# Splits scripts\mgh_dashboard_dump.sql into one .sql file per table.
# Use when the full dump exceeds phpMyAdmin's upload limit (usually 50 MB).
# Import the resulting files one by one (alphabetical order is fine for
# unrelated tables; for FK-dependent tables, import parents first).
# ============================================================================

$ErrorActionPreference = "Stop"

$InFile  = Join-Path $PSScriptRoot "mgh_dashboard_dump.sql"
$OutDir  = Join-Path $PSScriptRoot "dump_parts"

if (-not (Test-Path -LiteralPath $InFile)) {
  Write-Error "$InFile not found. Run .\dump_mgh_dashboard.ps1 first."
  exit 1
}

if (Test-Path -LiteralPath $OutDir) {
  Remove-Item -LiteralPath $OutDir -Recurse -Force
}
New-Item -ItemType Directory -Path $OutDir | Out-Null

# Read the header (everything before first table) so each part is self-contained
$reader = [System.IO.StreamReader]::new($InFile, [System.Text.Encoding]::UTF8)
$header = [System.Text.StringBuilder]::new()
$currentTable = $null
$currentBuilder = $null
$tableCount = 0

function Save-Current {
  param($table, $builder)
  if (-not $table -or -not $builder) { return }
  $safe = $table -replace '[^A-Za-z0-9_]', '_'
  $path = Join-Path $OutDir ("{0:D3}_{1}.sql" -f $script:tableCount, $safe)
  $content = $script:header.ToString() + $builder.ToString()
  [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
  $sizeKb = [Math]::Round((Get-Item $path).Length / 1KB, 1)
  Write-Host ("  -> {0,3} KB  {1}" -f $sizeKb, (Split-Path $path -Leaf)) -ForegroundColor Gray
}

Write-Host "Splitting $InFile ..." -ForegroundColor Cyan

$inHeader = $true
while (($line = $reader.ReadLine()) -ne $null) {
  # Detect a new table block
  if ($line -match '^--\s+Table structure for table `([^`]+)`') {
    $inHeader = $false
    Save-Current $currentTable $currentBuilder
    $currentTable   = $Matches[1]
    $currentBuilder = [System.Text.StringBuilder]::new()
    $script:tableCount++
    [void]$currentBuilder.AppendLine($line)
    continue
  }
  if ($inHeader) {
    [void]$header.AppendLine($line)
  } else {
    [void]$currentBuilder.AppendLine($line)
  }
}
Save-Current $currentTable $currentBuilder
$reader.Close()

Write-Host ""
Write-Host "Split $tableCount tables into $OutDir" -ForegroundColor Green
Write-Host "Import each .sql file via phpMyAdmin -> Import."
