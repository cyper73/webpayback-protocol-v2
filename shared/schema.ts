import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  websiteUrl: text("website_url").notNull(),
  walletAddress: text("wallet_address").notNull(),
  contentCategory: text("content_category").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blockchainNetworks = pgTable("blockchain_networks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chainId: integer("chain_id").notNull(),
  rpcUrl: text("rpc_url").notNull(),
  contractAddress: text("contract_address"),
  deploymentStatus: text("deployment_status").default("pending"), // pending, deploying, deployed, failed
  gasUsed: text("gas_used"),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // webpayback, autoregolator, poolagent, transparentagent
  status: text("status").default("active"), // active, inactive, processing
  expertiseLevel: integer("expertise_level").default(280),
  lastActivity: timestamp("last_activity").defaultNow(),
  metrics: jsonb("metrics").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentCommunications = pgTable("agent_communications", {
  id: serial("id").primaryKey(),
  fromAgentId: integer("from_agent_id").references(() => aiAgents.id),
  toAgentId: integer("to_agent_id").references(() => aiAgents.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("question"), // question, answer, notification
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const contentTracking = pgTable("content_tracking", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  contentHash: text("content_hash").notNull(),
  accessType: text("access_type").default("ai_access"), // ai_access, manual_access, crawler_access
  aiModel: text("ai_model"), // claude, gpt, gemini, bot
  detectionConfidence: decimal("detection_confidence", { precision: 3, scale: 2 }),
  usageCount: integer("usage_count").default(1),
  rewardAmount: decimal("reward_amount", { precision: 18, scale: 8 }).default("0"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default({}),
});

export const rewardDistributions = pgTable("reward_distributions", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  transactionHash: text("transaction_hash"),
  networkId: integer("network_id").references(() => blockchainNetworks.id),
  status: text("status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const poolManagement = pgTable("pool_management", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").references(() => blockchainNetworks.id),
  totalStaked: decimal("total_staked", { precision: 18, scale: 8 }).default("0"),
  totalRewards: decimal("total_rewards", { precision: 18, scale: 8 }).default("0"),
  apy: decimal("apy", { precision: 5, scale: 2 }).default("0"),
  stakersCount: integer("stakers_count").default(0),
  lastUpdate: timestamp("last_update").defaultNow(),
});

export const complianceRecords = pgTable("compliance_records", {
  id: serial("id").primaryKey(),
  auditType: text("audit_type").notNull(),
  status: text("status").notNull(), // compliant, non_compliant, under_review
  score: decimal("score", { precision: 5, scale: 2 }),
  details: jsonb("details").default({}),
  auditedAt: timestamp("audited_at").defaultNow(),
  auditedBy: text("audited_by"),
});

// Anti-fraud system tables
export const fraudDetectionRules = pgTable("fraud_detection_rules", {
  id: serial("id").primaryKey(),
  ruleName: text("rule_name").notNull(),
  ruleType: text("rule_type").notNull(), // domain_limit, ip_limit, pattern_analysis, threshold_check, reputation_check
  parameters: jsonb("parameters").default({}),
  isActive: boolean("is_active").default(true),
  severity: text("severity").default("medium"), // low, medium, high, critical
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fraudDetectionAlerts = pgTable("fraud_detection_alerts", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => fraudDetectionRules.id),
  creatorId: integer("creator_id").references(() => creators.id),
  alertType: text("alert_type").notNull(), // sybil_attack, auto_farming, suspicious_pattern, threshold_breach
  severity: text("severity").default("medium"), // low, medium, high, critical
  status: text("status").default("active"), // active, resolved, ignored
  details: jsonb("details").default({}),
  evidence: jsonb("evidence").default({}),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creatorReputationScores = pgTable("creator_reputation_scores", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id).notNull(),
  overallScore: integer("overall_score").default(100), // 0-100 scale
  trustLevel: text("trust_level").default("trusted"), // trusted, warning, suspended, banned
  fraudCount: integer("fraud_count").default(0),
  positiveActions: integer("positive_actions").default(0),
  negativeActions: integer("negative_actions").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  penalties: jsonb("penalties").default({}),
  notes: text("notes"),
});

export const accessPatterns = pgTable("access_patterns", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  domainHash: text("domain_hash").notNull(), // hashed domain for privacy
  ipHash: text("ip_hash").notNull(), // hashed IP for privacy
  aiType: text("ai_type").notNull(),
  accessCount: integer("access_count").default(1),
  lastAccess: timestamp("last_access").defaultNow(),
  suspicious: boolean("suspicious").default(false),
  entropy: decimal("entropy", { precision: 10, scale: 6 }).default("0"),
  metadata: jsonb("metadata").default({}),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  creators: many(creators),
}));

export const creatorsRelations = relations(creators, ({ one, many }) => ({
  user: one(users, {
    fields: [creators.userId],
    references: [users.id],
  }),
  contentTracking: many(contentTracking),
  rewardDistributions: many(rewardDistributions),
  fraudAlerts: many(fraudDetectionAlerts),
  reputationScore: one(creatorReputationScores),
  accessPatterns: many(accessPatterns),
}));

export const blockchainNetworksRelations = relations(blockchainNetworks, ({ many }) => ({
  rewardDistributions: many(rewardDistributions),
  poolManagement: many(poolManagement),
}));

export const aiAgentsRelations = relations(aiAgents, ({ many }) => ({
  sentMessages: many(agentCommunications, { relationName: "sentMessages" }),
  receivedMessages: many(agentCommunications, { relationName: "receivedMessages" }),
}));

export const agentCommunicationsRelations = relations(agentCommunications, ({ one }) => ({
  fromAgent: one(aiAgents, {
    fields: [agentCommunications.fromAgentId],
    references: [aiAgents.id],
    relationName: "sentMessages",
  }),
  toAgent: one(aiAgents, {
    fields: [agentCommunications.toAgentId],
    references: [aiAgents.id],
    relationName: "receivedMessages",
  }),
}));

export const contentTrackingRelations = relations(contentTracking, ({ one }) => ({
  creator: one(creators, {
    fields: [contentTracking.creatorId],
    references: [creators.id],
  }),
}));

export const rewardDistributionsRelations = relations(rewardDistributions, ({ one }) => ({
  creator: one(creators, {
    fields: [rewardDistributions.creatorId],
    references: [creators.id],
  }),
  network: one(blockchainNetworks, {
    fields: [rewardDistributions.networkId],
    references: [blockchainNetworks.id],
  }),
}));

export const poolManagementRelations = relations(poolManagement, ({ one }) => ({
  network: one(blockchainNetworks, {
    fields: [poolManagement.networkId],
    references: [blockchainNetworks.id],
  }),
}));

// Anti-fraud relations
export const fraudDetectionRulesRelations = relations(fraudDetectionRules, ({ many }) => ({
  alerts: many(fraudDetectionAlerts),
}));

export const fraudDetectionAlertsRelations = relations(fraudDetectionAlerts, ({ one }) => ({
  rule: one(fraudDetectionRules, {
    fields: [fraudDetectionAlerts.ruleId],
    references: [fraudDetectionRules.id],
  }),
  creator: one(creators, {
    fields: [fraudDetectionAlerts.creatorId],
    references: [creators.id],
  }),
}));

export const creatorReputationScoresRelations = relations(creatorReputationScores, ({ one }) => ({
  creator: one(creators, {
    fields: [creatorReputationScores.creatorId],
    references: [creators.id],
  }),
}));

export const accessPatternsRelations = relations(accessPatterns, ({ one }) => ({
  creator: one(creators, {
    fields: [accessPatterns.creatorId],
    references: [creators.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCreatorSchema = createInsertSchema(creators).pick({
  userId: true,
  websiteUrl: true,
  walletAddress: true,
  contentCategory: true,
});

export const insertBlockchainNetworkSchema = createInsertSchema(blockchainNetworks).pick({
  name: true,
  chainId: true,
  rpcUrl: true,
  contractAddress: true,
  deploymentStatus: true,
  gasUsed: true,
});

export const insertAiAgentSchema = createInsertSchema(aiAgents).pick({
  name: true,
  type: true,
  status: true,
  expertiseLevel: true,
  metrics: true,
});

export const insertAgentCommunicationSchema = createInsertSchema(agentCommunications).pick({
  fromAgentId: true,
  toAgentId: true,
  message: true,
  messageType: true,
});

export const insertContentTrackingSchema = createInsertSchema(contentTracking).pick({
  creatorId: true,
  contentHash: true,
  accessType: true,
  aiModel: true,
  detectionConfidence: true,
  usageCount: true,
  rewardAmount: true,
  metadata: true,
});

export const insertRewardDistributionSchema = createInsertSchema(rewardDistributions).pick({
  creatorId: true,
  amount: true,
  transactionHash: true,
  networkId: true,
  status: true,
});

export const insertPoolManagementSchema = createInsertSchema(poolManagement).pick({
  networkId: true,
  totalStaked: true,
  totalRewards: true,
  apy: true,
  stakersCount: true,
});

export const insertComplianceRecordSchema = createInsertSchema(complianceRecords).pick({
  auditType: true,
  status: true,
  score: true,
  details: true,
  auditedBy: true,
});

// Anti-fraud insert schemas
export const insertFraudDetectionRuleSchema = createInsertSchema(fraudDetectionRules).pick({
  ruleName: true,
  ruleType: true,
  parameters: true,
  isActive: true,
  severity: true,
  description: true,
});

export const insertFraudDetectionAlertSchema = createInsertSchema(fraudDetectionAlerts).pick({
  ruleId: true,
  creatorId: true,
  alertType: true,
  severity: true,
  status: true,
  details: true,
  evidence: true,
});

export const insertCreatorReputationScoreSchema = createInsertSchema(creatorReputationScores).pick({
  creatorId: true,
  overallScore: true,
  trustLevel: true,
  fraudCount: true,
  positiveActions: true,
  negativeActions: true,
  penalties: true,
  notes: true,
});

export const insertAccessPatternSchema = createInsertSchema(accessPatterns).pick({
  creatorId: true,
  domainHash: true,
  ipHash: true,
  aiType: true,
  accessCount: true,
  suspicious: true,
  entropy: true,
  metadata: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type Creator = typeof creators.$inferSelect;

export type InsertBlockchainNetwork = z.infer<typeof insertBlockchainNetworkSchema>;
export type BlockchainNetwork = typeof blockchainNetworks.$inferSelect;

export type InsertAiAgent = z.infer<typeof insertAiAgentSchema>;
export type AiAgent = typeof aiAgents.$inferSelect;

export type InsertAgentCommunication = z.infer<typeof insertAgentCommunicationSchema>;
export type AgentCommunication = typeof agentCommunications.$inferSelect;

export type InsertContentTracking = z.infer<typeof insertContentTrackingSchema>;
export type ContentTracking = typeof contentTracking.$inferSelect;

export type InsertRewardDistribution = z.infer<typeof insertRewardDistributionSchema>;
export type RewardDistribution = typeof rewardDistributions.$inferSelect;

export type InsertPoolManagement = z.infer<typeof insertPoolManagementSchema>;
export type PoolManagement = typeof poolManagement.$inferSelect;

export type InsertComplianceRecord = z.infer<typeof insertComplianceRecordSchema>;
export type ComplianceRecord = typeof complianceRecords.$inferSelect;

// Anti-fraud types
export type InsertFraudDetectionRule = z.infer<typeof insertFraudDetectionRuleSchema>;
export type FraudDetectionRule = typeof fraudDetectionRules.$inferSelect;

export type InsertFraudDetectionAlert = z.infer<typeof insertFraudDetectionAlertSchema>;
export type FraudDetectionAlert = typeof fraudDetectionAlerts.$inferSelect;

export type InsertCreatorReputationScore = z.infer<typeof insertCreatorReputationScoreSchema>;
export type CreatorReputationScore = typeof creatorReputationScores.$inferSelect;

export type InsertAccessPattern = z.infer<typeof insertAccessPatternSchema>;
export type AccessPattern = typeof accessPatterns.$inferSelect;
