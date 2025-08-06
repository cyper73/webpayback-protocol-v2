import { Request } from 'express';
import crypto from 'crypto';

// Advanced credential simulation detection and prevention
export class CredentialProtectionService {
  private static suspiciousAttempts = new Map<string, number>();
  private static blockedIPs = new Set<string>();
  private static founderWallet = process.env.FOUNDER_WALLET_ADDRESS || '0x***********************************************[FOUNDER]';
  
  // Founder's authorized IP addresses (from environment)
  private static founderAuthorizedIPs = (process.env.FOUNDER_AUTHORIZED_IPS || '127.0.0.1,localhost,::1').split(',').map(ip => ip.trim());
  
  // IP access attempts log
  private static ipAccessLog = new Map<string, {
    attempts: number;
    lastAttempt: Date;
    violations: string[];
    authorized: boolean;
  }>();

  /**
   * Validate IP address against founder's authorized list
   */
  static validateFounderIP(req: Request): {
    isAuthorized: boolean;
    detectedIP: string;
    reason?: string;
  } {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const realClientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || clientIP;
    const finalIP = typeof realClientIP === 'string' ? realClientIP.split(',')[0].trim() : clientIP;
    
    // Log access attempt
    this.logIPAccess(finalIP, 'FOUNDER_WALLET_ACCESS_ATTEMPT');
    
    // Check if IP is in founder's authorized list
    const isAuthorized = this.founderAuthorizedIPs.some(authorizedIP => {
      return finalIP === authorizedIP || finalIP.includes(authorizedIP);
    });
    
    console.log(`🔍 IP Authorization Check: ${finalIP} -> ${isAuthorized ? 'AUTHORIZED' : 'BLOCKED'}`);
    
    return {
      isAuthorized,
      detectedIP: finalIP,
      reason: isAuthorized ? undefined : 'IP_NOT_IN_FOUNDER_WHITELIST'
    };
  }

  /**
   * Validate that session headers are cryptographically authentic and not simulated
   */
  static async validateFounderSession(req: Request): Promise<{
    isValid: boolean;
    reason?: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }> {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Check if IP is already blocked for suspicious activity
    if (this.blockedIPs.has(clientIP)) {
      return {
        isValid: false,
        reason: 'IP_BLOCKED_SUSPICIOUS_ACTIVITY',
        riskLevel: 'CRITICAL'
      };
    }

    const walletSession = req.headers['x-wallet-session'] as string;
    const verifiedWallet = req.headers['x-verified-wallet'] as string;
    const walletSignature = req.headers['x-wallet-signature'] as string;
    const timestamp = req.headers['x-session-timestamp'] as string;

    // VALIDATION 1: All required headers present
    if (!walletSession || !verifiedWallet || !walletSignature || !timestamp) {
      this.recordSuspiciousActivity(clientIP);
      return {
        isValid: false,
        reason: 'MISSING_REQUIRED_HEADERS',
        riskLevel: 'HIGH'
      };
    }

    // VALIDATION 2: Wallet must match founder wallet exactly
    if (verifiedWallet.toLowerCase() !== this.founderWallet.toLowerCase()) {
      this.recordSuspiciousActivity(clientIP);
      return {
        isValid: false,
        reason: 'WALLET_ADDRESS_MISMATCH',
        riskLevel: 'CRITICAL'
      };
    }

    // VALIDATION 3: Session timestamp validation
    const now = Date.now();
    const sessionTime = parseInt(timestamp);
    if (isNaN(sessionTime) || (now - sessionTime) > 300000) { // 5 minute window
      return {
        isValid: false,
        reason: 'SESSION_EXPIRED_OR_INVALID',
        riskLevel: 'MEDIUM'
      };
    }

    // VALIDATION 4: Signature entropy check (detect generated signatures)
    if (!this.isValidSignatureEntropy(walletSignature)) {
      this.recordSuspiciousActivity(clientIP);
      return {
        isValid: false,
        reason: 'SIGNATURE_ENTROPY_SUSPICIOUS',
        riskLevel: 'CRITICAL'
      };
    }

    // VALIDATION 5: Session token cryptographic validation
    const expectedSessionHash = this.generateSessionHash(verifiedWallet, timestamp, walletSignature);
    if (walletSession !== expectedSessionHash) {
      this.recordSuspiciousActivity(clientIP);
      return {
        isValid: false,
        reason: 'SESSION_TOKEN_INVALID',
        riskLevel: 'CRITICAL'
      };
    }

    // All validations passed
    return {
      isValid: true,
      riskLevel: 'LOW'
    };
  }

