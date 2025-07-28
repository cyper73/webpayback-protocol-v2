# Token Allowance Management System

## Overview
Sistema di gestione automatica degli allowance per i token WPT del WebPayback Protocol, progettato per garantire rifornimenti automatici delle riserve token senza intervento manuale.

## Configurazione Attuale

### Parametri di Base
- **Max Allowance**: 2,000,000 WPT
- **Utilizzo Corrente**: 0% (0 WPT utilizzati)
- **Soglia di Ricarica**: 50,000 WPT
- **Importo Ricarica**: 500,000 WPT per operazione
- **Soglia di Allerta**: 100,000 WPT

### Indirizzi Configurati
- **Wallet Address**: 0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8
- **Contract Address**: 0x9408f17a8B4666f8cb8231BA213DE04137dc3825
- **Token Address**: 0x9408f17a8B4666f8cb8231BA213DE04137dc3825

## Funzionalità

### 1. Gestione Automatica Riserve
- Monitoraggio continuo del balance delle riserve token
- Ricarica automatica quando il balance scende sotto la soglia
- Protezione contro il drain delle riserve

### 2. Sicurezza Multi-Layer
- **Device Fingerprinting**: Solo Windows + Chrome/Firefox autorizzati
- **Wallet Validation**: Accesso limitato al wallet del founder
- **Session-Based Auth**: Protezione a livello di sessione
- **IDOR Protection**: Prevenzione accessi non autorizzati

### 3. Monitoraggio Sicurezza
- Tracciamento eventi di sicurezza
- Alert automatici per comportamenti anomali
- Log completo delle transazioni

## Database Schema

### allowance_management
- Configurazione principale degli allowance
- Soglie e parametri operativi
- Status e timestamp delle operazioni

### allowance_transactions
- Storico completo delle transazioni
- Hash, gas used, block number
- Status di conferma e eventuali errori

### reserve_pool_status
- Stato attuale delle riserve
- Distribuzione giornaliera/settimanale/mensile
- Proiezioni e livelli di allerta

### allowance_security
- Eventi di sicurezza rilevati
- Livelli di rischio e azioni intraprese
- Evidence e resolution tracking

## API Endpoints

### Configurazione
- `GET /api/allowance/config/:walletAddress` - Recupera configurazione
- `POST /api/allowance/setup` - Inizializza sistema allowance
- `PUT /api/allowance/update/:walletAddress` - Aggiorna parametri

### Monitoraggio
- `GET /api/allowance/dashboard/:walletAddress` - Dashboard completa
- `GET /api/allowance/transactions/:walletAddress` - Storico transazioni
- `GET /api/allowance/security/:walletAddress` - Eventi sicurezza

### Operazioni
- `POST /api/allowance/approve` - Approva allowance
- `POST /api/allowance/revoke` - Revoca allowance
- `POST /api/allowance/security-event` - Crea evento sicurezza

## Sicurezza e Accesso

### Accesso Founder-Only
Il sistema è progettato esclusivamente per l'accesso del founder del protocollo:
- Wallet: 0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8
- Device: Windows + Chrome/Firefox
- Tutti gli altri accessi vengono bloccati

### Protezioni Implementate
- Middleware di autenticazione su tutti gli endpoint
- Validazione wallet address su ogni richiesta
- Device fingerprinting per prevenire accessi da dispositivi non autorizzati
- Rate limiting e monitoraggio anomalie

## Status Implementazione

### ✅ Completato (28 Luglio 2025)
- Database schema completo e sincronizzato
- API backend completa con 8+ endpoints
- Frontend dashboard funzionante
- Sistema di sicurezza multi-layer attivo
- Configurazione iniziale salvata e testata
- Founder ha confermato funzionamento corretto

### 🔄 In Corso
- Monitoraggio automatico pool ogni 12 ore
- Alchemy API integration (192/1000 chiamate utilizzate)
- Pool TVL tracking: $1 USDT/WPT, €219 WMATIC/WPT

## Contatti
- Email: info@webpayback.com
- GitHub: https://github.com/cyper73/webpayback-protocol/tree/webpayback
- Domain: webpayback.com

---
*Documento aggiornato: 28 Luglio 2025*
*Sistema testato e confermato funzionante dal founder Claudio*