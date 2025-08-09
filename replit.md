# WebPayback Protocol - Replit Deployment Guide

## 🚀 Quick Start

1. **Fork this Repl** o importa il repository
2. **Run** - Il progetto si avvierà automaticamente con `npm run dev`
3. **Accedi** - La tua app sarà disponibile all'URL pubblico di Replit

## 🔧 Configurazione Porte

### Configurazione Attuale (.replit)
```toml
[[ports]]
localPort = 5000      # Porta INTERNA dell'app
externalPort = 80     # Porta ESTERNA (accesso pubblico)
```

### 📋 Dettagli Configurazione
- **🌐 Porta Principale**: 5000
  - Porta Interna: 5000 (dove gira l'app Express)
  - Porta Esterna: 80 (mappata automaticamente)
  - Accesso: La tua app è raggiungibile senza specificare la porta

### ⚡ Server Express
```typescript
// server/index.ts
// ALWAYS serve the app on port 5000
const port = 5000;
const host = process.platform === 'win32' ? 'localhost' : '0.0.0.0';
server.listen({ port, host }, () => {
  log(`serving on ${host}:${port}`);
});
```

### 🚀 Come Funziona
- **Internamente**: App gira su localhost:5000
- **Esternamente**: Accessibile tramite il dominio Replit senza porta
- **URL pubblico**: `https://[replit-domain].replit.dev/`

## 🔒 CORS Configurazione

Il server è già configurato per accettare richieste dai domini Replit:

```typescript
const allowedOrigins = [
  'https://web-payback-tokenizer.replit.app',
  'https://webpayback.replit.app',
  'https://webpayback.com',
  'https://www.webpayback.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000'
];
```

## 📊 Workflow Setup

Il file `.replit` include la configurazione del workflow:

```toml
[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run dev"
waitForPort = 5000      # Aspetta che la porta 5000 sia attiva
```

## 📱 Porte Alternative Disponibili

Replit supporta anche: 3000, 3001, 3002, 3003, 4200, 5000, 5173, 6000, 6800, 8000, 8008, 8080, 8081

## 🔧 Variabili d'Ambiente

Configura le seguenti variabili nei **Secrets** di Replit:

```bash
# Database (opzionale - usa mock se non configurato)
DATABASE_URL=postgresql://...

# Blockchain
PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_id

# API Keys
QLOO_API_KEY=your_qloo_key
CHAINLINK_API_KEY=your_chainlink_key
```

## 🚀 Deployment

### Automatico
1. Il progetto si avvia automaticamente quando apri il Repl
2. Usa `npm run dev` per lo sviluppo
3. Usa `npm run build && npm start` per la produzione

### Manuale
```bash
# Installa dipendenze
npm install

# Avvia in modalità sviluppo
npm run dev

# Build per produzione
npm run build

# Avvia produzione
npm start
```

## 🔍 Troubleshooting

### Porta non disponibile
- Verifica che la porta 5000 non sia già in uso
- Controlla i log del console per errori

### CORS Errors
- Aggiungi il tuo dominio Replit alla lista `allowedOrigins`
- Verifica che l'URL sia corretto (https vs http)

### Database Connection
- Il progetto usa un database mock se `DATABASE_URL` non è configurato
- Configura `DATABASE_URL` nei Secrets per usare un database reale

## Overview

WebPayback Protocol is a sophisticated decentralized application (dApp) that combines advanced AI agent orchestration with multi-chain blockchain deployment capabilities. The platform features a comprehensive creator economy system where content creators can register, verify their work, and receive automatic rewards when AI systems use their content. The protocol operates on multiple blockchain networks with a focus on Polygon mainnet, featuring the WPT (WebPayback Token) as its native currency and implements advanced security measures including 2FA authentication, anti-fraud systems, and pool drain protection.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 9, 2025)

- **TOKEN V2 MIGRATION COMPLETED**: Eliminated all V1 token references (0x9077051D318b614F915E8A07861090856FDEC91e) from entire system
- **Multi-Chain Deployment Module Fixed**: Updated database to display correct V2 token address (0x9408f17a8B4666f8cb8231BA213DE04137dc3825)
- **Environment Variables Updated**: POLYGON_TOKEN_ADDRESS secret configured with V2 token address
- **GitHub Repository Updated**: All links now point to https://github.com/cyper73/webpayback-public
- **PROFESSIONAL EMAIL MIGRATION COMPLETED**: All contact addresses migrated from cyper73@gmail.com to info@webpayback.com across entire platform including Contact & Support section, CCPA/GDPR compliance routes, and documentation
- **Backup Maintained**: WEBPAYBACK-V2-FUNZIONANTE directory kept current with all changes

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type-safe development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI primitives with shadcn/ui components for consistent design system
- **Styling**: Tailwind CSS with custom WebPayback theme, featuring dark mode with electric blue, neon green, and cyber purple accent colors
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using TypeScript and ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (@neondatabase/serverless) for scalable cloud database hosting
- **Session Management**: PostgreSQL-based sessions using connect-pg-simple for persistent session storage
- **API Design**: RESTful API architecture with comprehensive input validation and sanitization
- **Security**: Multi-layer security including CORS protection, CSRF tokens, input validation, and rate limiting

### Blockchain Integration
- **Multi-Chain Support**: Native deployment capabilities for Ethereum, BSC, Polygon, and Arbitrum networks
- **Smart Contract Management**: Automated token deployment and management with Hardhat framework
- **Web3 Integration**: Ethers.js for blockchain interactions with Alchemy SDK for enhanced functionality
- **Gas Optimization**: Sophisticated gas management system with emergency protections and founder wallet exceptions
- **Token Standards**: Full ERC-20 compliance with WPT v2 token featuring reduced fees (0.1% vs 3% in v1)

### AI Agent System
- **Multi-Agent Architecture**: Four specialized AI agents (WebPayback, Autoregolator, PoolAgent, TransparentAgent) with inter-agent communication
- **Performance Monitoring**: Real-time metrics tracking with accuracy and uptime monitoring
- **Expertise Levels**: Level 280 AI agents with domain-specific capabilities
- **Communication Protocol**: Structured messaging system between agents for coordinated operations

### Development Environment
- **Monorepo Structure**: Shared TypeScript schemas between client and server for consistency
- **Hot Reloading**: Vite dev server with Express middleware integration for rapid development
- **Type Safety**: Comprehensive TypeScript configuration with path aliases and strict type checking
- **Database Migrations**: Drizzle Kit for automated schema management and migrations

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with schema validation

### Blockchain Infrastructure
- **Alchemy SDK**: Enhanced Ethereum/Polygon network interactions and analytics
- **Ethers.js**: Core Web3 library for smart contract interactions
- **Hardhat**: Development environment for smart contract compilation, deployment, and testing

### API Integrations
- **Chainlink**: Price feeds and automation services for reliable oracle data
- **Uniswap V3**: Decentralized exchange integration for liquidity management
- **TokenSniffer**: Smart contract security scanning and verification

### Authentication & Security
- **Speakeasy**: TOTP-based two-factor authentication implementation
- **QRCode**: QR code generation for 2FA setup
- **Crypto Module**: Built-in Node.js cryptographic functions for secure operations

### Development Tools
- **Vite**: Modern build tool with HMR and optimized bundling
- **TypeScript**: Static type checking across the entire application stack
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Zod**: Runtime type validation for API requests and responses

### Monitoring & Analytics
- **Custom Analytics**: Internal tracking system for user behavior and system performance
- **Security Forensics**: IP-based threat detection and access control systems
- **Pool Health Monitoring**: Real-time TVL tracking and reward scaling based on liquidity health