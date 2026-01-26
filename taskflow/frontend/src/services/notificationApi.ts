import { httpClient } from "@/lib/httpClient";
import type { Notification } from "./notificationService";

export interface NotificationListResponse {
  success: boolean;
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  count: number;
  notifications: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  count: number;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  count: number;
}

/**
 * Fetch notifications from the API
 */
export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}): Promise<NotificationListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.isRead !== undefined)
    searchParams.append("isRead", params.isRead.toString());
  if (params?.type) searchParams.append("type", params.type);

  const query = searchParams.toString();
  const url = `/api/notifications${query ? `?${query}` : ""}`;

  return httpClient.get<NotificationListResponse>(url);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return httpClient.get<UnreadCountResponse>("/api/notifications/unread-count");
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  notificationIds: string[]
): Promise<MarkAsReadResponse> {
  return httpClient.patch<MarkAsReadResponse>("/api/notifications/mark-read", {
    notificationIds,
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<MarkAsReadResponse> {
  return httpClient.patch<MarkAsReadResponse>(
    "/api/notifications/mark-all-read",
    {}
  );
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; message: string }> {
  return httpClient.delete<{ success: boolean; message: string }>(
    `/api/notifications/${notificationId}`
  );
}

/**
 * Delete all read notifications
 */
export async function deleteAllReadNotifications(): Promise<{
  success: boolean;
  message: string;
  count: number;
}> {
  return httpClient.delete<{
    success: boolean;
    message: string;
    count: number;
  }>("/api/notifications");
}
