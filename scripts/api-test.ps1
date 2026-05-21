# API Test Script (Vanguard-U)
$BaseUrl = "https://api.wissegt.com/api/v1"
$AdminUser = "load_admin"
$AdminPass = "Demo123!"

function Test-Api {
    Write-Host "--- 1. Testing Login ---" -ForegroundColor Cyan
    $loginBody = @{ username = $AdminUser; password = $AdminPass } | ConvertTo-Json
    try {
        $loginResp = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        $token = $loginResp.token
        $idUser = $loginResp.idUser
        Write-Host "Login successful. ID: $idUser, Username: $($loginResp.username), Role: $($loginResp.role)" -ForegroundColor Green
        Write-Host "Token: $($token.Substring(0, 10))..." -ForegroundColor Gray
    } catch {
        Write-Host "Login failed: $_" -ForegroundColor Red
        return
    }

    Write-Host "`n--- 1.5 Checking /users/me ---" -ForegroundColor Cyan
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $me = Invoke-RestMethod -Uri "$BaseUrl/users/me" -Method Get -Headers $headers
        $me | ConvertTo-Json | Write-Host -ForegroundColor Gray
    } catch {
        Write-Host "WhoAmI failed: $_" -ForegroundColor Red
    }

    Write-Host "`n--- 2. Testing Data Retrieval (Get Users) ---" -ForegroundColor Cyan
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $users = Invoke-RestMethod -Uri "$BaseUrl/users" -Method Get -Headers $headers
        Write-Host "Fetched $($users.Count) users successfully." -ForegroundColor Green
    } catch {
        Write-Host "Fetch users failed: $_" -ForegroundColor Red
    }

    Write-Host "`n--- 3. Testing Account Update (Username & Password) ---" -ForegroundColor Cyan
    $newUsername = "load_admin_verified"
    $newPass = "NewPass2026!"
    $updateBody = @{ username = $newUsername; password = $newPass } | ConvertTo-Json
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $updateResp = Invoke-RestMethod -Uri "$BaseUrl/users/$idUser" -Method Put -Body $updateBody -ContentType "application/json" -Headers $headers
        Write-Host "Update successful. Response Username: $($updateResp.username)" -ForegroundColor Green
        
        Write-Host "`n--- 4. Verifying NEW Credentials ---" -ForegroundColor Cyan
        $verifyBody = @{ username = $newUsername; password = $newPass } | ConvertTo-Json
        $verifyResp = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $verifyBody -ContentType "application/json"
        Write-Host "Login with NEW password successful!" -ForegroundColor Green
        $token = $verifyResp.token
        
        # Revertir
        Write-Host "`n--- 5. Reverting to Original ---" -ForegroundColor Cyan
        $revertBody = @{ username = $AdminUser; password = $AdminPass } | ConvertTo-Json
        $headers = @{ Authorization = "Bearer $token" }
        $revertResp = Invoke-RestMethod -Uri "$BaseUrl/users/$idUser" -Method Put -Body $revertBody -ContentType "application/json" -Headers $headers
        Write-Host "Reverted successfully." -ForegroundColor Green
    } catch {
        Write-Host "Verification flow failed: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Details: $errorBody" -ForegroundColor Yellow
        }
    }
}

Test-Api
