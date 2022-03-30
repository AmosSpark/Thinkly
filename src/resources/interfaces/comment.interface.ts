import { Types } from "mongoose";

interface ICommentDocument {
  article?: Types.ObjectId;
  user?: Types.ObjectId;
  comment: string;
}

export default ICommentDocument;
