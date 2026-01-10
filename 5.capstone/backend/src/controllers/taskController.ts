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

export async function getTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
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
      100
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

    if (status && ["todo", "in-progress", "completed"].includes(status)) {
      query.status = status;
    }
    if (q && typeof q === "string" && q.trim().length > 0) {
      const regex = new RegExp(
        q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
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
        title: task.title,
        description: task.description,
        status: task.status,
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
  next: NextFunction
) {
  try {
    const { id } = req.params;
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
  next: NextFunction
) {
  try {
    const {
      title,
      description = "",
      status = "todo",
      userId: bodyUserId,
      tenantId: bodyTenantId,
    } = req.body as {
      title?: string;
      description?: string;
      status?: string;
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
    } else if (actor.role === "tenantAdmin" && bodyUserId) {
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
      userId: ownerUserId,
      tenantId,
    });
    await task.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: {
        id: task._id.toString(),
        tenantId: task.tenantId?.toString() || null,
        userId: task.userId?.toString() || null,
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

export async function updateTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body as {
      title?: string;
      description?: string;
      status?: string;
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

    if (status !== undefined) {
      const statusCheck = isValidTaskStatus(status);
      if (!statusCheck.valid) {
        return res
          .status(400)
          .json({ success: false, error: statusCheck.message });
      }
      task.status = status as any;
    }

    await task.save();

    res.json({
      success: true,
      message: "Task updated successfully",
      task: {
        id: task._id.toString(),
        tenantId: task.tenantId?.toString() || null,
        userId: task.userId?.toString() || null,
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

export async function deleteTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

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
