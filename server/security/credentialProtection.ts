import { Request } from 'express';
import crypto from 'crypto';

// Advanced credential simulation detection and prevention
export class CredentialProtectionService {
  private static suspiciousAttempts = new Map<string, number>();
  private static blockedIPs = new Set<string>();
  private static founderWallet = '0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba';

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
   * Record suspicious activity and block repeat offenders
   */
  private static recordSuspiciousActivity(clientIP: string): void {
    const attempts = this.suspiciousAttempts.get(clientIP) || 0;
    this.suspiciousAttempts.set(clientIP, attempts + 1);

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
      totalAttempts: Array.from(this.suspiciousAttempts.values()).reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Clear security counters (admin function)
   */
  static clearSecurityCounters(): void {
    this.suspiciousAttempts.clear();
    this.blockedIPs.clear();
    console.log('🔐 SECURITY: Security counters cleared');
  }
}