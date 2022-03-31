import { Schema, model } from "mongoose";

import IBookmarkDocument from "@/resources/interfaces/bookmark.interface";

const BookmarkSchema: Schema = new Schema(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
    bookmarkedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
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
  }
);

// Populate - user and article

BookmarkSchema.pre(/^find/, function (next: Function) {
  this.populate({
    path: "article",
    select: "-author -body -createdAt -updatedAt -noOfComments",
  });
  next();
});

export default model<IBookmarkDocument>("Bookmark", BookmarkSchema);
