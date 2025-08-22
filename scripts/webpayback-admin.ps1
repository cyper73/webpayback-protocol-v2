# WebPayback Admin PowerShell Script
# Usa questo script dal tuo PC Windows

$BaseUrl = "https://web-payback-tokenizer.replit.app"
$Username = "cyper"
$Password = "Matisse73"

function Get-AdminToken {
    Write-Host "🔐 Getting admin token..." -ForegroundColor Blue
    
    $body = @{
        username = $Username
        password = $Password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/login" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ Admin token obtained" -ForegroundColor Green
            return $response.token
        } else {
            Write-Host "❌ Failed to get token: $($response.message)" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "❌ Connection error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Show-PoolStatus {
    $token = Get-AdminToken
    if (-not $token) { return }
    
    Write-Host "📊 Fetching pool status..." -ForegroundColor Blue
    
    try {
        $headers = @{ Authorization = $token }
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/auto-pool-manager/status" -Headers $headers
        
        Write-Host ""
        Write-Host "📊 AUTO POOL MANAGER STATUS" -ForegroundColor Yellow
        Write-Host "═══════════════════════════════" -ForegroundColor Yellow
        Write-Host "Status: $(if($response.status.isEnabled){'🟢 ENABLED'}else{'🔴 DISABLED'})"
        Write-Host "Mode: $($response.status.currentMode)"
        Write-Host "Pools: $($response.status.poolsManaged)"
        Write-Host "Threshold: $($response.status.balanceThreshold)"
        Write-Host "Emergency: $(if($response.status.emergencyStop){'🚨 ACTIVE'}else{'✅ NORMAL'})"
        Write-Host "Gas Saved: $($response.status.totalGasSaved)"
        Write-Host ""
        Write-Host "💰 MANAGED POOLS:" -ForegroundColor Green
        foreach ($pool in $response.pools) {
            Write-Host "  • $($pool.name) ($($pool.address))" -ForegroundColor Cyan
            Write-Host "    TVL: $($pool.tvl) | Status: $($pool.status)"
        }
    } catch {
        Write-Host "❌ Failed to get pool status: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Invoke-EmergencyStop {
    $token = Get-AdminToken
    if (-not $token) { return }
    
    Write-Host "⚠️ Are you sure you want to activate emergency stop? (Y/N):" -ForegroundColor Yellow
    $confirmation = Read-Host
    
    if ($confirmation -eq "Y" -or $confirmation -eq "y") {
        Write-Host "🚨 Activating emergency stop..." -ForegroundColor Red
        
        try {
            $headers = @{ Authorization = $token }
            $response = Invoke-RestMethod -Uri "$BaseUrl/api/auto-pool-manager/emergency-stop" -Method POST -Headers $headers
            
            if ($response.success) {
                Write-Host "✅ Emergency stop activated at $($response.timestamp)" -ForegroundColor Green
            } else {
                Write-Host "❌ Emergency stop failed: $($response.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Emergency stop failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Emergency stop cancelled" -ForegroundColor Yellow
    }
}

function Set-PoolConfiguration {
    $token = Get-AdminToken
    if (-not $token) { return }
    
    Write-Host "⚙️ Configuring pool parameters..." -ForegroundColor Blue
    
    $threshold = Read-Host "Rebalance threshold (default 15%)"
    if ([string]::IsNullOrEmpty($threshold)) { $threshold = "15%" }
    
    $gasLimit = Read-Host "Gas limit (default 200000)"
    if ([string]::IsNullOrEmpty($gasLimit)) { $gasLimit = "200000" }
    
    $emergencyInput = Read-Host "Enable emergency stop? (Y/N)"
    $emergency = $emergencyInput -eq "Y" -or $emergencyInput -eq "y"
    
    $body = @{
        rebalanceThreshold = $threshold
        gasLimit = $gasLimit
        emergencyStopEnabled = $emergency
    } | ConvertTo-Json
    
    try {
        $headers = @{ 
            Authorization = $token
            'Content-Type' = 'application/json'
        }
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/auto-pool-manager/configure" -Method POST -Body $body -Headers $headers
        
        if ($response.success) {
            Write-Host "✅ Configuration updated:" -ForegroundColor Green
            $response.config.PSObject.Properties | ForEach-Object {
                Write-Host "  $($_.Name): $($_.Value)"
            }
        } else {
            Write-Host "❌ Configuration failed: $($response.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Configuration failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-Menu {
    Write-Host ""
    Write-Host "🎛️ WEBPAYBACK ADMIN POWERSHELL" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════" -ForegroundColor Cyan
    Write-Host "1. 📊 Pool Status"
    Write-Host "2. ⚙️ Configure Pool"
    Write-Host "3. 🚨 Emergency Stop"
    Write-Host "0. 🚪 Exit"
    Write-Host "═══════════════════════════════" -ForegroundColor Cyan
}

# Main execution
param(
    [string]$Command
)

switch ($Command) {
    "status" {
        Show-PoolStatus
    }
    "config" {
        Set-PoolConfiguration  
    }
    "stop" {
        Invoke-EmergencyStop
    }
    "" {
        # Interactive mode
        do {
            Show-Menu
            $choice = Read-Host "Select option"
            
            switch ($choice) {
                "1" { Show-PoolStatus }
                "2" { Set-PoolConfiguration }
                "3" { Invoke-EmergencyStop }
                "0" { 
                    Write-Host "👋 Goodbye!" -ForegroundColor Green
                    break
                }
                default { Write-Host "❌ Invalid option" -ForegroundColor Red }
            }
            
            if ($choice -ne "0") {
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
        } while ($choice -ne "0")
    }
    default {
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Write-Host "Usage: .\webpayback-admin.ps1 [status|config|stop]"
    }
}