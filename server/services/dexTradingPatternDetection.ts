import { ethers } from 'ethers';
import { db } from '../db';
import { securityEvents } from '@shared/schema';

interface DEXTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  timestamp: number;
  methodId: string;
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: string;
  amountOut?: string;
}

interface TradingPattern {
  address: string;
  frequency: number;
  gasOptimization: number;
  profitMargin: number;
  timingConsistency: number;
  botProbability: number;
}

class DEXTradingPatternDetection {
  private provider: any;
  private detectedPatterns = new Map<string, TradingPattern>();
  private transactionHistory = new Map<string, DEXTransaction[]>();
  
  // DEX contract addresses to monitor
  private readonly DEX_CONTRACTS = [
    '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff', // QuickSwap Router
    '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', // SushiSwap Router
    '0x8954afa98594b838bda56fe4c12a09d7739d179b', // OpenOcean Router
    '0xe592427a0aece92de3edee1f18e0157c05861564', // Uniswap V3 Router
    '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'  // Uniswap V3 Router 2
  ];
  
  // Trading method signatures
  private readonly TRADING_METHODS = {
    'swapExactTokensForTokens': '0x38ed1739',
    'swapTokensForExactTokens': '0x8803dbee',
    'swapExactETHForTokens': '0x7ff36ab5',
    'swapTokensForExactETH': '0x4a25d94a',
    'multicall': '0xac9650d8',
    'exactInputSingle': '0x414bf389',
    'exactOutputSingle': '0xdb3e2198'
  };

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/demo"
    );
  }

  async startPatternDetection(): Promise<void> {
    console.log('🎯 DEX Trading Pattern Detection ACTIVATED (STEALTH MODE)');
    
    // Monitor transactions to known DEX contracts
    this.provider.on('block', async (blockNumber) => {
      await this.scanBlockForDEXActivity(blockNumber);
    });
    
    // Analyze patterns every 15 minutes to reduce API calls
    setInterval(() => {
      this.analyzeTradingPatterns();
    }, 15 * 60 * 1000);
  }

  private async scanBlockForDEXActivity(blockNumber: any): Promise<void> {
    try {
      const block = await this.provider.getBlock(blockNumber, true);
      if (!block || !block.transactions) return;

      for (const tx of block.transactions) {
        if (typeof tx === 'string') continue;
        
        const toAddress = tx.to?.toLowerCase();
        if (!toAddress || !this.DEX_CONTRACTS.includes(toAddress)) continue;
        
        const methodId = tx.data?.slice(0, 10);
        if (!methodId || !Object.values(this.TRADING_METHODS).includes(methodId)) continue;
        
        await this.analyzeDEXTransaction(tx, blockNumber);
      }
    } catch (error) {
      // Silent error handling
      console.log(`⚠️ DEX scan error: ${blockNumber}`);
    }
  }

  private async analyzeDEXTransaction(
    tx: any,
    blockNumber: any
  ): Promise<void> {
    const fromAddress = tx.from.toLowerCase();
    const methodId = tx.data?.slice(0, 10) || '';
    
    const dexTx: DEXTransaction = {
      hash: tx.hash,
      from: fromAddress,
      to: tx.to || '',
      value: tx.value?.toString() || '0',
      gasPrice: tx.gasPrice?.toString() || '0',
      gasUsed: '0', // Will be filled from receipt
      timestamp: Date.now(),
      methodId
    };
    
    // Store transaction history
    const history = this.transactionHistory.get(fromAddress) || [];
    history.push(dexTx);
    
    // Keep only last 50 transactions per address to save memory
    if (history.length > 50) {
      history.shift();
    }
    
    this.transactionHistory.set(fromAddress, history);
    
    // Immediate analysis for suspicious patterns
    if (history.length >= 5) {
      const pattern = this.calculateTradingPattern(fromAddress, history);
      
      if (pattern.botProbability >= 80) {
        console.log(`🤖 BOT DETECTED: ${fromAddress} (Probability: ${pattern.botProbability}%)`);
        await this.logTradingBotEvent(fromAddress, pattern);
      }
    }
  }

  private calculateTradingPattern(address: string, history: DEXTransaction[]): TradingPattern {
    if (history.length < 3) {
      return {
        address,
        frequency: 0,
        gasOptimization: 0,
        profitMargin: 0,
        timingConsistency: 0,
        botProbability: 0
      };
    }
    
    // Calculate frequency (trades per hour)
    const timeSpan = (Date.now() - history[0].timestamp) / (1000 * 60 * 60); // hours
    const frequency = history.length / Math.max(timeSpan, 0.1);
    
    // Gas optimization analysis
    const gasPrices = history.map(tx => parseFloat(tx.gasPrice)).filter(gp => gp > 0);
    const gasVariance = this.calculateVariance(gasPrices);
    const gasOptimization = gasVariance < (gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length) * 0.05 ? 90 : 20;
    
    // Timing consistency analysis
    const intervals = [];
    for (let i = 1; i < history.length; i++) {
      intervals.push(history[i].timestamp - history[i-1].timestamp);
    }
    const intervalVariance = this.calculateVariance(intervals);
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const timingConsistency = intervalVariance < avgInterval * 0.2 ? 85 : 30;
    
    // Method diversity analysis
    const methods = new Set(history.map(tx => tx.methodId));
    const methodDiversity = methods.size / history.length;
    
    // Calculate bot probability
    let botProbability = 0;
    
    if (frequency > 10) botProbability += 25; // Very high frequency
    if (gasOptimization > 80) botProbability += 25; // Consistent gas optimization
    if (timingConsistency > 80) botProbability += 25; // Regular timing
    if (methodDiversity < 0.3) botProbability += 15; // Limited method diversity
    if (history.length > 20 && timeSpan < 2) botProbability += 10; // Many trades in short time
    
    const pattern: TradingPattern = {
      address,
      frequency,
      gasOptimization,
      profitMargin: 0, // Simplified for now
      timingConsistency,
      botProbability: Math.min(botProbability, 100)
    };
    
    this.detectedPatterns.set(address, pattern);
    return pattern;
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return variance;
  }

  private async analyzeTradingPatterns(): Promise<void> {
    console.log('🔍 Analyzing DEX trading patterns...');
    
    for (const [address, pattern] of this.detectedPatterns) {
      if (pattern.botProbability >= 70) {
        await this.logTradingBotEvent(address, pattern);
      }
    }
    
    // Clear old patterns to save memory
    const cutoff = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
    for (const [address, history] of this.transactionHistory) {
      const filtered = history.filter(tx => tx.timestamp > cutoff);
      if (filtered.length === 0) {
        this.transactionHistory.delete(address);
        this.detectedPatterns.delete(address);
      } else {
        this.transactionHistory.set(address, filtered);
      }
    }
  }

  private async logTradingBotEvent(address: string, pattern: TradingPattern): Promise<void> {
    const suspiciousPatterns = [];
    
    if (pattern.frequency > 10) suspiciousPatterns.push('High frequency trading');
    if (pattern.gasOptimization > 80) suspiciousPatterns.push('Optimized gas usage');
    if (pattern.timingConsistency > 80) suspiciousPatterns.push('Regular timing intervals');
    
    try {
      await db.insert(securityEvents).values({
        walletAddress: address,
        eventType: 'DEX_TRADING_BOT',
        severity: pattern.botProbability >= 90 ? 'CRITICAL' : 'HIGH',
        riskScore: Math.round(pattern.botProbability),
        suspiciousPatterns,
        similarWallets: [],
        confidence: '92.0',
        recommendedAction: pattern.botProbability >= 90 ? 'IMMEDIATE_BAN' : 'BLOCK_REWARDS',
        isResolved: false
      });
    } catch (error) {
      console.log(`⚠️ DEX bot event logging failed for ${address}`);
    }
  }

  getDetectedPattern(address: string): TradingPattern | null {
    return this.detectedPatterns.get(address.toLowerCase()) || null;
  }

  getAllDetectedPatterns(): Map<string, TradingPattern> {
    return new Map(this.detectedPatterns);
  }

  stopDetection(): void {
    this.provider.removeAllListeners('block');
    console.log('🛑 DEX pattern detection stopped');
  }
}

export const dexPatternDetection = new DEXTradingPatternDetection();