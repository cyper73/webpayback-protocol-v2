import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Send, Wallet, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
  const [selectedCreator, setSelectedCreator] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: creators } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
    refetchInterval: 30000
  });

  const { data: rewards } = useQuery<RewardDistribution[]>({
    queryKey: ["/api/rewards"],
    refetchInterval: 30000
  });

  const distributeMutation = useMutation({
    mutationFn: async (data: { creatorId: number; amount: string; walletAddress: string }) => {
      return await apiRequest("/api/web3/distribute-rewards", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Reward Distribution Initiated",
        description: "Real WPT tokens are being sent to the creator's wallet on Polygon",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      setSelectedCreator("");
      setAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Distribution Failed",
        description: error.message || "Failed to distribute rewards",
        variant: "destructive"
      });
    }
  });

  const handleDistribute = () => {
    if (!selectedCreator || !amount) {
      toast({
        title: "Missing Information",
        description: "Please select a creator and enter an amount",
        variant: "destructive"
      });
      return;
    }

    const creator = creators?.find(c => c.id.toString() === selectedCreator);
    if (!creator) {
      toast({
        title: "Creator Not Found",
        description: "Selected creator not found",
        variant: "destructive"
      });
      return;
    }

    distributeMutation.mutate({
      creatorId: creator.id,
      amount: amount,
      walletAddress: creator.walletAddress
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Distribution Form */}
      <Card className="border-blue-500/20 bg-blue-900/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-400" />
            Distribute Real WPT Rewards
          </CardTitle>
          <CardDescription>
            Send actual WPT tokens to creator wallets on Polygon blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creator">Select Creator</Label>
              <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a creator" />
                </SelectTrigger>
                <SelectContent>
                  {creators?.map((creator) => (
                    <SelectItem key={creator.id} value={creator.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{creator.websiteUrl}</span>
                        {creator.isVerified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (WPT)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {selectedCreator && (
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Recipient Wallet:</p>
              <div className="flex items-center gap-2 mt-1">
                <Wallet className="h-4 w-4 text-blue-400" />
                <span className="font-mono text-sm">
                  {creators?.find(c => c.id.toString() === selectedCreator)?.walletAddress}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleDistribute} 
            disabled={!selectedCreator || !amount || distributeMutation.isPending}
            className="w-full"
          >
            {distributeMutation.isPending ? "Processing..." : "Distribute Rewards"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Distributions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Distributions</CardTitle>
          <CardDescription>
            Latest reward distributions on Polygon blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards?.slice(0, 10).map((reward) => {
              const creator = creators?.find(c => c.id === reward.creatorId);
              return (
                <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(reward.status)}
                    <div>
                      <p className="font-medium">{reward.amount} WPT</p>
                      <p className="text-sm text-gray-400">
                        To: {creator?.websiteUrl || "Unknown Creator"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={getStatusColor(reward.status)}>
                      {reward.status}
                    </Badge>
                    {reward.transactionHash && (
                      <a
                        href={`https://polygonscan.com/tx/${reward.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View on PolygonScan
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card className="border-green-500/20 bg-green-900/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="font-medium text-green-400">Blockchain Integration Active</p>
              <p className="text-sm text-gray-400 mt-1">
                Connected to your WPT token: 0x9077051D318b614F915E8A07861090856FDEC91e
              </p>
              <p className="text-sm text-gray-400">
                Pool Address: 0x823C0b22b2eaD1A3A857F2300C8259d1695C5AAB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}