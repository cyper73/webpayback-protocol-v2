import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LiveStatsProps {
  stats: any;
}

export default function LiveStats({ stats }: LiveStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const mockStats = {
    totalTransactions: 2847392,
    activeValidators: 1247,
    networkTvl: 24700000,
    creatorRewards: 184392,
    sitesMonitored: 45892,
    aiRequestsPerHour: 147200,
    accuracyRate: 99.7,
    antiFraudScore: "A+"
  };

  return (
    <>
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold gradient-text">Live Network Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Transactions</span>
              <span className="font-mono text-neon-green">{formatNumber(mockStats.totalTransactions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Validators</span>
              <span className="font-mono text-electric-blue">{formatNumber(mockStats.activeValidators)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Network TVL</span>
              <span className="font-mono text-amber-400">${formatNumber(mockStats.networkTvl)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Creator Rewards</span>
              <span className="font-mono text-cyber-purple">{formatNumber(mockStats.creatorRewards)} WPT</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold gradient-text">AI Content Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Sites Monitored</span>
              <span className="font-mono text-neon-green">{formatNumber(mockStats.sitesMonitored)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">AI Requests/hr</span>
              <span className="font-mono text-electric-blue">{formatNumber(mockStats.aiRequestsPerHour)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Accuracy Rate</span>
              <span className="font-mono text-amber-400">{mockStats.accuracyRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Anti-Fraud Score</span>
              <span className="font-mono text-cyber-purple">{mockStats.antiFraudScore}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
