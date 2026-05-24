import { Request } from 'express';

// System forensics for tracking suspicious access attempts
export class SystemForensics {
  private static accessAttemptLog: Array<{
    timestamp: Date;
    ip: string;
    userAgent: string;
    walletAttempt: string;
    violations: string[];
    blocked: boolean;
    osFingerprint: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }> = [];

  /**
   * Log suspicious access attempt with detailed forensics
   */
  static logSuspiciousAccess(req: Request, walletAttempt: string, violations: string[]): void {
    const userAgent = req.get('User-Agent') || '';
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const realClientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || clientIP;
    
    // OS Fingerprinting  
    const osFingerprint = this.detectOperatingSystem(userAgent);
    const osFingerprintString = `OS: ${osFingerprint.os} | Browser: ${osFingerprint.browser} v${osFingerprint.version}${osFingerprint.suspicious ? ' | SUSPICIOUS: ' + osFingerprint.details : ''}`;
    
    // Risk assessment
    const riskLevel = this.assessRiskLevel(violations, osFingerprint, walletAttempt);
    
    const logEntry = {
      timestamp: new Date(),
      ip: typeof realClientIP === 'string' ? realClientIP : clientIP,
      userAgent,
      walletAttempt,
      violations,
      blocked: true,
      osFingerprint: osFingerprintString,
      riskLevel
    };
    
    this.accessAttemptLog.push(logEntry);
    
    // Keep only last 1000 entries to prevent memory bloat
    if (this.accessAttemptLog.length > 1000) {
      this.accessAttemptLog = this.accessAttemptLog.slice(-1000);
    }
    
    // Enhanced logging for critical attempts
    if (riskLevel === 'CRITICAL') {
      console.log(`🚨 CRITICAL THREAT DETECTED:`);
      console.log(`🚨 OS: ${osFingerprint.os} | Browser: ${osFingerprint.browser}`);
      console.log(`🚨 Source: [MASKED] | Wallet: ${walletAttempt}`);
      console.log(`🚨 Violations: ${violations.join(', ')}`);
      console.log(`🚨 FORENSIC ALERT: Potential ${osFingerprint.suspicious ? 'SPOOFED' : 'GENUINE'} ${osFingerprint.os} system`);
    }
  }

  /**
   * Detect operating system and browser from User-Agent
   */
  private static detectOperatingSystem(userAgent: string): {
    os: string;
    browser: string;
    version: string;
    suspicious: boolean;
    details: string;
  } {
    const ua = userAgent.toLowerCase();
    
    let os = 'Unknown';
    let browser = 'Unknown';
    let version = 'Unknown';
    let suspicious = false;
    let details = '';
    
    // OS Detection
    if (ua.includes('windows nt 10.0')) {
      os = 'Windows 10/11';
    } else if (ua.includes('windows nt 6.3')) {
      os = 'Windows 8.1';
    } else if (ua.includes('windows nt 6.1')) {
      os = 'Windows 7';
    } else if (ua.includes('windows nt')) {
      os = 'Windows NT (Older)';
    } else if (ua.includes('mac os x')) {
      os = 'macOS';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS';
    }
    
    // Browser Detection
    if (ua.includes('firefox') || ua.includes('gecko')) {
      browser = 'Firefox';
      const firefoxMatch = ua.match(/firefox\/(\d+)/);
      if (firefoxMatch) version = firefoxMatch[1];
    } else if (ua.includes('chrome')) {
      browser = 'Chrome';
      const chromeMatch = ua.match(/chrome\/(\d+)/);
      if (chromeMatch) version = chromeMatch[1];
    } else if (ua.includes('safari')) {
      browser = 'Safari';
    } else if (ua.includes('edge')) {
      browser = 'Edge';
    }
    
    // Suspicious Pattern Detection
    if (ua.includes('windows nt') && !ua.includes('windows nt 10.0')) {
      suspicious = true;
      details = 'Outdated Windows version - potential VM or spoofed UA';
    }
    
    if (ua.includes('rv:141') && os.includes('Windows')) {
      suspicious = true;
      details = 'Unusual Firefox version on Windows - potential automation';
    }
    
    // Check for headless browser indicators
    if (ua.includes('headless') || ua.includes('phantom') || ua.includes('selenium')) {
      suspicious = true;
      details = 'Headless browser detected - automation tool';
    }
    
    return { os, browser, version, suspicious, details };
  }

  /**
   * Assess risk level based on multiple factors
   */
  private static assessRiskLevel(violations: string[], osFingerprint: any, walletAttempt: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let score = 0;
    
    // Violation scoring
    if (violations.includes('WALLET_MISMATCH')) score += 3;
    if (violations.includes('MISSING_WALLET_SIGNATURE')) score += 2;
    if (violations.includes('EXPIRED_SESSION')) score += 1;
    if (violations.includes('UNAUTHORIZED_IP')) score += 2;
    if (violations.includes('SUSPICIOUS_PROXY_DETECTED')) score += 3;
    
    // OS/Browser scoring
    if (osFingerprint.suspicious) score += 2;
    if (osFingerprint.os.includes('Unknown')) score += 1;
    
    // Wallet pattern scoring
    if (walletAttempt && walletAttempt.includes('0x742d35Cc')) score += 4; // Known suspicious pattern
    if (walletAttempt && walletAttempt === 'NONE') score += 1;
    
    if (score >= 7) return 'CRITICAL';
    if (score >= 5) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Get suspicious Windows NT attempts
   */
  static getWindowsNTAttempts() {
    return this.accessAttemptLog.filter(entry => 
      entry.osFingerprint.includes('Windows') && 
      entry.blocked &&
      entry.riskLevel === 'CRITICAL'
    );
  }

  /**
   * Get complete forensics report
   */
  static getForensicsReport() {
    const windowsAttempts = this.getWindowsNTAttempts();
    const criticalAttempts = this.accessAttemptLog.filter(entry => entry.riskLevel === 'CRITICAL');
    
    return {
      totalAttempts: this.accessAttemptLog.length,
      windowsNTAttempts: windowsAttempts.length,
      criticalAttempts: criticalAttempts.length,
      recentCritical: criticalAttempts.slice(-10),
      osBreakdown: this.getOSBreakdown(),
      suspiciousPatterns: this.getSuspiciousPatterns()
    };
  }

  /**
   * Get OS breakdown
   */
  private static getOSBreakdown() {
    const breakdown: Record<string, number> = {};
    this.accessAttemptLog.forEach(entry => {
      const os = entry.osFingerprint.split(' | ')[0]?.replace('OS: ', '') || 'Unknown';
      breakdown[os] = (breakdown[os] || 0) + 1;
    });
    return breakdown;
  }

  /**
   * Get suspicious patterns
   */
  private static getSuspiciousPatterns() {
    return this.accessAttemptLog
      .filter(entry => entry.riskLevel === 'CRITICAL')
      .map(entry => ({
        timestamp: entry.timestamp.toISOString(),
        ip: entry.ip,
        osFingerprint: entry.osFingerprint,
        walletAttempt: entry.walletAttempt,
        violations: entry.violations
      }));
  }
}