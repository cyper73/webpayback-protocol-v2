import { Request, Response, NextFunction } from 'express';
import { twoFactorAuthService } from '../services/twoFactorAuth';
import { storage } from '../storage';

// Extend Express Request type to include 2FA info
declare global {
  namespace Express {
    interface Request {
      creator?: any;
      requires2FA?: boolean;
      twoFactorPassed?: boolean;
    }
  }
}

export interface TwoFactorMiddlewareOptions {
  requireFor?: 'all' | 'sensitive' | 'admin';
  sensitiveActions?: string[];
  skipIfNoSecret?: boolean;
}

/**
 * Middleware to enforce 2FA for sensitive operations
 */
export function require2FA(options: TwoFactorMiddlewareOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        requireFor = 'sensitive',
        sensitiveActions = ['create', 'update', 'delete', 'transfer', 'mint', 'claim'],
        skipIfNoSecret = false
      } = options;

      // Get creator from session or request
      const creatorId = req.session?.user?.id || req.body?.creatorId || req.params?.creatorId;
      
      if (!creatorId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          requires2FA: false
        });
      }

      // Get creator info with 2FA settings
      const creator = await storage.getCreator(creatorId);
      if (!creator) {
        return res.status(404).json({
          success: false,
          error: 'Creator not found'
        });
      }

      req.creator = creator;

      // Check if 2FA is required for this operation
      const is2FARequired = should2FABeRequired(req, requireFor, sensitiveActions);
      req.requires2FA = is2FARequired;

      // If 2FA is not required, continue
      if (!is2FARequired) {
        return next();
      }

      // If creator doesn't have 2FA setup and we allow skipping
      if (!creator.twoFactorEnabled && skipIfNoSecret) {
        console.log(`⚠️ 2FA required but not setup for creator ${creatorId}, allowing due to skipIfNoSecret`);
        return next();
      }

      // If creator doesn't have 2FA setup but it's required
      if (!creator.twoFactorEnabled) {
        return res.status(403).json({
          success: false,
          error: '2FA setup required for this operation',
          requires2FA: true,
          setup2FA: true,
          message: 'Please setup Two-Factor Authentication to access sensitive features'
        });
      }

      // Check for 2FA token in request
      const twoFactorToken = req.headers['x-2fa-token'] as string || req.body?.twoFactorToken;
      const backupCode = req.headers['x-backup-code'] as string || req.body?.backupCode;

      if (!twoFactorToken && !backupCode) {
        return res.status(403).json({
          success: false,
          error: '2FA token required',
          requires2FA: true,
          message: 'Please provide your 2FA token or backup code'
        });
      }

      let verification;
      let usedBackupCode = false;

      // Verify 2FA token or backup code
      if (backupCode && creator.twoFactorBackupCodes) {
        verification = twoFactorAuthService.verifyBackupCode(backupCode, creator.twoFactorBackupCodes);
        usedBackupCode = verification.wasBackupCode || false;
      } else if (twoFactorToken && creator.twoFactorSecret) {
        verification = twoFactorAuthService.verifyTwoFactorToken(creator.twoFactorSecret, twoFactorToken);
      } else {
        return res.status(403).json({
          success: false,
          error: 'Invalid 2FA configuration',
          requires2FA: true
        });
      }

      if (!verification.isValid) {
        console.log(`❌ 2FA verification failed for creator ${creatorId}: ${verification.error}`);
        return res.status(403).json({
          success: false,
          error: verification.error || '2FA verification failed',
          requires2FA: true
        });
      }

      // If backup code was used, remove it from available codes
      if (usedBackupCode && backupCode && creator.twoFactorBackupCodes) {
        const updatedBackupCodes = creator.twoFactorBackupCodes.filter(code => 
          code !== backupCode.replace(/[\s-]/g, '').toUpperCase()
        );
        
        await storage.updateCreator(creatorId, {
          twoFactorBackupCodes: updatedBackupCodes,
          lastTwoFactorUsed: new Date()
        });

        console.log(`🔐 Backup code used and removed for creator ${creatorId}. ${updatedBackupCodes.length} codes remaining.`);
      } else {
        // Update last 2FA use timestamp
        await storage.updateCreator(creatorId, {
          lastTwoFactorUsed: new Date()
        });
      }

      req.twoFactorPassed = true;
      console.log(`✅ 2FA verification successful for creator ${creatorId}`);
      next();

    } catch (error) {
      console.error('2FA middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during 2FA verification'
      });
    }
  };
}

/**
 * Determine if 2FA should be required for this request
 */
function should2FABeRequired(
  req: Request, 
  requireFor: string, 
  sensitiveActions: string[]
): boolean {
  // Always require for admin operations
  if (requireFor === 'admin' || req.path.includes('/admin/')) {
    return true;
  }

  // Always require for all operations
  if (requireFor === 'all') {
    return true;
  }

  // Check for sensitive operations
  if (requireFor === 'sensitive') {
    const method = req.method.toLowerCase();
    const path = req.path.toLowerCase();
    
    // High-value operations that always need 2FA
    const criticalPaths = [
      '/api/rewards/claim',
      '/api/content-certificate/mint',
      '/api/creators/wallet/update',
      '/api/allowance/transfer',
      '/api/pool/emergency'
    ];

    if (criticalPaths.some(criticalPath => path.includes(criticalPath))) {
      return true;
    }

    // Check if method matches sensitive actions
    if (method === 'post' && sensitiveActions.includes('create')) return true;
    if (method === 'put' && sensitiveActions.includes('update')) return true;
    if (method === 'patch' && sensitiveActions.includes('update')) return true;
    if (method === 'delete' && sensitiveActions.includes('delete')) return true;

    // Check for sensitive keywords in path
    const sensitiveKeywords = ['claim', 'mint', 'transfer', 'withdraw', 'emergency'];
    if (sensitiveKeywords.some(keyword => path.includes(keyword))) {
      return true;
    }
  }

  return false;
}

/**
 * Optional 2FA middleware - suggests 2FA but doesn't enforce it
 */
export function suggest2FA() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const creatorId = req.session?.user?.id;
      if (!creatorId) return next();

      const creator = await storage.getCreator(creatorId);
      if (!creator || creator.twoFactorEnabled) return next();

      // Add suggestion header
      res.set('X-2FA-Suggestion', 'Setup 2FA for enhanced security');
      res.set('X-2FA-Setup-URL', '/creator-portal/security/2fa-setup');
      
      next();
    } catch (error) {
      // Don't block request if suggestion fails
      next();
    }
  };
}

export default require2FA;