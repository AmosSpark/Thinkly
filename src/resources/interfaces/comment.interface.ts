import { Types } from "mongoose";

interface ICommentDocument {
  article?: Types.ObjectId;
  comment: string;
  commentBy?: Types.ObjectId;
}
export default ICommentDocument;
