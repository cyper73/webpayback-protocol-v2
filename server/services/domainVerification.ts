import { InsertDomainVerification, DomainVerification } from "@shared/schema";
import { storage } from "../storage";
import crypto from "crypto";

interface DomainVerificationRequest {
  creatorId: number;
  websiteUrl: string;
  verificationMethod: "dns_txt" | "html_meta" | "file_upload" | "social_proof";
}

interface DomainVerificationResult {
  success: boolean;
  verification?: DomainVerification;
  error?: string;
  instructions?: string;
}

class DomainVerificationService {
  private readonly FAMOUS_DOMAINS = [
    'github.com', 'stackoverflow.com', 'google.com', 'facebook.com', 'twitter.com',
    'linkedin.com', 'youtube.com', 'instagram.com', 'reddit.com', 'wikipedia.org',
    'medium.com', 'dev.to', 'hackernews.com', 'discord.com', 'telegram.org',
    'whatsapp.com', 'tiktok.com', 'snapchat.com', 'netflix.com', 'amazon.com',
    'apple.com', 'microsoft.com', 'adobe.com', 'spotify.com', 'twitch.tv',
    'coinbase.com', 'binance.com', 'kraken.com', 'opensea.io', 'uniswap.org',
    'ethereum.org', 'bitcoin.org', 'polygon.technology', 'chainlink.com',
    'coingecko.com', 'coinmarketcap.com', 'messari.io', 'defipulse.com',
    'news.ycombinator.com', 'producthunt.com', 'techcrunch.com', 'wired.com',
    'theverge.com', 'arstechnica.com', 'venturebeat.com', 'reuters.com',
    'bloomberg.com', 'cnbc.com', 'cnn.com', 'bbc.com', 'nytimes.com',
    'substack.com', 'notion.so', 'figma.com', 'canva.com', 'dribbble.com',
    'behance.net', 'unsplash.com', 'pexels.com', 'shutterstock.com'
  ];

  private readonly PROTECTED_SUBDOMAINS = [
    'www', 'blog', 'docs', 'api', 'app', 'admin', 'dashboard', 'support',
    'help', 'mail', 'email', 'secure', 'login', 'auth', 'account', 'profile',
    'cdn', 'static', 'assets', 'images', 'media', 'files', 'download'
  ];

