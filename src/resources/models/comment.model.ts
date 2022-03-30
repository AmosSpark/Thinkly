import { Schema, model } from "mongoose";

import ICommentDocument from "@/resources/interfaces/comment.interface";

const CommentSchema: Schema = new Schema(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
    comment: {
      type: String,
      required: [true, "Cannot post an empty comment"],
    },
    commentBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

// Populate - comment with article

CommentSchema.pre(/^find/, function (next: Function) {
  this.populate({
    path: "commentBy",
    select: "fullName",
  });
  next();
});

export default model<ICommentDocument>("Comment", CommentSchema);
