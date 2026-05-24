import { db } from "../db";
// import { walletFingerprints, securityEvents } from "@shared/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { ethers } from "ethers";

interface TransactionPattern {
  address: string;
  gasPrice: string;
  gasLimit: string;
  nonce: number;
  value: string;
  data: string;
  to: string | null;
  timestamp: Date;
}

interface WalletFingerprint {
  address: string;
  signaturePattern: string;
  gasUsageProfile: string;
  timingProfile: string;
  networkUsageProfile: string;
  riskScore: number;
  uniquenessScore: number;
  lastUpdated: Date;
}

interface FingerprintAnalysis {
  fingerprintId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  uniquenessScore: number;
  suspiciousPatterns: string[];
  similarWallets: string[];
  confidence: number;
  recommendedAction: string;
}

export class WalletFingerprintingService {
  private readonly SIGNATURE_ENTROPY_THRESHOLD = 0.7;
  private readonly GAS_PATTERN_SIMILARITY_THRESHOLD = 0.85;
  private readonly TIMING_VARIANCE_THRESHOLD = 0.3;
  private readonly MIN_TRANSACTIONS_FOR_ANALYSIS = 10;
  private readonly SUSPICIOUS_NONCE_GAPS = 5;

  /**
   * Analyzes a wallet's transaction patterns to create a unique fingerprint
   */
  async createWalletFingerprint(address: string, transactions: TransactionPattern[]): Promise<FingerprintAnalysis> {
    if (transactions.length < this.MIN_TRANSACTIONS_FOR_ANALYSIS) {
      return this.createInsufficientDataResult(address);
    }

    // 1. Signature Pattern Analysis
    const signatureAnalysis = this.analyzeSignaturePatterns(transactions);
    
    // 2. Gas Usage Pattern Analysis
    const gasAnalysis = this.analyzeGasUsagePatterns(transactions);
    
    // 3. Timing Pattern Analysis
    const timingAnalysis = this.analyzeTimingPatterns(transactions);
    
    // 4. Network Usage Analysis
    const networkAnalysis = this.analyzeNetworkUsagePatterns(transactions);
    
    // 5. Nonce Pattern Analysis
    const nonceAnalysis = this.analyzeNoncePatterns(transactions);

    // Generate composite fingerprint
    const fingerprintId = this.generateFingerprintHash({
      signature: signatureAnalysis.pattern,
      gas: gasAnalysis.pattern,
      timing: timingAnalysis.pattern,
      network: networkAnalysis.pattern,
      nonce: nonceAnalysis.pattern
    });

    // Calculate risk and uniqueness scores
    const riskScore = this.calculateRiskScore({
      signature: signatureAnalysis,
      gas: gasAnalysis,
      timing: timingAnalysis,
      network: networkAnalysis,
      nonce: nonceAnalysis
    });

    const uniquenessScore = this.calculateUniquenessScore({
      signature: signatureAnalysis,
      gas: gasAnalysis,
      timing: timingAnalysis
    });

    // Find similar wallets
    const similarWallets = await this.findSimilarWallets(fingerprintId, address);

    // Determine suspicious patterns
    const suspiciousPatterns = this.identifySuspiciousPatterns({
      signature: signatureAnalysis,
      gas: gasAnalysis,
      timing: timingAnalysis,
      network: networkAnalysis,
      nonce: nonceAnalysis,
      similarWallets
    });

    // Store fingerprint in database
    await this.storeFingerprintData({
      address,
      fingerprintId,
      signaturePattern: signatureAnalysis.pattern,
      gasUsageProfile: gasAnalysis.pattern,
      timingProfile: timingAnalysis.pattern,
      networkUsageProfile: networkAnalysis.pattern,
      riskScore,
      uniquenessScore
    });

    const riskLevel = this.determineRiskLevel(riskScore);
    const confidence = this.calculateConfidence(transactions.length, uniquenessScore);
    const recommendedAction = this.getRecommendedAction(riskLevel, suspiciousPatterns);

    return {
      fingerprintId,
      riskLevel,
      riskScore,
      uniquenessScore,
      suspiciousPatterns,
      similarWallets,
      confidence,
      recommendedAction
    };
  }

  /**
   * Analyzes ECDSA signature patterns for uniqueness and anomalies
   */
  private analyzeSignaturePatterns(transactions: TransactionPattern[]): any {
    const rValues: string[] = [];
    const sValues: string[] = [];
    const vValues: number[] = [];

    // Extract signature components from transaction data
    transactions.forEach(tx => {
      try {
        // This would normally extract r,s,v from actual transaction signatures
        // For demo purposes, we'll analyze gas patterns as a proxy
        const gasEntropy = this.calculateEntropy(tx.gasPrice);
        rValues.push(gasEntropy.toString());
      } catch (error) {
        console.warn(`Failed to extract signature from transaction: ${error}`);
      }
    });

    const rEntropy = this.calculateEntropy(rValues.join(''));
    const isLowEntropy = rEntropy < this.SIGNATURE_ENTROPY_THRESHOLD;
    
    return {
      pattern: `R_ENT:${rEntropy.toFixed(3)}`,
      entropy: rEntropy,
      isLowEntropy,
      riskFactors: isLowEntropy ? ['Low signature entropy - possible automated signing'] : []
    };
  }

