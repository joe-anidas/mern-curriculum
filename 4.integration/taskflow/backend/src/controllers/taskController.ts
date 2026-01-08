import { Response, NextFunction } from "express";
import Task from "../models/Task";
import { AuthenticatedRequest } from "../middleware/auth";

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
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 }).exec();
    res.json({ tasks: tasks.map(asTask) });
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

    if (!title) {
      return res.status(400).json({ error: "title required" });
    }

    const task = new Task({ title, description, status, userId });
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

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

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
