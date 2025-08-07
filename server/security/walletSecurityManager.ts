/**
 * Advanced Wallet Security Manager for WebPayback Protocol
 * - DEX wallet blacklisting
 * - High-frequency trading detection
 * - Founder wallet IP protection
 * - Automated reward abuse detection
 */

import { Request } from 'express';
import crypto from 'crypto';

// Known DEX wallet addresses (major exchanges and DEX contracts)
const DEX_BLACKLIST = [
  // Uniswap contracts
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
  '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3 Router
  '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // Uniswap V3 Router 2
  
  // Major CEX hot wallets
  '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3', // Binance hot wallet
  '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE', // Binance cold wallet
  '0x74de5d4FCbf63E00296fd95d33236B9794016631', // Binance wallet
  '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', // Binance wallet
  
  // PancakeSwap
  '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap Router
  '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F', // PancakeSwap Router
  
  // SushiSwap
  '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', // SushiSwap Router
  
  // 1inch
  '0x1111111254fb6c44bAC0beD2854e76F90643097d', // 1inch Router
  
  // Known bot/MEV addresses
  '0x00000000003b3cc22aF3aE1EAc0440BcEe416B40', // MEV bot
  '0x000000000dfDE7deaf24138722987c9a6991e2D4', // MEV bot
  
  // Add more as needed...
];

// High-frequency activity tracking
interface WalletActivity {
  address: string;
  requests: number[];
  rewards: number[];
  lastActivity: number;
  totalRewards: number;
  flaggedAsAbusive: boolean;
}

// Founder wallet configuration
const FOUNDER_WALLET_CONFIG = {
  address: process.env.FOUNDER_WALLET_ADDRESS || '',
  authorizedIPs: [
    '185.84.84.155',    // IP attuale founder
    '185.84.86.163',    // IP backup founder
    '127.0.0.1',        // Localhost
    'localhost'
  ]
};

class WalletSecurityManager {
  private walletActivity: Map<string, WalletActivity> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  
  // Frequency limits (per hour)
  private readonly LIMITS = {
    MAX_REGISTRATION_REQUESTS: 5,    // Max 5 registrations per hour per wallet
    MAX_REWARD_CLAIMS: 10,           // Max 10 reward claims per hour
    MAX_TRADING_OPERATIONS: 50,      // Max 50 trading ops per hour
    SUSPICIOUS_THRESHOLD: 100        // Flag if over 100 requests/hour
  };

  /**
   * Check if wallet is blacklisted (DEX/CEX addresses)
   */
  isWalletBlacklisted(walletAddress: string): boolean {
    const normalizedAddress = walletAddress.toLowerCase();
    return DEX_BLACKLIST.some(blacklisted => 
      blacklisted.toLowerCase() === normalizedAddress
    );
  }

  /**
   * Validate founder wallet access from authorized IP only
   */
  validateFounderWalletAccess(walletAddress: string, clientIP: string): {
    isValid: boolean;
    reason?: string;
  } {
    const founderWallet = FOUNDER_WALLET_CONFIG.address.toLowerCase();
    const requestWallet = walletAddress.toLowerCase();
    
    // Not founder wallet - allow (will be handled by other checks)
    if (requestWallet !== founderWallet) {
      return { isValid: true };
    }
    
    // Founder wallet - must be from authorized IP
    const isAuthorizedIP = FOUNDER_WALLET_CONFIG.authorizedIPs.some(ip => 
      clientIP.includes(ip) || ip === clientIP
    );
    
    if (!isAuthorizedIP) {
      return {
        isValid: false,
        reason: `FOUNDER_WALLET_UNAUTHORIZED_IP: ${clientIP}`
      };
    }
    
    return { isValid: true };
  }

  /**
   * Track wallet activity and detect high-frequency abuse
   */
  trackWalletActivity(walletAddress: string, operation: 'registration' | 'reward' | 'trading'): {
    allowed: boolean;
    reason?: string;
    riskScore: number;
  } {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000); // 1 hour ago
    
    if (!this.walletActivity.has(walletAddress)) {
      this.walletActivity.set(walletAddress, {
        address: walletAddress,
        requests: [],
        rewards: [],
        lastActivity: now,
        totalRewards: 0,
        flaggedAsAbusive: false
      });
    }
    
    const activity = this.walletActivity.get(walletAddress)!;
    
    // Clean old requests (older than 1 hour)
    activity.requests = activity.requests.filter(time => time > hourAgo);
    activity.rewards = activity.rewards.filter(time => time > hourAgo);
    
    // Add current request
    activity.requests.push(now);
    activity.lastActivity = now;
    
    if (operation === 'reward') {
      activity.rewards.push(now);
      activity.totalRewards++;
    }
    
    // Calculate risk score
    const recentRequests = activity.requests.length;
    const recentRewards = activity.rewards.length;
    