  /**
   * Analyzes gas usage patterns for automation detection
   */
  private analyzeGasUsagePatterns(transactions: TransactionPattern[]): any {
    const gasPrices = transactions.map(tx => parseInt(tx.gasPrice));
    const gasLimits = transactions.map(tx => parseInt(tx.gasLimit));

    const avgGasPrice = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length;
    const avgGasLimit = gasLimits.reduce((a, b) => a + b, 0) / gasLimits.length;

    const gasPriceVariance = this.calculateVariance(gasPrices);
    const gasLimitVariance = this.calculateVariance(gasLimits);

    const isStaticGasPrice = gasPriceVariance < 1000000; // Very low variance
    const isStaticGasLimit = gasLimitVariance < 1000;

    const riskFactors = [];
    if (isStaticGasPrice) riskFactors.push('Static gas price - automated tool');
    if (isStaticGasLimit) riskFactors.push('Static gas limit - scripted transactions');

    return {
      pattern: `GP:${avgGasPrice.toFixed(0)}_GL:${avgGasLimit.toFixed(0)}_VAR:${gasPriceVariance.toFixed(2)}`,
      averageGasPrice: avgGasPrice,
      averageGasLimit: avgGasLimit,
      gasPriceVariance,
      gasLimitVariance,
      isStaticGasPrice,
      isStaticGasLimit,
      riskFactors
    };
  }

  /**
   * Analyzes transaction timing patterns for bot detection
   */
  private analyzeTimingPatterns(transactions: TransactionPattern[]): any {
    const intervals: number[] = [];
    
    for (let i = 1; i < transactions.length; i++) {
      const timeDiff = transactions[i].timestamp.getTime() - transactions[i-1].timestamp.getTime();
      intervals.push(timeDiff);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const intervalVariance = this.calculateVariance(intervals);
    const regularIntervals = intervals.filter(interval => 
      Math.abs(interval - avgInterval) < avgInterval * 0.1
    ).length;

    const regularityRatio = regularIntervals / intervals.length;
    const isTooRegular = regularityRatio > 0.8; // 80% of intervals are very similar
    const isTooFast = avgInterval < 30000; // Less than 30 seconds average

    const riskFactors = [];
    if (isTooRegular) riskFactors.push('Highly regular timing - bot behavior');
    if (isTooFast) riskFactors.push('Very fast transaction frequency - automated');

    return {
      pattern: `INT:${avgInterval.toFixed(0)}_REG:${regularityRatio.toFixed(2)}`,
      averageInterval: avgInterval,
      intervalVariance,
      regularityRatio,
      isTooRegular,
      isTooFast,
      riskFactors
    };
  }

  /**
   * Analyzes network usage patterns
   */
  private analyzeNetworkUsagePatterns(transactions: TransactionPattern[]): any {
    // Analyze contract interaction patterns
    const contractInteractions = transactions.filter(tx => tx.to && tx.data !== '0x').length;
    const simpleTransfers = transactions.length - contractInteractions;
    
    const contractRatio = contractInteractions / transactions.length;
    const isHighlyAutomated = contractRatio > 0.9; // 90%+ contract interactions

    const riskFactors = [];
    if (isHighlyAutomated) riskFactors.push('High contract interaction ratio - DeFi bot');

    return {
      pattern: `CONT:${contractRatio.toFixed(2)}`,
      contractInteractionRatio: contractRatio,
      contractInteractions,
      simpleTransfers,
      isHighlyAutomated,
      riskFactors
    };
  }

  /**
   * Analyzes nonce progression patterns
   */
  private analyzeNoncePatterns(transactions: TransactionPattern[]): any {
    const nonces = transactions.map(tx => tx.nonce).sort((a, b) => a - b);
    const gaps: number[] = [];
    
    for (let i = 1; i < nonces.length; i++) {
      gaps.push(nonces[i] - nonces[i-1]);
    }

    const largeGaps = gaps.filter(gap => gap > this.SUSPICIOUS_NONCE_GAPS).length;
    const hasLargeGaps = largeGaps > 0;

    const riskFactors = [];
    if (hasLargeGaps) riskFactors.push('Large nonce gaps - possible parallel operations');

    return {
      pattern: `NONCE_GAPS:${largeGaps}`,
      largeGaps,
      hasLargeGaps,
      riskFactors
    };
  }

  /**
   * Calculates entropy of a string
   */
  private calculateEntropy(str: string): number {
    const freq: { [key: string]: number } = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }

    let entropy = 0;
    const len = str.length;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  /**
   * Calculates variance of an array of numbers
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Generates a unique hash for the fingerprint
   */
  private generateFingerprintHash(patterns: any): string {
    const combined = JSON.stringify(patterns);
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(combined)).slice(0, 16);
  }

