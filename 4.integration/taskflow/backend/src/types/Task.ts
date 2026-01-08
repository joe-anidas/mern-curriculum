import mongoose, { Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  status: string;
  userId: mongoose.Types.ObjectId;
}
