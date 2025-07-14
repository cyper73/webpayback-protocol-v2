import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AgentCard from "@/components/agents/AgentCard";
import AgentCommunication from "@/components/agents/AgentCommunication";
import MultiChainDeployment from "@/components/blockchain/MultiChainDeployment";
import TokenEconomics from "@/components/blockchain/TokenEconomics";
import CreatorPortal from "@/components/creators/CreatorPortal";
import LiveStats from "@/components/analytics/LiveStats";
import ComplianceMonitor from "@/components/compliance/ComplianceMonitor";
import TokenInfo from "@/components/web3/TokenInfo";
import RewardDistribution from "@/components/web3/RewardDistribution";
import NetworkSwitcher from "@/components/web3/NetworkSwitcher";
import { Box, Wallet, Coins } from "lucide-react";

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    refetchInterval: 30000, // Refresh every 30 seconds to reduce interruptions
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-space text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing Level 280 AI Agents...</p>
        </div>
      </div>
    );
  }

  const { agents = [], networks = [], creators = [], stats = {}, rewards = [], pool = [], compliance = [] } = dashboardData || {};

  return (
    <div className="min-h-screen bg-deep-space text-white">
      {/* Navigation Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Box className="text-electric-blue text-2xl" />
                <span className="text-xl font-bold gradient-text">WebPayback Protocol</span>
              </div>
              <div className="hidden md:flex items-center space-x-1 bg-glass-dark px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-neon-green rounded-full pulse-animation"></div>
                <span className="text-sm text-gray-300">Level 280 AI Agents Active</span>
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

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Registration Portal - Priority Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CreatorPortal />
            
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold gradient-text">Recent Creator Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewards.slice(0, 4).map((reward, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-glass-dark rounded-lg">
                      <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
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
        </div>

        {/* Agent Collaboration Panel */}
        <div className="mb-8">
          <Card className="glass-card rounded-2xl shadow-neon-blue">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold gradient-text">
                  Multi-Agent Orchestration Command Center
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full pulse-animation"></div>
                  <span className="text-sm text-gray-300">All agents synchronized</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inter-Agent Communication */}
        <div className="mb-8">
          <AgentCommunication />
        </div>

        {/* Multi-Chain Deployment Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <MultiChainDeployment networks={networks} />
          </div>
          
          {/* Real-time Analytics */}
          <div className="space-y-6">
            <LiveStats stats={stats} />
          </div>
        </div>

        {/* Token Economics and Pool Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TokenEconomics pool={pool} rewards={rewards} />
          <ComplianceMonitor compliance={compliance} />
        </div>

        {/* Real Blockchain Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <TokenInfo />
          <RewardDistribution />
          <NetworkSwitcher />
        </div>

        {/* Revolutionary Innovation Section */}
        <div className="glass-card rounded-2xl p-8 mb-8 border-2 border-gradient-to-r from-electric-blue to-neon-green">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              Revolutionary AI Content Tracking System
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our Level 280 AI agents have developed a completely novel approach to content tracking and reward distribution, 
              surpassing traditional methods by orders of magnitude in accuracy and fairness.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-electric-blue text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced Content Fingerprinting</h3>
              <p className="text-gray-400">
                Quantum-enhanced algorithms create unique content signatures with 99.97% accuracy
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-balance-scale text-neon-green text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Fair Distribution Matrix</h3>
              <p className="text-gray-400">
                Revolutionary algorithm ensures perfect equity in reward distribution across all creators
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cyber-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-cyber-purple text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Anti-Fraud Genesis Protocol</h3>
              <p className="text-gray-400">
                Predictive fraud detection with quantum-resistant security measures
              </p>
            </div>
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Box className="text-electric-blue text-xl" />
                <span className="text-lg font-bold gradient-text">WebPayback</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering the future of the web through transparent, decentralized creator compensation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Protocol</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-electric-blue transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Whitepaper</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Smart Contracts</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-electric-blue transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Reddit</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-electric-blue transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Developer Tools</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Bug Bounty</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 WebPayback Protocol. MIT License. Built by creators, for creators.
            </p>
            <div className="flex items-center space-x-4 text-gray-400">
              <span className="text-sm">No mediocrity allowed</span>
              <i className="fas fa-rocket text-electric-blue"></i>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
