import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { blockchainService } from "./services/blockchain";
import { agentService } from "./services/agents";
import { web3Service } from "./services/web3";
import { contentMonitoringService } from "./services/contentMonitoring";
import { gasManager } from "./services/gasManager";
import { 
  insertCreatorSchema, 
  insertAgentCommunicationSchema,
  insertContentTrackingSchema,
  insertRewardDistributionSchema,
  insertBlockchainNetworkSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize blockchain networks on startup
  await blockchainService.initializeNetworks();
  
  // Initialize AI agents
  app.post("/api/agents/initialize", async (req, res) => {
    try {
      await agentService.initializeAgents();
      res.json({ success: true, message: "AI agents initialized successfully" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get agent communications
  app.get("/api/agents/communications", async (req, res) => {
    try {
      const communications = await storage.getAgentCommunications();
      res.json(communications);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Send agent communication
  app.post("/api/agents/communicate", async (req, res) => {
    try {
      const validatedData = insertAgentCommunicationSchema.parse(req.body);
      const communication = await storage.createAgentCommunication(validatedData);
      res.json(communication);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get blockchain networks
  app.get("/api/blockchain/networks", async (req, res) => {
    try {
      const networks = await storage.getAllBlockchainNetworks();
      res.json(networks);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Deploy token to blockchain
  app.post("/api/blockchain/deploy", async (req, res) => {
    try {
      const validatedData = insertBlockchainNetworkSchema.parse(req.body);
      const deployment = await blockchainService.deployToken(validatedData);
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get deployment status
  app.get("/api/blockchain/deployment/:networkId", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const status = await blockchainService.getDeploymentStatus(networkId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Register creator
  app.post("/api/creators", async (req, res) => {
    try {
      const validatedData = insertCreatorSchema.parse(req.body);
      const creator = await storage.createCreator(validatedData);
      res.json(creator);
    } catch (error) {
      console.error("Creator registration error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all creators
  app.get("/api/creators", async (req, res) => {
    try {
      const creators = await storage.getAllCreators();
      res.json(creators);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get creator by referral code
  app.get("/api/creators/referral/:code", async (req, res) => {
    try {
      const creator = await storage.getCreatorByReferralCode(req.params.code);
      if (!creator) {
        return res.status(404).json({ error: "Referral code not found" });
      }
      res.json(creator);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get referral rewards
  app.get("/api/referrals/rewards", async (req, res) => {
    try {
      const creatorId = req.query.creatorId ? parseInt(req.query.creatorId as string) : undefined;
      const rewards = await storage.getReferralRewards(creatorId);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Generate referral code
  app.post("/api/referrals/generate", async (req, res) => {
    try {
      const code = await storage.generateReferralCode();
      res.json({ referralCode: code });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Track content usage
  app.post("/api/content/track", async (req, res) => {
    try {
      const validatedData = insertContentTrackingSchema.parse(req.body);
      const tracking = await storage.createContentTracking(validatedData);
      res.json(tracking);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get content tracking stats
  app.get("/api/content/stats", async (req, res) => {
    try {
      const stats = await storage.getContentTrackingStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get reward distributions
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getRewardDistributions();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Distribute rewards (now uses gas manager)
  app.post("/api/rewards/distribute", async (req, res) => {
    try {
      const validatedData = insertRewardDistributionSchema.parse(req.body);
      // Queue reward for batch processing instead of immediate distribution
      await gasManager.queueReward(validatedData);
      res.json({ success: true, message: "Reward queued for batch processing" });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Gas management endpoints
  app.get("/api/gas/status", async (req, res) => {
    try {
      const status = await gasManager.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/gas/flush", async (req, res) => {
    try {
      const results = await gasManager.flushPendingRewards();
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Test endpoint to queue multiple rewards for batch processing demo
  app.post("/api/gas/test-batch", async (req, res) => {
    try {
      const { count = 5 } = req.body;
      const results = [];
      
      for (let i = 0; i < count; i++) {
        const testReward = {
          creatorId: 4, // Using existing creator
          amount: (Math.random() * 2 + 0.5).toFixed(8), // Random amount between 0.5-2.5 WPT
          tokenType: "WPT",
          transactionHash: `0x${Date.now().toString(16)}${i}`,
          status: "pending" as const,
          metadata: {
            aiModel: ['claude', 'gpt', 'deepseek', 'mistral'][Math.floor(Math.random() * 4)],
            testBatch: true,
            batchId: Date.now()
          }
        };
        
        await gasManager.queueReward(testReward);
        results.push(testReward);
      }
      
      res.json({ 
        success: true, 
        message: `Queued ${count} test rewards for batch processing`,
        rewards: results 
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Create reward distribution (legacy endpoint - now redirects to gas manager)
  app.post("/api/rewards", async (req, res) => {
    try {
      const validatedData = insertRewardDistributionSchema.parse(req.body);
      // Use gas manager for new rewards
      await gasManager.queueReward(validatedData);
      res.json({ success: true, message: "Reward queued for gas-optimized batch processing" });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get pool management data
  app.get("/api/pool", async (req, res) => {
    try {
      const poolData = await storage.getPoolManagement();
      res.json(poolData);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get compliance records
  app.get("/api/compliance", async (req, res) => {
    try {
      const compliance = await storage.getComplianceRecords();
      res.json(compliance);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get analytics dashboard data
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const [agents, networks, creators, stats, rewards, pool, compliance] = await Promise.all([
        storage.getAllAgents(),
        storage.getAllBlockchainNetworks(),
        storage.getAllCreators(),
        storage.getContentTrackingStats(),
        storage.getRewardDistributions(),
        storage.getPoolManagement(),
        storage.getComplianceRecords()
      ]);

      res.json({
        agents,
        networks,
        creators,
        stats,
        rewards,
        pool,
        compliance
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get real token information from current network
  app.get("/api/web3/token-info", async (req, res) => {
    try {
      const tokenInfo = await web3Service.getTokenInfo();
      res.json(tokenInfo);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Switch blockchain network
  app.post("/api/web3/switch-network", async (req, res) => {
    try {
      const { network } = req.body;
      if (!network || !['polygon', 'ethereum'].includes(network)) {
        return res.status(400).json({ error: "Invalid network. Use 'polygon' or 'ethereum'" });
      }
      
      web3Service.switchNetwork(network);
      res.json({ 
        success: true, 
        message: `Switched to ${network} network`,
        network: network 
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get pool information for WMATIC/WPT
  app.get("/api/web3/pool-info", async (req, res) => {
    try {
      const poolInfo = await web3Service.getPoolInfo();
      res.json(poolInfo);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get network status
  app.get("/api/web3/network-status", async (req, res) => {
    try {
      const networkStatus = await web3Service.getNetworkStatus();
      res.json(networkStatus);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Distribute real rewards to creator wallet
  app.post("/api/web3/distribute-rewards", async (req, res) => {
    try {
      const { creatorId, amount, walletAddress } = req.body;
      
      if (!creatorId || !amount || !walletAddress) {
        return res.status(400).json({ error: "Missing required fields: creatorId, amount, walletAddress" });
      }

      await web3Service.processRewardDistribution(creatorId, amount, walletAddress);
      
      res.json({ 
        success: true, 
        message: "Reward distribution initiated successfully",
        tokenAddress: "0x9077051D318b614F915E8A07861090856FDEC91e",
        network: "Polygon"
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // AI Content Monitoring Routes
  
  // Simulate AI access to registered content
  app.post("/api/monitoring/simulate-ai-access", async (req, res) => {
    try {
      const { url, aiType } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      const success = await contentMonitoringService.simulateAIAccess(url, aiType);
      
      res.json({
        success,
        message: success ? "AI access detected and reward distributed" : "No creator found for URL or detection failed",
        url,
        aiType: aiType || 'claude'
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get monitoring statistics
  app.get("/api/monitoring/stats", async (req, res) => {
    try {
      const stats = await contentMonitoringService.getMonitoringStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ANTI-FRAUD PROTECTION ROUTES
  
  // Get active fraud detection rules
  app.get('/api/fraud/rules', async (req, res) => {
    try {
      const rules = await storage.getActiveFraudDetectionRules();
      res.json(rules);
    } catch (error) {
      console.error('Error fetching fraud rules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get fraud alerts
  app.get('/api/fraud/alerts', async (req, res) => {
    try {
      const creatorId = req.query.creatorId ? parseInt(req.query.creatorId as string) : undefined;
      const alerts = await storage.getFraudDetectionAlerts(creatorId);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get fraud detection statistics
  app.get('/api/fraud/stats', async (req, res) => {
    try {
      const totalAlerts = await storage.getTotalFraudAlerts();
      const activeAlerts = await storage.getActiveFraudAlerts();
      const bannedCreators = await storage.getBannedCreators();
      
      res.json({
        totalAlerts,
        activeAlerts,
        bannedCreators: bannedCreators.length,
        resolvedAlerts: totalAlerts - activeAlerts
      });
    } catch (error) {
      console.error('Error fetching fraud stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Real AI detection endpoint (would be called by monitoring system)
  app.post("/api/monitoring/detect-access", async (req, res) => {
    try {
      const { userAgent, ipAddress, url } = req.body;
      
      if (!userAgent || !ipAddress || !url) {
        return res.status(400).json({ error: "Missing required fields: userAgent, ipAddress, url" });
      }
      
      const detection = await contentMonitoringService.detectAIAccess(userAgent, ipAddress, url);
      const processed = await contentMonitoringService.processAIAccess(detection);
      
      res.json({
        detection,
        processed,
        message: processed ? "AI access processed and reward distributed" : "AI access detected but not processed"
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}