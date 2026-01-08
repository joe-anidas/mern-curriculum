import { Router } from "express";
import { login, register } from "../controllers/authController";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);


router.get("/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  res.json({
    success: true,
    user: {
      id: user.userId,
      name: user.name,
      email: user.email,
    },
  });
});

export default router;
