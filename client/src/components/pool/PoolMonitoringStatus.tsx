import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PoolCacheStatus {
  isValid: boolean;
  lastFetch: string;
  nextRefresh: string;
  dataSource: string;
  hoursUntilRefresh: number;
}

export default function PoolMonitoringStatus() {
  const { data: cacheStatus, refetch: refetchStatus } = useQuery<{
    success: boolean;
    status: PoolCacheStatus;
  }>({
    queryKey: ['/api/web3/pool-cache-status'],
    refetchInterval: 30000 // Check status every 30 seconds
  });

  const { data: poolInfo } = useQuery({
    queryKey: ['/api/web3/pool-info'],
    refetchInterval: 30000
  });

  const handleForceRefresh = async () => {
    try {
      await apiRequest('/api/web3/refresh-pools', {
        method: 'POST'
      });
      // Refresh both status and pool data
      refetchStatus();
      setTimeout(() => {
        window.location.reload(); // Refresh dashboard to show updated data
      }, 1000);
    } catch (error) {
      console.error('Failed to refresh pool data:', error);
    }
  };

  const formatLastUpdate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!cacheStatus?.status) {
    return (
      <Card className="border-gray-500/20">
        <CardContent className="pt-6">
          <div className="text-gray-400">Loading monitoring status...</div>
        </CardContent>
      </Card>
    );
  }

  const status = cacheStatus.status;
  const isDataFresh = status.isValid;

  return (
    <Card className="border-blue-500/20 bg-blue-900/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Pool Data Monitoring
          <Badge variant={isDataFresh ? "default" : "destructive"} className="ml-auto">
            {isDataFresh ? "Active" : "Refreshing"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Automatic pool data refresh every 12 hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDataFresh ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            )}
            <span className="text-sm font-medium">
              {isDataFresh ? "Data Current" : "Refreshing..."}
            </span>
          </div>
          <Badge variant="outline">
            {status.dataSource}
          </Badge>
        </div>

        {/* Last Update Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Last Updated:</span>
            <span>{formatLastUpdate(status.lastFetch)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Next Refresh:</span>
            <span>{new Date(status.nextRefresh).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Current Pool Data Summary */}
        {poolInfo && (
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm font-medium mb-2">Current Pool Metrics:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">TVL:</span>
                <span className="ml-2 font-semibold">{poolInfo.totalValueLocked}</span>
              </div>
              <div>
                <span className="text-gray-500">Price:</span>
                <span className="ml-2 font-semibold">{poolInfo.price} WMATIC</span>
              </div>
              <div>
                <span className="text-gray-500">24h Volume:</span>
                <span className="ml-2">{poolInfo.volume24h}</span>
              </div>
              <div>
                <span className="text-gray-500">Participants:</span>
                <span className="ml-2">{poolInfo.participants}</span>
              </div>
            </div>
          </div>
        )}

        {/* Manual Refresh Button */}
        <Button 
          onClick={handleForceRefresh}
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Force Refresh Now
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          Monitoring interval: Every 12 hours as requested
        </div>
      </CardContent>
    </Card>
  );
}