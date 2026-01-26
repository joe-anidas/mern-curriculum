import Task from "../models/Task";
import { notificationService } from "../notification";
import { getNowIST, getTomorrowIST } from "./dateUtils";

/**
 * Check if a task is due within 1 day (tomorrow) and send notification
 * This is called immediately when tasks are created or updated
 */
export async function checkAndNotifyDueSoon(
  task: { _id: any; userId: any; tenantId: any; title: string; dueDate?: Date | null; status: string }
): Promise<void> {
  try {
    // Skip if task is completed or has no due date
    if (!task.dueDate || task.status === "completed") {
      return;
    }

    const now = getNowIST();
    const tomorrow = getTomorrowIST();
    tomorrow.setHours(23, 59, 59, 999);

    const taskDueDate = new Date(task.dueDate);

    // Check if task is due within 24 hours (between now and tomorrow end of day)
    if (taskDueDate >= now && taskDueDate <= tomorrow) {
      const hoursUntilDue = Math.floor(
        (taskDueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      // Only send if it's within 24 hours (not already overdue)
      if (hoursUntilDue >= 0 && hoursUntilDue <= 24) {
        await notificationService.sendToUser({
          userId: task.userId.toString(),
          tenantId: task.tenantId.toString(),
          type: "task_due_soon",
          title: "Task Due Soon",
          message: `Task "${task.title}" is due in ${hoursUntilDue} hour(s)`,
          taskId: task._id.toString(),
          metadata: { 
            hoursUntilDue: String(hoursUntilDue), 
            dueDate: task.dueDate ? task.dueDate.toISOString() : '' 
          },
        });
      }
    }

    // Also check if task is overdue
    if (taskDueDate < now) {
      const daysOverdue = Math.floor(
        (now.getTime() - taskDueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      await notificationService.sendToUser({
        userId: task.userId.toString(),
        tenantId: task.tenantId.toString(),
        type: "task_overdue",
        title: "Task Overdue",
        message: `Task "${task.title}" is ${daysOverdue} day(s) overdue`,
        taskId: task._id.toString(),
        metadata: { 
          daysOverdue: String(daysOverdue), 
          dueDate: task.dueDate ? task.dueDate.toISOString() : '' 
        },
      });
    }
  } catch (error) {
    console.error("Error checking due date notification:", error);
    // Don't throw - we don't want to fail task creation/update if notification fails
  }
}
