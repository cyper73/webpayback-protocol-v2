import { UnifiedCitationRewardsDashboard } from "@/components/citations/UnifiedCitationRewardsDashboard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Wallet } from "lucide-react";

export default function Citations() {
  // Show ALL authenticated user sites with authentic AI accesses
  // User ID 1: GitHub, YouTube, Twitter, Discord, LinkedIn + all registered creators
  const userId = 1;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📊 Unified Citation Rewards Dashboard
          </h1>
          <p className="text-gray-300 mb-4">
            Track all citation rewards from AI systems across all platforms
          </p>
          
          {/* Wallet-Based Access Link */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-300">Individual Creator Access</span>
              </div>
              <Link href="/citations/0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba">
                <Button size="sm" variant="outline" className="text-xs">
                  Access Via Wallet
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              🔐 Blockchain-based personal dashboard access
            </p>
          </div>
        </div>
        
        <UnifiedCitationRewardsDashboard key={Date.now()} userId={userId} />
      </div>
    </div>
  );
}