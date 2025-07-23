import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowLeft, Shield, BarChart3, Coins, Brain } from "lucide-react";

interface CitationStats {
  totalCitations: string;
  totalRewards: string;
  citationsByAI: Record<string, number>;
  recentCitations: Array<{
    id: number;
    aiModel: string;
    rewardAmount: string;
    timestamp: string;
    usageCount: number;
    detectionConfidence: number;
  }>;
  citedSources: string[];
  isAuthentic: boolean;
  walletAddress: string;
}

export default function CitationsByWallet() {
  const { walletAddress } = useParams();

  const { data: citationData, isLoading, error } = useQuery<{ success: boolean; stats: CitationStats; message: string }>({
    queryKey: ['/api/citations/wallet', walletAddress],
    enabled: !!walletAddress,
  });

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400">Invalid Wallet Address</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please provide a valid wallet address in the URL.
            </p>
            <Link href="/citations">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to General Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white">Loading Citation Data...</h2>
              <p className="text-gray-300">Fetching authentic blockchain data for wallet {walletAddress}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !citationData?.success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-border/50 border-red-500/50">
              <CardHeader className="text-center">
                <CardTitle className="text-red-400">Error Loading Data</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Unable to load citation data for wallet: {walletAddress}
                </p>
                <Link href="/citations">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Wallet Input
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const stats = citationData.stats;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🎯 Citation Rewards Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm font-mono">
                  {walletAddress}
                </Badge>
                {stats.isAuthentic && (
                  <Badge className="bg-green-600 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Authentic Data
                  </Badge>
                )}
              </div>
            </div>
            <Link href="/citations">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  Total Citations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalCitations}</div>
                <p className="text-xs text-muted-foreground">AI system accesses</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  Total Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalRewards} WPT</div>
                <p className="text-xs text-muted-foreground">Authentic blockchain rewards</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Brain className="h-4 w-4 text-purple-400" />
                  AI Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{Object.keys(stats.citationsByAI).length}</div>
                <p className="text-xs text-muted-foreground">Different AI systems</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Breakdown */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>AI Citations Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(stats.citationsByAI).map(([aiModel, count]) => (
                  <div key={aiModel} className="text-center">
                    <div className="text-lg font-bold text-white">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">{aiModel}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Citations */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Recent Citations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentCitations.slice(0, 5).map((citation) => (
                  <div key={citation.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {citation.aiModel}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {new Date(citation.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">{citation.rewardAmount} WPT</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(citation.detectionConfidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cited Sources */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Your Cited Sources ({stats.citedSources.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stats.citedSources.map((source, index) => (
                  <div key={index} className="p-2 bg-muted/20 rounded text-sm font-mono text-muted-foreground truncate">
                    {source}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}