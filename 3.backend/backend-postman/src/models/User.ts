import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types/User";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const doc = this as IUser;
  if (!doc.isModified("passwordHash")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    doc.passwordHash = await bcrypt.hash(doc.passwordHash, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, (this as IUser).passwordHash);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
