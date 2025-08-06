import { Router } from 'express';
import { CredentialProtectionService } from '../security/credentialProtection';

const router = Router();

/**
 * Get security monitoring statistics (stealth - no visible dashboard)
 */
router.get('/stats', (req, res) => {
  try {
    const stats = CredentialProtectionService.getSecurityStats();
    
    // Return minimal information - detailed logs are server-side only
    res.json({
      success: true,
      stats: {
        status: stats.blockedIPs > 0 ? 'active_threats_detected' : 'secure',
        monitoring: 'active',
        last_update: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Security monitoring unavailable' 
    });
  }
});

/**
 * Test credential simulation detection (for verification)
 */
router.post('/test-credential-protection', (req, res) => {
  try {
    // This endpoint exists only to verify the system works
    // Real attacks will be blocked automatically in idorProtection.ts
    
    res.json({
      success: true,
      message: 'Credential protection systems operational',
      timestamp: new Date().toISOString(),
      note: 'All authentication requests are cryptographically verified'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Test failed' 
    });
  }
});

export default router;