import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Quote, Search, TrendingUp, Zap, Brain, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CitationStats {
  totalCitations: string | number;
  totalRewards: string | number;
  citationsByType: Record<string, string | number>;
  citationsByAI: Record<string, string | number>;
  recentCitations: any[];
}

export function CitationRewardsDashboard() {
  const [selectedCreatorId, setSelectedCreatorId] = useState<number>(4); // Default creator
  const [simulationData, setSimulationData] = useState({
    creatorUrl: 'https://marcosantoriello.it',
    userQuery: '',
    aiModel: 'claude',
    citationType: 'content_reference'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch citation statistics
  const { data: citationStats, isLoading: statsLoading } = useQuery<CitationStats>({
    queryKey: ['/api/citations/stats', selectedCreatorId],
    enabled: !!selectedCreatorId,
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchOnWindowFocus: true,
  });

  // Extract stats from nested API response
  const stats = citationStats?.stats || citationStats;

  // Simulate citation mutation
  const simulateCitationMutation = useMutation({
    mutationFn: async (data: typeof simulationData) => {
      const response = await fetch('/api/citations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to simulate citation');
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Citation Simulated Successfully!",
        description: `${result.message} - Reward: ${result.rewardAmount} WPT`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/citations/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Simulation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSimulation = () => {
    if (!simulationData.userQuery.trim()) {
      toast({
        title: "Missing Query",
        description: "Please enter a user query to simulate",
        variant: "destructive",
      });
      return;
    }
    simulateCitationMutation.mutate(simulationData);
  };

  const getCitationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'direct_quote': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'content_reference': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'paraphrase': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'factual_data': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getAIModelIcon = (model: string) => {
    const icons: Record<string, React.ReactNode> = {
      'claude': <Brain className="w-4 h-4" />,
      'gpt': <Zap className="w-4 h-4" />,
      'grok': <TrendingUp className="w-4 h-4" />,
      'gemini': <Search className="w-4 h-4" />,
      'perplexity': <Quote className="w-4 h-4" />,
      'deepseek': <AlertCircle className="w-4 h-4" />,
    };
    return icons[model] || <Brain className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Citation-Based Rewards System
          </h2>
          <p className="text-muted-foreground">
            Sustainable creator rewards through AI content citation tracking
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Coins className="w-4 h-4 mr-2" />
          Next-Gen Rewards
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="simulator">Citation Simulator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Citations</CardTitle>
                <Quote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : (Number(stats?.totalCitations) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Content references by AI systems
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citation Rewards</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : (Number(stats?.totalRewards)?.toFixed(4) || '0.0000')} WPT
                </div>
                <p className="text-xs text-muted-foreground">
                  From AI content citations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Citation Type</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : 
                    Object.entries(stats?.citationsByType || {})
                      .sort(([,a], [,b]) => Number(b) - Number(a))[0]?.[0] || 'None'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Most frequent citation method
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active AI Models</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : Object.keys(stats?.citationsByAI || {}).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  AI systems citing content
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cited Sources</CardTitle>
                <CardDescription>
                  Websites and content sources being cited by AI systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statsLoading ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading cited sources...
                    </div>
                  ) : stats?.recentCitations?.length > 0 ? (
                    Array.from(new Set(stats.recentCitations.map((c: any) => c.sourceUrl))).map((url: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {url.includes('youtube') ? '▶️' : '🌐'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {url.length > 40 ? `${url.substring(0, 40)}...` : url}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {stats.recentCitations.filter((c: any) => c.sourceUrl === url).length} citation{stats.recentCitations.filter((c: any) => c.sourceUrl === url).length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {url.includes('youtube') ? 'Video' : 'Website'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No cited sources yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
            <CardHeader>
              <CardTitle>Recent Citations</CardTitle>
              <CardDescription>
                Latest AI citations of your content with reward details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading recent citations...
                  </div>
                ) : stats?.recentCitations?.length > 0 ? (
                  stats.recentCitations.slice(0, 5).map((citation: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getAIModelIcon(citation.aiModel)}
                        <div>
                          <div className="font-medium">{citation.aiModel.toUpperCase()} Citation</div>
                          <div className="text-sm text-muted-foreground">
                            {citation.citationContext?.slice(0, 60)}...
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getCitationTypeColor(citation.citationType)}>
                          {citation.citationType.replace('_', ' ')}
                        </Badge>
                        <div className="text-sm font-medium text-green-600 mt-1">
                          +{citation.rewardAmount} WPT
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No citations recorded yet. Test the system using the Citation Simulator.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Citation Simulator</CardTitle>
              <CardDescription>
                Test the citation-based reward system by simulating AI queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="creatorUrl">Creator URL</Label>
                  <Input
                    id="creatorUrl"
                    value={simulationData.creatorUrl}
                    onChange={(e) => setSimulationData({...simulationData, creatorUrl: e.target.value})}
                    placeholder="https://creator-website.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Select
                    value={simulationData.aiModel}
                    onValueChange={(value) => setSimulationData({...simulationData, aiModel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude">Claude (1.3x multiplier)</SelectItem>
                      <SelectItem value="gpt">GPT (1.2x multiplier)</SelectItem>
                      <SelectItem value="grok">Grok (1.25x multiplier)</SelectItem>
                      <SelectItem value="gemini">Gemini (1.1x multiplier)</SelectItem>
                      <SelectItem value="perplexity">Perplexity (1.0x multiplier)</SelectItem>
                      <SelectItem value="deepseek">DeepSeek (0.9x multiplier)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="citationType">Citation Type</Label>
                <Select
                  value={simulationData.citationType}
                  onValueChange={(value) => setSimulationData({...simulationData, citationType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct_quote">Direct Quote (1.5x multiplier)</SelectItem>
                    <SelectItem value="content_reference">Content Reference (1.2x multiplier)</SelectItem>
                    <SelectItem value="paraphrase">Paraphrase (1.0x multiplier)</SelectItem>
                    <SelectItem value="factual_data">Factual Data (0.8x multiplier)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userQuery">User Query</Label>
                <Textarea
                  id="userQuery"
                  value={simulationData.userQuery}
                  onChange={(e) => setSimulationData({...simulationData, userQuery: e.target.value})}
                  placeholder="What question would a user ask that would cause the AI to cite this content?"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSimulation}
                disabled={simulateCitationMutation.isPending}
                className="w-full"
              >
                {simulateCitationMutation.isPending ? 'Simulating...' : 'Simulate Citation'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Citations by Type</CardTitle>
                <CardDescription>Distribution of citation methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(citationStats?.citationsByType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getCitationTypeColor(type)}>
                          {type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{count} citations</div>
                        <Progress 
                          value={(count / (citationStats?.totalCitations || 1)) * 100} 
                          className="w-20 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Citations by AI Model</CardTitle>
                <CardDescription>Which AI systems cite your content most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(citationStats?.citationsByAI || {}).map(([ai, count]) => (
                    <div key={ai} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getAIModelIcon(ai)}
                        <span className="font-medium">{ai.toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{count} citations</div>
                        <Progress 
                          value={(count / (citationStats?.totalCitations || 1)) * 100} 
                          className="w-20 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}