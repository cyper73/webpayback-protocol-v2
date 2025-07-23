import { db } from "../db";
import { citationTracking, aiKnowledgeIndex, creators, rewardDistributions } from "@shared/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export interface CitationEvent {
  sourceUrl: string;
  citationContext: string;
  citationType: 'content_reference' | 'direct_quote' | 'paraphrase' | 'factual_data';
  querySource: string;
  aiModel: string;
  userAgent?: string;
  sessionId?: string;
  confidence?: number;
}

export interface KnowledgeIndexEntry {
  creatorId: number;
  contentFingerprint: string;
  contentSummary: string;
  keyTopics: string[];
}

export class CitationRewardEngine {
  private static instance: CitationRewardEngine;
  
  // Citation reward multipliers based on type and AI model
  private readonly REWARD_MULTIPLIERS = {
    // Citation type multipliers
    citationType: {
      'direct_quote': 1.5,        // Highest reward for direct quotes
      'content_reference': 1.2,   // Good reward for references
      'paraphrase': 1.0,          // Standard reward for paraphrasing
      'factual_data': 0.8,        // Lower reward for facts/data
    },
    
    // AI model multipliers (different models have different usage patterns)
    aiModel: {
      'claude': 1.3,
      'gpt': 1.2,
      'grok': 1.25,
      'gemini': 1.1,
      'perplexity': 1.0,
      'deepseek': 0.9,
    },
    
    // Base citation reward amount
    baseReward: 0.15, // 0.15 WPT per citation (vs 1.0+ for direct access)
  };

  public static getInstance(): CitationRewardEngine {
    if (!CitationRewardEngine.instance) {
      CitationRewardEngine.instance = new CitationRewardEngine();
    }
    return CitationRewardEngine.instance;
  }

  /**
   * Process a citation event and calculate reward
   */
  async processCitation(citation: CitationEvent): Promise<{
    success: boolean;
    rewardAmount: number;
    citationId?: number;
    error?: string;
  }> {
    try {
      // Find creator by source URL
      const [creator] = await db
        .select()
        .from(creators)
        .where(sql`${creators.websiteUrl} = ${citation.sourceUrl} OR ${citation.sourceUrl} LIKE ${creators.websiteUrl} || '%'`)
        .limit(1);

      if (!creator) {
        return { success: false, rewardAmount: 0, error: 'Creator not found for URL' };
      }

      // Calculate reward amount
      const rewardAmount = this.calculateCitationReward(citation);

      // Insert citation tracking record
      const [citationRecord] = await db
        .insert(citationTracking)
        .values({
          creatorId: creator.id,
          sourceUrl: citation.sourceUrl,
          citationContext: citation.citationContext,
          citationType: citation.citationType,
          querySource: citation.querySource,
          aiModel: citation.aiModel,
          userAgent: citation.userAgent,
          sessionId: citation.sessionId,
          citationConfidence: citation.confidence?.toString() || "0.95",
          rewardAmount: rewardAmount.toString(),
          metadata: {
            timestamp: new Date().toISOString(),
            rewardCalculation: {
              baseReward: this.REWARD_MULTIPLIERS.baseReward,
              citationTypeMultiplier: this.REWARD_MULTIPLIERS.citationType[citation.citationType],
              aiModelMultiplier: this.REWARD_MULTIPLIERS.aiModel[citation.aiModel] || 1.0,
            }
          }
        })
        .returning();

      // Update AI knowledge index
      await this.updateKnowledgeIndex(creator.id, citation);

      // Create reward distribution
      await this.distributeReward(creator.id, rewardAmount);

      console.log(`📝 Citation reward processed: ${rewardAmount} WPT for ${citation.aiModel} citing ${creator.websiteUrl}`);

      return {
        success: true,
        rewardAmount,
        citationId: citationRecord.id,
      };

    } catch (error) {
      console.error('Citation processing error:', error);
      return { success: false, rewardAmount: 0, error: error.message };
    }
  }

  /**
   * Calculate reward amount based on citation characteristics
   */
  private calculateCitationReward(citation: CitationEvent): number {
    const baseReward = this.REWARD_MULTIPLIERS.baseReward;
    const citationMultiplier = this.REWARD_MULTIPLIERS.citationType[citation.citationType] || 1.0;
    const aiMultiplier = this.REWARD_MULTIPLIERS.aiModel[citation.aiModel] || 1.0;
    const confidenceMultiplier = citation.confidence || 0.95;

    return baseReward * citationMultiplier * aiMultiplier * confidenceMultiplier;
  }

