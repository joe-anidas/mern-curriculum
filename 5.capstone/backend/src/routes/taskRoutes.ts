import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addAttachments,
  removeAttachment,
} from "../controllers/taskController";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authenticateToken);

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/attachments", upload.array("files", 10), addAttachments);
router.delete("/:id/attachments/:attachmentId", removeAttachment);

export default router;