  /**
   * Generate cryptographically secure session hash
   */
  private static generateSessionHash(wallet: string, timestamp: string, signature: string): string {
    const secret = process.env.SESSION_SECRET || 'webpayback-fort-knox-2025';
    const data = `${wallet}:${timestamp}:${signature.substring(0, 32)}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Detect if signature has appropriate entropy (not generated/fake)
   */
  private static isValidSignatureEntropy(signature: string): boolean {
    if (!signature || signature.length < 130) return false;
    
    // Check for repeated patterns (sign of generation)
    const chars = signature.split('');
    const charFreq = chars.reduce((acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // If any character appears more than 20% of the time, suspicious
    const maxFreq = Math.max(...Object.values(charFreq));
    const entropyThreshold = signature.length * 0.2;
    
    return maxFreq < entropyThreshold;
  }

  /**
   * Log IP access attempts for forensic analysis
   */
  private static logIPAccess(ip: string, accessType: string, violations: string[] = []): void {
    const existing = this.ipAccessLog.get(ip) || {
      attempts: 0,
      lastAttempt: new Date(),
      violations: [],
      authorized: this.founderAuthorizedIPs.includes(ip)
    };
    
    existing.attempts += 1;
    existing.lastAttempt = new Date();
    existing.violations.push(...violations);
    
    this.ipAccessLog.set(ip, existing);
    
    // Enhanced logging for founder wallet access attempts
    if (accessType === 'FOUNDER_WALLET_ACCESS_ATTEMPT') {
      console.log(`📋 IP FORENSICS: ${ip} attempted founder wallet access (attempt #${existing.attempts})`);
      console.log(`📋 IP STATUS: ${existing.authorized ? 'AUTHORIZED_FOUNDER_IP' : 'UNAUTHORIZED_IP'}`);
      if (violations.length > 0) {
        console.log(`📋 VIOLATIONS: ${violations.join(', ')}`);
      }
    }
  }

  /**
   * Record suspicious activity and block repeat offenders
   */
  private static recordSuspiciousActivity(clientIP: string): void {
    const attempts = this.suspiciousAttempts.get(clientIP) || 0;
    this.suspiciousAttempts.set(clientIP, attempts + 1);

    // Enhanced logging for IP blocking
    this.logIPAccess(clientIP, 'SUSPICIOUS_ACTIVITY', ['CREDENTIAL_SIMULATION_ATTEMPT']);

    // Block IP after 3 suspicious attempts
    if (attempts >= 2) {
      this.blockedIPs.add(clientIP);
      console.log(`🚨 SECURITY: Blocked IP ${clientIP} for credential simulation attempts`);
    }

    console.log(`⚠️ SECURITY: Suspicious activity from ${clientIP} (${attempts + 1} attempts)`);
  }

  /**
   * Get security statistics (for monitoring)
   */
  static getSecurityStats() {
    return {
      suspiciousAttempts: this.suspiciousAttempts.size,
      blockedIPs: this.blockedIPs.size,
      totalAttempts: Array.from(this.suspiciousAttempts.values()).reduce((a, b) => a + b, 0),
      founderAuthorizedIPs: this.founderAuthorizedIPs.length,
      ipAccessLog: this.ipAccessLog.size,
      recentUnauthorizedIPs: Array.from(this.ipAccessLog.entries())
        .filter(([ip, data]) => !data.authorized && data.lastAttempt > new Date(Date.now() - 24 * 60 * 60 * 1000))
        .length
    };
  }

  /**
   * Get detailed IP access forensics (founder only)
   */
  static getIPForensics() {
    return {
      authorizedIPs: this.founderAuthorizedIPs,
      accessLog: Array.from(this.ipAccessLog.entries()).map(([ip, data]) => ({
        ip,
        attempts: data.attempts,
        lastAttempt: data.lastAttempt.toISOString(),
        violations: data.violations,
        authorized: data.authorized,
        risk: data.violations.length > 3 ? 'HIGH' : data.violations.length > 0 ? 'MEDIUM' : 'LOW'
      })),
      blockedIPs: Array.from(this.blockedIPs)
    };
  }

  /**
   * Clear security counters (admin function)
   */
  static clearSecurityCounters(): void {
    this.suspiciousAttempts.clear();
    this.blockedIPs.clear();
    this.ipAccessLog.clear();
    console.log('🔐 SECURITY: Security counters cleared');
  }
}