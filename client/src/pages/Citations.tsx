import { CitationRewardsDashboard } from "@/components/citations/CitationRewardsDashboard";

export default function Citations() {
  // Use creatorId 4 - will show ZERO citations since simulated data was removed
  // This is the correct behavior: no fake data, only authentic citations
  const creatorId = 4;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <CitationRewardsDashboard creatorId={creatorId} />
      </div>
    </div>
  );
}