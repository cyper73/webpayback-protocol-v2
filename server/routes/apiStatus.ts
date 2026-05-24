/**
 * API Status and Configuration Check Routes
 * Verifies all API integrations and their status
 */

import { Router } from 'express';
import { ethers } from 'ethers';

const router = Router();

/**
 * Check all API configurations and their status
 */
router.get('/check', async (req, res) => {
  try {
    console.log('🔍 Checking API configurations...');
    
    const apiStatus = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apis: {
        alchemy: {
          configured: !!process.env.ALCHEMY_API_KEY,
          key_preview: process.env.ALCHEMY_API_KEY ? 
            `${process.env.ALCHEMY_API_KEY.substring(0, 8)}...` : 'Not set',
          status: process.env.ALCHEMY_API_KEY === 'demo-api-key' ? 'demo' : 'configured'
        },
        chainlink: {
          api_key: {
            configured: !!process.env.CHAINLINK_API_KEY,
            status: process.env.CHAINLINK_API_KEY === 'demo-chainlink-key' ? 'demo' : 'configured'
          },
          vrf: {
            coordinator: process.env.CHAINLINK_VRF_COORDINATOR || 'Not set',
            key_hash: process.env.CHAINLINK_VRF_KEY_HASH || 'Not set',
            subscription_id: process.env.CHAINLINK_VRF_SUBSCRIPTION_ID || 'Not set'
          },
          functions: {
            subscription_id: process.env.CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID || 'Not set'
          }
        },
        qloo: {
          configured: !!process.env.QLOO_API_KEY,
          url: process.env.QLOO_API_URL || 'Not set',
          key_preview: process.env.QLOO_API_KEY ? 
            `${process.env.QLOO_API_KEY.substring(0, 8)}...` : 'Not set',
          status: process.env.QLOO_API_KEY === 'demo-qloo-key' ? 'demo' : 'live'
        },
        polygon: {
          token_address: process.env.POLYGON_TOKEN_ADDRESS || 'Not set',
          wpt_token_address: process.env.WPT_TOKEN_ADDRESS || 'Not set',
          primary_pool: process.env.POLYGON_PRIMARY_POOL_ADDRESS || 'Not set',
          secondary_pool: process.env.POLYGON_SECONDARY_POOL_ADDRESS || 'Not set',
          rpc_url: process.env.POLYGON_RPC_URL || 'Not set',
          rpc_fallback: process.env.POLYGON_RPC || 'Not set'
        }
      },
      blockchain: {
        founder_wallet: process.env.FOUNDER_WALLET_ADDRESS || 'Not set',
        private_key_configured: !!process.env.PRIVATE_KEY
      },
      security: {
        jwt_secret: !!process.env.JWT_SECRET,
        session_secret: !!process.env.SESSION_SECRET
      }
    };
    
    res.json({
      success: true,
      message: 'API configuration check completed',
      data: apiStatus
    });
  } catch (error) {
    console.error('❌ API status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'API status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test Alchemy connection
 */
router.get('/test/alchemy', async (req, res) => {
  try {
    console.log('🧪 Testing Alchemy connection...');
    
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyKey || alchemyKey === 'demo-api-key') {
      return res.json({
        success: false,
        message: 'Alchemy API key not configured or using demo key',
        status: 'demo_mode'
      });
    }
    
    const provider = new ethers.providers.JsonRpcProvider(
      `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`
    );
    
    const blockNumber = await provider.getBlockNumber();
    
    res.json({
      success: true,
      message: 'Alchemy connection successful',
      data: {
        latest_block: blockNumber,
        network: 'Polygon Mainnet',
        provider: 'Alchemy'
      }
    });
  } catch (error) {
    console.error('❌ Alchemy test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Alchemy connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test Polygon RPC connection
 */
router.get('/test/polygon', async (req, res) => {
  try {
    console.log('🧪 Testing Polygon RPC connection...');
    
    const rpcUrl = process.env.POLYGON_RPC || 'https://polygon-rpc.com/';
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    
    res.json({
      success: true,
      message: 'Polygon RPC connection successful',
      data: {
        latest_block: blockNumber,
        chain_id: network.chainId.toString(),
        network_name: network.name,
        rpc_url: rpcUrl
      }
    });
  } catch (error) {
    console.error('❌ Polygon RPC test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Polygon RPC connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get recommendations for API key setup
 */
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = [];
    
    // Check Alchemy
    if (!process.env.ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY === 'demo-api-key') {
      recommendations.push({
        service: 'Alchemy',
        priority: 'high',
        message: 'Get a real Alchemy API key from https://alchemy.com for blockchain interactions',
        impact: 'Blockchain data fetching, pool monitoring, transaction processing'
      });
    }
    
    // Check Chainlink
    if (!process.env.CHAINLINK_API_KEY || process.env.CHAINLINK_API_KEY === 'demo-chainlink-key') {
      recommendations.push({
        service: 'Chainlink',
        priority: 'medium',
        message: 'Configure Chainlink API key and VRF subscription for randomness and automation',
        impact: 'Random number generation, automated functions, oracle data'
      });
    }
    
    // Check Qloo
    if (process.env.QLOO_API_KEY && process.env.QLOO_API_KEY !== 'demo-qloo-key') {
      recommendations.push({
        service: 'Qloo',
        priority: 'low',
        message: 'Qloo API is properly configured for cultural intelligence',
        impact: 'Cultural content analysis and reward optimization'
      });
    }
    
    res.json({
      success: true,
      message: 'API setup recommendations',
      recommendations,
      total_recommendations: recommendations.length
    });
  } catch (error) {
    console.error('❌ Recommendations failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;