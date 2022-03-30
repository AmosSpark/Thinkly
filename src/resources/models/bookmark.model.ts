import { Schema, model } from "mongoose";

import IBookmarkDocument from "@/resources/interfaces/bookmark.interface";

const BookmarkSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  article: {
    type: Schema.Types.ObjectId,
    ref: "Article",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default model<IBookmarkDocument>("Bookmark", BookmarkSchema);