  /**
   * Update or create knowledge index entry
   */
  private async updateKnowledgeIndex(creatorId: number, citation: CitationEvent): Promise<void> {
    const contentFingerprint = this.generateContentFingerprint(citation.sourceUrl, citation.citationContext);

    // Check if knowledge index entry exists
    const [existing] = await db
      .select()
      .from(aiKnowledgeIndex)
      .where(and(
        eq(aiKnowledgeIndex.creatorId, creatorId),
        eq(aiKnowledgeIndex.contentFingerprint, contentFingerprint)
      ))
      .limit(1);

    if (existing) {
      // Update existing entry
      await db
        .update(aiKnowledgeIndex)
        .set({
          lastCitationDate: new Date(),
          totalCitations: existing.totalCitations + 1,
          cumulativeRewards: (parseFloat(existing.cumulativeRewards) + this.calculateCitationReward(citation)).toString(),
        })
        .where(eq(aiKnowledgeIndex.id, existing.id));
    } else {
      // Create new knowledge index entry
      await db
        .insert(aiKnowledgeIndex)
        .values({
          creatorId,
          contentFingerprint,
          contentSummary: this.generateContentSummary(citation.citationContext),
          keyTopics: this.extractKeyTopics(citation.citationContext),
          accessTimestamp: new Date(),
          lastCitationDate: new Date(),
          totalCitations: 1,
          cumulativeRewards: this.calculateCitationReward(citation).toString(),
        });
    }
  }

  /**
   * Generate unique fingerprint for content
   */
  private generateContentFingerprint(url: string, context: string): string {
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(`${url}:${context.slice(0, 100)}`)
      .digest('hex')
      .slice(0, 16);
  }

  /**
   * Generate AI-powered content summary
   */
  private generateContentSummary(context: string): string {
    // Simplified summary - in production could use AI for better summaries
    return context.length > 200 
      ? context.slice(0, 200) + "..."
      : context;
  }

  /**
   * Extract key topics from citation context
   */
  private extractKeyTopics(context: string): string[] {
    // Simple keyword extraction - in production could use NLP
    const words = context
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    return [...new Set(words)].slice(0, 10);
  }

  /**
   * Distribute reward to creator
   */
  private async distributeReward(creatorId: number, amount: number): Promise<void> {
    await db
      .insert(rewardDistributions)
      .values({
        creatorId,
        amount: amount.toString(),
        status: 'pending',
      });
  }

  /**
   * Get citation statistics for a creator
   */
  async getCitationStats(creatorId: number): Promise<{
    totalCitations: number;
    totalRewards: number;
    citationsByType: Record<string, number>;
    citationsByAI: Record<string, number>;
    recentCitations: any[];
  }> {
    // Get total citations and rewards
    const stats = await db
      .select({
        totalCitations: sql<number>`count(*)`,
        totalRewards: sql<number>`sum(${citationTracking.rewardAmount})`,
      })
      .from(citationTracking)
      .where(eq(citationTracking.creatorId, creatorId));

    // Get citations by type
    const citationsByType = await db
      .select({
        type: citationTracking.citationType,
        count: sql<number>`count(*)`,
      })
      .from(citationTracking)
      .where(eq(citationTracking.creatorId, creatorId))
      .groupBy(citationTracking.citationType);

    // Get citations by AI model
    const citationsByAI = await db
      .select({
        aiModel: citationTracking.aiModel,
        count: sql<number>`count(*)`,
      })
      .from(citationTracking)
      .where(eq(citationTracking.creatorId, creatorId))
      .groupBy(citationTracking.aiModel);

    // Get recent citations
    const recentCitations = await db
      .select()
      .from(citationTracking)
      .where(eq(citationTracking.creatorId, creatorId))
      .orderBy(desc(citationTracking.timestamp))
      .limit(10);

    return {
      totalCitations: stats[0]?.totalCitations || 0,
      totalRewards: stats[0]?.totalRewards || 0,
      citationsByType: Object.fromEntries(
        citationsByType.map(item => [item.type, item.count])
      ),
      citationsByAI: Object.fromEntries(
        citationsByAI.map(item => [item.aiModel, item.count])
      ),
      recentCitations,
    };
  }

  /**
   * Simulate AI citation detection (for testing)
   */
  async simulateCitation(params: {
    creatorUrl: string;
    userQuery: string;
    aiModel: string;
    citationType?: string;
  }): Promise<{ success: boolean; rewardAmount: number; message: string }> {
    const citationEvent: CitationEvent = {
      sourceUrl: params.creatorUrl,
      citationContext: `Content referenced in response to: "${params.userQuery}"`,
      citationType: (params.citationType as any) || 'content_reference',
      querySource: params.userQuery,
      aiModel: params.aiModel,
      userAgent: 'WebPayback-Simulator',
      sessionId: `sim-${Date.now()}`,
      confidence: 0.95,
    };

    const result = await this.processCitation(citationEvent);
    
    return {
      success: result.success,
      rewardAmount: result.rewardAmount,
      message: result.success 
        ? `Citation reward: ${result.rewardAmount} WPT for ${params.aiModel} citing your content`
        : result.error || 'Citation processing failed'
    };
  }
}

export const citationRewardEngine = CitationRewardEngine.getInstance();