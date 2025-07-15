import { storage } from "../storage";
import { InsertRewardDistribution, RewardDistribution } from "@shared/schema";

interface GasPoolStats {
  totalFeesCollected: number;
  totalGasSpent: number;
  currentBalance: number;
  isHealthy: boolean;
}

interface BatchProcessingResult {
  success: boolean;
  processedCount: number;
  totalGasUsed: string;
  batchTransactionHash: string;
  fallbackUsed: boolean;
}

export class GasManager {
  private readonly PROTOCOL_FEE_PERCENTAGE = 0.001; // 0.1%
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MIN_POOL_BALANCE = 1.0; // 1 MATIC minimum
  
  private pendingRewards: InsertRewardDistribution[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startBatchProcessor();
  }

  /**
   * Calculate protocol fee from reward amount
   */
  private calculateProtocolFee(rewardAmount: number): number {
    return rewardAmount * this.PROTOCOL_FEE_PERCENTAGE;
  }

  /**
   * Get current gas pool statistics
   */
  async getGasPoolStats(): Promise<GasPoolStats> {
    // In production, this would read from a dedicated gas pool wallet
    // For now, we simulate based on reward distributions
    const rewards = await storage.getRewardDistributions();
    
    const totalFeesCollected = rewards.reduce((sum, reward) => {
      return sum + (parseFloat(reward.amount) * this.PROTOCOL_FEE_PERCENTAGE);
    }, 0);

    // Simulate gas costs (in MATIC)
    const avgGasCostPerTx = 0.001; // ~$0.0008 on Polygon
    const totalGasSpent = rewards.length * avgGasCostPerTx;
    
    const currentBalance = totalFeesCollected - totalGasSpent;
    const isHealthy = currentBalance >= this.MIN_POOL_BALANCE;

    return {
      totalFeesCollected,
      totalGasSpent,
      currentBalance,
      isHealthy
    };
  }

  /**
   * Add reward to pending batch processing queue
   */
  async queueReward(reward: InsertRewardDistribution): Promise<void> {
    this.pendingRewards.push(reward);
    
    // Process immediately if batch is full
    if (this.pendingRewards.length >= this.BATCH_SIZE) {
      await this.processBatch();
    }
  }

  /**
   * Process batch of rewards
   */
  private async processBatch(): Promise<BatchProcessingResult> {
    if (this.pendingRewards.length === 0) {
      return {
        success: true,
        processedCount: 0,
        totalGasUsed: "0",
        batchTransactionHash: "",
        fallbackUsed: false
      };
    }

    const gasPool = await this.getGasPoolStats();
    const batchToProcess = this.pendingRewards.splice(0, this.BATCH_SIZE);
    
    try {
      if (gasPool.isHealthy) {
        // Normal mode: Protocol pays gas fees
        return await this.processBatchNormal(batchToProcess);
      } else {
        // Fallback mode: Deduct gas from rewards
        return await this.processBatchFallback(batchToProcess);
      }
    } catch (error) {
      // Return rewards to queue if processing fails
      this.pendingRewards.unshift(...batchToProcess);
      throw error;
    }
  }

  /**
   * Process batch with protocol paying gas fees
   */
  private async processBatchNormal(batch: InsertRewardDistribution[]): Promise<BatchProcessingResult> {
    const batchTransactionHash = this.generateMockHash();
    const estimatedGasUsed = "0.05"; // 0.05 MATIC for 50 transactions
    
    // Process each reward in the batch
    for (const reward of batch) {
      await storage.createRewardDistribution({
        ...reward,
        transactionHash: batchTransactionHash,
        status: "completed",
        completedAt: new Date()
      });
    }

    return {
      success: true,
      processedCount: batch.length,
      totalGasUsed: estimatedGasUsed,
      batchTransactionHash,
      fallbackUsed: false
    };
  }

  /**
   * Process batch with gas fees deducted from rewards (fallback mode)
   */
  private async processBatchFallback(batch: InsertRewardDistribution[]): Promise<BatchProcessingResult> {
    const batchTransactionHash = this.generateMockHash();
    const estimatedGasUsed = "0.05";
    const gasPerReward = 0.001; // 0.001 MATIC per reward
    
    // Process each reward with gas deduction
    for (const reward of batch) {
      const originalAmount = parseFloat(reward.amount);
      const adjustedAmount = Math.max(0, originalAmount - gasPerReward);
      
      await storage.createRewardDistribution({
        ...reward,
        amount: adjustedAmount.toFixed(8),
        transactionHash: batchTransactionHash,
        status: "completed",
        completedAt: new Date()
      });
    }

    return {
      success: true,
      processedCount: batch.length,
      totalGasUsed: estimatedGasUsed,
      batchTransactionHash,
      fallbackUsed: true
    };
  }

  /**
   * Start the batch processing timer
   */
  private startBatchProcessor(): void {
    this.batchTimer = setInterval(async () => {
      try {
        await this.processBatch();
      } catch (error) {
        console.error("Batch processing error:", error);
      }
    }, this.BATCH_INTERVAL);
  }

  /**
   * Stop the batch processor
   */
  stopBatchProcessor(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Force process all pending rewards immediately
   */
  async flushPendingRewards(): Promise<BatchProcessingResult[]> {
    const results: BatchProcessingResult[] = [];
    
    while (this.pendingRewards.length > 0) {
      const result = await this.processBatch();
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get current status of gas management system
   */
  async getSystemStatus() {
    const gasPool = await this.getGasPoolStats();
    
    return {
      gasPool,
      pendingRewards: this.pendingRewards.length,
      batchSize: this.BATCH_SIZE,
      batchInterval: this.BATCH_INTERVAL,
      protocolFeePercentage: this.PROTOCOL_FEE_PERCENTAGE * 100, // Convert to percentage
      isProcessorActive: this.batchTimer !== null
    };
  }

  private generateMockHash(): string {
    return "0x" + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }
}

export const gasManager = new GasManager();