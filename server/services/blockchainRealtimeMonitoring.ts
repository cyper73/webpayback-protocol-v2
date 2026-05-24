import { ethers } from 'ethers';
import { db } from '../db';
// import { walletFingerprints, securityEvents } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface TransactionPattern {
  address: string;
  gasPrice: string;
  gasUsed: string;
  timestamp: number;
  to: string;
  value: string;
  data: string;
  blockNumber: number;
  transactionIndex: number;
}

interface WalletBehaviorProfile {
  address: string;
  avgGasPrice: number;
  gasConsistency: number;
  timingRegularity: number;
  contractInteractionRatio: number;
  riskScore: number;
  lastAnalyzed: Date;
}

class BlockchainRealtimeMonitoring {
  private provider: any;
  private monitoringActive: boolean = false;
  private analysisCache = new Map<string, WalletBehaviorProfile>();
  private rateLimits = new Map<string, number[]>();
  
  // Severe thresholds - 10 requests per 5 minutes
  private readonly RATE_LIMIT_REQUESTS = 10;
  private readonly RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
  
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/demo"
    );
  }

  async startRealtimeMonitoring(): Promise<void> {
    if (this.monitoringActive) return;
    
    this.monitoringActive = true;
    console.log('🔒 Blockchain Real-Time Monitoring ACTIVATED (STEALTH MODE)');
    
    // Monitor new blocks with optimized frequency
    this.provider.on('block', async (blockNumber) => {
      await this.analyzeBlockTransactions(blockNumber);
    });
    
    // Periodic analysis every 10 minutes to reduce API calls
    setInterval(() => {
      this.performBatchAnalysis();
    }, 10 * 60 * 1000);
  }

  private async analyzeBlockTransactions(blockNumber: any): Promise<void> {
    try {
      const block = await this.provider.getBlock(blockNumber, true);
      if (!block || !block.transactions) return;

      const suspiciousAddresses = [
        '0x742d35Cc6634C0532925a3b8D4C0532925a3b123',
        '0x8B4C6B2A5d9E3F7C8D2E6F9A1B4C7E8F2A5D9E3F',
        '0x3E5C8A9F2D1B4E7F8C2D6A9E3B5C8A9F2D1B4E7F',
        '0x742d35Cc6634C0532925a3b8D47f3c99E0C6fF42',
        '0x742d35Cc6634C0532925a3b8D40141ef1bdddd'
      ];

      for (const tx of block.transactions) {
        if (typeof tx === 'string') continue;
        
        const fromAddress = tx.from?.toLowerCase();
        const toAddress = tx.to?.toLowerCase();
        
        if (suspiciousAddresses.some(addr => 
          fromAddress?.includes(addr.toLowerCase()) || 
          toAddress?.includes(addr.toLowerCase())
        )) {
          await this.analyzeSuspiciousTransaction(tx, blockNumber);
        }
      }
    } catch (error) {
      // Silent error handling - no external visibility
      console.log(`⚠️ Block analysis error: ${blockNumber}`);
    }
  }

  private async analyzeSuspiciousTransaction(
    tx: any, 
    blockNumber: any
  ): Promise<void> {
    const address = tx.from.toLowerCase();
    
    // Rate limiting check with severe thresholds
    if (!this.checkRateLimit(address)) {
      await this.logSecurityEvent(address, 'RATE_LIMIT_EXCEEDED', 85, [
        'Excessive transaction frequency',
        'Automated behavior detected'
      ]);
      return;
    }

    const pattern: TransactionPattern = {
      address,
      gasPrice: tx.gasPrice?.toString() || '0',
      gasUsed: '0', // Will be filled after receipt
      timestamp: Date.now(),
      to: tx.to || '',
      value: tx.value?.toString() || '0',
      data: tx.data || '0x',
      blockNumber,
      transactionIndex: tx.index || 0
    };

    const riskScore = await this.calculateRiskScore(pattern);
    
    if (riskScore >= 80) {
      console.log(`🚨 CRITICAL THREAT: ${address} (Block: ${blockNumber}, Risk: ${riskScore})`);
      await this.logSecurityEvent(address, 'CRITICAL_THREAT', riskScore, [
        'High-frequency automation',
        'Bot-like patterns detected'
      ]);
    }
  }

  private checkRateLimit(address: string): boolean {
    const now = Date.now();
    const requests = this.rateLimits.get(address) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.RATE_LIMIT_WINDOW);
    
    if (validRequests.length >= this.RATE_LIMIT_REQUESTS) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    this.rateLimits.set(address, validRequests);
    return true;
  }

  private async calculateRiskScore(pattern: TransactionPattern): Promise<number> {
    let riskScore = 0;
    
    // Gas price consistency analysis
    const gasPrice = parseFloat(pattern.gasPrice);
    if (gasPrice > 0) {
      const profile = this.analysisCache.get(pattern.address);
      if (profile) {
        const gasDifference = Math.abs(gasPrice - profile.avgGasPrice);
        const consistency = gasDifference / profile.avgGasPrice;
        
        if (consistency < 0.05) { // Less than 5% variation = bot
          riskScore += 25;
        }
      }
    }
    
    // Contract interaction analysis
    if (pattern.data && pattern.data.length > 10) {
      riskScore += 15; // Contract interactions are more suspicious
    }
    
    // Value analysis
    const value = parseFloat(pattern.value);
    if (value === 0) {
      riskScore += 10; // Zero-value transactions often automated
    }
    
    // Timing analysis (simplified for performance)
    const now = Date.now();
    const recentRequests = this.rateLimits.get(pattern.address) || [];
    if (recentRequests.length >= 5) {
      const intervals = [];
      for (let i = 1; i < recentRequests.length; i++) {
        intervals.push(recentRequests[i] - recentRequests[i-1]);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => 
        sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      if (variance < avgInterval * 0.1) { // Very regular timing
        riskScore += 30;
      }
    }
    
    return Math.min(riskScore, 100);
  }

  private async performBatchAnalysis(): Promise<void> {
    console.log('🔍 Performing batch security analysis...');
    
    // Analyze cached wallet profiles
    for (const [address, profile] of Array.from(this.analysisCache.entries())) {
      if (profile.riskScore >= 60) {
        await this.logSecurityEvent(address, 'BATCH_ANALYSIS', profile.riskScore, [
          `Gas consistency: ${profile.gasConsistency}%`,
          `Contract ratio: ${profile.contractInteractionRatio}%`
        ]);
      }
    }
    
    // Clear old cache entries to save memory
    this.analysisCache.clear();
  }

  private async logSecurityEvent(
    address: string,
    eventType: string,
    riskScore: number,
    patterns: string[]
  ): Promise<void> {
    try {
      await db.insert(securityEvents).values({
        walletAddress: address,
        eventType,
        severity: riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : 'MEDIUM',
        riskScore: riskScore,
        suspiciousPatterns: patterns,
        similarWallets: [],
        confidence: '85.5',
        recommendedAction: riskScore >= 80 ? 'IMMEDIATE_BAN' : 'MONITOR_CLOSELY',
        isResolved: false
      });
    } catch (error) {
      // Silent error handling
      console.log(`⚠️ Security event logging failed for ${address}`);
    }
  }

  async getWalletRiskProfile(address: string): Promise<WalletBehaviorProfile | null> {
    const profile = this.analysisCache.get(address.toLowerCase());
    if (profile) {
      return profile;
    }

    // Check database for historical data
    try {
      const fingerprint = await db.select().from(walletFingerprints)
        .where(eq(walletFingerprints.address, address.toLowerCase()))
        .limit(1);
      
      if (fingerprint.length > 0) {
        const fp = fingerprint[0];
        return {
          address,
          avgGasPrice: 20000000000, // Default value
          gasConsistency: 0,
          timingRegularity: 0,
          contractInteractionRatio: 0,
          riskScore: fp.riskScore,
          lastAnalyzed: fp.lastUpdated || new Date()
        };
      }
    } catch (error) {
      console.log(`⚠️ Database query failed for ${address}`);
    }
    
    return null;
  }

  stopMonitoring(): void {
    this.monitoringActive = false;
    this.provider.removeAllListeners('block');
    console.log('🛑 Blockchain monitoring stopped');
  }
}

export const blockchainMonitoring = new BlockchainRealtimeMonitoring();