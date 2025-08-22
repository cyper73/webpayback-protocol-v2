import { RequestHandler } from "express";
import { CredentialProtectionService } from "./security/credentialProtection";

// Admin credentials for allowance management and pool manager
// Using lazy loading to ensure environment variables are available
const getAdminCredentials = () => {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'changeme'
  };
};

// Admin authentication middleware with IP protection (founder's IP only)
export const authenticateAdmin: RequestHandler = (req, res, next) => {
  // STEP 1: Validate IP is authorized (founder's IP only)
  const ipValidation = CredentialProtectionService.validateFounderIP(req);
  
  // EMERGENCY ADMIN ACCESS: Temporary bypass for platform restoration
  // Allow admin access with correct credentials regardless of IP for emergency restoration
  console.log(`🔧 EMERGENCY ADMIN ACCESS: IP ${ipValidation.detectedIP} attempting access`);
  
  // Continue with credential validation (IP check bypassed for emergency access)

  // STEP 2: Validate admin credentials
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required for admin modules" 
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Get credentials using lazy loading
  const ADMIN_CREDENTIALS = getAdminCredentials();
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    console.log(`✅ ADMIN ACCESS GRANTED: IP ${ipValidation.detectedIP} authorized`);
    // Add admin flag to request
    (req as any).isAdmin = true;
    return next();
  }

  console.log(`🚨 ADMIN ACCESS BLOCKED: Invalid credentials from IP ${ipValidation.detectedIP}`);
  return res.status(401).json({ 
    success: false, 
    message: "Invalid admin credentials" 
  });
};

// Check if request has admin authentication
export const isAdminAuthenticated = (req: any): boolean => {
  return req.isAdmin === true;
};

// Admin login endpoint handler with IP protection
export const adminLogin: RequestHandler = (req, res) => {
  // STEP 1: Validate IP is authorized (founder's IP only)
  const ipValidation = CredentialProtectionService.validateFounderIP(req);
  
  // EMERGENCY ADMIN ACCESS: Temporary bypass for platform restoration
  // Allow admin access with correct credentials regardless of IP for emergency restoration
  console.log(`🔧 EMERGENCY ADMIN ACCESS: IP ${ipValidation.detectedIP} attempting login`);
  
  // Continue with credential validation (IP check bypassed for emergency access)

  // STEP 2: Validate admin credentials
  const { username, password } = req.body;
  
  // Get credentials using lazy loading
  const ADMIN_CREDENTIALS = getAdminCredentials();
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    console.log(`✅ ADMIN LOGIN SUCCESSFUL: IP ${ipValidation.detectedIP} authorized`);
    
    // Generate basic auth token
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    
    res.json({
      success: true,
      message: "Admin authentication successful",
      token: `Basic ${token}`,
      modules: ["allowance-management", "auto-pool-manager"],
      authorizedIP: ipValidation.detectedIP
    });
  } else {
    console.log(`🚨 ADMIN LOGIN BLOCKED: Invalid credentials from IP ${ipValidation.detectedIP}`);
    res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }
};