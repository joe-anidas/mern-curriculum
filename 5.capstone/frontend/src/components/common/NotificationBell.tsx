import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store";
import { notificationService } from "@/services";
import type { Notification } from "@/services";
import { formatDistanceToNow } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({
  className = "",
}: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    setOpen,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, setOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification.id]);
      notificationService.markAsRead(notification.id);
    }
    // You can navigate to the task or show more details here
    // Example: navigate(`/tasks/${notification.taskId}`);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    notificationService.markAllAsRead();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "task_assigned":
        return "📋";
      case "task_updated":
        return "🔄";
      case "task_completed":
        return "✅";
      case "task_deleted":
        return "🗑️";
      case "task_due_soon":
        return "⏰";
      case "task_overdue":
        return "⚠️";
      case "comment_added":
        return "💬";
      case "mention":
        return "👤";
      default:
        return "🔔";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[32rem] overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-gray-600">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  No notifications yet
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`cursor-pointer px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium text-gray-900 ${
                              !notification.isRead ? "font-semibold" : ""
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-indigo-600 mt-1.5"></span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(notification.createdAt)
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
              <button
                onClick={() => {
                  setOpen(false);
                  // Navigate to notifications page if you have one
                  // navigate('/notifications');
                }}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
