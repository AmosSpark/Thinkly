import { Model, Types } from "mongoose";
interface IUserDocument {
  fullName: string;
  email: string;
  password: string;
  photo?: string;
  photoId?: string;
  headline?: string;
  bio?: string;
  role?: string;
  followers?: string[];
  followersCount?: number;
  following?: string[];
  followingCount?: number;
  active?: boolean;
}

interface IUserModel extends Model<IUserDocument> {
  getFollowers: (this: Model<any>, ...args: any[]) => any;
  getFollowing: (this: Model<any>, ...args: any[]) => any;
}

interface IUserLogin {
  email: string;
  password: string;
}

interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

export { IUserDocument, IUserModel, IUserLogin, IChangePassword };
