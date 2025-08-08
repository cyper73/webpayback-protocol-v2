# WebPayback Protocol

## Overview

WebPayback Protocol is a sophisticated decentralized application (dApp) that combines advanced AI agent orchestration with multi-chain blockchain deployment capabilities. The platform features a comprehensive creator economy system where content creators can register, verify their work, and receive automatic rewards when AI systems use their content. The protocol operates on multiple blockchain networks with a focus on Polygon mainnet, featuring the WPT (WebPayback Token) as its native currency and implements advanced security measures including 2FA authentication, anti-fraud systems, and pool drain protection.

## User Preferences

Preferred communication style: Simple, everyday language.

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