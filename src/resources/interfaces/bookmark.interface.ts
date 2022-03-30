import { Types } from "mongoose";

interface IBookmarkDocument {
  user?: Types.ObjectId;
  article?: Types.ObjectId;
}

export default IBookmarkDocument;
