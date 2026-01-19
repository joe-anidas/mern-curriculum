/**
 * Example Socket.IO Client for Testing Notifications
 *
 * Usage:
 * 1. Start the backend server: npm run dev
 * 2. Get a valid JWT token from login
 * 3. Run this script: ts-node-dev test-notifications.ts
 */

import { io } from "socket.io-client";

// Replace with actual JWT token from your login
const TEST_TOKEN = "your-jwt-token-here";
const SERVER_URL = "http://localhost:3000";

const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ Connected to server");
  console.log("🔐 Authenticating...");
  socket.emit("authenticate", TEST_TOKEN);
});

socket.on("authenticated", (data) => {
  console.log("✅ Authenticated successfully:", data);
  console.log(`   User ID: ${data.userId}`);
  console.log(`   Tenant ID: ${data.tenantId}`);
  console.log(`   Unread Count: ${data.unreadCount}`);

  // Request unread notifications
  console.log("\n📬 Requesting unread notifications...");
  socket.emit("get_unread");
});

socket.on("unread_notifications", (data) => {
  console.log("\n📬 Unread Notifications:");
  console.log(`   Total: ${data.count}`);
  data.notifications.forEach((notif: any, index: number) => {
    console.log(`\n   ${index + 1}. ${notif.title}`);
    console.log(`      Message: ${notif.message}`);
    console.log(`      Type: ${notif.type}`);
    console.log(`      Created: ${new Date(notif.createdAt).toLocaleString()}`);
  });
});

socket.on("notification", (notification) => {
  console.log("\n🔔 NEW NOTIFICATION RECEIVED:");
  console.log(`   Title: ${notification.title}`);
  console.log(`   Message: ${notification.message}`);
  console.log(`   Type: ${notification.type}`);
  console.log(`   Task ID: ${notification.taskId || "N/A"}`);
  console.log(`   Triggered By: ${notification.triggeredBy || "System"}`);
});

socket.on("notifications_marked_read", (data) => {
  console.log(`\n✅ Marked ${data.count} notification(s) as read`);
});

socket.on("all_notifications_marked_read", (data) => {
  console.log(`\n✅ Marked all (${data.count}) notifications as read`);
});

socket.on("auth_error", (error) => {
  console.error("\n❌ Authentication Error:", error.message);
  console.log("\n💡 Please update TEST_TOKEN with a valid JWT token");
  socket.disconnect();
});

socket.on("error", (error) => {
  console.error("\n❌ Error:", error.message || error);
});

socket.on("disconnect", () => {
  console.log("\n👋 Disconnected from server");
});

// Keep the script running
console.log("🚀 Notification Client Test Started");
console.log("   Server:", SERVER_URL);
console.log("   Press Ctrl+C to exit\n");

// Example: Mark a notification as read after 5 seconds
setTimeout(() => {
  // Uncomment and replace with actual notification ID
  // socket.emit('mark_read', ['notification-id-here']);
}, 5000);

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down...");
  socket.disconnect();
  process.exit(0);
});
