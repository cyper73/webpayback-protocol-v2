import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, Eye, Zap, TrendingDown, Activity, Clock, Target, AlertCircle, CheckCircle } from "lucide-react";

interface WalletAnalysis {
  address: string;
  analysis?: {
    fingerprintId: string;
    riskScore: number;
    uniquenessScore: number;
    suspiciousPatterns: string[];
    recommendedAction: string;
    confidence: number;
    similarWallets: string[];
    signatureAnalysis: any;
    gasAnalysis: any;
    timingAnalysis: any;
    networkAnalysis: any;
    nonceAnalysis: any;
  };
  error?: string;
  status: 'analyzed' | 'failed';
}

interface AnalysisResult {
  results: WalletAnalysis[];
  totalAnalyzed: number;
  timestamp: string;
}

export default function WalletFingerprintingDashboard() {
  const queryClient = useQueryClient();

  // Fetch suspicious wallet analysis
  const { 
    data: analysisData,
    isLoading,
    refetch: refreshAnalysis
  } = useQuery<AnalysisResult>({
    queryKey: ['/api/wallet-fingerprinting/analyze-suspicious'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const analyzeWalletMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/wallet-fingerprinting/analyze-suspicious', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-fingerprinting/analyze-suspicious'] });
    }
  });

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'CRITICAL', color: 'bg-red-500', textColor: 'text-red-700' };
    if (score >= 60) return { level: 'HIGH', color: 'bg-orange-500', textColor: 'text-orange-700' };
    if (score >= 40) return { level: 'MEDIUM', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { level: 'LOW', color: 'bg-green-500', textColor: 'text-green-700' };
  };

  const getThreatIcon = (score: number) => {
    if (score >= 80) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-orange-500" />;
    if (score >= 40) return <Eye className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  if (isLoading && !analysisData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Advanced Wallet Fingerprinting
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Analyzing suspicious wallet patterns...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const results = analysisData?.results || [];
  const criticalWallets = results.filter(r => r.analysis && r.analysis.riskScore >= 80);
  const highRiskWallets = results.filter(r => r.analysis && r.analysis.riskScore >= 60 && r.analysis.riskScore < 80);
  const totalSuspiciousPatterns = results.reduce((sum, r) => 
    sum + (r.analysis?.suspiciousPatterns?.length || 0), 0
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Advanced Wallet Fingerprinting
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time blockchain security monitoring system
            </p>
          </div>
        </div>
        <Button 
          onClick={() => analyzeWalletMutation.mutate()}
          disabled={analyzeWalletMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          {analyzeWalletMutation.isPending ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Under analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalWallets.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Risk score ≥80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highRiskWallets.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Risk score 60-79</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patterns Found</CardTitle>
            <Target className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalSuspiciousPatterns}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Suspicious patterns</p>
          </CardContent>
        </Card>
      </div>

      {analysisData && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Last analysis: {new Date(analysisData.timestamp).toLocaleString()}
            {' • '}Next update: {new Date(Date.now() + 30000).toLocaleTimeString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="wallets">Wallet Analysis</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {results.map((result, index) => (
              <Card key={index} className="border-l-4" style={{
                borderLeftColor: result.analysis ? getRiskLevel(result.analysis.riskScore).color.replace('bg-', '#') : '#gray'
              }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.analysis ? getThreatIcon(result.analysis.riskScore) : null}
                      <div>
                        <CardTitle className="text-lg font-mono">
                          {result.address.slice(0, 10)}...{result.address.slice(-8)}
                        </CardTitle>
                        {result.analysis && (
                          <Badge 
                            variant="outline" 
                            className={`${getRiskLevel(result.analysis.riskScore).color} text-white border-none`}
                          >
                            {getRiskLevel(result.analysis.riskScore).level} RISK
                          </Badge>
                        )}
                      </div>
                    </div>
                    {result.analysis && (
                      <div className="text-right">
                        <div className="text-2xl font-bold">{result.analysis.riskScore}/100</div>
                        <div className="text-sm text-gray-600">Risk Score</div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {result.status === 'failed' ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Analysis failed: {result.error}
                      </AlertDescription>
                    </Alert>
                  ) : result.analysis ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Risk Assessment</span>
                        <Progress 
                          value={result.analysis.riskScore} 
                          className="w-32"
                        />
                      </div>
                      
                      {result.analysis.suspiciousPatterns.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Detected Patterns:</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.analysis.suspiciousPatterns.map((pattern, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {pattern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="text-sm font-semibold mb-1">Recommended Action:</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {result.analysis.recommendedAction}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Uniqueness:</span> {result.analysis.uniquenessScore}/100
                        </div>
                        <div>
                          <span className="font-semibold">Confidence:</span> {result.analysis.confidence}%
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">Detailed Wallet Analysis</h3>
            {results.filter(r => r.analysis).map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="font-mono">{result.address}</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Signature Analysis</h4>
                        <div className="text-sm space-y-1">
                          <div>Entropy Level: {result.analysis.signatureAnalysis?.entropy || 'N/A'}</div>
                          <div>Pattern Score: {result.analysis.signatureAnalysis?.patternScore || 'N/A'}/100</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Gas Usage Profile</h4>
                        <div className="text-sm space-y-1">
                          <div>Consistency: {result.analysis.gasAnalysis?.consistency || 'N/A'}%</div>
                          <div>Automation Score: {result.analysis.gasAnalysis?.automationScore || 'N/A'}/100</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Timing Profile</h4>
                        <div className="text-sm space-y-1">
                          <div>Regularity: {result.analysis.timingAnalysis?.regularity || 'N/A'}%</div>
                          <div>Human Likelihood: {result.analysis.timingAnalysis?.humanLikelihood || 'N/A'}%</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Network Activity</h4>
                        <div className="text-sm space-y-1">
                          <div>Contract Ratio: {result.analysis.networkAnalysis?.contractRatio || 'N/A'}%</div>
                          <div>Bot Probability: {result.analysis.networkAnalysis?.botProbability || 'N/A'}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">Pattern Detection Results</h3>
            
            {results.filter(r => r.analysis?.suspiciousPatterns.length > 0).map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-mono text-lg">
                      {result.address.slice(0, 16)}...{result.address.slice(-6)}
                    </CardTitle>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {result.analysis?.suspiciousPatterns.length} Patterns
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.analysis?.suspiciousPatterns.map((pattern, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium">{pattern}</span>
                      </div>
                    ))}
                    
                    {result.analysis?.similarWallets.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold mb-2">Similar Wallets (Potential Sybil Network):</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis.similarWallets.map((wallet, i) => (
                            <Badge key={i} variant="outline" className="font-mono text-xs">
                              {wallet.slice(0, 8)}...{wallet.slice(-4)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {results.filter(r => r.analysis?.suspiciousPatterns.length > 0).length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Suspicious Patterns</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All analyzed wallets show normal behavior patterns
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}