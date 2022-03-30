import { Schema, model } from "mongoose";

import ICommentDocument from "@/resources/interfaces/comment.interface";

const CommentSchema: Schema = new Schema(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
      required: [true, "Cannot post an empty comment"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default model<ICommentDocument>("Comment", CommentSchema);
