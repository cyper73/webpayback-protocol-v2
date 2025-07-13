import { 
  users, creators, blockchainNetworks, aiAgents, agentCommunications, 
  contentTracking, rewardDistributions, poolManagement, complianceRecords,
  type User, type InsertUser, type Creator, type InsertCreator,
  type BlockchainNetwork, type InsertBlockchainNetwork, type AiAgent, type InsertAiAgent,
  type AgentCommunication, type InsertAgentCommunication, type ContentTracking, type InsertContentTracking,
  type RewardDistribution, type InsertRewardDistribution, type PoolManagement, type InsertPoolManagement,
  type ComplianceRecord, type InsertComplianceRecord
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// IStorage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Agent methods
  getAllAgents(): Promise<AiAgent[]>;
  getAgent(id: number): Promise<AiAgent | undefined>;
  getAgentByName(name: string): Promise<AiAgent | undefined>;
  createAgent(insertAgent: InsertAiAgent): Promise<AiAgent>;
  updateAgent(id: number, updates: Partial<AiAgent>): Promise<void>;
  
  // Agent communication methods
  getAgentCommunications(): Promise<AgentCommunication[]>;
  createAgentCommunication(insertComm: InsertAgentCommunication): Promise<AgentCommunication>;
  
  // Blockchain network methods
  getAllBlockchainNetworks(): Promise<BlockchainNetwork[]>;
  getBlockchainNetwork(id: number): Promise<BlockchainNetwork | undefined>;
  getBlockchainNetworkByName(name: string): Promise<BlockchainNetwork | undefined>;
  createBlockchainNetwork(insertNetwork: InsertBlockchainNetwork): Promise<BlockchainNetwork>;
  updateBlockchainNetwork(name: string, updates: Partial<BlockchainNetwork>): Promise<void>;
  
  // Creator methods
  getAllCreators(): Promise<Creator[]>;
  createCreator(insertCreator: InsertCreator): Promise<Creator>;
  
  // Content tracking methods
  createContentTracking(insertTracking: InsertContentTracking): Promise<ContentTracking>;
  getContentTrackingStats(): Promise<any>;
  
  // Reward distribution methods
  getRewardDistributions(): Promise<RewardDistribution[]>;
  createRewardDistribution(insertReward: InsertRewardDistribution): Promise<RewardDistribution>;
  
  // Pool management methods
  getPoolManagement(): Promise<PoolManagement[]>;
  
  // Compliance methods
  getComplianceRecords(): Promise<ComplianceRecord[]>;
}

// rewrite MemStorage to DatabaseStorage
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Agent methods
  async getAllAgents(): Promise<AiAgent[]> {
    return await db.select().from(aiAgents);
  }

  async getAgent(id: number): Promise<AiAgent | undefined> {
    const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
    return agent || undefined;
  }

  async getAgentByName(name: string): Promise<AiAgent | undefined> {
    const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.name, name));
    return agent || undefined;
  }

  async createAgent(insertAgent: InsertAiAgent): Promise<AiAgent> {
    const [agent] = await db
      .insert(aiAgents)
      .values(insertAgent)
      .returning();
    return agent;
  }

  async updateAgent(id: number, updates: Partial<AiAgent>): Promise<void> {
    await db.update(aiAgents).set(updates).where(eq(aiAgents.id, id));
  }

  // Agent communication methods
  async getAgentCommunications(): Promise<AgentCommunication[]> {
    return await db.select().from(agentCommunications);
  }

  async createAgentCommunication(insertComm: InsertAgentCommunication): Promise<AgentCommunication> {
    const [comm] = await db
      .insert(agentCommunications)
      .values(insertComm)
      .returning();
    return comm;
  }

  // Blockchain network methods
  async getAllBlockchainNetworks(): Promise<BlockchainNetwork[]> {
    return await db.select().from(blockchainNetworks);
  }

  async getBlockchainNetwork(id: number): Promise<BlockchainNetwork | undefined> {
    const [network] = await db.select().from(blockchainNetworks).where(eq(blockchainNetworks.id, id));
    return network || undefined;
  }

  async getBlockchainNetworkByName(name: string): Promise<BlockchainNetwork | undefined> {
    const [network] = await db.select().from(blockchainNetworks).where(eq(blockchainNetworks.name, name));
    return network || undefined;
  }

  async createBlockchainNetwork(insertNetwork: InsertBlockchainNetwork): Promise<BlockchainNetwork> {
    const [network] = await db
      .insert(blockchainNetworks)
      .values(insertNetwork)
      .returning();
    return network;
  }

  async updateBlockchainNetwork(name: string, updates: Partial<BlockchainNetwork>): Promise<void> {
    await db.update(blockchainNetworks).set(updates).where(eq(blockchainNetworks.name, name));
  }

  // Creator methods
  async getAllCreators(): Promise<Creator[]> {
    return await db.select().from(creators);
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const [creator] = await db
      .insert(creators)
      .values(insertCreator)
      .returning();
    return creator;
  }

  // Content tracking methods
  async createContentTracking(insertTracking: InsertContentTracking): Promise<ContentTracking> {
    const [tracking] = await db
      .insert(contentTracking)
      .values(insertTracking)
      .returning();
    return tracking;
  }

  async getContentTrackingStats(): Promise<any> {
    const stats = await db.select().from(contentTracking);
    return {
      totalRequests: stats.length,
      totalRewards: stats.reduce((sum, s) => sum + parseFloat(s.rewardAmount || "0"), 0),
      uniqueCreators: new Set(stats.map(s => s.creatorId)).size,
      averageUsage: stats.reduce((sum, s) => sum + (s.usageCount || 0), 0) / stats.length || 0
    };
  }

  // Reward distribution methods
  async getRewardDistributions(): Promise<RewardDistribution[]> {
    return await db.select().from(rewardDistributions);
  }

  async createRewardDistribution(insertReward: InsertRewardDistribution): Promise<RewardDistribution> {
    const [reward] = await db
      .insert(rewardDistributions)
      .values(insertReward)
      .returning();
    return reward;
  }

  // Pool management methods
  async getPoolManagement(): Promise<PoolManagement[]> {
    return await db.select().from(poolManagement);
  }

  // Compliance methods
  async getComplianceRecords(): Promise<ComplianceRecord[]> {
    return await db.select().from(complianceRecords);
  }
}

export const storage = new DatabaseStorage();