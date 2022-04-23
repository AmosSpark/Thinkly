import { Types } from "mongoose";

interface ILikeDocument {
  article?: Types.ObjectId;
  likedBy?: Types.ObjectId;
  createdAt?: Date;
}

export default ILikeDocument;
