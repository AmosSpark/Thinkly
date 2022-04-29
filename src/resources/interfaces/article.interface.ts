import { Model, Types } from "mongoose";

interface IArticleDocument {
  title: string;
  category: string;
  photo?: string;
  photoId: string;
  body: string;
  author?: Types.ObjectId;
  likedBy?: string[];
  noOfLikes?: number;
  commentCount?: number;
}
interface IArticleModel extends Model<IArticleDocument> {
  getWeeklyTrending: (this: Model<any>, ...args: any[]) => any;
  getLikesOfArticles: (this: Model<any>, ...args: any[]) => any;
}

export { IArticleDocument, IArticleModel };
