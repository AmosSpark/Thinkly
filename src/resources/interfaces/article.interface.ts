import { Model, Types } from "mongoose";

interface IArticleDocument {
  title: string;
  category: string;
  body: string;
  author?: Types.ObjectId;
  commentCount?: number;
}
interface IArticleModel extends Model<IArticleDocument> {
  getWeeklyTrending: (this: Model<any>, ...args: any[]) => any;
}

export { IArticleDocument, IArticleModel };
