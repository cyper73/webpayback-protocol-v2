/**
 * Pool Health API Routes - WebPayback Protocol
 * Auto-scaling reward system based on pool liquidity health
 */

import { Router } from 'express';
import { PoolHealthRewardScaler } from '../services/poolHealthRewardScaler';

const router = Router();

/**
 * GET /api/pool-health/status
 * Get current pool health status and reward scaling factor
 */
router.get('/status', async (req, res) => {
  try {
    const poolHealthScaler = PoolHealthRewardScaler.getInstance();
    const healthStatus = await poolHealthScaler.getCurrentPoolHealth();
    
    res.json({
      success: true,
      data: {
        usdtPool: {
          tvl: healthStatus.usdtPoolTvl,
          healthLevel: healthStatus.usdtHealthLevel,
          threshold: healthStatus.usdtHealthLevel === 'healthy' ? '> $500' : 
                    healthStatus.usdtHealthLevel === 'warning' ? '$400-500' :
                    healthStatus.usdtHealthLevel === 'critical' ? '$200-400' : '< $200'
        },
        wmaticPool: {
          tvl: healthStatus.wmaticPoolTvl,
          healthLevel: healthStatus.wmaticHealthLevel,
          threshold: healthStatus.wmaticHealthLevel === 'healthy' ? '> 10 WMATIC' :
                    healthStatus.wmaticHealthLevel === 'warning' ? '8-10 WMATIC' :
                    healthStatus.wmaticHealthLevel === 'critical' ? '5-8 WMATIC' : '< 5 WMATIC'
        },
        rewardScaling: {
          currentFactor: healthStatus.rewardScaleFactor,
          percentage: Math.round(healthStatus.rewardScaleFactor * 100),
          status: healthStatus.rewardScaleFactor === 1.0 ? 'normal' :
                  healthStatus.rewardScaleFactor >= 0.8 ? 'reduced' :
                  healthStatus.rewardScaleFactor >= 0.5 ? 'critical' : 'emergency'
        },
        lastUpdated: healthStatus.lastUpdated
      }
    });
  } catch (error) {
    console.error('Pool health status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pool health status'
    });
  }
});

/**
 * GET /api/pool-health/alerts
 * Get current pool health alerts and recommendations
 */
router.get('/alerts', async (req, res) => {
  try {
    const poolHealthScaler = PoolHealthRewardScaler.getInstance();
    const alertsData = await poolHealthScaler.getPoolHealthAlerts();
    
    res.json({
      success: true,
      data: {
        alerts: alertsData.alerts,
        overallStatus: alertsData.overallStatus,
        totalAlerts: alertsData.alerts.length,
        severityBreakdown: {
          emergency: alertsData.alerts.filter(a => a.severity === 'emergency').length,
          critical: alertsData.alerts.filter(a => a.severity === 'critical').length,
          warning: alertsData.alerts.filter(a => a.severity === 'warning').length,
          info: alertsData.alerts.filter(a => a.severity === 'info').length
        }
      }
    });
  } catch (error) {
    console.error('Pool health alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pool health alerts'
    });
  }
});

/**
 * POST /api/pool-health/test-reward-scaling
 * Test reward scaling with different base amounts
 */
router.post('/test-reward-scaling', async (req, res) => {
  try {
    const { baseReward } = req.body;
    
    if (!baseReward || typeof baseReward !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'baseReward is required and must be a number'
      });
    }
    
    const poolHealthScaler = PoolHealthRewardScaler.getInstance();
    const scaledRewardData = await poolHealthScaler.scaleRewardByPoolHealth(baseReward);
    
    res.json({
      success: true,
      data: {
        input: {
          baseReward: baseReward,
          scenario: 'current pool conditions'
        },
        output: {
          originalReward: scaledRewardData.originalReward,
          scaledReward: scaledRewardData.scaledReward,
          scaleFactor: scaledRewardData.scaleFactor,
          reductionPercentage: Math.round((1 - scaledRewardData.scaleFactor) * 100),
          savings: scaledRewardData.originalReward - scaledRewardData.scaledReward
        },
        poolHealthContext: scaledRewardData.healthStatus
      }
    });
  } catch (error) {
    console.error('Reward scaling test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test reward scaling'
    });
  }
});

/**
 * GET /api/pool-health/thresholds
 * Get pool health thresholds configuration
 */
router.get('/thresholds', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        usdt: {
          healthy: { min: 500, rewardFactor: 1.0, description: "Full rewards (100%)" },
          warning: { min: 400, max: 499, rewardFactor: 0.8, description: "Reduced rewards (80%)" },
          critical: { min: 200, max: 399, rewardFactor: 0.5, description: "Critical rewards (50%)" },
          emergency: { max: 199, rewardFactor: 0.25, description: "Emergency rewards (25%)" }
        },
        wmatic: {
          healthy: { min: 10, rewardFactor: 1.0, description: "Full rewards (100%)" },
          warning: { min: 8, max: 9.99, rewardFactor: 0.8, description: "Reduced rewards (80%)" },
          critical: { min: 5, max: 7.99, rewardFactor: 0.5, description: "Critical rewards (50%)" },
          emergency: { max: 4.99, rewardFactor: 0.25, description: "Emergency rewards (25%)" }
        },
        logic: "System uses the most restrictive health level from both pools"
      }
    });
  } catch (error) {
    console.error('Pool thresholds error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pool thresholds'
    });
  }
});

export { router as poolHealthRouter };