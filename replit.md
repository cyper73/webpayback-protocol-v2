# WebPayback Protocol

## Overview

WebPayback Protocol is a sophisticated decentralized application (dApp) that combines advanced AI agent orchestration with multi-chain blockchain deployment capabilities. The platform features a comprehensive dashboard for managing AI agents, blockchain networks, creator rewards, and compliance monitoring. Built with a modern full-stack architecture, it emphasizes real-time interactions, token economics, and transparent governance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom WebPayback theme (dark mode focused)
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: PostgreSQL-based sessions (connect-pg-simple)
- **API Design**: RESTful API with typed schemas

### Development Environment
- **Monorepo Structure**: Shared schemas between client and server
- **Hot Reloading**: Vite dev server with Express middleware integration
- **Type Safety**: Comprehensive TypeScript configuration with path aliases
- **Database Migrations**: Drizzle Kit for schema management

## Key Components

### AI Agent System
- **Agent Types**: Four specialized AI agents (WebPayback, Autoregolator, PoolAgent, TransparentAgent)
- **Communication**: Real-time inter-agent messaging system
- **Metrics Tracking**: Performance monitoring with accuracy and uptime metrics
- **Expertise Levels**: Level 280 AI agents with specialized capabilities

### Blockchain Infrastructure
- **Multi-Chain Support**: Ethereum, BSC, Polygon, Arbitrum deployment capabilities
- **Smart Contract Management**: Automated token deployment and management
- **Network Monitoring**: Real-time deployment status tracking
- **Gas Optimization**: Efficient transaction management

### Creator Economy
- **Creator Portal**: Registration and verification system
- **Content Tracking**: AI-powered content monitoring and categorization
- **Reward Distribution**: Automated token distribution based on performance
- **Wallet Integration**: Multi-chain wallet address management

### Compliance & Governance
- **Automated Auditing**: AI-powered compliance monitoring
- **Transparency Reports**: Real-time audit trails and scoring
- **Legal Framework**: Automated legal compliance checking
- **Security Audits**: Continuous security assessment

## Data Flow

### Client-Server Communication
1. **Frontend** makes API requests to Express server
2. **Server** processes requests through typed route handlers
3. **Database** operations via Drizzle ORM with PostgreSQL
4. **Real-time Updates** through periodic API polling (React Query)

### AI Agent Workflow
1. **Agent Initialization** triggers specialized AI agent setup
2. **Inter-Agent Communication** enables collaborative decision-making
3. **Metrics Collection** tracks performance and accuracy
4. **Dashboard Updates** provide real-time agent status

### Blockchain Deployment Flow
1. **Network Selection** from supported chains
2. **Smart Contract Compilation** and deployment simulation
3. **Transaction Monitoring** with gas usage tracking
4. **Status Updates** through deployment pipeline

## External Dependencies

### Core Technologies
- **React Ecosystem**: React 18, React Query, React Hook Form
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, PostCSS, class-variance-authority
- **Database**: Neon PostgreSQL, Drizzle ORM
- **Validation**: Zod for runtime type checking

### Development Tools
- **Build System**: Vite with React plugin
- **TypeScript**: Strict mode with comprehensive type checking
- **Replit Integration**: Runtime error overlay and development banner
- **Code Quality**: ESLint-ready configuration

### Blockchain Integration
- **Multi-Chain Support**: Ethereum, BSC, Polygon, Arbitrum
- **Wallet Connectivity**: Prepared for Web3 wallet integration
- **Smart Contracts**: Ready for token deployment and management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API
- **Hot Module Replacement**: Instant updates during development
- **Error Handling**: Runtime error overlays and comprehensive logging
- **Database**: Neon PostgreSQL with connection pooling

### Production Deployment
- **Build Process**: Vite builds client, esbuild bundles server
- **Static Assets**: Client built to `dist/public` directory
- **Server Bundle**: ESM format with external package handling
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection

### Database Management
- **Schema Migrations**: Drizzle Kit for version control
- **Connection Pooling**: Neon serverless connection management
- **WebSocket Support**: Configured for real-time capabilities
- **Backup Strategy**: Managed by Neon Database service

