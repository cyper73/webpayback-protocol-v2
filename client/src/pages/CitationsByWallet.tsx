import { useParams, Link } from "wouter";
import { useState } from "react";
import { UnifiedCitationRewardsDashboard } from "@/components/citations/UnifiedCitationRewardsDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowLeft, Shield, Eye } from "lucide-react";

export default function CitationsByWallet() {
  const { walletAddress } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // For demo purposes, we'll simulate wallet connection
  // In production, this would integrate with MetaMask/WalletConnect
  const handleWalletConnect = () => {
    setIsAuthenticated(true);
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                🔐 Wallet Authentication Required
              </h1>
              <p className="text-gray-300">
                Connect your wallet to access your personalized Citation Dashboard
              </p>
            </div>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Wallet className="h-6 w-6 text-blue-400" />
                  Wallet-Based Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Requesting Access For:</h3>
                  <Badge variant="outline" className="text-sm font-mono">
                    {walletAddress}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-400" />
                    Only you can access your citation data
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 text-blue-400" />
                    View all your registered platforms in one dashboard
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4 text-purple-400" />
                    Decentralized authentication via wallet signature
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button 
                    onClick={handleWalletConnect}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet & Access Dashboard
                  </Button>
                  
                  <Link href="/citations">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to General Dashboard
                    </Button>
                  </Link>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border/20">
                  🔒 Your data is protected by blockchain-based authentication
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Wallet Info Header */}
        <div className="mb-6 p-4 bg-muted/10 rounded-lg border border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Authenticated Wallet</p>
                <Badge variant="outline" className="text-xs font-mono">
                  {walletAddress}
                </Badge>
              </div>
            </div>
            <Link href="/citations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                General Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Personalized Dashboard - Using wallet address as user identifier */}
        <UnifiedCitationRewardsDashboard 
          key={`wallet-${walletAddress}`}
          userId={1} // For now, we'll need to map wallet to userId
          walletAddress={walletAddress}
        />
      </div>
    </div>
  );
}