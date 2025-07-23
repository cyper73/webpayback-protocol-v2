import { CitationRewardsDashboard } from "@/components/citations/CitationRewardsDashboard";

export default function Citations() {
  // Use creatorId 7 - shows AUTHENTIC GitHub accesses (cyper73/webpayback)
  // 12 real AI accesses: Claude, GPT, DeepSeek, Grok, Mistral, Perplexity
  const creatorId = 7;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <CitationRewardsDashboard creatorId={creatorId} />
      </div>
    </div>
  );
}