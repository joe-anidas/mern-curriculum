import { Response, NextFunction } from "express";
import Task from "../models/Task";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  isValidTaskTitle,
  isValidTaskStatus,
  sanitizeInput,
} from "../utils/validators";

const asTask = (task: any) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  status: task.status,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

export async function getTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 3);
    const q = (req.query.q as string) || "";
    const status = (req.query.status as string) || "";

    // Build filter
    const filter: any = { userId };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    // Get total count
    const total = await Task.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const skip = (page - 1) * limit;
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.json({
      success: true,
      tasks: tasks.map(asTask),
      page,
      limit,
      total,
      totalPages,
      count: tasks.length,
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
    const userId = req.user!.userId;
    const task = await Task.findOne({ _id: id, userId });
    if (!task) return res.status(404).json({ error: "not found" });
    res.json({ task: asTask(task) });
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
    const { title, description = "", status = "todo" } = req.body || {};
    const userId = req.user!.userId;

    // Validate title
    const titleValidation = isValidTaskTitle(title);
    if (!titleValidation.valid) {
      return res.status(400).json({ error: titleValidation.message });
    }

    // Validate status
    const statusValidation = isValidTaskStatus(status);
    if (!statusValidation.valid) {
      return res.status(400).json({ error: statusValidation.message });
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title, 200);
    const sanitizedDescription = sanitizeInput(description, 500);

    const task = new Task({
      title: sanitizedTitle,
      description: sanitizedDescription,
      status,
      userId,
    });
    await task.save();

    res.status(201).json({ task: asTask(task) });
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
    const { title, description, status } = req.body || {};
    const userId = req.user!.userId;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) return res.status(404).json({ error: "not found" });

    // Validate and update title if provided
    if (title !== undefined) {
      const titleValidation = isValidTaskTitle(title);
      if (!titleValidation.valid) {
        return res.status(400).json({ error: titleValidation.message });
      }
      task.title = sanitizeInput(title, 200);
    }

    // Validate and update description if provided
    if (description !== undefined) {
      task.description = sanitizeInput(description, 500);
    }

    // Validate and update status if provided
    if (status !== undefined) {
      const statusValidation = isValidTaskStatus(status);
      if (!statusValidation.valid) {
        return res.status(400).json({ error: statusValidation.message });
      }
      task.status = status;
    }

    await task.save();

    res.json({ task: asTask(task) });
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
    const userId = req.user!.userId;
    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) return res.status(404).json({ error: "not found" });
    res.json({ task: asTask(task) });
  } catch (err) {
    next(err);
  }
}
