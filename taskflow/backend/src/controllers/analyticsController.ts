import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import Task from "../models/Task";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth";

/**
 * Get overall task statistics (Completion, Status counts)
 */
export async function getTaskStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user!;
    const { startDate, endDate } = req.query;

    const tenantId = new mongoose.Types.ObjectId(actor.tenantId);

    // Base match for tenant
    const matchStage: any = { tenantId };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    // 1. Status Counts
    const statusStats = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format status stats
    const statusCounts = {
      todo: 0,
      "in-progress": 0,
      "in-review": 0,
      completed: 0,
    };
    statusStats.forEach((s) => {
      if (s._id in statusCounts) {
        statusCounts[s._id as keyof typeof statusCounts] = s.count;
      }
    });

    // 2. Completion Rate (Tasks completed vs Total)
    const totalTasks = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const completionRate =
      totalTasks > 0
        ? Math.round((statusCounts.completed / totalTasks) * 100)
        : 0;

    // 3. Due Date Stats (Overdue vs Due Soon)
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const dueStats = await Task.aggregate([
      {
        $match: {
          ...matchStage,
          status: { $ne: "completed" },
          dueDate: { $ne: null },
        },
      },
      {
        $project: {
          isOverdue: { $lt: ["$dueDate", now] },
          isDueSoon: {
            $and: [
              { $gte: ["$dueDate", now] },
              { $lte: ["$dueDate", sevenDaysFromNow] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          overdue: { $sum: { $cond: ["$isOverdue", 1, 0] } },
          dueSoon: { $sum: { $cond: ["$isDueSoon", 1, 0] } },
        },
      },
    ]);

    const dueData = dueStats[0] || { overdue: 0, dueSoon: 0 };

    res.json({
      success: true,
      data: {
        total: totalTasks,
        completionRate,
        statusCounts,
        dueStats: {
          overdue: dueData.overdue,
          dueSoon: dueData.dueSoon,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get workload distribution (Tasks per user)
 */
export async function getWorkloadStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user!;
    const tenantId = new mongoose.Types.ObjectId(actor.tenantId);

    const workload = await Task.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: "$userId",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          inReview: {
            $sum: { $cond: [{ $eq: ["$status", "in-review"] }, 1, 0] },
          },
          todo: {
            $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          userId: "$_id",
          name: "$userDetails.name",
          email: "$userDetails.email",
          total: 1,
          completed: 1,
          inProgress: 1,
          inReview: 1,
          todo: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      data: workload,
    });
  } catch (err) {
    next(err);
  }
}
