import mongoose from "mongoose";
import { lowercase } from "zod";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "lastName is required!"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "email is required!"],
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, "password is required!"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: undefined,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true },
);

export const userModel = mongoose.model("user", userSchema);

export default userModel;
