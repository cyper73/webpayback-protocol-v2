import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LiveStats from "@/components/analytics/LiveStats";
import AgentCard from "@/components/agents/AgentCard";
import AgentCommunication from "@/components/agents/AgentCommunication";
import MultiChainDeployment from "@/components/blockchain/MultiChainDeployment";
import TokenEconomics from "@/components/blockchain/TokenEconomics";
import CreatorPortal from "@/components/creators/CreatorPortal";
import ComplianceMonitor from "@/components/compliance/ComplianceMonitor";
import FraudDetectionRules from "@/components/fraud/FraudDetectionRules";
import FraudAlerts from "@/components/fraud/FraudAlerts";
import TokenInfo from "@/components/web3/TokenInfo";
import RewardDistribution from "@/components/web3/RewardDistribution";
import NetworkSwitcher from "@/components/web3/NetworkSwitcher";
import { Box, Wallet, Coins, Shield, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    agents: [],
    networks: [],
    creators: [],
    stats: { totalRequests: 0, totalRewards: 0, uniqueCreators: 0, averageUsage: 0 },
    rewards: [],
    pool: [],
    compliance: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      }
      
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      setDashboardData(data);
      
      if (isLoading) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const { agents, networks, creators, stats, rewards, pool, compliance } = dashboardData;

  return (
    <div className="min-h-screen bg-deep-space text-white">
      
      {/* Navigation Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Box className="text-electric-blue text-2xl" />
                <span className="text-xl font-bold gradient-text">WebPayback Protocol</span>
              </div>
              <div className="hidden md:flex items-center space-x-1 bg-glass-dark px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-400 animate-pulse' : 'bg-neon-green'} pulse-animation`}></div>
                <span className="text-sm text-gray-300">
                  {isRefreshing ? 'Syncing...' : 'Level 280 AI Agents'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Wallet className="text-electric-blue" />
                <span className="font-mono">0x9077...91e</span>
              </div>
              <div className="flex items-center space-x-2 bg-glass-dark px-3 py-1 rounded-lg">
                <Coins className="text-amber-400" />
                <span className="font-mono">WPT Token Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Creator Portal Section */}
        <div className="mb-8">
          <CreatorPortal />
        </div>

        {/* Recent Creator Rewards */}
        <div className="mb-8">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text">Recent Creator Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewards.slice(0, 4).map((reward, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-glass-dark rounded-lg">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-globe text-electric-blue text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Creator #{reward.creatorId}</span>
                        <span className="text-neon-green font-mono">+{reward.amount} WPT</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Status: {reward.status}</span>
                        <span>{new Date(reward.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Rewards Today:</span>
                  <span className="font-mono text-neon-green">
                    {rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2)} WPT
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent System */}
        <div className="mb-8">
          <Card className="glass-card rounded-2xl shadow-neon-blue">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold gradient-text">
                  Multi-Agent Orchestration
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full pulse-animation"></div>
                  <span className="text-sm text-gray-300">Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communications */}
        <div className="mb-8">
          <AgentCommunication />
        </div>

        {/* Blockchain & Token Economics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MultiChainDeployment networks={networks} />
          <TokenEconomics stats={stats} pool={pool} rewards={rewards} />
        </div>

        {/* Web3 Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <TokenInfo />
          <RewardDistribution />
          <LiveStats stats={stats} />
        </div>

        {/* Anti-Fraud Protection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
                <Shield className="text-electric-blue" />
                Anti-Fraud System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FraudDetectionRules />
            </CardContent>
          </Card>
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
                <AlertTriangle className="text-amber-400" />
                Fraud Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FraudAlerts />
            </CardContent>
          </Card>
        </div>

        {/* Compliance & Network */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ComplianceMonitor compliance={compliance} />
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text">Network Switcher</CardTitle>
            </CardHeader>
            <CardContent>
              <NetworkSwitcher />
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}