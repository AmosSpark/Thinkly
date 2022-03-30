import { Types } from "mongoose";

interface IBookmarkDocument {
  user?: Types.ObjectId;
  article?: Types.ObjectId;
  createdAt?: Date;
}

export default IBookmarkDocument;
