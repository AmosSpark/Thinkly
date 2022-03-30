import { Types } from "mongoose";

interface IBookmarkDocument {
  article?: Types.ObjectId;
  bookmarkedBy?: Types.ObjectId;
  createdAt?: Date;
}

export default IBookmarkDocument;
