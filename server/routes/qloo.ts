/**
 * Qloo API Integration Routes
 * Handles Qloo cultural intelligence and taste analysis endpoints
 */

import { Router } from 'express';
import { qlooService } from '../services/qlooService.js';

const router = Router();

/**
 * Test Qloo API connection
 */
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing Qloo API connection...');
    
    // Test with a sample content URL
    const testUrl = 'https://example.com/sample-content';
    const analysis = await qlooService.analyzeContent(testUrl, 'Sample content for testing Qloo integration');
    
    res.json({
      success: true,
      message: 'Qloo API connection successful',
      test_analysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Qloo API test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Qloo API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Analyze content with Qloo
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url, content } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    console.log(`🔍 Analyzing content with Qloo: ${url}`);
    const analysis = await qlooService.analyzeContent(url, content);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('❌ Content analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Content analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Calculate cultural reward
 */
router.post('/reward', async (req, res) => {
  try {
    const { baseReward, analysis, userLocation } = req.body;
    
    if (!baseReward || !analysis) {
      return res.status(400).json({
        success: false,
        error: 'Base reward and analysis are required'
      });
    }
    
    console.log(`💰 Calculating cultural reward: base=${baseReward}`);
    const reward = await qlooService.calculateCulturalReward(baseReward, analysis, userLocation);
    
    res.json({
      success: true,
      reward
    });
  } catch (error) {
    console.error('❌ Reward calculation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Reward calculation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get trending cultural categories
 */
router.get('/trending', async (req, res) => {
  try {
    console.log('📈 Fetching trending cultural categories...');
    const categories = await qlooService.getTrendingCulturalCategories();
    
    res.json({
      success: true,
      trending_categories: categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to fetch trending categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;