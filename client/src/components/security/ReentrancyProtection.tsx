import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Zap, Code, Target, TestTube, Activity } from "lucide-react";

interface ReentrancyStats {
  totalChecks: number;
  blockedAttempts: number;
  flaggedTransactions: number;
  averageCallDepth: number;
  topRiskyContracts: Array<{
    contractAddress: string;
    attempts: number;
    maxCallDepth: number;
    riskScore: number;
  }>;
  recentBlocks: Array<{
    contractAddress: string;
    functionSelector: string;
    callDepth: number;
    timestamp: Date;
    riskScore: number;
  }>;
}

const ReentrancyProtection: React.FC = () => {
  const [stats, setStats] = useState<ReentrancyStats | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [simulationType, setSimulationType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica statistiche
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/reentrancy/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (err) {
        setError('Failed to load reentrancy protection stats');
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh ogni 30 secondi
    return () => clearInterval(interval);
  }, []);

  // Esegui test di protezione
  const runTest = async () => {
    if (!simulationType) {
      setError('Please select a simulation type');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reentrancy/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          simulationType,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTestResult(result);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Test failed');
      }
    } catch (err) {
      setError('Failed to run reentrancy test');
    } finally {
      setIsLoading(false);
    }
  };

  // Ottieni colore per il livello di rischio
  const getRiskColor = (score: number) => {
    if (score >= 90) return 'text-red-600';
    if (score >= 70) return 'text-orange-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Ottieni badge per l'azione raccomandata
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'block':
        return <Badge variant="destructive">Block</Badge>;
      case 'flag':
        return <Badge variant="secondary">Flag</Badge>;
      case 'allow':
        return <Badge variant="default">Allow</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Formatta l'indirizzo del contratto
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Formatta il function selector
  const formatFunctionSelector = (selector: string) => {
    const knownFunctions: { [key: string]: string } = {
      '0xa9059cbb': 'transfer()',
      '0x23b872dd': 'transferFrom()',
      '0x2e1a7d4d': 'withdraw(uint256)',
      '0x3ccfd60b': 'withdraw()',
      '0x095ea7b3': 'approve()',
      '0x6a761202': 'emergencyWithdraw()',
      '0x441a3e70': 'harvest()',
      '0x1249c58b': 'mint()',
      '0x42966c68': 'burn()',
    };
    
    return knownFunctions[selector] || selector;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Reentrancy Protection</h2>
        </div>
        <Badge variant={stats && stats.totalChecks > 0 ? "default" : "destructive"}>
          {stats && stats.totalChecks > 0 ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500" />
              Total Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalChecks || 0}
            </div>
            <p className="text-xs text-gray-600">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              Blocked Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.blockedAttempts || 0}
            </div>
            <p className="text-xs text-gray-600">Reentrancy attacks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-yellow-500" />
              Flagged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.flaggedTransactions || 0}
            </div>
            <p className="text-xs text-gray-600">Suspicious transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-purple-500" />
              Avg Call Depth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.averageCallDepth?.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-gray-600">Function calls</p>
          </CardContent>
        </Card>
      </div>

      {/* Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-4 w-4 mr-2" />
            Reentrancy Testing
          </CardTitle>
          <CardDescription>
            Test the reentrancy protection system with different attack scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Select value={simulationType} onValueChange={setSimulationType}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select attack scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal Transaction</SelectItem>
                  <SelectItem value="deep_call">Deep Call Stack</SelectItem>
                  <SelectItem value="high_frequency">High Frequency</SelectItem>
                  <SelectItem value="gas_drain">Gas Drain Attack</SelectItem>
                  <SelectItem value="known_vulnerable">Known Vulnerable Contract</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={runTest} disabled={isLoading}>
                {isLoading ? 'Testing...' : 'Run Test'}
              </Button>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {testResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Test Results</span>
                    <Badge variant="outline">{testResult.testType}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Contract:</span>
                        <p className="font-mono text-sm">{formatAddress(testResult.testTransaction.contractAddress)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Function:</span>
                        <p className="font-mono text-sm">{formatFunctionSelector(testResult.testTransaction.functionSelector)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium">Call Depth:</span>
                        <p className="text-lg font-bold">{testResult.testTransaction.callDepth}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Gas Used:</span>
                        <p className="text-lg font-bold">{testResult.testTransaction.gasUsed.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Risk Score:</span>
                        <p className={`text-lg font-bold ${getRiskColor(testResult.analysis.riskScore)}`}>
                          {testResult.analysis.riskScore}%
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Reentrancy Detected:</span>
                        <Badge variant={testResult.analysis.isReentrancyDetected ? "destructive" : "default"}>
                          {testResult.analysis.isReentrancyDetected ? "YES" : "NO"}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Recommended Action:</span>
                        {getActionBadge(testResult.analysis.recommendedAction)}
                      </div>
                    </div>

                    {testResult.analysis.suspiciousPatterns.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-sm font-medium">Suspicious Patterns:</span>
                        <ul className="text-sm text-gray-600 mt-1">
                          {testResult.analysis.suspiciousPatterns.map((pattern: string, index: number) => (
                            <li key={index} className="flex items-center space-x-2">
                              <AlertTriangle className="h-3 w-3 text-orange-500" />
                              <span>{pattern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600">
                        <strong>Evidence:</strong> {testResult.analysis.evidence}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Risky Contracts */}
      {stats?.topRiskyContracts && stats.topRiskyContracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Top Risky Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topRiskyContracts.map((contract, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-mono text-sm">{formatAddress(contract.contractAddress)}</div>
                    <div className="text-xs text-gray-600">
                      {contract.attempts} attempts • Max depth: {contract.maxCallDepth}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getRiskColor(contract.riskScore)}`}>
                        {contract.riskScore.toFixed(1)}%
                      </div>
                      <Progress value={contract.riskScore} className="w-16 h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Blocks */}
      {stats?.recentBlocks && stats.recentBlocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Recent Blocked Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentBlocks.slice(0, 5).map((block, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <div className="flex-1">
                    <div className="font-mono text-sm">{formatAddress(block.contractAddress)}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatFunctionSelector(block.functionSelector)} • Call depth: {block.callDepth}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(block.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm font-semibold ${getRiskColor(block.riskScore)}`}>
                      {block.riskScore}%
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Blocked
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.recentBlocks.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  +{stats.recentBlocks.length - 5} more blocked transactions
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReentrancyProtection;