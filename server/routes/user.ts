import { Router } from "express";

const router = Router();

// Get current user (mock for development)
router.get("/", (req, res) => {
  // In a real app, this would get user from session/JWT
  // For now, return a mock user to make the Content Certificate system work
  const mockUser = {
    id: 1,
    username: "webpayback_creator"
  };
  
  res.json(mockUser);
});

export default router;