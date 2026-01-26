import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "task_completed"
  | "task_deleted"
  | "task_due_soon"
  | "task_overdue"
  | "comment_added"
  | "mention";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: mongoose.Types.ObjectId;
  triggeredBy?: mongoose.Types.ObjectId;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface INotificationModel extends Model<INotification> {
  findUnreadByUser(userId: mongoose.Types.ObjectId): Promise<INotification[]>;
  markAsRead(
    userId: mongoose.Types.ObjectId,
    notificationIds: string[]
  ): Promise<number>;
}

const notificationSchema = new Schema<INotification, INotificationModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Tenant ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_updated",
        "task_completed",
        "task_deleted",
        "task_due_soon",
        "task_overdue",
        "comment_added",
        "mention",
      ],
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: false,
      index: true,
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ tenantId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, taskId: 1 });

// Automatically delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Static method to find unread notifications
notificationSchema.statics.findUnreadByUser = function (
  userId: mongoose.Types.ObjectId
) {
  return this.find({ userId, isRead: false })
    .sort({ createdAt: -1 })
    .populate("triggeredBy", "name email")
    .exec();
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function (
  userId: mongoose.Types.ObjectId,
  notificationIds: string[]
) {
  const result = await this.updateMany(
    {
      _id: { $in: notificationIds },
      userId,
    },
    { $set: { isRead: true } }
  );
  return result.modifiedCount;
};

const Notification: INotificationModel = mongoose.model<
  INotification,
  INotificationModel
>("Notification", notificationSchema);

export default Notification;
