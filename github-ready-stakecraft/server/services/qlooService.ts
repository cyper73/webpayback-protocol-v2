/**
 * Qloo Cultural Intelligence Service
 * Integrates Qloo API for taste-aware content analysis and cultural context understanding
 */

interface QlooTasteProfile {
  categories: string[];
  genres: string[];
  cultural_context: {
    region: string;
    demographic: string;
    interests: string[];
  };
  taste_score: number;
  cultural_relevance: number;
  engagement_potential: number;
}

interface QlooContentAnalysis {
  content_id: string;
  content_type: 'video' | 'article' | 'podcast' | 'image' | 'social_post';
  detected_categories: string[];
  cultural_tags: string[];
  taste_profile: QlooTasteProfile;
  audience_match: {
    primary_demographic: string;
    cultural_affinity: number;
    taste_alignment: number;
  };
  reward_multiplier: number;
  cultural_bonus: number;
}

interface QlooRewardCalculation {
  base_reward: number;
  cultural_multiplier: number;
  taste_bonus: number;
  inclusivity_score: number;
  final_reward: number;
  reasoning: string[];
}

export class QlooService {
  private apiKey: string;
  private baseUrl = 'https://api.qloo.com/v1';
  
  constructor() {
    this.apiKey = process.env.QLOO_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Qloo API key not found. Cultural intelligence features will be simulated.');
    }
  }

  /**
   * Analyze content for cultural context and taste profile
   */
  async analyzeContent(contentUrl: string, contentText?: string): Promise<QlooContentAnalysis> {
    try {
      if (!this.apiKey) {
        return this.simulateQlooAnalysis(contentUrl, contentText);
      }

      // Real Qloo API integration
      const response = await fetch(`${this.baseUrl}/cultural/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: contentUrl,
          text: contentText,
          analysis_depth: 'deep',
          cultural_context: true,
          taste_profiling: true
        })
      });

      if (!response.ok) {
        throw new Error(`Qloo API error: ${response.status}`);
      }

      const data = await response.json();
      return this.processQlooResponse(data, contentUrl);

    } catch (error) {
      console.error('Qloo analysis failed:', error);
      return this.simulateQlooAnalysis(contentUrl, contentText);
    }
  }

  /**
   * Calculate culturally-aware WPT rewards
   */
  async calculateCulturalReward(
    baseReward: number,
    analysis: QlooContentAnalysis,
    userLocation?: string
  ): Promise<QlooRewardCalculation> {
    
    // Cultural multiplier based on content inclusivity and cultural relevance
    let culturalMultiplier = 1.0;
    const reasoning: string[] = [];

    // Inclusivity bonus for diverse content
    if (analysis.taste_profile.categories.includes('diverse_culture')) {
      culturalMultiplier += 0.3;
      reasoning.push('Diverse cultural content (+30%)');
    }

    // Regional relevance bonus
    if (userLocation && analysis.audience_match.cultural_affinity > 0.7) {
      culturalMultiplier += 0.2;
      reasoning.push('High regional cultural affinity (+20%)');
    }

    // Taste alignment bonus
    const tasteBonus = analysis.audience_match.taste_alignment * 0.4;
    culturalMultiplier += tasteBonus;
    reasoning.push(`Taste alignment bonus (+${(tasteBonus * 100).toFixed(1)}%)`);

    // Underrepresented culture bonus
    if (this.isUnderrepresentedCulture(analysis.cultural_tags)) {
      culturalMultiplier += 0.5;
      reasoning.push('Underrepresented culture support (+50%)');
    }

    // Community engagement potential
    const engagementMultiplier = analysis.taste_profile.engagement_potential * 0.25;
    culturalMultiplier += engagementMultiplier;
    reasoning.push(`Community engagement potential (+${(engagementMultiplier * 100).toFixed(1)}%)`);

    const finalReward = baseReward * culturalMultiplier;

    return {
      base_reward: baseReward,
      cultural_multiplier: culturalMultiplier,
      taste_bonus: tasteBonus,
      inclusivity_score: analysis.taste_profile.cultural_relevance,
      final_reward: Math.round(finalReward * 100) / 100,
      reasoning
    };
  }

  /**
   * Get trending cultural categories
   */
  async getTrendingCulturalCategories(): Promise<string[]> {
    if (!this.apiKey) {
      return [
        'vegan_cuisine', 'street_art', 'sustainable_fashion', 'indie_music',
        'cultural_fusion', 'mindfulness', 'urban_gardening', 'digital_art',
        'craft_brewing', 'ethnic_cooking', 'social_activism', 'eco_lifestyle'
      ];
    }

    try {
      const response = await fetch(`${this.baseUrl}/trends/cultural`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      
      const data = await response.json();
      return data.trending_categories || [];
    } catch (error) {
      console.error('Failed to fetch trending categories:', error);
      return [];
    }
  }

  /**
   * Simulate Qloo analysis when API key is not available
   */
  private simulateQlooAnalysis(contentUrl: string, contentText?: string): QlooContentAnalysis {
    // Intelligent content categorization based on URL patterns
    const categories = this.categorizeFromUrl(contentUrl);
    const culturalTags = this.extractCulturalTags(contentUrl, contentText);
    
    const tasteProfile: QlooTasteProfile = {
      categories,
      genres: this.inferGenres(categories),
      cultural_context: {
        region: this.inferRegion(contentUrl),
        demographic: this.inferDemographic(categories),
        interests: categories.slice(0, 3)
      },
      taste_score: Math.random() * 0.4 + 0.6, // 0.6-1.0
      cultural_relevance: Math.random() * 0.3 + 0.7, // 0.7-1.0
      engagement_potential: Math.random() * 0.5 + 0.5 // 0.5-1.0
    };

    return {
      content_id: this.generateContentId(contentUrl),
      content_type: this.inferContentType(contentUrl),
      detected_categories: categories,
      cultural_tags: culturalTags,
      taste_profile: tasteProfile,
      audience_match: {
        primary_demographic: tasteProfile.cultural_context.demographic,
        cultural_affinity: tasteProfile.cultural_relevance,
        taste_alignment: tasteProfile.taste_score
      },
      reward_multiplier: this.calculateBaseMultiplier(categories, culturalTags),
      cultural_bonus: this.calculateCulturalBonus(culturalTags)
    };
  }

  private categorizeFromUrl(url: string): string[] {
    const categories: string[] = [];
    const urlLower = url.toLowerCase();

    // Food & Cuisine
    if (urlLower.includes('vegan') || urlLower.includes('plant')) {
      categories.push('vegan_cuisine', 'sustainable_living', 'health_wellness');
    }
    if (urlLower.includes('recipe') || urlLower.includes('cooking')) {
      categories.push('culinary_arts', 'food_culture');
    }

    // Art & Culture
    if (urlLower.includes('art') || urlLower.includes('gallery')) {
      categories.push('visual_arts', 'cultural_expression');
    }
    if (urlLower.includes('street') && urlLower.includes('art')) {
      categories.push('street_art', 'urban_culture', 'social_commentary');
    }

    // Music & Entertainment
    if (urlLower.includes('music') || urlLower.includes('song')) {
      categories.push('music', 'creative_arts');
    }

    // Sustainability & Environment
    if (urlLower.includes('eco') || urlLower.includes('sustainable')) {
      categories.push('sustainability', 'environmental_awareness');
    }

    // Technology & Innovation
    if (urlLower.includes('tech') || urlLower.includes('ai')) {
      categories.push('technology', 'innovation');
    }

    return categories.length > 0 ? categories : ['general_content', 'creative_expression'];
  }

  private extractCulturalTags(url: string, text?: string): string[] {
    const tags: string[] = [];
    const content = (url + ' ' + (text || '')).toLowerCase();

    // Cultural identifiers
    const culturalPatterns = {
      'asian_culture': ['asian', 'japanese', 'chinese', 'korean', 'thai', 'vietnamese'],
      'latin_culture': ['latino', 'hispanic', 'mexican', 'brazilian', 'spanish'],
      'african_culture': ['african', 'afro', 'ethiopian', 'nigerian'],
      'european_culture': ['italian', 'french', 'german', 'scandinavian'],
      'middle_eastern': ['arabic', 'persian', 'turkish', 'lebanese'],
      'indigenous': ['indigenous', 'native', 'aboriginal', 'tribal']
    };

    for (const [culture, keywords] of Object.entries(culturalPatterns)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(culture);
      }
    }

    return tags;
  }

  private isUnderrepresentedCulture(culturalTags: string[]): boolean {
    const underrepresented = [
      'indigenous', 'african_culture', 'middle_eastern', 
      'pacific_islander', 'native_american'
    ];
    return culturalTags.some(tag => underrepresented.includes(tag));
  }

  private inferGenres(categories: string[]): string[] {
    const genreMap: Record<string, string[]> = {
      'vegan_cuisine': ['lifestyle', 'health', 'cooking'],
      'street_art': ['visual_arts', 'urban', 'contemporary'],
      'music': ['audio', 'performance', 'entertainment'],
      'technology': ['educational', 'innovation', 'tutorial']
    };

    const genres = new Set<string>();
    categories.forEach(cat => {
      if (genreMap[cat]) {
        genreMap[cat].forEach(genre => genres.add(genre));
      }
    });

    return Array.from(genres);
  }

  private inferRegion(url: string): string {
    if (url.includes('.it/') || url.includes('italy')) return 'Europe';
    if (url.includes('.jp/') || url.includes('japan')) return 'Asia';
    if (url.includes('.br/') || url.includes('brazil')) return 'South America';
    return 'Global';
  }

  private inferDemographic(categories: string[]): string {
    if (categories.includes('vegan_cuisine')) return 'health_conscious_millennials';
    if (categories.includes('street_art')) return 'urban_creatives';
    if (categories.includes('technology')) return 'tech_enthusiasts';
    return 'general_audience';
  }

  private inferContentType(url: string): QlooContentAnalysis['content_type'] {
    if (url.includes('youtube.com') || url.includes('video')) return 'video';
    if (url.includes('instagram.com')) return 'image';
    if (url.includes('podcast') || url.includes('audio')) return 'podcast';
    return 'article';
  }

  private generateContentId(url: string): string {
    return `qloo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateBaseMultiplier(categories: string[], culturalTags: string[]): number {
    let multiplier = 1.0;
    
    // Category bonuses
    if (categories.includes('vegan_cuisine')) multiplier += 0.2;
    if (categories.includes('street_art')) multiplier += 0.25;
    if (categories.includes('sustainable_living')) multiplier += 0.15;
    
    // Cultural diversity bonus
    if (culturalTags.length > 0) multiplier += 0.1;
    
    return Math.round(multiplier * 100) / 100;
  }

  private calculateCulturalBonus(culturalTags: string[]): number {
    return culturalTags.length * 0.05; // 5% bonus per cultural tag
  }

  private processQlooResponse(data: any, contentUrl: string): QlooContentAnalysis {
    // Process real Qloo API response
    return {
      content_id: data.content_id || this.generateContentId(contentUrl),
      content_type: data.content_type || 'article',
      detected_categories: data.categories || [],
      cultural_tags: data.cultural_tags || [],
      taste_profile: data.taste_profile || {
        categories: [],
        genres: [],
        cultural_context: { region: 'Global', demographic: 'general', interests: [] },
        taste_score: 0.7,
        cultural_relevance: 0.8,
        engagement_potential: 0.6
      },
      audience_match: data.audience_match || {
        primary_demographic: 'general',
        cultural_affinity: 0.7,
        taste_alignment: 0.8
      },
      reward_multiplier: data.reward_multiplier || 1.0,
      cultural_bonus: data.cultural_bonus || 0.0
    };
  }
}

export const qlooService = new QlooService();