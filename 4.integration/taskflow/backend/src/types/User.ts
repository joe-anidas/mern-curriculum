import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}
