import { Schema, model } from "mongoose";

import validator from "validator";
import { IUserDocument } from "@/resources/interfaces/user.interface";

const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide your full name. e.g John Doe"],
      trim: true,
      minlength: [
        2,
        "Your full name should not be less than 2 characters long",
      ],
      maxlength: [
        36,
        "Your full name should not be more than 36 characters long",
      ],
      validate: [
        validator.isAlpha,
        "Firstname should be contain characters a-zA-Z only",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Incorrect email address"],
    },
    password: {
      type: String,
      required: [true, `Please provide a password`],
      select: false,
      minlength: [8, "Password cannot be less than 8 characters"],
    },
    headline: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user, admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default model<IUserDocument>("User", UserSchema);
