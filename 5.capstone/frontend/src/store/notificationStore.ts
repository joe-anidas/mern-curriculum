import { create } from "zustand";
import type { Notification } from "@/services/notificationService";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  markAsRead: (notificationIds: string[]) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  toggleOpen: () => void;
  setOpen: (isOpen: boolean) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + 1,
    })),

  setNotifications: (notifications) => set({ notifications }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  markAsRead: (notificationIds) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        notificationIds.includes(n.id) ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - notificationIds.length),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find(
        (n) => n.id === notificationId
      );
      const wasUnread = notification && !notification.isRead;
      return {
        notifications: state.notifications.filter(
          (n) => n.id !== notificationId
        ),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  setOpen: (isOpen) => set({ isOpen }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
