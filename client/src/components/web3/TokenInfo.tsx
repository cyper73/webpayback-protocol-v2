import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, TrendingUp, Activity } from "lucide-react";

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  poolAddress: string;
  poolLiquidity: string;
}

interface PoolInfo {
  poolAddress: string;
  token0: string;
  token1: string;
  liquidity: string;
  price: string;
  volume24h: string;
  fees24h: string;
}

interface NetworkStatus {
  chainId: number;
  networkName: string;
  rpcUrl: string;
  explorerUrl: string;
  tokenAddress: string;
  poolAddress: string;
  isConnected: boolean;
  blockHeight: number;
}

export default function TokenInfo() {
  const { data: tokenInfo } = useQuery<TokenInfo>({
    queryKey: ["/api/web3/token-info"],
    refetchInterval: 30000
  });

  const { data: poolInfo } = useQuery<PoolInfo>({
    queryKey: ["/api/web3/pool-info"],
    refetchInterval: 30000
  });

  const { data: networkStatus } = useQuery<NetworkStatus>({
    queryKey: ["/api/web3/network-status"],
    refetchInterval: 30000
  });

  const formatNumber = (value: string, decimals: number = 18) => {
    const num = parseFloat(value) / Math.pow(10, decimals);
    return num.toLocaleString();
  };

  const formatPrice = (value: string) => {
    return parseFloat(value).toFixed(6);
  };

  if (!tokenInfo || !poolInfo || !networkStatus) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <Card className="border-green-500/20 bg-green-900/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Network Status
          </CardTitle>
          <CardDescription>
            Connected to {networkStatus.networkName} (Chain ID: {networkStatus.chainId})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Block</p>
              <p className="text-lg font-semibold">{networkStatus.blockHeight.toLocaleString()}</p>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {networkStatus.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Token Information */}
      <Card className="border-blue-500/20 bg-blue-900/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            WPT Token Information
          </CardTitle>
          <CardDescription>
            Real token deployed on Polygon blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Contract Address</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono">{tokenInfo.address.slice(0, 8)}...{tokenInfo.address.slice(-6)}</p>
                <a 
                  href={`${networkStatus.explorerUrl}/token/${tokenInfo.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Symbol</p>
              <p className="text-lg font-semibold">{tokenInfo.symbol}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Supply</p>
              <p className="text-lg font-semibold">{formatNumber(tokenInfo.totalSupply)} WPT</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Decimals</p>
              <p className="text-lg font-semibold">{tokenInfo.decimals}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Information */}
      <Card className="border-purple-500/20 bg-purple-900/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Liquidity Pool ({poolInfo.token0}/{poolInfo.token1})
          </CardTitle>
          <CardDescription>
            Live pool data from Polygon DEX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Pool Address</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono">{poolInfo.poolAddress.slice(0, 8)}...{poolInfo.poolAddress.slice(-6)}</p>
                <a 
                  href={`${networkStatus.explorerUrl}/address/${poolInfo.poolAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="text-lg font-semibold">{formatPrice(poolInfo.price)} MATIC</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Liquidity</p>
              <p className="text-lg font-semibold">{formatNumber(poolInfo.liquidity)} WPT</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">24h Volume</p>
              <p className="text-lg font-semibold">{formatNumber(poolInfo.volume24h)} WPT</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">24h Fees</p>
              <p className="text-lg font-semibold">{formatNumber(poolInfo.fees24h)} WPT</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Blockchain Integration Notice */}
      <Card className="border-amber-500/20 bg-amber-900/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-amber-400 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-amber-400">Real Blockchain Integration</p>
              <p className="text-sm text-gray-400 mt-1">
                This is connected to your actual WPT token on Polygon. All reward distributions will be processed through the real smart contract.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}