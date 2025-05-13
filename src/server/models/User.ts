import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export type UserType = Document & {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
};

const UserSchema: Schema = new Schema<UserType>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    stripeCustomerId: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<UserType>("User", UserSchema);
