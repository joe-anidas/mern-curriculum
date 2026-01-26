import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { getTaskStats, getWorkloadStats } from "../controllers/analyticsController";

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Analytics usually requires admin privileges, but we'll allow tenantAdmins and superadmins
// Regular users might not need to see full org stats
router.get("/stats", authorizeRoles("superadmin", "tenantAdmin"), getTaskStats);
router.get("/workload", authorizeRoles("superadmin", "tenantAdmin"), getWorkloadStats);

export default router;
