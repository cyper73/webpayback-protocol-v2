#!/usr/bin/env node

/**
 * WebPayback Admin CLI Tool
 * Accesso sicuro ai moduli admin senza interfacce web
 */

import https from 'https';
import readline from 'readline';

class WebPaybackAdminCLI {
  constructor() {
    this.baseUrl = 'https://web-payback-tokenizer.replit.app';
    this.token = null;
    this.credentials = {
      username: 'cyper',
      password: 'Matisse73'
    };
  }

  // Effettua richiesta HTTP autenticata
  async makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WebPayback-Admin-CLI/1.0'
        }
      };

      if (this.token) {
        options.headers['Authorization'] = this.token;
      }

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(responseData);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ status: res.statusCode, data: responseData });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // Login e ottieni token
  async login() {
    console.log('🔐 Authenticating admin access...');
    
    try {
      const response = await this.makeRequest('/api/admin/login', 'POST', this.credentials);
      
      if (response.status === 200 && response.data.success) {
        this.token = response.data.token;
        console.log('✅ Admin authentication successful');
        console.log(`🔧 Available modules: ${response.data.modules.join(', ')}`);
        console.log(`📍 Authorized IP: ${response.data.authorizedIP}`);
        return true;
      } else {
        console.log('❌ Authentication failed:', response.data.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Connection error:', error.message);
      return false;
    }
  }

  // Visualizza status Auto Pool Manager
  async showPoolStatus() {
    if (!this.token) {
      console.log('❌ Not authenticated. Please login first.');
      return;
    }

    try {
      const response = await this.makeRequest('/api/auto-pool-manager/status');
      
      if (response.status === 200) {
        const status = response.data.status;
        console.log('\n📊 AUTO POOL MANAGER STATUS');
        console.log('═══════════════════════════════');
        console.log(`Status: ${status.isEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}`);
        console.log(`Mode: ${status.currentMode}`);
        console.log(`Pools Managed: ${status.poolsManaged}`);
        console.log(`Balance Threshold: ${status.balanceThreshold}`);
        console.log(`Emergency Stop: ${status.emergencyStop ? '🚨 ACTIVE' : '✅ NORMAL'}`);
        console.log(`Gas Saved: ${status.totalGasSaved}`);
        
        console.log('\n💰 MANAGED POOLS:');
        response.data.pools.forEach(pool => {
          console.log(`  • ${pool.name} (${pool.address})`);
          console.log(`    TVL: ${pool.tvl} | Status: ${pool.status}`);
          console.log(`    Last Rebalance: ${pool.lastRebalance}`);
        });
      } else {
        console.log('❌ Failed to get pool status:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }

  // Emergency stop
  async emergencyStop() {
    if (!this.token) {
      console.log('❌ Not authenticated. Please login first.');
      return;
    }

    console.log('🚨 Activating emergency stop...');
    
    try {
      const response = await this.makeRequest('/api/auto-pool-manager/emergency-stop', 'POST');
      
      if (response.status === 200) {
        console.log('✅ Emergency stop activated successfully');
        console.log(`📅 Timestamp: ${response.data.timestamp}`);
        console.log('🛑 All automated pool operations have been halted');
      } else {
        console.log('❌ Emergency stop failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Emergency stop failed:', error.message);
    }
  }

  // Configura parametri pool
  async configurePool(rebalanceThreshold, emergencyStopEnabled, gasLimit) {
    if (!this.token) {
      console.log('❌ Not authenticated. Please login first.');
      return;
    }

    const config = {
      rebalanceThreshold: rebalanceThreshold || "15%",
      emergencyStopEnabled: emergencyStopEnabled || false,
      gasLimit: gasLimit || "200000"
    };

    console.log('⚙️ Updating pool configuration...');
    
    try {
      const response = await this.makeRequest('/api/auto-pool-manager/configure', 'POST', config);
      
      if (response.status === 200) {
        console.log('✅ Pool configuration updated successfully');
        console.log('📋 New Configuration:');
        Object.entries(response.data.config).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      } else {
        console.log('❌ Configuration update failed:', response.data.message);
      }
    } catch (error) {
      console.log('❌ Configuration update failed:', error.message);
    }
  }

  // Menu principale
  showMenu() {
    console.log('\n🎛️ WEBPAYBACK ADMIN CLI');
    console.log('═══════════════════════');
    console.log('1. 📊 Pool Status');
    console.log('2. ⚙️ Configure Pool');
    console.log('3. 🚨 Emergency Stop');
    console.log('4. 🔄 Refresh Login');
    console.log('0. 🚪 Exit');
    console.log('═══════════════════════');
  }

  // Avvia CLI interattiva
  async start() {
    console.log('🚀 WebPayback Admin CLI v1.0\n');
    
    // Login automatico
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.log('❌ Unable to access admin modules. Exiting...');
      process.exit(1);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (question) => {
      return new Promise((resolve) => {
        rl.question(question, resolve);
      });
    };

    while (true) {
      this.showMenu();
      const choice = await askQuestion('Select option: ');

      switch (choice.trim()) {
        case '1':
          await this.showPoolStatus();
          break;
          
        case '2':
          const threshold = await askQuestion('Rebalance threshold (default 15%): ') || '15%';
          const emergency = (await askQuestion('Enable emergency stop? (y/N): ')).toLowerCase() === 'y';
          const gas = await askQuestion('Gas limit (default 200000): ') || '200000';
          await this.configurePool(threshold, emergency, gas);
          break;
          
        case '3':
          const confirm = await askQuestion('⚠️ Confirm emergency stop? (type "YES"): ');
          if (confirm === 'YES') {
            await this.emergencyStop();
          } else {
            console.log('❌ Emergency stop cancelled');
          }
          break;
          
        case '4':
          await this.login();
          break;
          
        case '0':
          console.log('👋 Goodbye!');
          rl.close();
          process.exit(0);
          break;
          
        default:
          console.log('❌ Invalid option');
      }

      await askQuestion('\nPress Enter to continue...');
    }
  }
}

// Avvia CLI se eseguito direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new WebPaybackAdminCLI();
  cli.start().catch(console.error);
}

export default WebPaybackAdminCLI;