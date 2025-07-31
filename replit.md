# WebPayback Protocol

## Overview

WebPayback Protocol is a multi-agent blockchain application designed to automatically reward content creators when AI systems utilize their work. It aims to establish a self-sustaining creator economy, combining advanced AI orchestration with robust blockchain integration across multiple networks. The platform's vision is to ensure creators are fairly compensated, foster a vibrant creator community, and address the economic implications of AI content consumption.

## User Preferences

Preferred communication style: Simple, everyday language.
Interface language: English-only for better international understanding and system stability.
Domain configuration: webpayback.com registered on Ionos with Domain Guard, redirects to Replit app.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite.
- **UI Components**: Radix UI primitives with shadcn/ui.
- **Styling**: Tailwind CSS with custom WebPayback dark theme.
- **State Management**: TanStack Query (React Query).
- **Routing**: Wouter.
- **Form Management**: React Hook Form with Zod validation.

### Backend Architecture
- **Runtime**: Node.js with Express.js (ES modules).
- **Language**: Full TypeScript with shared schemas.
- **Database**: PostgreSQL with Drizzle ORM and Neon Database serverless driver.
- **Session Management**: PostgreSQL-based sessions using connect-pg-simple.
- **Security**: Comprehensive CSRF protection, rate limiting, IDOR protection, and input validation.

### Development Environment
- **Monorepo Structure**: Shared TypeScript schemas in `/shared`.
- **Path Aliases**: TypeScript path mapping (`@/`, `@shared/`).
- **Build System**: Vite for frontend, esbuild for backend.
- **Database Migrations**: Drizzle Kit for schema management.

### Core Features
- **AI Agent System**: Four specialized agents (WebPayback, Autoregolator, PoolAgent, TransparentAgent) with database-backed communication and real-time performance tracking.
- **Blockchain Infrastructure**: Multi-chain support (Ethereum, BSC, Polygon, Arbitrum) for WPT token management (ERC-20), automated smart contract deployment, and real-time network monitoring.
- **Content Creator Economy**: Features creator registration, website verification, wallet integration, channel monitoring (YouTube, Instagram, TikTok, Twitter/X), a multi-level referral system, and dynamic reputation scoring.
- **Security & Fraud Detection**: Multi-layer protection including CSRF tokens, rate limiting, input validation, IDOR protection, a real-time fraud detection engine, pool drain protection, and reentrancy protection. This includes advanced allowance management with multi-layer founder authentication.
- **Content Certificate System**: NFT-based system for anti-AI scraping, SHA-256 fingerprinting, unauthorized AI usage detection, and WPT rewards for content theft, integrated with the Creator Portal.
- **Automated Pool Management**: Zero-touch system with server-side automation, intelligent range management, spending caps, real-time monitoring, and emergency stop controls.
- **Data Flow**: Includes AI detection for content access, content fingerprinting, reward calculation and distribution, and comprehensive logging. Verification pipeline covers domain verification, social proof, channel mapping, and reputation building. Security event processing involves real-time monitoring, risk scoring, alert generation, and automated response actions.
- **UI/UX Decisions**: Consistent styling with improved text contrast (e.g., `text-gray-700 dark:text-gray-300`), personalized favicon, comprehensive SEO meta tags (Open Graph, Twitter Cards), and reorganized navigation for mobile-friendliness.

## External Dependencies

### Blockchain Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Alchemy SDK**: Ethereum and Polygon blockchain data and real-time monitoring.
- **Chainlink**: Price feeds, VRF randomness, and external data oracles.
- **Web3 Providers**: Multiple RPC endpoints for blockchain network connectivity.

### AI & Content Analysis
- **Multiple AI Model Detection**: Supports Claude, GPT, Gemini, DeepSeek, Grok, and 25+ other AI models.
- **Content Fingerprinting**: Utilizes advanced hashing algorithms.
- **Natural Language Processing**: For content categorization and quality assessment.

### External APIs
- **Domain Verification**: DNS lookup services.
- **IP Geolocation**: For VPN detection and geographic analysis.
- **Social Media APIs**: Integrations with YouTube, Instagram, and Twitter for verification.
- **Price Data**: Real-time cryptocurrency price feeds for WPT valuation.