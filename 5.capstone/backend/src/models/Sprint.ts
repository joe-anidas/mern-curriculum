import mongoose, { Schema, Document, Model } from "mongoose";

export type SprintStatus = "planned" | "active" | "completed";

export interface ISprint extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  tenantId: mongoose.Types.ObjectId;
  status: SprintStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sprintSchema = new Schema<ISprint>(
  {
    name: {
      type: String,
      required: [true, "Sprint name is required"],
      trim: true,
      minlength: [1, "Sprint name cannot be empty"],
      maxlength: [100, "Sprint name cannot exceed 100 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (this: ISprint, value: Date) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Tenant ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["planned", "active", "completed"],
        message: "Status must be one of: planned, active, completed",
      },
      default: "planned",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

sprintSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

sprintSchema.index({ tenantId: 1, createdAt: -1 });
sprintSchema.index({ tenantId: 1, status: 1 });

const Sprint = mongoose.model<ISprint>("Sprint", sprintSchema);

export default Sprint;
