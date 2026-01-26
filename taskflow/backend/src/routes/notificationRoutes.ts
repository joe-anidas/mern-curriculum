import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  registerFcmToken,
} from "../controllers/notificationController";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user
 * @access  Private
 */
router.get("/", getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get("/unread-count", getUnreadCount);

/**
 * @route   PATCH /api/notifications/mark-read
 * @desc    Mark specific notifications as read
 * @access  Private
 */
router.patch("/mark-read", markAsRead);

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch("/mark-all-read", markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification
 * @access  Private
 */
router.delete("/:id", deleteNotification);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete("/", deleteAllRead);

/**
 * @route   POST /api/notifications/fcm-token
 * @desc    Register FCM Token
 * @access  Private
 */
router.post("/fcm-token", registerFcmToken);

export default router;
