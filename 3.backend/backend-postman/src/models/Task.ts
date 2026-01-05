import mongoose, { Schema, Model } from "mongoose";
import { ITask } from "../types/Task";

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, default: "todo" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);

export default Task;
