param([string]$MySqlHome = $env:MYSQL_HOME)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$dataPath = Join-Path $projectRoot '.local/mysql-data'

if (-not (Test-Path -LiteralPath $dataPath)) {
    throw 'Database lokal belum diinisialisasi. Ikuti backend/README.md untuk koneksi MySQL biasa.'
}

if (-not $MySqlHome) {
    $MySqlHome = Get-ChildItem 'C:/laragon/bin/mysql' -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName 'bin/mysqld.exe') } |
        Select-Object -First 1 -ExpandProperty FullName
}
if (-not $MySqlHome) {
    throw 'Set MYSQL_HOME ke folder instalasi MySQL yang berisi bin/mysqld.exe.'
}

$running = Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue
if ($running) {
    Write-Output 'Port 3307 sudah aktif. Tidak memulai server kedua.'
    exit 0
}

$mysqlArguments = @(
    '--no-defaults',
    ('--basedir="{0}"' -f $MySqlHome),
    ('--datadir="{0}"' -f $dataPath),
    '--port=3307',
    '--bind-address=127.0.0.1',
    '--mysqlx=OFF',
    ('--log-error="{0}"' -f (Join-Path $projectRoot '.local/mysql-error.log'))
)
Start-Process -FilePath (Join-Path $MySqlHome 'bin/mysqld.exe') -ArgumentList $mysqlArguments -WindowStyle Hidden | Out-Null
Write-Output 'MySQL lokal dimulai pada 127.0.0.1:3307. Log: .local/mysql-error.log'
