import { ethers } from 'ethers';
import crypto from 'crypto';

/**
 * WALLET CRYPTOGRAPHIC VERIFICATION SERVICE
 * Prevents wallet address spoofing by requiring cryptographic signature proof
 */

export class WalletVerificationService {
  
  /**
   * Generate a random verification message for wallet signing
   */
  generateVerificationMessage(walletAddress: string): { message: string; timestamp: number } {
    const timestamp = Date.now();
    const randomCode = crypto.randomBytes(16).toString('hex');
    
    const message = `WebPayback Protocol - Wallet Ownership Verification

By signing this message, you prove ownership of your wallet address.

Wallet Address: ${walletAddress}
Verification Code: ${randomCode}
Timestamp: ${timestamp}

This signature does not authorize any transactions.`;
    
    return { message, timestamp };
  }

  /**
   * Verify that the signature matches the wallet address and message
   */
  async verifyWalletSignature(
    walletAddress: string, 
    message: string, 
    signature: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      console.log('🔐 Verifying wallet signature...');
      console.log('🔐 Wallet:', walletAddress);
      console.log('🔐 Message length:', message.length);
      console.log('🔐 Signature:', signature.substring(0, 20) + '...');

      // Normalize wallet address (remove 0x and make lowercase for comparison)
      const normalizedAddress = walletAddress.toLowerCase().replace('0x', '');
      
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      console.log('🔐 Recovered address:', recoveredAddress);
      
      // Compare addresses (case-insensitive)
      const recoveredNormalized = recoveredAddress.toLowerCase().replace('0x', '');
      
      if (normalizedAddress === recoveredNormalized) {
        console.log('✅ Wallet signature verification SUCCESS');
        return { isValid: true };
      } else {
        console.log('❌ Wallet signature verification FAILED - address mismatch');
        return { 
          isValid: false, 
          error: 'Signature does not match wallet address' 
        };
      }
      
    } catch (error) {
      console.error('❌ Wallet signature verification ERROR:', error);
      return { 
        isValid: false, 
        error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Check if verification message is still valid (not expired)
   */
  isVerificationMessageValid(message: string, maxAgeMinutes: number = 10): boolean {
    try {
      // Extract timestamp from message
      const timestampMatch = message.match(/Timestamp: (\d+)/);
      if (!timestampMatch) {
        return false;
      }
      
      const messageTimestamp = parseInt(timestampMatch[1]);
      const now = Date.now();
      const ageInMinutes = (now - messageTimestamp) / (1000 * 60);
      
      return ageInMinutes <= maxAgeMinutes;
      
    } catch (error) {
      console.error('❌ Verification message validation error:', error);
      return false;
    }
  }

  /**
   * Validate wallet address format
   */
  isValidWalletAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Get verification status summary
   */
  getVerificationSummary(creator: any): {
    hasSignature: boolean;
    isSignatureValid: boolean;
    isMessageExpired: boolean;
    canProceed: boolean;
    statusMessage: string;
  } {
    const hasSignature = !!(creator.walletSignature && creator.verificationMessage);
    const isSignatureValid = creator.signatureVerified || false;
    
    let isMessageExpired = false;
    if (creator.verificationMessage) {
      isMessageExpired = !this.isVerificationMessageValid(creator.verificationMessage, 60); // 1 hour expiry
    }
    
    const canProceed = hasSignature && isSignatureValid && !isMessageExpired;
    
    let statusMessage = '';
    if (!hasSignature) {
      statusMessage = 'Wallet signature required for verification';
    } else if (!isSignatureValid) {
      statusMessage = 'Invalid wallet signature';
    } else if (isMessageExpired) {
      statusMessage = 'Verification message expired - please sign again';
    } else {
      statusMessage = 'Wallet successfully verified';
    }
    
    return {
      hasSignature,
      isSignatureValid,
      isMessageExpired,
      canProceed,
      statusMessage
    };
  }
}

export const walletVerificationService = new WalletVerificationService();