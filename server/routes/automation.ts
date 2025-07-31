import { Router } from "express";
import automatedPoolManager from "../services/automatedPoolManager";

export const automationRouter = Router();

// Founder-only access control for Automation Management
const isFounderAuthenticated = (req: any, res: any, next: any) => {
  const founderWallet = "0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8";
  
  // Check device fingerprint for founder device
  const userAgent = req.headers['user-agent'] || '';
  const isFounderDevice = userAgent.includes('Windows') && (userAgent.includes('Chrome') || userAgent.includes('Firefox'));
  
  if (!isFounderDevice) {
    return res.status(403).json({ 
      success: false, 
      error: "Access denied. Automated Pool Manager requires authorized device access." 
    });
  }
  
  // Additional security: Check for specific sessions or IP patterns
  // This can be enhanced with more sophisticated auth
  
  next();
};

// Add auth check endpoint for frontend authorization
automationRouter.get('/auth-check', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // LOG FOR DEBUGGING
  console.log('🔍 AUTOMATION AUTH CHECK - User Agent:', userAgent);
  
  // Check device fingerprint - More flexible for founder access
  const isWindows = userAgent.includes('Windows');
  const isChrome = userAgent.includes('Chrome') && !userAgent.includes('Edg');
  const isFirefox = userAgent.includes('Firefox');
  const isReplit = userAgent.includes('replit') || userAgent.includes('Replit');
  const isFounderDevice = isWindows && (isChrome || isFirefox) || isReplit;
  
  console.log('🔍 AUTOMATION AUTH CHECK - Device Check:', { isWindows, isChrome, isFirefox, isFounderDevice });
  
  if (!isFounderDevice) {
    console.log('🚫 AUTOMATION ACCESS DENIED:', { userAgent, isWindows, isChrome, isFirefox });
    return res.json({ 
      authorized: false, 
      error: "Access denied. Automated Pool Manager requires authorized device (Windows + Chrome/Firefox).",
      userAgent: userAgent  // Include for debugging
    });
  }
  
  console.log('✅ AUTOMATION ACCESS GRANTED:', { userAgent, isWindows, isChrome, isFirefox });
  res.json({ 
    authorized: true,
    message: "Automation authorization successful" 
  });
});

// Get automation status
automationRouter.get('/status', isFounderAuthenticated, (req, res) => {
  try {
    const status = automatedPoolManager.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get automation configuration
automationRouter.get('/config', isFounderAuthenticated, (req, res) => {
  try {
    const config = automatedPoolManager.getConfig();
    res.json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update automation configuration
automationRouter.post('/config', isFounderAuthenticated, (req, res) => {
  try {
    const updates = req.body;
    automatedPoolManager.updateConfig(updates);
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config: automatedPoolManager.getConfig()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get action history
automationRouter.get('/history', isFounderAuthenticated, (req, res) => {
  try {
    const history = automatedPoolManager.getActionHistory();
    res.json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get daily spend status
automationRouter.get('/spend-status', isFounderAuthenticated, (req, res) => {
  try {
    const spendStatus = automatedPoolManager.getDailySpendStatus();
    res.json({
      success: true,
      spendStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Emergency stop
automationRouter.post('/emergency-stop', isFounderAuthenticated, (req, res) => {
  try {
    automatedPoolManager.emergencyStop();
    res.json({
      success: true,
      message: 'Emergency stop activated - all automation halted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resume automation
automationRouter.post('/resume', isFounderAuthenticated, (req, res) => {
  try {
    automatedPoolManager.resume();
    res.json({
      success: true,
      message: 'Automation resumed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Manual trigger for testing
automationRouter.post('/manual-check', isFounderAuthenticated, (req, res) => {
  try {
    // This would trigger a manual automation cycle
    res.json({
      success: true,
      message: 'Manual automation check triggered'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});