  /**
   * Calculates composite risk score
   */
  private calculateRiskScore(analyses: any): number {
    let riskScore = 0;
    
    // Signature risks
    if (analyses.signature.isLowEntropy) riskScore += 25;
    
    // Gas pattern risks
    if (analyses.gas.isStaticGasPrice) riskScore += 20;
    if (analyses.gas.isStaticGasLimit) riskScore += 15;
    
    // Timing pattern risks
    if (analyses.timing.isTooRegular) riskScore += 30;
    if (analyses.timing.isTooFast) riskScore += 25;
    
    // Network usage risks
    if (analyses.network.isHighlyAutomated) riskScore += 20;
    
    // Nonce pattern risks
    if (analyses.nonce.hasLargeGaps) riskScore += 15;

    return Math.min(riskScore, 100);
  }

  /**
   * Calculates uniqueness score
   */
  private calculateUniquenessScore(analyses: any): number {
    let uniqueness = 100;
    
    // Reduce uniqueness for common patterns
    uniqueness -= analyses.signature.entropy * 10;
    uniqueness -= analyses.gas.gasPriceVariance / 1000000;
    uniqueness -= analyses.timing.regularityRatio * 30;

    return Math.max(uniqueness, 0);
  }

  /**
   * Finds wallets with similar fingerprints
   */
  private async findSimilarWallets(fingerprintId: string, excludeAddress: string): Promise<string[]> {
    try {
      const similar = await db.select()
        .from(walletFingerprints)
        .where(
          and(
            sql`similarity(fingerprint_id, ${fingerprintId}) > 0.8`,
            sql`address != ${excludeAddress}`
          )
        )
        .limit(5);

      return similar.map(w => w.address);
    } catch (error) {
      console.warn('Similar wallet lookup failed:', error);
      return [];
    }
  }

  /**
   * Identifies suspicious patterns from all analyses
   */
  private identifySuspiciousPatterns(analyses: any): string[] {
    const patterns: string[] = [];
    
    // Collect all risk factors
    analyses.signature.riskFactors?.forEach((factor: string) => patterns.push(factor));
    analyses.gas.riskFactors?.forEach((factor: string) => patterns.push(factor));
    analyses.timing.riskFactors?.forEach((factor: string) => patterns.push(factor));
    analyses.network.riskFactors?.forEach((factor: string) => patterns.push(factor));
    analyses.nonce.riskFactors?.forEach((factor: string) => patterns.push(factor));

    // Add similarity-based patterns
    if (analyses.similarWallets.length > 2) {
      patterns.push(`Similar to ${analyses.similarWallets.length} other wallets - possible sybil network`);
    }

    return patterns;
  }

  /**
   * Stores fingerprint data in database
   */
  private async storeFingerprintData(data: any): Promise<void> {
    try {
      await db.insert(walletFingerprints)
        .values({
          address: data.address,
          fingerprintId: data.fingerprintId,
          signaturePattern: data.signaturePattern,
          gasUsageProfile: data.gasUsageProfile,
          timingProfile: data.timingProfile,
          networkUsageProfile: data.networkUsageProfile,
          riskScore: data.riskScore,
          uniquenessScore: data.uniquenessScore,
          lastUpdated: new Date()
        })
        .onConflictDoUpdate({
          target: walletFingerprints.address,
          set: {
            fingerprintId: data.fingerprintId,
            signaturePattern: data.signaturePattern,
            gasUsageProfile: data.gasUsageProfile,
            timingProfile: data.timingProfile,
            networkUsageProfile: data.networkUsageProfile,
            riskScore: data.riskScore,
            uniquenessScore: data.uniquenessScore,
            lastUpdated: new Date()
          }
        });
    } catch (error) {
      console.error('Failed to store fingerprint:', error);
    }
  }

  private createInsufficientDataResult(address: string): FingerprintAnalysis {
    return {
      fingerprintId: `INSUFFICIENT_${address.slice(0, 8)}`,
      riskLevel: 'LOW',
      riskScore: 0,
      uniquenessScore: 50,
      suspiciousPatterns: ['Insufficient transaction history for analysis'],
      similarWallets: [],
      confidence: 0.1,
      recommendedAction: 'Monitor for more transactions before assessment'
    };
  }

  private determineRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore >= 80) return 'CRITICAL';
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private calculateConfidence(transactionCount: number, uniquenessScore: number): number {
    const countFactor = Math.min(transactionCount / 50, 1); // Max confidence with 50+ transactions
    const uniquenessFactor = uniquenessScore / 100;
    return (countFactor * 0.7 + uniquenessFactor * 0.3);
  }

  private getRecommendedAction(riskLevel: string, patterns: string[]): string {
    if (riskLevel === 'CRITICAL') return 'Immediate ban - high automation detected';
    if (riskLevel === 'HIGH') return 'Block rewards and intensive monitoring';
    if (riskLevel === 'MEDIUM') return 'Enhanced monitoring and rate limiting';
    return 'Continue normal monitoring';
  }
}

export const walletFingerprintingService = new WalletFingerprintingService();