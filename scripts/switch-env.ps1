# Script para alternar entre entorno Local y Nube
param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "cloud")]
    $Mode = "local"
)

$GatewayClientPath = "Vanguard-web/js/utils/gateway-client.js"
$Content = Get-Content $GatewayClientPath -Raw

if ($Mode -eq "local") {
    Write-Host "Cambiando a modo LOCAL (localhost:8080)..." -ForegroundColor Cyan
    $NewContent = $Content -replace "this.baseUrl = 'https://api.wissegt.com/api/v1'", "this.baseUrl = 'http://localhost:8080/api/v1'"
    Set-Content $GatewayClientPath $NewContent
    
    Write-Host "Levantando infraestructura local con Docker Compose..." -ForegroundColor Yellow
    docker-compose up --build -d
    
    Write-Host "`n¡LISTO! Puedes abrir el index.html en tu navegador." -ForegroundColor Green
    Write-Host "Los cambios que hagas en el código de los microservicios requerirán ejecutar 'docker-compose restart <servicio>'" -ForegroundColor Gray
} else {
    Write-Host "Cambiando a modo NUBE (api.wissegt.com)..." -ForegroundColor Cyan
    $NewContent = $Content -replace "this.baseUrl = 'http://localhost:8080/api/v1'", "this.baseUrl = 'https://api.wissegt.com/api/v1'"
    Set-Content $GatewayClientPath $NewContent
    
    Write-Host "Deteniendo contenedores locales..." -ForegroundColor Yellow
    docker-compose down
    
    Write-Host "`n¡LISTO! El frontend ahora apunta a la API de producción." -ForegroundColor Green
}