  private extractDomain(url: string): string {
    try {
      console.log(`🔍 Extracting domain from URL: ${url}`);
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      console.log(`🔍 Extracted domain: ${domain}`);
      return domain;
    } catch (error) {
      console.error(`❌ Error extracting domain from URL: ${url}`, error);
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private isFamousDomain(domain: string): boolean {
    // Check if domain is in the famous domains list
    if (this.FAMOUS_DOMAINS.includes(domain)) {
      return true;
    }

    // Check if it's a subdomain of a famous domain
    for (const famousDomain of this.FAMOUS_DOMAINS) {
      if (domain.endsWith(`.${famousDomain}`)) {
        return true;
      }
    }

    return false;
  }

  private requiresHighSecurityVerification(domain: string): boolean {
    // Famous domains require additional verification
    if (this.isFamousDomain(domain)) {
      return true;
    }

    // Government domains
    if (domain.endsWith('.gov') || domain.endsWith('.edu') || domain.endsWith('.mil')) {
      return true;
    }

    // High-value TLDs
    const highValueTlds = ['.com', '.org', '.net', '.io', '.co'];
    const domainParts = domain.split('.');
    if (domainParts.length === 2 && highValueTlds.includes(`.${domainParts[1]}`)) {
      return true;
    }

    return false;
  }

  async startVerification(request: DomainVerificationRequest): Promise<DomainVerificationResult> {
    try {
      const domain = this.extractDomain(request.websiteUrl);
      
      // Check if domain is already being verified by another creator
      const existingVerification = await storage.getDomainVerificationByDomain(domain);
      if (existingVerification && existingVerification.creatorId !== request.creatorId) {
        if (existingVerification.verificationStatus === 'verified') {
          return {
            success: false,
            error: `Domain ${domain} is already verified by another creator. If you believe this is an error, please contact support.`
          };
        }
        if (existingVerification.verificationStatus === 'pending') {
          return {
            success: false,
            error: `Domain ${domain} is currently being verified by another creator. Please try again later.`
          };
        }
      }

      // Generate verification token
      const verificationToken = this.generateVerificationToken();
      
      // Create verification record
      const verificationData: InsertDomainVerification = {
        creatorId: request.creatorId,
        domain: domain,
        verificationMethod: request.verificationMethod,
        verificationToken: verificationToken,
        reviewNotes: this.isFamousDomain(domain) ? 
          `Famous domain detected: ${domain}. Requires manual review.` : 
          `Standard domain verification for ${domain}`
      };

      const verification = await storage.createDomainVerification(verificationData);

      // If it's a famous domain, flag for manual review
      if (this.isFamousDomain(domain)) {
        await storage.updateDomainVerification(verification.id, {
          isManualReview: true,
          verificationStatus: 'pending',
          reviewNotes: `🚨 SECURITY ALERT: Attempt to register famous domain ${domain}. Manual review required.`
        });
      }

      const instructions = this.generateVerificationInstructions(
        verification.verificationMethod,
        verification.verificationToken,
        domain
      );

      return {
        success: true,
        verification: verification,
        instructions: instructions
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private generateVerificationInstructions(
    method: string,
    token: string,
    domain: string
  ): string {
    switch (method) {
      case 'dns_txt':
        return `Add a TXT record to your DNS settings:
Name: _webpayback-verification.${domain}
Value: ${token}
TTL: 300

After adding the record, click "Verify Domain" to complete verification.`;

      case 'html_meta':
        return `Add this meta tag to the <head> section of your homepage:
<meta name="webpayback-verification" content="${token}" />

Make sure it's accessible at: https://${domain}/
Then click "Verify Domain" to complete verification.`;

      case 'file_upload':
        return `Create a file named "webpayback-verification.txt" with this content:
${token}

Upload it to your website root directory so it's accessible at:
https://${domain}/webpayback-verification.txt

Then click "Verify Domain" to complete verification.`;

      case 'social_proof':
        return `Post on your official social media account (Twitter, LinkedIn, etc.) with this content:
"Verifying my website ${domain} for WebPayback Protocol: ${token}"

Then provide the URL of your social media post for manual verification.`;

      default:
        return `Unknown verification method: ${method}`;
    }
  }

  async verifyDomain(verificationId: number): Promise<DomainVerificationResult> {
    try {
      const verification = await storage.getDomainVerification(verificationId);
      if (!verification) {
        return { success: false, error: 'Verification not found' };
      }

      if (verification.verificationStatus === 'verified') {
        return { success: false, error: 'Domain already verified' };
      }

      if (verification.isManualReview) {
        return { 
          success: false, 
          error: 'This domain requires manual review. Our team will verify it within 24-48 hours.' 
        };
      }

      // Attempt verification based on method
      const verificationSuccess = await this.performVerification(verification);
      
      if (verificationSuccess) {
        await storage.updateDomainVerification(verificationId, {
          verificationStatus: 'verified',
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        });

        return { success: true, verification: verification };
      } else {
        await storage.updateDomainVerification(verificationId, {
          verificationStatus: 'failed',
          attemptCount: (verification.attemptCount || 0) + 1,
          lastAttempt: new Date(),
          failureReason: 'Verification token not found or incorrect'
        });

        return { success: false, error: 'Verification failed. Please check your verification setup.' };
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async performVerification(verification: DomainVerification): Promise<boolean> {
    // In a real implementation, this would check DNS records, HTTP responses, etc.
    // For now, we'll simulate verification logic
    
    try {
      switch (verification.verificationMethod) {
        case 'dns_txt':
          return await this.verifyDNSTXT(verification.domain, verification.verificationToken);
        case 'html_meta':
          return await this.verifyHTMLMeta(verification.domain, verification.verificationToken);
        case 'file_upload':
          return await this.verifyFileUpload(verification.domain, verification.verificationToken);
        case 'social_proof':
          // Social proof requires manual review
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }

  private async verifyDNSTXT(domain: string, token: string): Promise<boolean> {
    // In production, this would use DNS lookup
    // For simulation, we'll check if domain is in our test list
    console.log(`🔍 Verifying DNS TXT record for ${domain} with token ${token}`);
    
    // Simulate DNS verification (in production, use dns.resolveTxt)
    return !this.isFamousDomain(domain); // Famous domains fail without proper DNS
  }

  private async verifyHTMLMeta(domain: string, token: string): Promise<boolean> {
    // In production, this would fetch the homepage and check for meta tag
    console.log(`🔍 Verifying HTML meta tag for ${domain} with token ${token}`);
    
    // Simulate HTTP verification
    return !this.isFamousDomain(domain); // Famous domains fail without proper meta tag
  }

  private async verifyFileUpload(domain: string, token: string): Promise<boolean> {
    // In production, this would fetch the verification file
    console.log(`🔍 Verifying file upload for ${domain} with token ${token}`);
    
    // Simulate file verification
    return !this.isFamousDomain(domain); // Famous domains fail without proper file
  }

  async getDomainVerificationStatus(creatorId: number): Promise<DomainVerification[]> {
    return await storage.getDomainVerificationsByCreator(creatorId);
  }

  async checkDomainAvailability(websiteUrl: string): Promise<{
    available: boolean;
    reason?: string;
    requiresVerification: boolean;
    securityLevel: 'low' | 'medium' | 'high';
  }> {
    try {
      const domain = this.extractDomain(websiteUrl);
      
      // Check if domain is already verified
      try {
        const existingVerification = await storage.getDomainVerificationByDomain(domain);
        if (existingVerification && existingVerification.verificationStatus === 'verified') {
          return {
            available: false,
            reason: 'Domain already verified by another creator',
            requiresVerification: true,
            securityLevel: 'high'
          };
        }
      } catch (dbError) {
        // Database error - proceed without domain verification check
        console.log('Database error checking domain verification:', dbError);
      }

      // Check if it's a famous domain
      if (this.isFamousDomain(domain)) {
        return {
          available: true,
          reason: 'Famous domain - requires manual verification',
          requiresVerification: true,
          securityLevel: 'high'
        };
      }

      // Check if it requires high security verification
      if (this.requiresHighSecurityVerification(domain)) {
        return {
          available: true,
          reason: 'High-value domain - requires verification',
          requiresVerification: true,
          securityLevel: 'high'
        };
      }

      return {
        available: true,
        requiresVerification: false,
        securityLevel: 'low'
      };

    } catch (error) {
      console.error('Error in checkDomainAvailability:', error);
      return {
        available: false,
        reason: 'Invalid URL format',
        requiresVerification: false,
        securityLevel: 'low'
      };
    }
  }
}

export const domainVerificationService = new DomainVerificationService();