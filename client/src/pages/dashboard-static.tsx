import { useState, useEffect } from "react";
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
import FraudDetectionRules from "@/components/fraud/FraudDetectionRules";
import FraudAlerts from "@/components/fraud/FraudAlerts";
import TokenInfo from "@/components/web3/TokenInfo";
import RewardDistribution from "@/components/web3/RewardDistribution";
import NetworkSwitcher from "@/components/web3/NetworkSwitcher";
import { useTranslations } from "@/hooks/use-translations";
import LanguageDropdown from "@/components/ui/language-dropdown";
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
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('webpayback-language') || 'en';
  });
  const { t, changeLanguage } = useTranslations(currentLanguage);
  
  const [forceRerender, setForceRerender] = useState(0);
  
  const handleLanguageChange = (newLanguage: string) => {
    console.log('Changing language to:', newLanguage);
    setCurrentLanguage(newLanguage);
    changeLanguage(newLanguage);
  };
  
  // Debug per vedere se funziona
  useEffect(() => {
    console.log('Dashboard language changed to:', currentLanguage);
    console.log('Level 280 agents text:', t('level_280_agents'));
    console.log('Recent creator rewards text:', t('recent_creator_rewards'));
    
    // Force component re-render when language changes
    setForceRerender(prev => prev + 1);
  }, [currentLanguage, t]);
  


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
    // Initial load
    fetchDashboardData();
    
    // Set up interval for refresh
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const { agents, networks, creators, stats, rewards, pool, compliance } = dashboardData;



  return (
    <div className="min-h-screen bg-deep-space text-white" key={`lang-${currentLanguage}-${forceRerender}`}>
      <LanguageDropdown 
        currentLanguage={currentLanguage} 
        onLanguageChange={handleLanguageChange} 
      />
      
      {/* Navigation Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Box className="text-electric-blue text-2xl" />
                <span className="text-xl font-bold gradient-text">WebPayback Protocol</span>
              </div>
              <div className="hidden md:flex items-center space-x-1 bg-glass-dark px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-400 animate-pulse' : 'bg-neon-green'} pulse-animation`}></div>
                <span className="text-sm text-gray-300">
                  {isRefreshing ? t('syncing') : t('level_280_agents')}
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
                <span className="font-mono">{t('wpt_token_live')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard - Always show content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Registration Portal - Priority Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CreatorPortal />
            
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold gradient-text">{t('recent_creator_rewards')}</CardTitle>
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
                          <span className="font-medium">{t('creator')} #{reward.creatorId}</span>
                          <span className="text-neon-green font-mono">+{reward.amount} WPT</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{t('status')} {reward.status}</span>
                          <span>{new Date(reward.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('totalRewardsToday')}:</span>
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
                  {t('multi_agent_orchestration')}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full pulse-animation"></div>
                  <span className="text-sm text-gray-300">{t('active')}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
              
              <div className="mb-8">
                <AgentCommunication />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Analytics & Blockchain Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <LiveStats stats={stats} />
          </div>
          <div>
            <TokenInfo />
          </div>
        </div>

        {/* Multi-Chain Deployment & Token Economics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MultiChainDeployment networks={networks} />
          <TokenEconomics pool={pool} rewards={rewards} />
        </div>

        {/* Reward Distribution System */}
        <div className="mb-8">
          <RewardDistribution />
        </div>

        {/* Anti-Fraud Protection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
                <Shield className="text-electric-blue" />
                {t('antiFraudSystem')}
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
                {t('fraudAlerts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FraudAlerts />
            </CardContent>
          </Card>
        </div>

        {/* Compliance & Governance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ComplianceMonitor compliance={compliance} />
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold gradient-text">{t('networkSwitcher')}</CardTitle>
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