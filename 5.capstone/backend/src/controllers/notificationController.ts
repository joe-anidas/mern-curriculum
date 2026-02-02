import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth";

/**
 * Get all notifications for the authenticated user
 */
export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      page = "1",
      limit = "20",
      isRead,
      type,
    } = req.query as {
      page?: string;
      limit?: string;
      isRead?: string;
      type?: string;
    };

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const actor = req.user!;
    const query: any = {
      userId: new mongoose.Types.ObjectId(actor.userId),
    };

    // Filter by read status if provided
    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    const [total, notifications] = await Promise.all([
      Notification.countDocuments(query).exec(),
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .populate("triggeredBy", "name email")
        .populate("taskId", "title status")
        .exec(),
    ]);

    const totalPages = Math.ceil(total / parsedLimit) || 1;

    res.json({
      success: true,
      message: "Notifications fetched successfully",
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages,
      count: notifications.length,
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        taskId: n.taskId,
        triggeredBy: n.triggeredBy,
        isRead: n.isRead,
        metadata: n.metadata,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user!;
    const count = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(actor.userId),
      isRead: false,
    });

    res.json({
      success: true,
      message: "Unread count fetched successfully",
      count,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark specific notifications as read
 */
export async function markAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { notificationIds } = req.body;
    const actor = req.user!;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "notificationIds must be an array",
      });
    }

    const count = await Notification.markAsRead(
      new mongoose.Types.ObjectId(actor.userId),
      notificationIds,
    );

    res.json({
      success: true,
      message: "Notifications marked as read",
      count,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user!;
    const result = await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(actor.userId),
        isRead: false,
      },
      { $set: { isRead: true } },
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
      count: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const actor = req.user!;

    const notification = await Notification.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(actor.userId),
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user!;
    const result = await Notification.deleteMany({
      userId: new mongoose.Types.ObjectId(actor.userId),
      isRead: true,
    });

    res.json({
      success: true,
      message: "Read notifications deleted",
      count: result.deletedCount,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Register FCM Token for the user
 */
export async function registerFcmToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = req.body;
    const actor = req.user!;

    if (!token) {
      console.warn(
        `[FCM] Token missing in registration request from user ${actor.userId}`,
      );
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Token is required",
      });
    }

    console.log(
      `[FCM] Registering token for user ${actor.userId}: ${token.substring(0, 10)}... (Length: ${token.length})`,
    );

    await User.findByIdAndUpdate(actor.userId, {
      $addToSet: { fcmTokens: token },
    });

    res.json({
      success: true,
      message: "FCM token registered successfully",
    });
  } catch (err) {
    next(err);
  }
}
