import { Schema, model } from "mongoose";

import bcrypt from "bcrypt";
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
      validate: {
        validator: function (el: string) {
          return /^[a-zA-Z]+ [a-zA-Z]+$/.test(el);
        },
        message: "Please provide your full name e.g. John Doe",
      },
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
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Password Management

// - Register - store hashed password only

UserSchema.pre("save", async function (next: Function) {
  // if password is not modified, do nothing
  if (!this.isModified("password")) return next();
  // hash if password is modified
  this.password = await bcrypt.hash(this.password, 12);
  // do not persist passwordConfirm to db
  this.passwordConfirm = undefined;
  next();
});

// Virtual Population

// Populate no. of articles

UserSchema.virtual("noOfArticles", {
  ref: "Article",
  foreignField: "author",
  localField: "_id",
  count: true,
});

// Populate no. of bookmarks

UserSchema.virtual("noOfBookmarks", {
  ref: "Bookmark",
  foreignField: "bookmarkedBy",
  localField: "_id",
  count: true,
});

// Populate no. of comments

UserSchema.virtual("noOfComments", {
  ref: "Comment",
  foreignField: "commentBy",
  localField: "_id",
  count: true,
});

/*
 * @desc poputate articles when
 * 'api/v1/users/:id' is queried
 */

UserSchema.virtual("articles", {
  ref: "Article",
  foreignField: "author",
  localField: "_id",
});

/*
 * @desc poputate bookmarks when
 * 'api/v1/users/:id' is queried
 */

UserSchema.virtual("bookmarks", {
  ref: "Bookmark",
  foreignField: "bookmarkedBy",
  localField: "_id",
});

/*
 * @desc do not show inactive (deactived) users when
 * 'api/vi/users' is queried
 */

UserSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

export default model<IUserDocument>("User", UserSchema);
