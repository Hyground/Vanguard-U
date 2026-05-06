$ErrorActionPreference = "Stop"

$serviceRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $serviceRoot ".env"

if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Missing .env file at $envFile"
}

Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0 -or $line.StartsWith("#")) {
        return
    }

    $parts = $line.Split("=", 2)
    if ($parts.Count -ne 2) {
        return
    }

    [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
}

$env:MAVEN_USER_HOME = Join-Path $serviceRoot ".m2"
& (Join-Path $serviceRoot "mvnw.cmd") spring-boot:run
