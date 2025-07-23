import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Quote, Coins, TrendingUp, Brain, Globe, Bot, Sparkles } from 'lucide-react';

interface CitationStats {
  totalCitations: number;
  totalRewards: number;
  citationsByType: Record<string, number>;
  citationsByAI: Record<string, number>;
  recentCitations: Array<{
    id: number;
    aiModel: string;
    citationType: string;
    sourceUrl: string;
    citationContext: string;
    rewardAmount: number;
    createdAt: string;
  }>;
}

interface CitationRewardsDashboardProps {
  creatorId: number;
}

export function CitationRewardsDashboard({ creatorId }: CitationRewardsDashboardProps) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/citations/stats', creatorId],
    enabled: !!creatorId,
    refetchInterval: 5000,
  });

  const getCitationTypeColor = (type: string) => {
    switch (type) {
      case 'direct_quote': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'content_reference': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'paraphrase': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'factual_data': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getAIModelIcon = (model: string) => {
    switch (model.toLowerCase()) {
      case 'claude': return <Bot className="h-4 w-4 text-orange-600" />;
      case 'gpt': case 'chatgpt': return <Sparkles className="h-4 w-4 text-green-600" />;
      case 'gemini': return <Globe className="h-4 w-4 text-blue-600" />;
      case 'grok': return <Brain className="h-4 w-4 text-purple-600" />;
      case 'perplexity': return <TrendingUp className="h-4 w-4 text-teal-600" />;
      case 'deepseek': return <Quote className="h-4 w-4 text-indigo-600" />;
      default: return <Bot className="h-4 w-4 text-gray-600" />;
    }
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
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
                      No citations recorded yet. Citations will appear when AI systems reference your content.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
                  {Object.entries(stats?.citationsByType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getCitationTypeColor(type)}>
                          {type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{count} citations</div>
                        <Progress 
                          value={(Number(count) / (Number(stats?.totalCitations) || 1)) * 100} 
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
                  {Object.entries(stats?.citationsByAI || {}).map(([ai, count]) => (
                    <div key={ai} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getAIModelIcon(ai)}
                        <span className="font-medium">{ai.toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{count} citations</div>
                        <Progress 
                          value={(Number(count) / (Number(stats?.totalCitations) || 1)) * 100} 
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