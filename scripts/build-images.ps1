param(
    [string]$Registry = "vanguardu",
    [string]$Tag = "latest",
    [switch]$Push
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$services = @(
    @{ Name = "gateway-ms"; Path = "services/gateway-ms" },
    @{ Name = "users-ms"; Path = "services/users-ms" },
    @{ Name = "academic-ms"; Path = "services/academic-ms" },
    @{ Name = "student-and-enrollment-ms"; Path = "services/student-and-enrollment-ms" },
    @{ Name = "billing-ms"; Path = "services/billing-ms" }
)

foreach ($service in $services) {
    $image = "{0}/{1}:{2}" -f $Registry, $service.Name, $Tag
    Write-Host "Building $image"
    docker build -t $image $service.Path
}

if ($Push) {
    foreach ($service in $services) {
        $image = "{0}/{1}:{2}" -f $Registry, $service.Name, $Tag
        Write-Host "Pushing $image"
        docker push $image
    }
}
