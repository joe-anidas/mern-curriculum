import Task from "../models/Task";
import { notificationService } from "../notification";
import { getNowIST, getTomorrowIST } from "./dateUtils";

/**
 * Check for overdue and due soon tasks and send notifications
 * This can be run as a scheduled job (e.g., with node-cron)
 * All dates are handled in Indian Standard Time (IST)
 */
export async function checkTaskDueDates() {
  try {
    // Use IST for all date comparisons
    const now = getNowIST();
    const tomorrow = getTomorrowIST();
    tomorrow.setHours(23, 59, 59, 999);

    // Find overdue tasks
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: "completed" },
    }).exec();

    // Find tasks due within 24 hours
    const dueSoonTasks = await Task.find({
      dueDate: {
        $gte: now,
        $lte: tomorrow,
      },
      status: { $ne: "completed" },
    }).exec();

    // Send overdue notifications
    for (const task of overdueTasks) {
      const daysOverdue = Math.floor(
        (now.getTime() - task.dueDate!.getTime()) / (1000 * 60 * 60 * 24)
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

    // Send due soon notifications
    // Only notify if task is due within 24 hours (not already notified)
    for (const task of dueSoonTasks) {
      const hoursUntilDue = Math.floor(
        (task.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      // Only send notification if task is due within 24 hours
      // This prevents duplicate notifications for tasks that are already overdue
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

    console.log(
      `📅 Due date check complete: ${overdueTasks.length} overdue, ${dueSoonTasks.length} due soon`
    );

    return {
      overdue: overdueTasks.length,
      dueSoon: dueSoonTasks.length,
    };
  } catch (error) {
    console.error("Error checking task due dates:", error);
    throw error;
  }
}

/**
 * Schedule the due date check to run daily
 * Uncomment and import node-cron if you want automated scheduling
 */
// import cron from 'node-cron';
// export function scheduleDueDateChecks() {
//   // Run every day at 9 AM
//   cron.schedule('0 9 * * *', async () => {
//     console.log('⏰ Running scheduled due date check...');
//     await checkTaskDueDates();
//   });
//   console.log('✅ Due date checks scheduled');
// }
