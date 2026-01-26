import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/config/api";

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "task_completed"
  | "task_deleted"
  | "task_due_soon"
  | "task_overdue"
  | "comment_added"
  | "mention";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  triggeredBy?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export type NotificationListener = (notification: Notification) => void;
type UnreadCountListener = (count: number) => void;

class NotificationService {
  private socket: Socket | null = null;
  private notificationListeners: NotificationListener[] = [];
  private unreadCountListeners: UnreadCountListener[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to the Socket.IO server
   */
  connect(token: string) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    this.socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
    });

    this.setupSocketListeners(token);
  }

  /**
   * Set up all socket event listeners
   */
  private setupSocketListeners(token: string) {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket connected");
      this.reconnectAttempts = 0;
      this.socket?.emit("authenticate", token);
    });

    this.socket.on(
      "authenticated",
      (data: { userId: string; tenantId?: string; unreadCount: number }) => {
        console.log("✅ Socket authenticated", data);
        this.notifyUnreadCount(data.unreadCount);
      }
    );

    this.socket.on("notification", (notification: Notification) => {
      console.log("📧 New notification received:", notification);
      this.notificationListeners.forEach((listener) => listener(notification));

      // Show browser notification if permission granted
      this.showBrowserNotification(notification);
    });

    this.socket.on(
      "unread_notifications",
      (data: { count: number; notifications: Notification[] }) => {
        console.log(`📬 Unread notifications: ${data.count}`);
        this.notifyUnreadCount(data.count);
      }
    );

    this.socket.on(
      "notifications_marked_read",
      (data: { count: number; notificationIds: string[] }) => {
        console.log(`✅ ${data.count} notification(s) marked as read`);
      }
    );

    this.socket.on(
      "all_notifications_marked_read",
      (data: { count: number }) => {
        console.log(`✅ All ${data.count} notifications marked as read`);
        this.notifyUnreadCount(0);
      }
    );

    this.socket.on("auth_error", (error: { message: string }) => {
      console.error("❌ Authentication error:", error.message);
    });

    this.socket.on("error", (error: { message: string }) => {
      console.error("❌ Socket error:", error.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      this.attemptReconnect();
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(
      `🔄 Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.socket?.connect();
    }, delay);
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Notification) {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      });
    }
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  /**
   * Subscribe to new notifications
   */
  onNotification(callback: NotificationListener) {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Subscribe to unread count changes
   */
  onUnreadCountChange(callback: UnreadCountListener) {
    this.unreadCountListeners.push(callback);
    return () => {
      this.unreadCountListeners = this.unreadCountListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Notify all unread count listeners
   */
  private notifyUnreadCount(count: number) {
    this.unreadCountListeners.forEach((listener) => listener(count));
  }

  /**
   * Request unread notifications from server
   */
  getUnread() {
    this.socket?.emit("get_unread");
  }

  /**
   * Mark specific notifications as read
   */
  markAsRead(notificationIds: string | string[]) {
    const ids = Array.isArray(notificationIds)
      ? notificationIds
      : [notificationIds];
    this.socket?.emit("mark_read", ids);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.socket?.emit("mark_all_read");
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.notificationListeners = [];
    this.unreadCountListeners = [];
    this.reconnectAttempts = 0;
    console.log("🔌 Socket disconnected and cleaned up");
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
