import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Wallet, 
  RefreshCw, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Settings,
  History,
  DollarSign
} from "lucide-react";

interface AllowanceConfig {
  id: number;
  walletAddress: string;
  contractAddress: string;
  tokenAddress: string;
  maxAllowance: string;
  currentAllowance: string;
  usedAllowance: string;
  refillThreshold: string;
  refillAmount: string;
  isActive: boolean;
  lastRefillAt: string | null;
  alertThreshold: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: number;
  transactionType: string;
  amount: string;
  transactionHash: string;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
}

interface ReserveStatus {
  id: number;
  contractAddress: string;
  currentBalance: string;
  minimumThreshold: string;
  optimalBalance: string;
  totalDistributedToday: string;
  averageDailyUsage: string;
  projectedDaysRemaining: number | null;
  alertLevel: string;
  updatedAt: string;
}

interface DashboardData {
  config: AllowanceConfig;
  recentTransactions: Transaction[];
  reserveStatus: ReserveStatus | null;
  activeSecurityEvents: number;
  utilizationPercent: string;
}

// Default wallet address for WebPayback Protocol founder
const DEFAULT_WALLET = "0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8";

export default function AllowanceManagementDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch allowance dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/allowance/dashboard"],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });

  // Manual refresh
  const refreshMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/allowance/refresh", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/allowance/dashboard"] });
      toast({
        title: "Data Refreshed",
        description: "Allowance data updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh allowance data",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshMutation.mutate();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Token Allowance Management</h1>
            <p className="text-gray-400">Loading system configuration...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load allowance data. Please check your connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const data = dashboardData as DashboardData;
  const config = data?.config;
  const reserveStatus = data?.reserveStatus;
  const recentTransactions = data?.recentTransactions || [];

  // Calculate utilization percentage
  const utilizationPercent = config ? 
    ((parseFloat(config.usedAllowance) / parseFloat(config.maxAllowance)) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Token Allowance Management</h1>
          <p className="text-gray-400">Real-time WPT allowance monitoring and control</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing || refreshMutation.isPending}
          className="bg-electric-blue hover:bg-electric-blue/80"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Allowance */}
        <Card className="glass-card border-electric-blue/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <Wallet className="w-4 h-4 mr-2" />
              Current Allowance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {config ? `${parseFloat(config.currentAllowance).toFixed(2)} WPT` : "Loading..."}
            </div>
            <div className="text-sm text-gray-400">
              {config ? `${utilizationPercent}% utilized` : ""}
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-electric-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${utilizationPercent}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Reserve Status */}
        <Card className="glass-card border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Reserve Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {reserveStatus ? `${parseFloat(reserveStatus.currentBalance).toFixed(2)} WPT` : "Loading..."}
            </div>
            <div className="text-sm text-gray-400">
              {reserveStatus ? `${reserveStatus.projectedDaysRemaining || "∞"} days remaining` : ""}
            </div>
            {reserveStatus && (
              <Badge 
                variant={reserveStatus.alertLevel === 'normal' ? 'default' : 'destructive'}
                className="mt-2"
              >
                {reserveStatus.alertLevel.toUpperCase()}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card className="glass-card border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {data?.activeSecurityEvents || 0}
            </div>
            <div className="text-sm text-gray-400">Active alerts</div>
            <Badge 
              variant={data?.activeSecurityEvents === 0 ? 'default' : 'destructive'}
              className="mt-2"
            >
              {data?.activeSecurityEvents === 0 ? 'SECURE' : 'ALERTS ACTIVE'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Panel */}
      {config && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Settings className="w-5 h-5 mr-2" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Wallet Address</Label>
                <div className="font-mono text-sm text-gray-400 bg-gray-800 p-2 rounded">
                  {config.walletAddress}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Contract Address</Label>
                <div className="font-mono text-sm text-gray-400 bg-gray-800 p-2 rounded">
                  {config.contractAddress}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Max Allowance</Label>
                <div className="font-mono text-sm text-white">
                  {parseFloat(config.maxAllowance).toLocaleString()} WPT
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Refill Threshold</Label>
                <div className="font-mono text-sm text-white">
                  {parseFloat(config.refillThreshold).toLocaleString()} WPT
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">System Active</span>
              <Badge variant="outline" className="ml-auto">
                Last updated: {new Date(config.updatedAt).toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <History className="w-5 h-5 mr-2" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No recent transactions
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.status === 'confirmed' ? 'bg-green-400' : 
                      tx.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {tx.transactionType.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-white">
                      {parseFloat(tx.amount).toFixed(2)} WPT
                    </div>
                    <div className="text-xs text-gray-400">
                      {tx.transactionHash.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}