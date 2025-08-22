#!/bin/bash

# Quick Admin Access Script
# Comandi rapidi per gestione admin WebPayback

BASE_URL="https://web-payback-tokenizer.replit.app"
CREDENTIALS='{"username":"cyper","password":"Matisse73"}'

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Login and get token
get_admin_token() {
    echo -e "${BLUE}🔐 Getting admin token...${NC}"
    
    TOKEN=$(curl -s -X POST "$BASE_URL/api/admin/login" \
        -H "Content-Type: application/json" \
        -d "$CREDENTIALS" | \
        grep -o '"token":"[^"]*"' | \
        cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ Failed to get admin token${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Admin token obtained${NC}"
}

# Show pool status
pool_status() {
    get_admin_token
    
    echo -e "${BLUE}📊 Fetching pool status...${NC}"
    
    curl -s "$BASE_URL/api/auto-pool-manager/status" \
        -H "Authorization: $TOKEN" | \
        jq -r '
        "
📊 AUTO POOL MANAGER STATUS
═══════════════════════════════
Status: \(.status.isEnabled | if . then "🟢 ENABLED" else "🔴 DISABLED" end)
Mode: \(.status.currentMode)
Pools: \(.status.poolsManaged)
Threshold: \(.status.balanceThreshold)
Emergency: \(.status.emergencyStop | if . then "🚨 ACTIVE" else "✅ NORMAL" end)
Gas Saved: \(.status.totalGasSaved)

💰 MANAGED POOLS:
\(.pools[] | "  • \(.name) (\(.address))\n    TVL: \(.tvl) | Status: \(.status)")
"'
}

# Emergency stop
emergency_stop() {
    get_admin_token
    
    echo -e "${YELLOW}⚠️ Are you sure you want to activate emergency stop? (y/N)${NC}"
    read -r confirmation
    
    if [ "$confirmation" = "y" ] || [ "$confirmation" = "Y" ]; then
        echo -e "${RED}🚨 Activating emergency stop...${NC}"
        
        curl -s -X POST "$BASE_URL/api/auto-pool-manager/emergency-stop" \
            -H "Authorization: $TOKEN" | \
            jq -r '
            if .success then
                "✅ Emergency stop activated at \(.timestamp)"
            else
                "❌ Emergency stop failed: \(.message)"
            end'
    else
        echo -e "${YELLOW}❌ Emergency stop cancelled${NC}"
    fi
}

# Configure pool
configure_pool() {
    get_admin_token
    
    echo -e "${BLUE}⚙️ Configuring pool parameters...${NC}"
    echo "Rebalance threshold (default 15%):"
    read -r threshold
    threshold=${threshold:-"15%"}
    
    echo "Gas limit (default 200000):"
    read -r gas_limit
    gas_limit=${gas_limit:-"200000"}
    
    echo "Enable emergency stop? (y/N):"
    read -r emergency
    if [ "$emergency" = "y" ] || [ "$emergency" = "Y" ]; then
        emergency_enabled="true"
    else
        emergency_enabled="false"
    fi
    
    config_data="{\"rebalanceThreshold\":\"$threshold\",\"gasLimit\":\"$gas_limit\",\"emergencyStopEnabled\":$emergency_enabled}"
    
    curl -s -X POST "$BASE_URL/api/auto-pool-manager/configure" \
        -H "Content-Type: application/json" \
        -H "Authorization: $TOKEN" \
        -d "$config_data" | \
        jq -r '
        if .success then
            "✅ Configuration updated:\n\(.config | to_entries[] | "  \(.key): \(.value)")"
        else
            "❌ Configuration failed: \(.message)"
        end'
}

# Show help
show_help() {
    echo -e "${BLUE}🎛️ WebPayback Admin Quick Commands${NC}"
    echo "═══════════════════════════════════"
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status     📊 Show pool manager status"
    echo "  stop       🚨 Activate emergency stop"
    echo "  config     ⚙️ Configure pool parameters"
    echo "  help       ❓ Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 stop"
    echo "  $0 config"
}

# Main
case "$1" in
    "status")
        pool_status
        ;;
    "stop")
        emergency_stop
        ;;
    "config")
        configure_pool
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac