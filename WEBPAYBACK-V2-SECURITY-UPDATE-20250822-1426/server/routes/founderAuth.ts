import { Router } from 'express';
import { CredentialProtectionService } from '../security/credentialProtection';

const router = Router();

// Test endpoint per verificare l'autorizzazione IP del founder
router.get('/ip-check', (req, res) => {
  try {
    const ipValidation = CredentialProtectionService.validateFounderIP(req);
    
    res.json({
      success: true,
      ipAuthorization: {
        isAuthorized: ipValidation.isAuthorized,
        detectedIP: ipValidation.detectedIP,
        reason: ipValidation.reason,
        timestamp: new Date().toISOString()
      },
      message: ipValidation.isAuthorized 
        ? 'IP autorizzato per accesso founder' 
        : 'IP non autorizzato per accesso founder'
    });
  } catch (error) {
    console.error('Errore nel controllo IP founder:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno nel controllo autorizzazione IP'
    });
  }
});

// Endpoint per ottenere la lista degli IP autorizzati (solo per debugging)
router.get('/authorized-ips', (req, res) => {
  try {
    const authorizedIPs = (process.env.FOUNDER_AUTHORIZED_IPS || '127.0.0.1,localhost,::1')
      .split(',')
      .map(ip => ip.trim());
    
    res.json({
      success: true,
      authorizedIPs,
      founderWallet: process.env.FOUNDER_WALLET_ADDRESS || 'Non configurato',
      message: 'Lista IP autorizzati per il founder'
    });
  } catch (error) {
    console.error('Errore nel recupero IP autorizzati:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno nel recupero configurazione'
    });
  }
});

// Endpoint per simulare l'inserimento del wallet founder con controllo IP
router.post('/wallet-insert', (req, res) => {
  try {
    const { walletAddress } = req.body;
    const founderWallet = process.env.FOUNDER_WALLET_ADDRESS;
    
    // Controllo autorizzazione IP
    const ipValidation = CredentialProtectionService.validateFounderIP(req);
    
    if (!ipValidation.isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Accesso negato: IP non autorizzato per inserimento wallet founder',
        details: {
          detectedIP: ipValidation.detectedIP,
          reason: ipValidation.reason
        }
      });
    }
    
    // Controllo che il wallet sia quello del founder
    if (!walletAddress || walletAddress.toLowerCase() !== founderWallet?.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address non valido o non corrispondente al founder'
      });
    }
    
    // Simulazione inserimento riuscito
    res.json({
      success: true,
      message: 'Wallet founder inserito con successo',
      details: {
        walletAddress,
        authorizedIP: ipValidation.detectedIP,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Errore nell\'inserimento wallet founder:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno nell\'inserimento wallet'
    });
  }
});

export default router;