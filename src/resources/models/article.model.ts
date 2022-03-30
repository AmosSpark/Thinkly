import { Schema, model } from "mongoose";

import IArticleDocument from "@/resources/interfaces/article.interface";

const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      minlength: [1, "Post must have a title"],
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          "ENTERTAINMENT",
          "INTERNET",
          "GAMES",
          "SOCIETY",
          "WOMAN",
          "EDUCATION",
        ],
        message:
          "Category '{VALUE}' is not available. Category should be either: entertainment, internet, games, society, woman, or education",
      },
      required: [true, "Category is required"],
      trim: true,
      uppercase: true,
    },
    body: {
      type: String,
      required: [true, "Cannot publish an empty article"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default model<IArticleDocument>("Article", ArticleSchema);
