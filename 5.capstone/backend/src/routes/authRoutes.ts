import { Router } from "express";
import {
  login,
  register,
  createTenantUser,
  listUsers,
  getOrganization,
  updateOrganizationName,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/authController";
import {
  authenticateToken,
  AuthenticatedRequest,
  authorizeRoles,
} from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post(
  "/tenant/users",
  authenticateToken,
  authorizeRoles("tenantAdmin", "superadmin"),
  createTenantUser
);

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("tenantAdmin", "superadmin"),
  listUsers
);

router.get("/organization", authenticateToken, getOrganization);

router.post("/logout", authenticateToken, logout);

router.patch(
  "/organization",
  authenticateToken,
  authorizeRoles("tenantAdmin", "superadmin"),
  updateOrganizationName
);

// Verify current authenticated user
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
      role: user.role,
      tenantId: user.tenantId,
    },
  });
});

export default router;
