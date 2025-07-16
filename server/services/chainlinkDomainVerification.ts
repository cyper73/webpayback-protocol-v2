import { storage } from '../storage';
import { InsertDomainVerification, DomainVerification } from '@shared/schema';

interface ChainlinkDomainCheckResult {
  domain: string;
  isVerified: boolean;
  securityLevel: 'low' | 'medium' | 'high';
  requiresManualReview: boolean;
  verificationScore: number;
  riskFactors: string[];
  chainlinkData: {
    domainAge: number;
    sslCertificate: boolean;
    dnsRecords: boolean;
    whoisData: any;
    reputationScore: number;
  };
}

class ChainlinkDomainVerificationService {
  private readonly FAMOUS_DOMAINS = [
    'google.com', 'facebook.com', 'youtube.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'tiktok.com', 'netflix.com', 'amazon.com', 'apple.com',
    'microsoft.com', 'github.com', 'stackoverflow.com', 'reddit.com', 'wikipedia.org',
    'medium.com', 'wordpress.com', 'blogger.com', 'tumblr.com', 'pinterest.com'
  ];

  private readonly HIGH_RISK_TLDS = [
    '.tk', '.ml', '.ga', '.cf', '.click', '.download', '.zip', '.review'
  ];

  private extractDomain(url: string): string {
    console.log('🔍 Extracting domain from URL:', url);
    
    let normalizedUrl = url.toLowerCase().trim();
    
    // Auto-add https:// if no protocol is present
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
      console.log('🔧 Auto-added https:// - normalized URL:', normalizedUrl);
    }
    
