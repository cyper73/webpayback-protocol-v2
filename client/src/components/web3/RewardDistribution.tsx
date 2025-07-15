import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Creator {
  id: number;
  userId: number;
  websiteUrl: string;
  walletAddress: string;
  contentCategory: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RewardDistribution {
  id: number;
  creatorId: number;
  amount: string;
  transactionHash: string | null;
  networkId: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export default function RewardDistribution() {
  const { data: creators } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
    refetchInterval: 30000
  });

  const { data: rewards } = useQuery<RewardDistribution[]>({
    queryKey: ["/api/rewards"],
    refetchInterval: 30000
  });

  return (
    <div className="space-y-6">

      {/* Recent Creator Rewards */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold gradient-text">Recent Creator Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards?.slice(0, 3).map((reward) => {
              const displayName = `Creator #${reward.creatorId}`;
              
              return (
                <div key={reward.id} className="flex items-center space-x-3 p-3 bg-glass-dark rounded-lg">
                  <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-globe text-electric-blue text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate max-w-[180px]">
                        {displayName}
                      </span>
                      <span className="text-neon-green font-mono">+{reward.amount} WPT</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Status: {reward.status}</span>
                      <span>{new Date(reward.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {rewards && rewards.length > 3 && (
              <div className="text-center pt-2">
                <span className="text-sm text-electric-blue">
                  +{rewards.length - 3} more rewards
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Rewards Today:</span>
              <span className="font-mono text-neon-green">
                {rewards?.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2) || '0.00'} WPT
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}