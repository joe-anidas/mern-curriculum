import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import mongoose from "mongoose";
import Notification, { NotificationType } from "../models/Notification";
import User from "../models/User";
import { verifyToken, AuthPayload } from "../middleware/auth";

interface SocketData {
  userId?: string;
  tenantId?: string;
  email?: string;
  role?: string;
}

interface NotificationPayload {
  userId: string;
  tenantId: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  triggeredBy?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private io: SocketIOServer | null = null;

  /**
   * Initialize Socket.IO with HTTP server
   */
  initialize(server: HTTPServer, allowedOrigins: string[]) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupSocketHandlers();
    console.log("✅ Socket.IO notification service initialized");
  }

  /**
   * Set up Socket.IO event handlers
   */
  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Authenticate and join user room
      socket.on("authenticate", async (token: string) => {
        try {
          const decoded = verifyToken(token);
          if (!decoded || !decoded.userId) {
            socket.emit("auth_error", { message: "Invalid token" });
            return;
          }

          // Store user data in socket
          const socketData = socket.data as SocketData;
          socketData.userId = decoded.userId;
          socketData.tenantId = decoded.tenantId;
          socketData.email = decoded.email;
          socketData.role = decoded.role;

          // Join user-specific room
          socket.join(`user:${decoded.userId}`);

          // Join tenant-specific room if applicable
          if (decoded.tenantId) {
            socket.join(`tenant:${decoded.tenantId}`);
          }

          // Send unread count
          const unreadCount = await Notification.countDocuments({
            userId: new mongoose.Types.ObjectId(decoded.userId),
            isRead: false,
          });

          socket.emit("authenticated", {
            userId: decoded.userId,
            tenantId: decoded.tenantId,
            unreadCount,
          });

          console.log(
            `✅ User authenticated: ${decoded.userId} (${decoded.email})`
          );
        } catch (error) {
          console.error("Authentication error:", error);
          socket.emit("auth_error", { message: "Authentication failed" });
        }
      });

      // Mark notifications as read
      socket.on("mark_read", async (notificationIds: string | string[]) => {
        const socketData = socket.data as SocketData;
        if (!socketData.userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        try {
          const ids = Array.isArray(notificationIds)
            ? notificationIds
            : [notificationIds];
          const count = await Notification.markAsRead(
            new mongoose.Types.ObjectId(socketData.userId),
            ids
          );

          socket.emit("notifications_marked_read", {
            count,
            notificationIds: ids,
          });
        } catch (error) {
          console.error("Error marking notifications as read:", error);
          socket.emit("error", { message: "Failed to mark as read" });
        }
      });

      // Mark all notifications as read
      socket.on("mark_all_read", async () => {
        const socketData = socket.data as SocketData;
        if (!socketData.userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        try {
          const result = await Notification.updateMany(
            {
              userId: new mongoose.Types.ObjectId(socketData.userId),
              isRead: false,
            },
            { $set: { isRead: true } }
          );

          socket.emit("all_notifications_marked_read", {
            count: result.modifiedCount,
          });
        } catch (error) {
          console.error("Error marking all notifications as read:", error);
          socket.emit("error", {
            message: "Failed to mark all as read",
          });
        }
      });

      // Request unread notifications
      socket.on("get_unread", async () => {
        const socketData = socket.data as SocketData;
        if (!socketData.userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        try {
          const notifications = await Notification.findUnreadByUser(
            new mongoose.Types.ObjectId(socketData.userId)
          );

          socket.emit("unread_notifications", {
            count: notifications.length,
            notifications: notifications.map((n) => ({
              id: n._id.toString(),
              type: n.type,
              title: n.title,
              message: n.message,
              taskId: n.taskId?.toString(),
              triggeredBy: n.triggeredBy,
              metadata: n.metadata,
              createdAt: n.createdAt,
            })),
          });
        } catch (error) {
          console.error("Error fetching unread notifications:", error);
          socket.emit("error", {
            message: "Failed to fetch notifications",
          });
        }
      });

      // Disconnect handler
      socket.on("disconnect", () => {
        const socketData = socket.data as SocketData;
        console.log(
          `🔌 Client disconnected: ${socket.id} (User: ${
            socketData.userId || "unknown"
          })`
        );
      });
    });
  }

  async sendToUser(payload: NotificationPayload): Promise<void> {
    if (!this.io) {
      console.warn("Socket.IO not initialized");
      // return; // Don't return, we might want to send push even if socket is down, but realistically this service assumes io init.
    }

    try {
      // Save to database
      const notification = await Notification.create({
        userId: new mongoose.Types.ObjectId(payload.userId),
        tenantId: new mongoose.Types.ObjectId(payload.tenantId),
        type: payload.type,
        title: payload.title,
        message: payload.message,
        taskId: payload.taskId
          ? new mongoose.Types.ObjectId(payload.taskId)
          : undefined,
        triggeredBy: payload.triggeredBy
          ? new mongoose.Types.ObjectId(payload.triggeredBy)
          : undefined,
        metadata: payload.metadata,
      });

      // Emit to user's room
      if (this.io) {
        this.io.to(`user:${payload.userId}`).emit("notification", {
          id: notification._id.toString(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          taskId: notification.taskId?.toString(),
          triggeredBy: notification.triggeredBy?.toString(),
          metadata: notification.metadata,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        });
      }

      // Send Push Notification (non-blocking - notification is already saved and sent via Socket.IO)
      const pushSent = await this.sendPushNotification(payload.userId, payload.title, payload.message, payload);

      if (pushSent) {
        console.log(`📧 Notification sent to user ${payload.userId} (DB + Socket.IO + Push)`);
      } else {
        console.log(`📧 Notification sent to user ${payload.userId} (DB + Socket.IO, Push failed)`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  /**
   * Send notification to all users in a tenant
   */
  async sendToTenant(payload: NotificationPayload): Promise<void> {
    if (!this.io) {
      console.warn("Socket.IO not initialized");
    }

    try {
      // Create notification in database (Wait, this is single user in payload schema? 
      // Actually sendToTenant usually iterates or expects the caller to handle specific users, 
      // or we need to find all users in tenant.
      // The current implementation creates ONE notification record which implies 'userId' in payload is the target.
      // But method name is 'sendToTenant'. 
      // Let's look at the original implementation:
      // It creates Notification with payload.userId. 
      // Then emits to `tenant:${payload.tenantId}`.
      // This implies the 'notification' record is just a log, but the socket event goes to everyone.
      // For Push, we need to find ALL users in the tenant.
      
      const notification = await Notification.create({
        userId: new mongoose.Types.ObjectId(payload.userId), // This might be the 'target' or just a placeholder?
        tenantId: new mongoose.Types.ObjectId(payload.tenantId),
        type: payload.type,
        title: payload.title,
        message: payload.message,
        taskId: payload.taskId
          ? new mongoose.Types.ObjectId(payload.taskId)
          : undefined,
        triggeredBy: payload.triggeredBy
          ? new mongoose.Types.ObjectId(payload.triggeredBy)
          : undefined,
        metadata: payload.metadata,
      });

      // Emit to tenant room
      if (this.io) {
        this.io.to(`tenant:${payload.tenantId}`).emit("notification", {
          id: notification._id.toString(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          taskId: notification.taskId?.toString(),
          triggeredBy: notification.triggeredBy?.toString(),
          metadata: notification.metadata,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        });
      }

      // Send Push to ALL users in tenant
      // We need to fetch all users for this tenant
      const users = await User.find({ tenantId: new mongoose.Types.ObjectId(payload.tenantId) });
      const pushResults = await Promise.allSettled(
        users.map(u => 
          this.sendPushNotification(u._id.toString(), payload.title, payload.message, payload)
        )
      );
      
      const successfulPushes = pushResults.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const totalUsers = users.length;

      if (successfulPushes === totalUsers) {
        console.log(`📧 Notification sent to tenant ${payload.tenantId} (DB + Socket.IO + Push to all ${totalUsers} users)`);
      } else if (successfulPushes > 0) {
        console.log(`📧 Notification sent to tenant ${payload.tenantId} (DB + Socket.IO + Push to ${successfulPushes}/${totalUsers} users)`);
      } else {
        console.log(`📧 Notification sent to tenant ${payload.tenantId} (DB + Socket.IO, Push failed for all users)`);
      }
    } catch (error) {
      console.error("Error sending tenant notification:", error);
    }
  }

  /**
   * Send Firebase Push Notification
   * @returns true if push notification was sent successfully, false otherwise
   */
  private async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    console.log(`🚀 Attempting to send push to user: ${userId}`);
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.warn(`⚠️ User not found for push: ${userId}`);
        return false;
      }
      
      if (!user.fcmTokens || user.fcmTokens.length === 0) {
        console.warn(`⚠️ No FCM tokens for user: ${userId} (${user.email})`);
        return false;
      }

      console.log(`📱 Found ${user.fcmTokens.length} tokens for user ${userId}`);

      // Convert metadata to string values (FCM requires all data values to be strings)
      const stringifyMetadata = (obj: any): Record<string, string> => {
        const result: Record<string, string> = {};
        if (obj && typeof obj === 'object') {
          for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined) {
              result[key] = '';
            } else if (value instanceof Date) {
              result[key] = value.toISOString();
            } else if (typeof value === 'object') {
              result[key] = JSON.stringify(value);
            } else {
              result[key] = String(value);
            }
          }
        }
        return result;
      };

      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...stringifyMetadata(data?.metadata || {}),
          taskId: data?.taskId || "",
          type: data?.type || "INFO",
          click_action: "FLUTTER_NOTIFICATION_CLICK" 
        },
        tokens: user.fcmTokens,
      };

      // Import messaging dynamically
      try {
          const { messaging } = await import("../config/firebase");
          
          if (messaging) {
             console.log(`📨 Sending multicast message to ${user.fcmTokens.length} tokens`);
             const response = await messaging.sendEachForMulticast(message);
             console.log(`✅ FCM Response: Success=${response.successCount}, Failure=${response.failureCount}`);
             
             if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp, idx) => {
                  if (!resp.success) {
                    const error = resp.error;
                    console.error(`❌ FCM Send Error for token ${idx}:`, error?.code, error?.message);
                    // Only remove if it's a permanent error
                    if (error?.code === 'messaging/invalid-registration-token' ||
                        error?.code === 'messaging/registration-token-not-registered') {
                        failedTokens.push(user.fcmTokens[idx]);
                    }
                  }
                });
                
                // Clean up invalid tokens
                if (failedTokens.length > 0) {
                    console.log(`🗑️ Removing ${failedTokens.length} invalid tokens`);
                    await User.findByIdAndUpdate(userId, {
                        $pull: { fcmTokens: { $in: failedTokens } }
                    });
                }
             }
             
             // Return true if at least one notification was sent successfully
             return response.successCount > 0;
          } else {
              console.error("❌ Messaging service not available (import failed or null)");
              return false;
          }
      } catch (importError: any) {
          // Check if it's a network error (common when offline or DNS issues)
          const isNetworkError = importError?.code === 'messaging/app/network-error' || 
                                 importError?.errorInfo?.code === 'messaging/app/network-error' ||
                                 importError?.message?.includes('ENOTFOUND') ||
                                 importError?.message?.includes('network');
          
          if (isNetworkError) {
              console.warn(`⚠️ Network error sending FCM push to user ${userId}: ${importError?.errorInfo?.message || importError?.message}. Push notification will be skipped.`);
          } else {
              console.error("❌ Error importing/using Firebase messaging:", importError);
          }
          return false;
      }
    } catch (error) {
      console.error(`❌ Global error sending push to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