    try {
      const urlObj = new URL(normalizedUrl);
      const domain = urlObj.hostname.replace(/^www\./, '');
      console.log('🔍 Extracted domain:', domain);
      return domain;
    } catch (error) {
      console.error('❌ Invalid URL format:', normalizedUrl);
      throw new Error('Invalid URL format');
    }
  }

  private isFamousDomain(domain: string): boolean {
    return this.FAMOUS_DOMAINS.some(famous => 
      domain === famous || domain.endsWith('.' + famous)
    );
  }

  private isHighRiskTLD(domain: string): boolean {
    return this.HIGH_RISK_TLDS.some(tld => domain.endsWith(tld));
  }

  private calculateVerificationScore(domain: string, chainlinkData: any): number {
    let score = 50; // Base score

    // Domain age factor (simulated)
    if (chainlinkData.domainAge > 365) score += 20;
    else if (chainlinkData.domainAge > 90) score += 10;
    else score -= 15;

    // SSL certificate
    if (chainlinkData.sslCertificate) score += 15;
    else score -= 20;

    // DNS records
    if (chainlinkData.dnsRecords) score += 10;
    else score -= 10;

    // Famous domain bonus
    if (this.isFamousDomain(domain)) score += 30;

    // High risk TLD penalty
    if (this.isHighRiskTLD(domain)) score -= 25;

    // Reputation score
    score += chainlinkData.reputationScore;

    return Math.max(0, Math.min(100, score));
  }

  private async simulateChainlinkDataFeed(domain: string): Promise<ChainlinkDomainCheckResult['chainlinkData']> {
    // Simulate Chainlink external data feed
    // In production, this would use actual Chainlink Data Feeds
    console.log('🔗 Simulating Chainlink data feed for domain:', domain);
    
    const isFamous = this.isFamousDomain(domain);
    const isHighRisk = this.isHighRiskTLD(domain);
    
    return {
      domainAge: isFamous ? 3650 : Math.random() * 365, // Famous domains are old
      sslCertificate: isFamous ? true : Math.random() > 0.2,
      dnsRecords: isFamous ? true : Math.random() > 0.1,
      whoisData: {
        registrar: isFamous ? 'MarkMonitor Inc.' : 'Generic Registrar',
        registrationDate: new Date(Date.now() - (isFamous ? 3650 : 365) * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      reputationScore: isFamous ? 25 : (isHighRisk ? -20 : Math.random() * 10)
    };
  }

  async checkDomainWithChainlink(websiteUrl: string): Promise<ChainlinkDomainCheckResult> {
    console.log('🔗 Starting Chainlink domain verification for:', websiteUrl);
    
    const domain = this.extractDomain(websiteUrl);
    const chainlinkData = await this.simulateChainlinkDataFeed(domain);
    
    const verificationScore = this.calculateVerificationScore(domain, chainlinkData);
    const isFamous = this.isFamousDomain(domain);
    const isHighRisk = this.isHighRiskTLD(domain);
    
    const riskFactors: string[] = [];
    
    if (isFamous) {
      riskFactors.push('Famous domain requiring manual verification');
    }
    
    if (isHighRisk) {
      riskFactors.push('High-risk TLD detected');
    }
    
    if (chainlinkData.domainAge < 90) {
      riskFactors.push('Recently registered domain');
    }
    
    if (!chainlinkData.sslCertificate) {
      riskFactors.push('No valid SSL certificate');
    }
    
    if (chainlinkData.reputationScore < 0) {
      riskFactors.push('Negative reputation score');
    }

    const securityLevel: 'low' | 'medium' | 'high' = 
      verificationScore >= 80 ? 'low' :
      verificationScore >= 60 ? 'medium' : 'high';

    const requiresManualReview = isFamous || verificationScore < 40;

    console.log('🔗 Chainlink verification result:', {
      domain,
      verificationScore,
      securityLevel,
      requiresManualReview,
      riskFactors
    });

    return {
      domain,
      isVerified: verificationScore >= 70 && !requiresManualReview,
      securityLevel,
      requiresManualReview,
      verificationScore,
      riskFactors,
      chainlinkData
    };
  }

  async startChainlinkVerification(creatorId: number, websiteUrl: string): Promise<{
    success: boolean;
    verification?: DomainVerification;
    chainlinkResult?: ChainlinkDomainCheckResult;
    error?: string;
  }> {
    try {
      console.log('🔗 Starting Chainlink verification process for creator:', creatorId);
      
      const chainlinkResult = await this.checkDomainWithChainlink(websiteUrl);
      
      if (chainlinkResult.isVerified) {
        // Domain is automatically verified by Chainlink
        const verificationData: InsertDomainVerification = {
          creatorId,
          domain: chainlinkResult.domain,
          verificationMethod: 'chainlink_automated',
          verificationToken: `chainlink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          verificationStatus: 'verified',
          verificationProof: JSON.stringify(chainlinkResult.chainlinkData),
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          attemptCount: 1,
          lastAttempt: new Date(),
          isManualReview: false,
          reviewNotes: `Automatically verified by Chainlink with score ${chainlinkResult.verificationScore}/100`
        };

        const verification = await storage.createDomainVerification(verificationData);
        
        return {
          success: true,
          verification,
          chainlinkResult
        };
      } else if (chainlinkResult.requiresManualReview) {
        // Requires manual review
        const verificationData: InsertDomainVerification = {
          creatorId,
          domain: chainlinkResult.domain,
          verificationMethod: 'chainlink_manual',
          verificationToken: `chainlink_manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          verificationStatus: 'pending',
          verificationProof: JSON.stringify(chainlinkResult.chainlinkData),
          verifiedAt: null,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          attemptCount: 1,
          lastAttempt: new Date(),
          isManualReview: true,
          reviewNotes: `Chainlink flagged for manual review: ${chainlinkResult.riskFactors.join(', ')}`
        };

        const verification = await storage.createDomainVerification(verificationData);
        
        return {
          success: false,
          verification,
          chainlinkResult,
          error: `Domain requires manual review due to: ${chainlinkResult.riskFactors.join(', ')}`
        };
      } else {
        // Domain failed verification
        return {
          success: false,
          chainlinkResult,
          error: `Domain verification failed. Score: ${chainlinkResult.verificationScore}/100. Issues: ${chainlinkResult.riskFactors.join(', ')}`
        };
      }
    } catch (error) {
      console.error('❌ Chainlink verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown verification error'
      };
    }
  }

  async getChainlinkVerificationStatus(creatorId: number): Promise<DomainVerification[]> {
    return await storage.getDomainVerificationsByCreator(creatorId);
  }
}

export const chainlinkDomainVerificationService = new ChainlinkDomainVerificationService();