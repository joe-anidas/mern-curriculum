import mongoose, { Schema, Document, Model } from "mongoose";

export type TaskStatus = "todo" | "in-progress" | "in-review" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  sprintId?: mongoose.Types.ObjectId | null;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  attachments: {
    name: string;
    url: string;
    publicId: string;
    uploadedAt: Date;
  }[];
  isOverdue(): boolean;
}

interface ITaskModel extends Model<ITask> {
  findByStatus(
    userId: mongoose.Types.ObjectId,
    status: TaskStatus,
  ): Promise<ITask[]>;
}

const taskSchema = new Schema<ITask, ITaskModel>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [1, "Task title cannot be empty"],
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Task description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["todo", "in-progress", "in-review", "completed"],
        message:
          "Status must be one of: todo, in-progress, in-review, completed",
      },
      default: "todo",
      lowercase: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Tenant ID is required"],
      index: true,
    },
    sprintId: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
      index: true,
    },
    dueDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

taskSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ tenantId: 1, createdAt: -1 });
taskSchema.index({ title: "text", description: "text" });

taskSchema.methods.isOverdue = function () {
  return !!(
    this.dueDate &&
    this.dueDate < new Date() &&
    this.status !== "completed"
  );
};

taskSchema.statics.findByStatus = function (
  userId: mongoose.Types.ObjectId,
  status: TaskStatus,
) {
  return this.find({ userId, status }).sort({ createdAt: -1 });
};

const Task: ITaskModel = mongoose.model<ITask, ITaskModel>("Task", taskSchema);

export default Task;
