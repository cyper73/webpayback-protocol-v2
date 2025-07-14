import { InsertContentTracking, ContentTracking } from "@shared/schema";
import { storage } from "../storage";
import { web3Service } from "./web3";

interface AIAccessDetection {
  userAgent: string;
  ipAddress: string;
  url: string;
  timestamp: Date;
  aiType: 'claude' | 'gpt' | 'gemini' | 'bot' | 'unknown';
  confidence: number;
}

interface ContentFingerprint {
  contentHash: string;
  title: string;
  description: string;
  keywords: string[];
  length: number;
  language: string;
}

class ContentMonitoringService {
  private readonly AI_USER_AGENTS = [
    'Claude',
    'GPT',
    'OpenAI',
    'Anthropic',
    'Gemini',
    'Bard',
    'Bot',
    'Crawler',
    'Spider',
    'Scraper'
  ];

  private readonly AI_IP_PATTERNS = [
    // OpenAI IP ranges
    /^20\.102\./,
    /^13\.107\./,
    // Anthropic IP ranges
    /^34\.102\./,
    /^35\.247\./,
    // Google AI IP ranges
    /^34\.149\./,
    /^35\.186\./
  ];

  async detectAIAccess(userAgent: string, ipAddress: string, url: string): Promise<AIAccessDetection> {
    const aiType = this.identifyAIType(userAgent);
    const confidence = this.calculateConfidence(userAgent, ipAddress);
    
    return {
      userAgent,
      ipAddress,
      url,
      timestamp: new Date(),
      aiType,
      confidence
    };
  }

  private identifyAIType(userAgent: string): AIAccessDetection['aiType'] {
    const lowerUA = userAgent.toLowerCase();
    
    if (lowerUA.includes('claude') || lowerUA.includes('anthropic')) return 'claude';
    if (lowerUA.includes('gpt') || lowerUA.includes('openai')) return 'gpt';
    if (lowerUA.includes('gemini') || lowerUA.includes('bard')) return 'gemini';
    if (this.AI_USER_AGENTS.some(agent => lowerUA.includes(agent.toLowerCase()))) return 'bot';
    
    return 'unknown';
  }

  private calculateConfidence(userAgent: string, ipAddress: string): number {
    let confidence = 0;
    
    // User agent analysis
    if (this.AI_USER_AGENTS.some(agent => userAgent.toLowerCase().includes(agent.toLowerCase()))) {
      confidence += 0.4;
    }
    
    // IP pattern analysis
    if (this.AI_IP_PATTERNS.some(pattern => pattern.test(ipAddress))) {
      confidence += 0.3;
    }
    
    // Behavioral patterns
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      confidence += 0.2;
    }
    
