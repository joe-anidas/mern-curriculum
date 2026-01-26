import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../controllers/sprintController";

const router = Router();

// All sprint routes require authentication
router.use(authenticateToken);

// GET /api/sprints - Get all sprints for the user's tenant
router.get("/", getSprints);

// GET /api/sprints/:id - Get a specific sprint
router.get("/:id", getSprint);

// POST /api/sprints - Create a new sprint (admin only)
router.post("/", createSprint);

// PUT /api/sprints/:id - Update a sprint
router.put("/:id", updateSprint);

// DELETE /api/sprints/:id - Delete a sprint (admin only)
router.delete("/:id", deleteSprint);

export default router;
