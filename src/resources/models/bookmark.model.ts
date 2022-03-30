import { Schema, model } from "mongoose";

import IBookmarkDocument from "@/resources/interfaces/bookmark.interface";

const BookmarkSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
  },
  {
    timestamps: true,
  }
);

export default model<IBookmarkDocument>("Bookmark", BookmarkSchema);
