import { UnifiedCitationRewardsDashboard } from "@/components/citations/UnifiedCitationRewardsDashboard";

export default function Citations() {
  // Show ALL authenticated user sites with authentic AI accesses
  // User ID 1: GitHub, YouTube, Twitter, Discord, LinkedIn + all registered creators
  const userId = 1;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <UnifiedCitationRewardsDashboard userId={userId} />
      </div>
    </div>
  );
}