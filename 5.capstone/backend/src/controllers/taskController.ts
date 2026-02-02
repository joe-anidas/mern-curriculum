import { Response, NextFunction } from "express";
import Task from "../models/Task";
import Organization from "../models/Organization";
import User from "../models/User";
import {
  isValidTaskStatus,
  isValidTaskTitle,
  isValidObjectId,
} from "../utils/validators";
import { AuthenticatedRequest } from "../middleware/auth";
import { notificationService } from "../notification";
import { parseDateIST, getTomorrowIST } from "../utils/dateUtils";
import { checkAndNotifyDueSoon } from "../utils/dueDateNotification";

export async function getTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      page = "1",
      limit = "10",
      status,
      q,
      tenantId: tenantIdQuery,
      userId: queryUserId,
    } = req.query as {
      page?: string;
      limit?: string;
      status?: string;
      q?: string;
      tenantId?: string;
      userId?: string;
    };

    const parsedPage = Math.max(parseInt(page as string, 10) || 1, 1);
    const parsedLimit = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      100,
    );

    const actor = req.user!;
    const effectiveTenantId =
      actor.role === "superadmin"
        ? tenantIdQuery && isValidObjectId(tenantIdQuery)
          ? tenantIdQuery
          : actor.tenantId
        : actor.tenantId;

    const query: any = {};

    if (effectiveTenantId) {
      query.tenantId = effectiveTenantId;
    } else if (actor.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        error: "Tenant context is required",
      });
    }

    if (actor.role === "user") {
      query.userId = actor.userId;
    } else if (queryUserId && isValidObjectId(queryUserId)) {
      query.userId = queryUserId;
    }

    if (
      status &&
      ["todo", "in-progress", "in-review", "completed"].includes(status)
    ) {
      query.status = status;
    }
    if (q && typeof q === "string" && q.trim().length > 0) {
      const regex = new RegExp(
        q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      query.$or = [{ title: regex }, { description: regex }];
    }

    const [total, tasks] = await Promise.all([
      Task.countDocuments(query).exec(),
      Task.find(query)
        .sort({ createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .exec(),
    ]);

    const totalPages = Math.ceil(total / parsedLimit) || 1;

    res.json({
      success: true,
      message: "Tasks fetched successfully",
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages,
      count: tasks.length,
      tasks: tasks.map((task) => ({
        id: task._id.toString(),
        tenantId: task.tenantId?.toString() || null,
        userId: task.userId?.toString() || null,
        createdBy: task.createdBy?.toString() || null,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        sprintId: task.sprintId?.toString() || null,
        dueDate: task.dueDate,
        attachments: task.attachments,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const actor = req.user!;
    const filters: any = { _id: id };

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid task identifier" });
    }

    if (actor.role !== "superadmin") {
      filters.tenantId = actor.tenantId;
    }
    if (actor.role === "user") {
      filters.userId = actor.userId;
    }

    const task = await Task.findOne(filters);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }
    res.json({
      success: true,
      message: "Task fetched successfully",
      task: {
        id: task._id.toString(),
        tenantId: task.tenantId?.toString() || null,
        userId: task.userId?.toString() || null,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        sprintId: task.sprintId?.toString() || null,
        dueDate: task.dueDate,
        attachments: task.attachments,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      title,
      description = "",
      status = "todo",
      priority = "medium",
      dueDate,
      sprintId,
      userId: bodyUserId,
      tenantId: bodyTenantId,
    } = req.body as {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      sprintId?: string | null;
      userId?: string;
      tenantId?: string;
    };

    const actor = req.user!;
    const tenantId =
      actor.role === "superadmin"
        ? bodyTenantId && isValidObjectId(bodyTenantId)
          ? bodyTenantId
          : actor.tenantId
        : actor.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: "Tenant context is required to create tasks",
      });
    }

    const tenantExists = await Organization.exists({ _id: tenantId });
    if (!tenantExists) {
      return res.status(404).json({
        success: false,
        error: "Tenant not found",
      });
    }

    const titleCheck = isValidTaskTitle(title || "");
    if (!titleCheck.valid) {
      return res
        .status(400)
        .json({ success: false, error: titleCheck.message });
    }

    const statusCheck = isValidTaskStatus(status);
    if (!statusCheck.valid) {
      return res
        .status(400)
        .json({ success: false, error: statusCheck.message });
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: "Priority must be one of: low, medium, high",
      });
    }

    // Parse due date in IST, default to tomorrow if not provided
    let parsedDueDate: Date | null = null;
    if (dueDate) {
      parsedDueDate = parseDateIST(dueDate);
      if (!parsedDueDate) {
        return res.status(400).json({
          success: false,
          error: "Invalid due date format",
        });
      }
    } else {
      // Default to tomorrow in IST when creating a new task
      parsedDueDate = getTomorrowIST();
    }

    let ownerUserId = actor.userId;

    // Superadmins must target a specific user in the tenant to avoid orphaned tasks
    if (actor.role === "superadmin") {
      if (!bodyUserId) {
        return res.status(400).json({
          success: false,
          error: "userId is required when creating tasks as superadmin",
        });
      }
      if (!isValidObjectId(bodyUserId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid user identifier",
        });
      }
      const targetUser = await User.findById(bodyUserId);
      if (!targetUser) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }
      if (
        !targetUser.tenantId ||
        targetUser.tenantId.toString() !== tenantId.toString()
      ) {
        return res.status(400).json({
          success: false,
          error: "User does not belong to the specified tenant",
        });
      }
      ownerUserId = targetUser._id.toString();
    } else if (actor.role === "tenantAdmin") {
      // For tenant admins, if userId is provided and is a valid non-empty string, assign to that user
      // Otherwise, default to the tenant admin themselves
      if (
        bodyUserId &&
        typeof bodyUserId === "string" &&
        bodyUserId.trim() !== ""
      ) {
        if (!isValidObjectId(bodyUserId)) {
          return res.status(400).json({
            success: false,
            error: "Invalid user identifier",
          });
        }
        const targetUser = await User.findById(bodyUserId);
        if (!targetUser) {
          return res
            .status(404)
            .json({ success: false, error: "User not found" });
        }
        if (
          !targetUser.tenantId ||
          targetUser.tenantId.toString() !== tenantId.toString()
        ) {
          return res.status(403).json({
            success: false,
            error: "Cannot assign tasks to users outside your tenant",
          });
        }
        ownerUserId = targetUser._id.toString();
      }
      // If bodyUserId is not provided or is empty, ownerUserId remains as actor.userId (tenant admin)
    }

    if (!ownerUserId) {
      return res.status(400).json({
        success: false,
        error: "User context is required to create tasks",
      });
    }

    const task = new Task({
      title: (title || "").trim(),
      description: description ? description.trim() : "",
      status,
      priority,
      dueDate: parsedDueDate,
      sprintId: sprintId && isValidObjectId(sprintId) ? sprintId : null,
      userId: ownerUserId,
      createdBy: actor.userId,
      tenantId,
    });
    await task.save();

    // Send notification if task was assigned to another user
    if (ownerUserId !== actor.userId) {
      await notificationService.sendToUser({
        userId: ownerUserId,
        tenantId: tenantId,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `You have been assigned a new task: "${task.title}"`,
        taskId: task._id.toString(),
        triggeredBy: actor.userId,
      });
    }

    // Check if task is due within 1 day and send notification immediately
    if (parsedDueDate) {
      await checkAndNotifyDueSoon(task);
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: {
        id: task._id.toString(),
        tenantId: task.tenantId?.toString() || null,
        userId: task.userId?.toString() || null,
        createdBy: task.createdBy?.toString() || null,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        sprintId: task.sprintId?.toString() || null,
        dueDate: task.dueDate,
        attachments: task.attachments,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      sprintId,
      userId: newAssigneeId,
    } = req.body as {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      sprintId?: string | null;
      userId?: string;
    };

    const actor = req.user!;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid task identifier" });
    }

    const filters: any = { _id: id };

    if (actor.role !== "superadmin") {
      filters.tenantId = actor.tenantId;
    }
    if (actor.role === "user") {
      filters.userId = actor.userId;
    }

    const task = await Task.findOne(filters);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const oldStatus = task.status;
    const oldDueDate = task.dueDate;
    const oldAssigneeId = task.userId.toString();

    // 1. Update basic fields
    if (title !== undefined) {
      const titleCheck = isValidTaskTitle(title);
      if (!titleCheck.valid) {
        return res
          .status(400)
          .json({ success: false, error: titleCheck.message });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description ? description.trim() : "";
    }

    // 2. Update Status
    if (status !== undefined) {
      const statusCheck = isValidTaskStatus(status);
      if (!statusCheck.valid) {
        return res
          .status(400)
          .json({ success: false, error: statusCheck.message });
      }
      task.status = status as any;
    }

    // 2.5. Update Priority
    if (priority !== undefined) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({
          success: false,
          error: "Priority must be one of: low, medium, high",
        });
      }
      task.priority = priority as any;
    }

    // 3. Update Due Date (parse in IST)
    if (dueDate !== undefined) {
      if (dueDate === null) {
        task.dueDate = null;
      } else {
        const parsedDate = parseDateIST(dueDate);
        if (!parsedDate) {
          return res.status(400).json({
            success: false,
            error: "Invalid due date format",
          });
        }
        task.dueDate = parsedDate;
      }
    }

    // 3.5. Update Sprint
    if (sprintId !== undefined) {
      if (sprintId === null) {
        task.sprintId = null;
      } else if (isValidObjectId(sprintId)) {
        task.sprintId = sprintId as any;
      } else {
        return res.status(400).json({
          success: false,
          error: "Invalid sprint identifier",
        });
      }
    }

    // 4. Update Assignee (Only for Admins)
    if (
      newAssigneeId !== undefined &&
      newAssigneeId !== null &&
      newAssigneeId !== ""
    ) {
      if (actor.role === "user") {
        return res.status(403).json({
          success: false,
          error: "Users cannot reassign tasks",
        });
      }
      if (!isValidObjectId(newAssigneeId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid user identifier",
        });
      }

      // Verify the new assignee exists in the tenant
      const targetUser = await User.findById(newAssigneeId);
      if (!targetUser) {
        return res
          .status(404)
          .json({ success: false, error: "Assignee user not found" });
      }

      const taskTenantId = task.tenantId.toString();
      if (
        !targetUser.tenantId ||
        targetUser.tenantId.toString() !== taskTenantId
      ) {
        return res.status(400).json({
          success: false,
          error: "User does not belong to the task's tenant",
        });
      }

      task.userId = targetUser._id;
    }

    await task.save();

    // --- NOTIFICATIONS ---

    const notifications: Promise<void>[] = [];

    // A. Status Change Notifications
    if (status !== undefined && status !== oldStatus) {
      const metadata = { oldStatus, newStatus: status };
      const message =
        status === "completed"
          ? `Task "${task.title}" has been marked as completed`
          : `Task "${task.title}" status changed from ${oldStatus} to ${status}`;

      // 1. Notify Assignee (if actor is NOT the assignee)
      // Note: If assignee changed in this same request, we notify the NEW assignee about assignment,
      // but maybe we should notify them about status too?
      // Simpler: Notify CURRENT task.userId (which is new assignee if changed).
      if (task.userId.toString() !== actor.userId) {
        notifications.push(
          notificationService.sendToUser({
            userId: task.userId.toString(),
            tenantId: task.tenantId.toString(),
            type: status === "completed" ? "task_completed" : "task_updated",
            title:
              status === "completed" ? "Task Completed" : "Task Status Updated",
            message: message,
            taskId: task._id.toString(),
            triggeredBy: actor.userId,
            metadata,
          }),
        );
      }

      // 2. Notify Creator (if actor is NOT the creator) - Admin Case
      // This covers "status change notif from user to admin"
      if (task.createdBy.toString() !== actor.userId) {
        // Avoid double notification if Creator IS the Assignee (already handled above)
        if (task.createdBy.toString() !== task.userId.toString()) {
          notifications.push(
            notificationService.sendToUser({
              userId: task.createdBy.toString(),
              tenantId: task.tenantId.toString(),
              type: status === "completed" ? "task_completed" : "task_updated",
              title:
                status === "completed"
                  ? "Task Completed"
                  : "Task Status Updated",
              message: `${message} by user`, // Add context
              taskId: task._id.toString(),
              triggeredBy: actor.userId,
              metadata,
            }),
          );
        }
      }
    }

    // B. Due Date Change Notifications
    // "duedate to both"
    const isDueDateChanged =
      (dueDate !== undefined &&
        oldDueDate?.getTime() !== task.dueDate?.getTime()) ||
      (dueDate === null && oldDueDate !== null) ||
      (dueDate !== undefined && dueDate !== null && oldDueDate === null);

    if (isDueDateChanged) {
      const dateText = task.dueDate ? task.dueDate.toDateString() : "No Date";
      const message = `Task "${task.title}" due date updated to ${dateText}`;

      // Notify Assignee (if not actor)
      if (task.userId.toString() !== actor.userId) {
        notifications.push(
          notificationService.sendToUser({
            userId: task.userId.toString(),
            tenantId: task.tenantId.toString(),
            type: "task_updated",
            title: "Task Due Date Updated",
            message,
            taskId: task._id.toString(),
            triggeredBy: actor.userId,
            metadata: {
              oldDueDate: oldDueDate ? oldDueDate.toISOString() : "",
              newDueDate: task.dueDate ? task.dueDate.toISOString() : "",
            },
          }),
        );
      }

      // Notify Creator (if not actor)
      // Avoid double notif if Creator == Assignee
      if (
        task.createdBy.toString() !== actor.userId &&
        task.createdBy.toString() !== task.userId.toString()
      ) {
        notifications.push(
          notificationService.sendToUser({
            userId: task.createdBy.toString(),
            tenantId: task.tenantId.toString(),
            type: "task_updated",
            title: "Task Due Date Updated",
            message,
            taskId: task._id.toString(),
            triggeredBy: actor.userId,
            metadata: {
              oldDueDate: oldDueDate ? oldDueDate.toISOString() : "",
              newDueDate: task.dueDate ? task.dueDate.toISOString() : "",
            },
          }),
        );
      }
    }

    // C. Assignment Change Notifications (Re-assignment)
    // "assign task notif from admin to user"
    if (newAssigneeId !== undefined && newAssigneeId !== oldAssigneeId) {
      // Notify New Assignee
      if (newAssigneeId !== actor.userId) {
        notifications.push(
          notificationService.sendToUser({
            userId: newAssigneeId,
            tenantId: task.tenantId.toString(),
            type: "task_assigned",
            title: "New Task Assigned",
            message: `You have been assigned a task: "${task.title}"`,
            taskId: task._id.toString(),
            triggeredBy: actor.userId,
            metadata: { previousAssignee: oldAssigneeId },
          }),
        );
      }

      // Optional: Notify Old Assignee (if not actor)
      if (oldAssigneeId !== actor.userId) {
        notifications.push(
          notificationService.sendToUser({
            userId: oldAssigneeId,
            tenantId: task.tenantId.toString(),
            type: "task_updated", // or task_unassigned if such type exists, sticking to general
            title: "Task Unassigned",
            message: `You have been unassigned from task: "${task.title}"`,
            taskId: task._id.toString(),
            triggeredBy: actor.userId,
          }),
        );
      }
    }

    await Promise.all(notifications);

    // Check if task is due within 1 day and send notification immediately (if due date was changed)
    if (isDueDateChanged && task.dueDate) {
      await checkAndNotifyDueSoon(task);
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      task: {
        id: task._id.toString(),
        tenantId: task.tenantId?.toString() || null,
        userId: task.userId?.toString() || null,
        createdBy: task.createdBy?.toString() || null,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        sprintId: task.sprintId?.toString() || null,
        dueDate: task.dueDate,
        attachments: task.attachments,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const actor = req.user!;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid task identifier" });
    }

    const filters: any = { _id: id };
    if (actor.role !== "superadmin") {
      filters.tenantId = actor.tenantId;
    }
    if (actor.role === "user") {
      filters.userId = actor.userId;
    }

    const task = await Task.findOneAndDelete(filters);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    // Send notification about task deletion
    if (task.userId.toString() !== actor.userId) {
      await notificationService.sendToUser({
        userId: task.userId.toString(),
        tenantId: task.tenantId.toString(),
        type: "task_deleted",
        title: "Task Deleted",
        message: `Task "${task.title}" has been deleted`,
        triggeredBy: actor.userId,
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
      task: {
        id: task._id.toString(),
        tenantId: task.tenantId,
        userId: task.userId,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function addAttachments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const files = req.files as Express.Multer.File[];
    const actor = req.user!;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid task identifier" });
    }

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No files uploaded" });
    }

    const filters: any = { _id: id };
    if (actor.role !== "superadmin") {
      filters.tenantId = actor.tenantId;
    }
    if (actor.role === "user") {
      filters.userId = actor.userId;
    }

    const task = await Task.findOne(filters);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    // Process files and upload to Cloudinary
    // Note: Since we use diskStorage or memoryStorage (if changed), we need to handle the upload to Cloudinary manually
    // if using just multer, files are on disk (or memory).
    // We should use cloudinary.uploader.upload

    const importCloudinary = await import("../config/cloudinary");
    const cloudinary = importCloudinary.default;
    const fs = await import("fs");

    const uploadedAttachments = [];

    for (const file of files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `taskflow/${task.tenantId}/tasks/${task._id}`,
          resource_type: "auto",
        });

        uploadedAttachments.push({
          name: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          uploadedAt: new Date(),
        });
      } finally {
        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    task.attachments = [...(task.attachments || []), ...uploadedAttachments];
    await task.save();

    res.json({
      success: true,
      message: "Attachments added successfully",
      attachments: uploadedAttachments,
      task,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeAttachment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, attachmentId } = req.params as {
      id: string;
      attachmentId: string;
    };
    const actor = req.user!;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid task identifier" });
    }

    const filters: any = { _id: id };
    if (actor.role !== "superadmin") {
      filters.tenantId = actor.tenantId;
    }
    // Users can remove their own task attachments? Let's assume yes if they created the task or are assigned.
    if (actor.role === "user") {
      filters.userId = actor.userId;
    }

    const task = await Task.findOne(filters);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const attachmentIndex = task.attachments.findIndex(
      (att: any) => att._id.toString() === attachmentId,
    );

    if (attachmentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Attachment not found" });
    }

    const attachment = task.attachments[attachmentIndex];

    // Remove from Cloudinary
    const importCloudinary = await import("../config/cloudinary");
    const cloudinary = importCloudinary.default;

    if (attachment.publicId) {
      await cloudinary.uploader.destroy(attachment.publicId);
    }

    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    res.json({
      success: true,
      message: "Attachment removed successfully",
      task,
    });
  } catch (err) {
    next(err);
  }
}
