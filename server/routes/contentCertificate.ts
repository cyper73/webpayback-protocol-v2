import { Router } from "express";
import { contentCertificateNftService } from "../services/contentCertificateNft";
import { z } from "zod";

const router = Router();

// Mint Content Certificate NFT
router.post('/mint', async (req, res) => {
  try {
    const mintSchema = z.object({
      creatorId: z.number(),
      contentUrl: z.string().url(),
      contentTitle: z.string().min(1),
      contentText: z.string().min(50), // Minimum 50 characters
      royaltyPercentage: z.number().min(0).max(50).optional() // Max 50% royalty
    });

    const data = mintSchema.parse(req.body);
    const result = await contentCertificateNftService.mintContentCertificate(data);

    res.json(result);
  } catch (error) {
    console.error('Content certificate minting failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Detect Google AI Overview usage
router.post('/detect-usage', async (req, res) => {
  try {
    const detectionSchema = z.object({
      querySearched: z.string().min(1),
      aiOverviewText: z.string().min(10),
      detectionMethod: z.string().optional()
    });

    const data = detectionSchema.parse(req.body);
    const result = await contentCertificateNftService.detectGoogleAiOverviewUsage(data);

    res.json(result);
  } catch (error) {
    console.error('Usage detection failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get creator's certificates
router.get('/creator/:creatorId', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.creatorId);
    if (isNaN(creatorId)) {
      return res.status(400).json({ success: false, error: 'Invalid creator ID' });
    }

    const result = await contentCertificateNftService.getCreatorCertificates(creatorId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching creator certificates:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get detection statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await contentCertificateNftService.getDetectionStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching detection stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export { router as contentCertificateRouter };