import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export interface TwoFactorConfig {
  secret: string;
  qrCodeUrl: string;
  manualEntryCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  error?: string;
  wasBackupCode?: boolean;
}

export class TwoFactorAuthService {
  private readonly SERVICE_NAME = 'WebPayback Protocol';
  
  /**
   * Generate a new 2FA secret and QR code for a user
   */
  async generateTwoFactorSecret(userEmail: string, userName?: string): Promise<TwoFactorConfig> {
    try {
      // Generate a new secret
      const secret = speakeasy.generateSecret({
        name: `${this.SERVICE_NAME} (${userEmail})`,
        issuer: this.SERVICE_NAME,
        length: 32 // 32 character secret for extra security
      });

      if (!secret.base32) {
        throw new Error('Failed to generate secret');
      }

      // Generate QR code for easy setup
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');
      
      // Generate backup codes (10 single-use codes)
      const backupCodes = this.generateBackupCodes(10);

      console.log(`🔐 Generated 2FA secret for user: ${userEmail}`);
      
      return {
        secret: secret.base32,
        qrCodeUrl,
        manualEntryCode: secret.base32,
        backupCodes
      };
    } catch (error) {
      console.error('2FA secret generation error:', error);
      throw new Error('Failed to generate 2FA configuration');
    }
  }

  /**
   * Verify a 2FA token from user's authenticator app
   */
  verifyTwoFactorToken(secret: string, token: string, window?: number): TwoFactorVerification {
    try {
      if (!secret || !token) {
        return {
          isValid: false,
          error: '2FA secret and token are required'
        };
      }

      // Clean the token (remove spaces, hyphens)
      const cleanToken = token.replace(/[\s-]/g, '');
      
      // Verify the token
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: cleanToken,
        window: window || 2, // Allow 2 time steps before/after for clock drift
        step: 30 // 30 second window
      });

      if (verified) {
        console.log('✅ 2FA token verified successfully');
        return { isValid: true };
      } else {
        console.log('❌ 2FA token verification failed');
        return {
          isValid: false,
          error: 'Invalid 2FA token. Please check your authenticator app.'
        };
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      return {
        isValid: false,
        error: 'Failed to verify 2FA token'
      };
    }
  }

  /**
   * Verify a backup code
   */
  verifyBackupCode(providedCode: string, validBackupCodes: string[]): TwoFactorVerification {
    try {
      const cleanCode = providedCode.replace(/[\s-]/g, '').toUpperCase();
      
      if (validBackupCodes.includes(cleanCode)) {
        console.log('✅ Backup code verified successfully');
        return { 
          isValid: true, 
          wasBackupCode: true 
        };
      } else {
        return {
          isValid: false,
          error: 'Invalid backup code'
        };
      }
    } catch (error) {
      console.error('Backup code verification error:', error);
      return {
        isValid: false,
        error: 'Failed to verify backup code'
      };
    }
  }

  /**
   * Generate secure backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    for (let i = 0; i < count; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Format as XXXX-XXXX for readability
      const formattedCode = code.substring(0, 4) + '-' + code.substring(4);
      codes.push(formattedCode);
    }
    
    return codes;
  }

  /**
   * Generate a current TOTP token (for testing/development)
   */
  generateCurrentToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32'
    });
  }

  /**
   * Check if 2FA is properly configured for a user
   */
  is2FAConfigured(twoFactorSecret?: string, twoFactorEnabled?: boolean): boolean {
    return !!(twoFactorSecret && twoFactorEnabled);
  }

  /**
   * Validate 2FA setup by requiring a token verification
   */
  async validateSetup(secret: string, verificationToken: string): Promise<boolean> {
    const result = this.verifyTwoFactorToken(secret, verificationToken);
    return result.isValid;
  }

  /**
   * Get setup instructions for users
   */
  getSetupInstructions(): {
    steps: string[];
    recommendedApps: string[];
    troubleshooting: string[];
  } {
    return {
      steps: [
        'Install a 2FA app like Google Authenticator, Authy, or Microsoft Authenticator',
        'Scan the QR code with your authenticator app',
        'If you cannot scan, manually enter the secret code',
        'Enter the 6-digit code from your app to verify setup',
        'Save your backup codes in a secure location'
      ],
      recommendedApps: [
        'Google Authenticator (Free)',
        'Authy (Free, supports backup)',
        'Microsoft Authenticator (Free)',
        '1Password (Paid, integrated password manager)',
        'Bitwarden (Free/Paid, integrated password manager)'
      ],
      troubleshooting: [
        'Make sure your device time is synchronized',
        'Try generating a new code if the current one doesn\'t work',
        'Use backup codes if your authenticator is unavailable',
        'Contact support if you\'ve lost access to both your device and backup codes'
      ]
    };
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();