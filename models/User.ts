import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },
    name: String,
    email: String,
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