    // Missing typical browser headers
    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome')) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  async createContentFingerprint(url: string): Promise<ContentFingerprint> {
    try {
      // In a real implementation, this would fetch and analyze the content
      // For now, we'll create a fingerprint based on URL and current data
      const contentHash = this.generateContentHash(url);
      
      return {
        contentHash,
        title: this.extractTitleFromURL(url),
        description: "AI-tracked content from registered creator",
        keywords: this.extractKeywords(url),
        length: Math.floor(Math.random() * 5000) + 1000,
        language: "en"
      };
    } catch (error) {
      throw new Error(`Failed to create content fingerprint: ${error}`);
    }
  }

  private generateContentHash(url: string): string {
    // Simple hash generation - in real implementation would use actual content
    const timestamp = Date.now().toString();
    const combined = url + timestamp;
    return this.simpleHash(combined);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private extractTitleFromURL(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || urlObj.hostname;
    } catch {
      return "Unknown Content";
    }
  }

  private extractKeywords(url: string): string[] {
    const keywords = [];
    if (url.includes('github')) keywords.push('github', 'code', 'repository');
    if (url.includes('webpayback')) keywords.push('webpayback', 'protocol', 'blockchain');
    if (url.includes('ai')) keywords.push('ai', 'artificial intelligence');
    return keywords.length > 0 ? keywords : ['content', 'web', 'creator'];
  }

  async processAIAccess(detection: AIAccessDetection): Promise<boolean> {
    try {
      // Find the creator by website URL
      const creators = await storage.getAllCreators();
      const creator = creators.find(c => detection.url.includes(c.websiteUrl) || c.websiteUrl.includes(detection.url));
      
      if (!creator) {
        console.log(`No creator found for URL: ${detection.url}`);
        return false;
      }

      // Only process if confidence is high enough
      if (detection.confidence < 0.3) {
        console.log(`Low confidence AI detection: ${detection.confidence}`);
        return false;
      }

      // Create content fingerprint
      const fingerprint = await this.createContentFingerprint(detection.url);
      
      // Track the content access
      const trackingData: InsertContentTracking = {
        creatorId: creator.id,
        contentHash: fingerprint.contentHash,
        accessType: "ai_access",
        aiModel: detection.aiType,
        detectionConfidence: detection.confidence.toString(),
        metadata: {
          userAgent: detection.userAgent,
          ipAddress: detection.ipAddress,
          fingerprint: fingerprint
        }
      };

      await storage.createContentTracking(trackingData);
      
      // Calculate reward amount based on content type and AI model
      const rewardAmount = this.calculateReward(detection.aiType, fingerprint);
      
      // Distribute reward to creator
      await web3Service.processRewardDistribution(
        creator.id,
        rewardAmount,
        creator.walletAddress
      );

      console.log(`✅ AI Access Detected and Rewarded:
        Creator: ${creator.name}
        URL: ${detection.url}
        AI Type: ${detection.aiType}
        Confidence: ${(detection.confidence * 100).toFixed(1)}%
        Reward: ${rewardAmount} WPT
        Wallet: ${creator.walletAddress}`);

      return true;
      
    } catch (error) {
      console.error(`Failed to process AI access: ${error}`);
      return false;
    }
  }

  private calculateReward(aiType: AIAccessDetection['aiType'], fingerprint: ContentFingerprint): string {
    let baseReward = 0.5; // Base reward in WPT
    
    // Adjust based on AI type
    switch (aiType) {
      case 'claude':
        baseReward *= 1.5; // Higher reward for Claude
        break;
      case 'gpt':
        baseReward *= 1.3;
        break;
      case 'gemini':
        baseReward *= 1.2;
        break;
      case 'bot':
        baseReward *= 1.0;
        break;
      default:
        baseReward *= 0.8;
    }
    
    // Adjust based on content length
    if (fingerprint.length > 3000) {
      baseReward *= 1.2;
    }
    
    // Adjust based on keywords
    if (fingerprint.keywords.includes('blockchain') || fingerprint.keywords.includes('ai')) {
      baseReward *= 1.3;
    }
    
    return baseReward.toFixed(8);
  }

  // Simulate AI access for testing
  async simulateAIAccess(url: string, aiType: AIAccessDetection['aiType'] = 'claude'): Promise<boolean> {
    const mockDetection: AIAccessDetection = {
      userAgent: `${aiType === 'claude' ? 'Claude-AI' : 'GPT-Bot'}/1.0`,
      ipAddress: aiType === 'claude' ? '34.102.136.180' : '20.102.46.123',
      url: url,
      timestamp: new Date(),
      aiType: aiType,
      confidence: 0.85
    };

    return await this.processAIAccess(mockDetection);
  }

  async getMonitoringStats(): Promise<any> {
    const stats = await storage.getContentTrackingStats();
    return {
      totalAIAccesses: stats.totalAccesses || 0,
      totalRewardsDistributed: stats.totalRewards || 0,
      topAIModels: stats.topModels || [],
      recentActivity: stats.recentActivity || []
    };
  }
}

export const contentMonitoringService = new ContentMonitoringService();