The architecture emphasizes modularity, type safety, and real-time capabilities while maintaining a clean separation between frontend presentation, backend logic, and data persistence layers.

## Recent Changes

- Successfully deployed with autoscale infrastructure (4 vCPU/8GB RAM, up to 3 machines)
- Implemented REAL AI monitoring system that detects actual AI bot access and automatically distributes WPT rewards
- MAJOR UPDATE: Extended AI detection to support 20+ AI models including DeepSeek, Grok, Mistral, Perplexity, Llama, Cohere, and all major AI platforms
- Enhanced reward system with differentiated payouts for different AI types and premium bonuses for advanced models
- FIXED: Resolved persistent dashboard refresh issues by completely removing loading states and implementing stable UI patterns
- Replaced original dashboard with optimized version that eliminates "Initializing Level 280 AI Agents" interruptions
- Creator Registration Portal positioned at top of dashboard for maximum visibility and user engagement
- Updated GitHub README with live platform links and comprehensive technical documentation
- Successfully tested reward distribution with live transactions across multiple AI types
- **MAJOR ANTI-FRAUD INTEGRATION COMPLETED** (January 14, 2025):
  - Added comprehensive fraud detection database tables (fraudDetectionRules, fraudDetectionAlerts, accessPatterns, creatorReputationScores)
  - Implemented FraudDetectionService with real-time pattern analysis and risk scoring
  - Integrated anti-fraud monitoring into contentMonitoring service with automatic reward blocking
  - Created visible fraud protection UI components with Italian warnings for potential attackers
  - Added fraud protection API endpoints (/api/fraud/rules, /api/fraud/alerts, /api/fraud/stats)
  - System prevents sybil attacks, auto-farming, domain/IP concentration, and bot collusion
  - Reputation scoring system with penalty multipliers and automatic banning
  - All fraud rules visible in dashboard with clear deterrent messaging
- **MULTILINGUAL SYSTEM REMOVED DUE TO STABILITY ISSUES** (January 15, 2025):
  - Removed complex multilingual translation system causing form input failures
  - Converted entire interface to English for consistency and stability
  - Fixed Creator Portal input fields and dropdown selectors
  - Eliminated translation errors causing React component crashes
  - Prioritized functionality over advanced multilingual features
- **ANTI-FRAUD SYSTEM REFINEMENTS** (January 15, 2025):
  - Restored beautiful anti-fraud protection UI blocks with English text
  - Adjusted fraud detection thresholds to prevent false positives:
    - Increased daily access limits (500 per domain, 200 per IP)
    - Relaxed concentration thresholds (90% domain, 85% IP)
    - Reduced AI diversity requirements (minimum 2 models)
    - Extended burst detection window (50 requests per 10 minutes)
  - Modified reputation scoring to be less aggressive
  - Reduced ban thresholds to prevent legitimate users from being flagged
  - System now properly balances security with usability
- **COMPLETE ENGLISH CONVERSION** (January 15, 2025):
  - Converted all remaining Italian text to English throughout the platform
  - Updated dashboard section titles: "Recent Creator Rewards", "Multi-Agent Orchestration"
  - Fixed Creator Portal Content Category dropdown to English
  - Translated all network switcher labels and messages
  - Ensured consistent English interface across all components
- **UI OPTIMIZATION FOR RECENT REWARDS** (January 15, 2025):
  - Improved Recent Creator Rewards block layout to prevent excessive height
  - Limited display to 3 most recent rewards with compact design
  - Added max-height with scroll and "more rewards" indicator
  - Compacted item design with smaller icons and reduced padding
  - Enhanced visual balance between dashboard blocks
- **UI OPTIMIZATION FOR RECENT DISTRIBUTIONS** (January 15, 2025):
  - Applied same compact optimization to Recent Distributions block
  - Reduced from 10 to 3 displayed distributions with scrollable container
  - Compacted layout with smaller badges and reduced spacing
  - Added "more distributions" indicator for better UX
  - Improved overall dashboard balance and visual hierarchy