    let riskScore = 0;
    riskScore += Math.min(recentRequests / this.LIMITS.MAX_REGISTRATION_REQUESTS, 2) * 30;
    riskScore += Math.min(recentRewards / this.LIMITS.MAX_REWARD_CLAIMS, 2) * 40;
    
    // High frequency detection
    if (recentRequests > this.LIMITS.SUSPICIOUS_THRESHOLD) {
      activity.flaggedAsAbusive = true;
      return {
        allowed: false,
        reason: `HIGH_FREQUENCY_ABUSE: ${recentRequests} requests/hour`,
        riskScore: 100
      };
    }
    
    // Reward farming detection
    if (recentRewards > this.LIMITS.MAX_REWARD_CLAIMS) {
      return {
        allowed: false,
        reason: `REWARD_FARMING_DETECTED: ${recentRewards} claims/hour`,
        riskScore: 95
      };
    }
    
    // Registration spam detection
    if (operation === 'registration' && recentRequests > this.LIMITS.MAX_REGISTRATION_REQUESTS) {
      return {
        allowed: false,
        reason: `REGISTRATION_SPAM: ${recentRequests} attempts/hour`,
        riskScore: 85
      };
    }
    
    return {
      allowed: true,
      riskScore: Math.min(riskScore, 100)
    };
  }

  /**
   * Get wallet security status
   */
  getWalletSecurityStatus(walletAddress: string) {
    const activity = this.walletActivity.get(walletAddress);
    const isBlacklisted = this.isWalletBlacklisted(walletAddress);
    
    return {
      address: walletAddress,
      isBlacklisted,
      activity: activity || null,
      securityFlags: {
        isFounderWallet: walletAddress.toLowerCase() === FOUNDER_WALLET_CONFIG.address.toLowerCase(),
        isFlagged: activity?.flaggedAsAbusive || false,
        recentActivity: activity?.requests.length || 0,
        totalRewards: activity?.totalRewards || 0
      }
    };
  }

  /**
   * Enhanced request validation for wallet operations
   */
  validateWalletRequest(req: Request, operation: 'registration' | 'reward' | 'trading'): {
    allowed: boolean;
    reason?: string;
    riskScore: number;
    securityHeaders: Record<string, string>;
  } {
    const walletAddress = req.headers['x-verified-wallet'] as string;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // No wallet provided - allow for public registrations
    if (!walletAddress && operation === 'registration') {
      return {
        allowed: true,
        riskScore: 0,
        securityHeaders: {
          'X-Security-Status': 'PUBLIC_REGISTRATION_ALLOWED'
        }
      };
    }
    
    if (!walletAddress) {
      return {
        allowed: false,
        reason: 'MISSING_WALLET_ADDRESS',
        riskScore: 50,
        securityHeaders: {
          'X-Security-Status': 'WALLET_REQUIRED'
        }
      };
    }
    
    // Check DEX blacklist
    if (this.isWalletBlacklisted(walletAddress)) {
      return {
        allowed: false,
        reason: 'WALLET_BLACKLISTED_DEX',
        riskScore: 100,
        securityHeaders: {
          'X-Security-Status': 'BLACKLISTED',
          'X-Blacklist-Reason': 'DEX_WALLET_DETECTED'
        }
      };
    }
    
    // Founder wallet IP validation
    const founderValidation = this.validateFounderWalletAccess(walletAddress, clientIP);
    if (!founderValidation.isValid) {
      return {
        allowed: false,
        reason: founderValidation.reason!,
        riskScore: 100,
        securityHeaders: {
          'X-Security-Status': 'FOUNDER_IP_VIOLATION',
          'X-Client-IP': clientIP
        }
      };
    }
    
    // High-frequency abuse detection
    const activityCheck = this.trackWalletActivity(walletAddress, operation);
    
    return {
      allowed: activityCheck.allowed,
      reason: activityCheck.reason,
      riskScore: activityCheck.riskScore,
      securityHeaders: {
        'X-Security-Status': activityCheck.allowed ? 'APPROVED' : 'BLOCKED',
        'X-Risk-Score': activityCheck.riskScore.toString(),
        'X-Wallet-Status': this.getWalletSecurityStatus(walletAddress).securityFlags.isFlagged ? 'FLAGGED' : 'CLEAN'
      }
    };
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    const totalTrackedWallets = this.walletActivity.size;
    const flaggedWallets = Array.from(this.walletActivity.values())
      .filter(activity => activity.flaggedAsAbusive).length;
    
    const recentActivity = Array.from(this.walletActivity.values())
      .reduce((total, activity) => total + activity.requests.length, 0);
    
    return {
      totalTrackedWallets,
      flaggedWallets,
      recentActivity,
      blacklistedAddresses: DEX_BLACKLIST.length,
      founderWalletProtected: !!FOUNDER_WALLET_CONFIG.address,
      securityLevel: 'MAXIMUM'
    };
  }
}

export const walletSecurityManager = new WalletSecurityManager();
export { WalletSecurityManager };