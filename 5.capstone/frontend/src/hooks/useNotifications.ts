import { useEffect, useCallback } from "react";
import { useAuthStore, useNotificationStore } from "@/store";
import { notificationService, fetchNotifications } from "@/services";
import type { Notification } from "@/services";
import { toast } from "sonner";
import { requestForToken, onMessageListener } from "@/config/firebase";
import { httpClient } from "@/lib/httpClient";

/**
 * Hook to manage notification service connection and synchronization
 */
export function useNotifications() {
  const { token, isAuthenticated } = useAuthStore();
  const { addNotification, setUnreadCount, setNotifications } =
    useNotificationStore();

  /**
   * Load initial notifications from API
   */
  const loadInitialNotifications = useCallback(async () => {
    try {
      const response = await fetchNotifications({ limit: 20, page: 1 });
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [setNotifications]);

  /**
   * Register FCM Token
   */
  const registerFcmToken = useCallback(async () => {
    try {
      const fcmToken = await requestForToken();
      if (fcmToken) {
        console.log("FCM Token:", fcmToken);
        await httpClient.post("/api/notifications/fcm-token", {
          token: fcmToken,
        });
      }
    } catch (error) {
       // Silent fail if firebase not configured or permission denied
       console.warn("FCM Registration failed (likely missing config or permission):", error);
    }
  }, []);

  /**
   * Show a toast notification
   */
  const showToast = useCallback((notification: Notification) => {
    // Determine type for styling (simulated by sonner variants if needed, or just default)
    toast(notification.title, {
       description: notification.message,
       action: {
          label: "View",
          onClick: () => console.log("View notification", notification.id)
       }
    });

    console.log("📧 New notification:", notification.title);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect if not authenticated
      notificationService.disconnect();
      return;
    }

    // Connect to Socket.IO
    notificationService.connect(token);

    // Request browser notification permission (Standard Web API)
    notificationService.requestNotificationPermission();
    
    // Register FCM
    registerFcmToken();
    
    // Listen for FCM foreground messages
    onMessageListener()
      .then((payload: unknown | null) => {
         if (!payload) return;
         const { title, body } = (payload as { notification?: { title: string; body: string } })?.notification || {};
         if (title) {
            toast(title, { description: body });
         }
      })
      .catch((err) => console.log("failed: ", err));


    // Load initial notifications from API
    loadInitialNotifications();

    // Subscribe to new notifications
    const unsubscribeNotification = notificationService.onNotification(
      (notification) => {
        addNotification(notification);
        showToast(notification);
      }
    );

    // Subscribe to unread count changes
    const unsubscribeUnreadCount = notificationService.onUnreadCountChange(
      (count) => {
        setUnreadCount(count);
      }
    );

    // Request current unread notifications


    // Cleanup on unmount or auth change
    return () => {
      unsubscribeNotification();
      unsubscribeUnreadCount();
      notificationService.disconnect();
    };
  }, [
    isAuthenticated,
    token,
    addNotification,
    setUnreadCount,
    loadInitialNotifications,
    showToast,
    registerFcmToken
  ]);
}
