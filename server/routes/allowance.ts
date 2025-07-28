import type { Express } from "express";
import { db } from "../db";
import { 
  allowanceManagement, 
  allowanceTransactions, 
  reservePoolStatus,
  allowanceSecurity,
  type InsertAllowanceManagement,
  type InsertAllowanceTransaction,
  type InsertReservePoolStatus,
  type InsertAllowanceSecurity
} from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
// Temporary auth middleware - replace with proper authentication
const isAuthenticated = (req: any, res: any, next: any) => {
  // For now, allow all requests - replace with proper auth check
  next();
};

export function registerAllowanceRoutes(app: Express) {
  
  // Get allowance configuration for a wallet
  app.get("/api/allowance/config/:walletAddress", isAuthenticated, async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      const config = await db
        .select()
        .from(allowanceManagement)
        .where(eq(allowanceManagement.walletAddress, walletAddress))
        .limit(1);
      
      res.json({ success: true, config: config[0] || null });
    } catch (error) {
      console.error("Error fetching allowance config:", error);
      res.status(500).json({ success: false, error: "Failed to fetch allowance config" });
    }
  });

  // Create or update allowance configuration
  app.post("/api/allowance/setup", isAuthenticated, async (req, res) => {
    try {
      const configData: InsertAllowanceManagement = req.body;
      
      // Check if config already exists
      const existing = await db
        .select()
        .from(allowanceManagement)
        .where(eq(allowanceManagement.walletAddress, configData.walletAddress))
        .limit(1);
      
      let result;
      if (existing.length > 0) {
        // Update existing config
        result = await db
          .update(allowanceManagement)
          .set({
            ...configData,
            updatedAt: new Date(),
          })
          .where(eq(allowanceManagement.walletAddress, configData.walletAddress))
          .returning();
      } else {
        // Create new config
        result = await db
          .insert(allowanceManagement)
          .values(configData)
          .returning();
      }
      
      res.json({ success: true, config: result[0] });
    } catch (error) {
      console.error("Error setting up allowance:", error);
      res.status(500).json({ success: false, error: "Failed to setup allowance" });
    }
  });

  // Get allowance transaction history
  app.get("/api/allowance/transactions/:allowanceId", isAuthenticated, async (req, res) => {
    try {
      const { allowanceId } = req.params;
      const { limit = "20", offset = "0" } = req.query;
      
      const transactions = await db
        .select()
        .from(allowanceTransactions)
        .where(eq(allowanceTransactions.allowanceId, parseInt(allowanceId)))
        .orderBy(desc(allowanceTransactions.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json({ success: true, transactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ success: false, error: "Failed to fetch transactions" });
    }
  });

  // Record a new allowance transaction
  app.post("/api/allowance/transaction", isAuthenticated, async (req, res) => {
    try {
      const transactionData: InsertAllowanceTransaction = req.body;
      
      const result = await db
        .insert(allowanceTransactions)
        .values(transactionData)
        .returning();
      
      // Update current allowance if this is a successful refill
      if (transactionData.transactionType === "refill" && transactionData.status === "confirmed") {
        await db
          .update(allowanceManagement)
          .set({
            usedAllowance: transactionData.amount,
            lastRefillAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(allowanceManagement.id, transactionData.allowanceId));
      }
      
      res.json({ success: true, transaction: result[0] });
    } catch (error) {
      console.error("Error recording transaction:", error);
      res.status(500).json({ success: false, error: "Failed to record transaction" });
    }
  });

  // Get reserve pool status
  app.get("/api/allowance/reserve-status/:contractAddress", isAuthenticated, async (req, res) => {
    try {
      const { contractAddress } = req.params;
      
      const status = await db
        .select()
        .from(reservePoolStatus)
        .where(eq(reservePoolStatus.contractAddress, contractAddress))
        .orderBy(desc(reservePoolStatus.updatedAt))
        .limit(1);
      
      res.json({ success: true, status: status[0] || null });
    } catch (error) {
      console.error("Error fetching reserve status:", error);
      res.status(500).json({ success: false, error: "Failed to fetch reserve status" });
    }
  });

  // Update reserve pool status
  app.post("/api/allowance/reserve-status", isAuthenticated, async (req, res) => {
    try {
      const statusData: InsertReservePoolStatus = req.body;
      
      // Check if status record exists
      const existing = await db
        .select()
        .from(reservePoolStatus)
        .where(eq(reservePoolStatus.contractAddress, statusData.contractAddress))
        .limit(1);
      
      let result;
      if (existing.length > 0) {
        // Update existing status
        result = await db
          .update(reservePoolStatus)
          .set({
            ...statusData,
            updatedAt: new Date(),
          })
          .where(eq(reservePoolStatus.contractAddress, statusData.contractAddress))
          .returning();
      } else {
        // Create new status record
        result = await db
          .insert(reservePoolStatus)
          .values(statusData)
          .returning();
      }
      
      res.json({ success: true, status: result[0] });
    } catch (error) {
      console.error("Error updating reserve status:", error);
      res.status(500).json({ success: false, error: "Failed to update reserve status" });
    }
  });

  // Get security events for an allowance
  app.get("/api/allowance/security/:allowanceId", isAuthenticated, async (req, res) => {
    try {
      const { allowanceId } = req.params;
      const { limit = "10" } = req.query;
      
      const events = await db
        .select()
        .from(allowanceSecurity)
        .where(eq(allowanceSecurity.allowanceId, parseInt(allowanceId)))
        .orderBy(desc(allowanceSecurity.createdAt))
        .limit(parseInt(limit as string));
      
      res.json({ success: true, events });
    } catch (error) {
      console.error("Error fetching security events:", error);
      res.status(500).json({ success: false, error: "Failed to fetch security events" });
    }
  });

  // Create security event
  app.post("/api/allowance/security", isAuthenticated, async (req, res) => {
    try {
      const eventData: InsertAllowanceSecurity = req.body;
      
      const result = await db
        .insert(allowanceSecurity)
        .values(eventData)
        .returning();
      
      res.json({ success: true, event: result[0] });
    } catch (error) {
      console.error("Error creating security event:", error);
      res.status(500).json({ success: false, error: "Failed to create security event" });
    }
  });

  // Get allowance statistics dashboard
  app.get("/api/allowance/dashboard/:walletAddress", isAuthenticated, async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      // Get allowance config
      const config = await db
        .select()
        .from(allowanceManagement)
        .where(eq(allowanceManagement.walletAddress, walletAddress))
        .limit(1);
      
      if (!config.length) {
        return res.json({ 
          success: false, 
          error: "Allowance not configured for this wallet" 
        });
      }
      
      const allowanceId = config[0].id;
      
      // Get recent transactions
      const recentTransactions = await db
        .select()
        .from(allowanceTransactions)
        .where(eq(allowanceTransactions.allowanceId, allowanceId))
        .orderBy(desc(allowanceTransactions.createdAt))
        .limit(5);
      
      // Get reserve status
      const reserveStatus = await db
        .select()
        .from(reservePoolStatus)
        .where(eq(reservePoolStatus.contractAddress, config[0].contractAddress))
        .orderBy(desc(reservePoolStatus.updatedAt))
        .limit(1);
      
      // Get security events count
      const securityEventsCount = await db
        .select()
        .from(allowanceSecurity)
        .where(and(
          eq(allowanceSecurity.allowanceId, allowanceId),
          eq(allowanceSecurity.isResolved, false)
        ));
      
      res.json({
        success: true,
        dashboard: {
          config: config[0],
          recentTransactions,
          reserveStatus: reserveStatus[0] || null,
          activeSecurityEvents: securityEventsCount.length,
          utilizationPercent: ((parseFloat(config[0].usedAllowance) / parseFloat(config[0].maxAllowance)) * 100).toFixed(2)
        }
      });
    } catch (error) {
      console.error("Error fetching allowance dashboard:", error);
      res.status(500).json({ success: false, error: "Failed to fetch dashboard data" });
    }
  });
}