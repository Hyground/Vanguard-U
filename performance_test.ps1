$baseUrl = "http://localhost:8080"
$loginUrl = "$baseUrl/api/v1/auth/login"
$testUrl = "$baseUrl/api/v1/courses"

# 1. Login
$loginBody = @{
    username = "load_admin"
    password = "Demo123!"
} | ConvertTo-Json

Write-Host "Intentando login en $loginUrl..."
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login exitoso. Token obtenido."
} catch {
    Write-Error "Error en el login: $_"
    exit
}

# 2. Performance Test
$iterations = 50000
$times = @()

Write-Host "Iniciando $iterations peticiones a $testUrl..."

for ($i = 1; $i -le $iterations; $i++) {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-RestMethod -Uri $testUrl -Method Get -Headers @{ Authorization = "Bearer $token" }
        $stopwatch.Stop()
        $times += $stopwatch.Elapsed.TotalMilliseconds
        
        if ($i % 1000 -eq 0) {
            Write-Host "Progreso: $i / $iterations..."
        }
    } catch {
        $stopwatch.Stop()
        $msg = $_.Exception.Message
        Write-Error "Error en peticion $i -- $msg"
    }
}

# 3. Results
$avg = ($times | Measure-Object -Average).Average
$min = ($times | Measure-Object -Minimum).Minimum
$max = ($times | Measure-Object -Maximum).Maximum

Write-Host "`n--- Resultados ---"
Write-Host "Promedio: $avg ms"
Write-Host "Minimo: $min ms"
Write-Host "Maximo: $max ms"
