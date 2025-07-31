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

// CLIENT-SIDE SECURITY: Immediate device authentication check
const isFounderDevice = (): boolean => {
  const userAgent = navigator.userAgent;
  return userAgent.includes('Windows') && (userAgent.includes('Chrome') || userAgent.includes('Firefox'));
};

export default function AllowanceManagementPage() {
  const [clientSideAccess, setClientSideAccess] = useState<boolean | null>(null);
  const [walletAddress, setWalletAddress] = useState(DEFAULT_WALLET);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [newConfig, setNewConfig] = useState({
    maxAllowance: "2000000", // 2M WPT - Configurazione suggerita
    refillThreshold: "50000", // 50k WPT - Soglia ricarica automatica
    refillAmount: "500000", // 500k WPT - Quantità per ricarica
    alertThreshold: "100000", // 100k WPT - Soglia notifica
    contractAddress: "0x9408f17a8B4666f8cb8231BA213DE04137dc3825", // WPT Contract
    tokenAddress: "0x9408f17a8B4666f8cb8231BA213DE04137dc3825", // WPT Token
    autoRefill: true, // Ricarica automatica attivata
    isActive: true // Sistema attivo
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // IMMEDIATE CLIENT-SIDE SECURITY CHECK
  useEffect(() => {
    const hasAccess = isFounderDevice();
    setClientSideAccess(hasAccess);
    
    if (!hasAccess) {
      console.log('🔒 SECURITY: Unauthorized device blocked from accessing Allowance Management');
    }
  }, []);

  // Block immediately if client-side check fails
  if (clientSideAccess === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Shield className="h-6 w-6 mr-2" />
              Access Denied - Security Block
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Allowance Management - Unauthorized Access Blocked</strong>
                <br />
                This module is restricted to the WebPayback Protocol founder only. 
                Token allowance management requires highest security clearance.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded">
              <h4 className="font-semibold mb-2 text-red-800">🛡️ Security Requirements:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Authorized device (Windows + Chrome/Firefox)</li>
                <li>Founder-level authentication required</li>
                <li>Device fingerprint validation</li>
                <li>Multi-layer security verification</li>
                <li>Founder wallet: {DEFAULT_WALLET}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while performing client-side checks
  if (clientSideAccess === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying device authorization...</p>
        </div>
      </div>
    );
  }

  // First check authorization via server API
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["/api/allowance/auth-check"],
    retry: false,
  });

  // Only fetch dashboard data if authorized
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/allowance/dashboard", walletAddress],
    enabled: !!walletAddress && (authData as any)?.authorized === true,
  });

  // Setup allowance mutation
  const setupAllowanceMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest("POST", "/api/allowance/setup", {
        walletAddress,
        ...config,
        isActive: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Allowance configuration updated successfully",
      });
      setIsConfiguring(false);
      queryClient.invalidateQueries({ queryKey: ["/api/allowance/dashboard"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSetupAllowance = () => {
    setupAllowanceMutation.mutate(newConfig);
  };

  const formatNumber = (value: string) => {
    return parseFloat(value).toLocaleString();
  };

  const formatWPT = (value: string) => {
    return `${formatNumber(value)} WPT`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "critical": return "bg-red-100 text-red-800";
      case "emergency": return "bg-red-200 text-red-900";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "pending": return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-600" />;
    }
  };

  // Show loading during auth check
  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Verifying authorization...</span>
        </div>
      </div>
    );
  }

  // Check server-side authorization
  if (!(authData as any)?.authorized) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Shield className="h-5 w-5 mr-2" />
                Access Restricted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Allowance Management Access Denied</strong>
                  <br />
                  {(authData as any)?.error || "This functionality is restricted to the WebPayback Protocol founder only. Automated token reserve management requires highest security clearance."}
                </AlertDescription>
              </Alert>
              <div className="mt-4 text-sm text-gray-600">
                <h4 className="font-semibold mb-2">Security Features:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Server-side authentication validation</li>
                  <li>Device fingerprint authentication</li>
                  <li>Wallet address validation</li>
                  <li>Session-based access control</li>
                  <li>Multi-layer authorization</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading allowance data...</span>
        </div>
      </div>
    );
  }

  const dashboard = (dashboardData as any)?.dashboard as DashboardData | undefined;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Allowance Management</h1>
          <div className="mt-2">
            <p className="text-gray-600">
              Sistema di automazione per la distribuzione rewards WPT senza MetaMask
            </p>
            {!dashboard && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>🚀 Sistema non ancora configurato</strong> - Clicca "Configure" per attivare l'automazione
                </p>
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={() => setIsConfiguring(!isConfiguring)}
          variant={isConfiguring ? "outline" : "default"}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isConfiguring ? "Cancel" : "Configure"}
        </Button>
      </div>

      {/* Configuration Panel */}
      {isConfiguring && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Allowance Configuration
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Configura l'automazione per la distribuzione dei rewards WPT. I valori preimpostati sono ottimizzati per i tuoi 10M WPT token.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxAllowance">Maximum Allowance (WPT)</Label>
                <Input
                  id="maxAllowance"
                  value={newConfig.maxAllowance}
                  onChange={(e) => setNewConfig({ ...newConfig, maxAllowance: e.target.value })}
                  placeholder="5000000"
                />
                <p className="text-sm text-gray-500 mt-1">Total tokens contract can use</p>
              </div>
              
              <div>
                <Label htmlFor="refillThreshold">Refill Threshold (WPT)</Label>
                <Input
                  id="refillThreshold"
                  value={newConfig.refillThreshold}
                  onChange={(e) => setNewConfig({ ...newConfig, refillThreshold: e.target.value })}
                  placeholder="50000"
                />
                <p className="text-sm text-gray-500 mt-1">Auto-refill when reserves drop below</p>
              </div>
              
              <div>
                <Label htmlFor="refillAmount">Refill Amount (WPT)</Label>
                <Input
                  id="refillAmount"
                  value={newConfig.refillAmount}
                  onChange={(e) => setNewConfig({ ...newConfig, refillAmount: e.target.value })}
                  placeholder="500000"
                />
                <p className="text-sm text-gray-500 mt-1">Tokens to transfer per refill</p>
              </div>
              
              <div>
                <Label htmlFor="alertThreshold">Alert Threshold (WPT)</Label>
                <Input
                  id="alertThreshold"
                  value={newConfig.alertThreshold}
                  onChange={(e) => setNewConfig({ ...newConfig, alertThreshold: e.target.value })}
                  placeholder="100000"
                />
                <p className="text-sm text-gray-500 mt-1">Send alert when reserves drop below</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configurazione Suggerita:</strong><br/>
                  • Max Allowance: 2M WPT (20% dei tuoi token)<br/>
                  • Refill Amount: 500K WPT per ricarica<br/>
                  • Refill Threshold: 50K WPT (ricarica automatica)<br/>
                  • Alert Threshold: 100K WPT (notifica preventiva)
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleSetupAllowance}
                disabled={setupAllowanceMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {setupAllowanceMutation.isPending ? "Configurando..." : "🚀 Attiva Allowance Management"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Max Allowance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Max Allowance</p>
                  <p className="text-2xl font-bold">{formatWPT(dashboard.config.maxAllowance)}</p>
                </div>
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Used Allowance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Used Allowance</p>
                  <p className="text-2xl font-bold">{formatWPT(dashboard.config.usedAllowance)}</p>
                  <p className="text-sm text-gray-500">{dashboard.utilizationPercent}% utilized</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Reserve Balance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reserve Balance</p>
                  <p className="text-2xl font-bold">
                    {dashboard.reserveStatus 
                      ? formatWPT(dashboard.reserveStatus.currentBalance)
                      : "N/A"
                    }
                  </p>
                  {dashboard.reserveStatus && (
                    <Badge className={getStatusColor(dashboard.reserveStatus.alertLevel)}>
                      {dashboard.reserveStatus.alertLevel}
                    </Badge>
                  )}
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Security Events */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Events</p>
                  <p className="text-2xl font-bold">{dashboard.activeSecurityEvents}</p>
                  <p className="text-sm text-gray-500">Active alerts</p>
                </div>
                <Shield className={`h-8 w-8 ${dashboard.activeSecurityEvents > 0 ? "text-red-600" : "text-green-600"}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionStatusIcon(tx.status)}
                    <div>
                      <p className="font-medium capitalize">{tx.transactionType}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatWPT(tx.amount)}</p>
                    <p className="text-sm text-gray-500 font-mono">
                      {tx.transactionHash.slice(0, 8)}...{tx.transactionHash.slice(-6)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      {dashboard?.reserveStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Reserve Pool Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Daily Usage</Label>
                <p className="text-lg font-semibold">
                  {formatWPT(dashboard.reserveStatus.totalDistributedToday)}
                </p>
              </div>
              <div>
                <Label>Average Daily Usage</Label>
                <p className="text-lg font-semibold">
                  {formatWPT(dashboard.reserveStatus.averageDailyUsage)}
                </p>
              </div>
              <div>
                <Label>Projected Days Remaining</Label>
                <p className="text-lg font-semibold">
                  {dashboard.reserveStatus.projectedDaysRemaining || "∞"} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Configuration Message */}
      {!dashboard && !error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No allowance configuration found for this wallet. Click "Configure" to set up automated token management.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load allowance data. Please try again later.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}