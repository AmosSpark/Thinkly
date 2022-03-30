import { Types } from "mongoose";

interface IArticleDocument {
  title: string;
  category: string;
  body: string;
  author?: Types.ObjectId;
}

export default IArticleDocument;